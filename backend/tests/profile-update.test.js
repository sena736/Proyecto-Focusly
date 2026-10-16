const request = require("supertest");

// Never touch a real database: the repository is mocked, like the other
// backend tests do.
jest.mock("../src/repositories/user.repository", () => ({
  getUserById: jest.fn(),
  updateName: jest.fn(),
}));

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-profile-update";

const userRepository = require("../src/repositories/user.repository");
const { signJwt } = require("../src/utils/jwt");
const app = require("../src/app");

describe("PROFILE API - PATCH /api/v1/profile", () => {
  const USER_ID = 42;

  const STORED_USER = {
    id: USER_ID,
    googleId: "google-abc",
    email: "ana@focusly.test",
    password: "hashed-secret",
    name: "Ana",
    avatarUrl: null,
    nickname: null,
    role: "USER",
  };

  const token = () => signJwt({ sub: USER_ID, role: "USER" });

  const patch = (body) =>
    request(app)
      .patch("/api/v1/profile")
      .set("Authorization", `Bearer ${token()}`)
      .send(body);

  beforeEach(() => {
    userRepository.getUserById.mockResolvedValue(STORED_USER);
    userRepository.updateName.mockImplementation(async (id, name) => ({
      ...STORED_USER,
      id,
      name,
    }));
  });

  test("rejects a request without token with 401", async () => {
    const response = await request(app)
      .patch("/api/v1/profile")
      .send({ name: "Nuevo" });

    expect(response.statusCode).toBe(401);
    expect(userRepository.updateName).not.toHaveBeenCalled();
  });

  test("updates the name, trims it and returns the user without the password", async () => {
    const response = await patch({ name: "  María López  " });

    expect(response.statusCode).toBe(200);
    expect(userRepository.updateName).toHaveBeenCalledWith(
      USER_ID,
      "María López"
    );
    expect(response.body.name).toBe("María López");
    expect(response.body.email).toBe(STORED_USER.email);
    expect(response.body.role).toBe("USER");
    expect(response.body).not.toHaveProperty("password");
  });

  test("accepts a name of exactly 100 characters", async () => {
    const name = "a".repeat(100);

    const response = await patch({ name });

    expect(response.statusCode).toBe(200);
    expect(userRepository.updateName).toHaveBeenCalledWith(USER_ID, name);
  });

  test.each([
    ["missing", {}, "El nombre es obligatorio."],
    ["null", { name: null }, "El nombre es obligatorio."],
    ["empty", { name: "" }, "El nombre es obligatorio."],
    ["whitespace only", { name: "   \t " }, "El nombre es obligatorio."],
    ["a number", { name: 123 }, "El nombre debe ser un texto."],
    ["an object", { name: { first: "Ana" } }, "El nombre debe ser un texto."],
    ["an array", { name: ["Ana"] }, "El nombre debe ser un texto."],
    [
      "longer than 100 characters after trimming",
      { name: "a".repeat(101) },
      "El nombre no puede superar 100 caracteres.",
    ],
  ])("answers 400 with a { message } when the name is %s", async (_label, body, message) => {
    const response = await patch(body);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ message });
    expect(userRepository.updateName).not.toHaveBeenCalled();
  });

  test("answers 400 when the request has no body at all", async () => {
    const response = await request(app)
      .patch("/api/v1/profile")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ message: "El nombre es obligatorio." });
  });

  test("a name padded with spaces up to 100 characters is valid once trimmed", async () => {
    const response = await patch({ name: `  ${"a".repeat(100)}  ` });

    expect(response.statusCode).toBe(200);
    expect(userRepository.updateName).toHaveBeenCalledWith(
      USER_ID,
      "a".repeat(100)
    );
  });

  test("mass assignment is impossible: only the name changes, role/email/id are ignored", async () => {
    const response = await patch({
      name: "Solo Nombre",
      role: "ADMIN",
      email: "x@y.z",
      id: 999,
      password: "hacked",
      googleId: "evil",
      nickname: "evil",
      avatarUrl: "http://evil.test/a.png",
    });

    expect(response.statusCode).toBe(200);

    // The repository is called with the id from the TOKEN and the name only.
    expect(userRepository.updateName).toHaveBeenCalledTimes(1);
    expect(userRepository.updateName).toHaveBeenCalledWith(
      USER_ID,
      "Solo Nombre"
    );

    expect(response.body.id).toBe(USER_ID);
    expect(response.body.email).toBe(STORED_USER.email);
    expect(response.body.role).toBe("USER");
    expect(response.body.googleId).toBe(STORED_USER.googleId);
    expect(response.body).not.toHaveProperty("password");
  });

  test("ignores the extra fields even when the name is invalid", async () => {
    const response = await patch({ role: "ADMIN", email: "x@y.z", id: 999 });

    expect(response.statusCode).toBe(400);
    expect(userRepository.updateName).not.toHaveBeenCalled();
  });

  test("answers 404 when the user no longer exists", async () => {
    userRepository.getUserById.mockResolvedValue(null);

    const response = await patch({ name: "Nuevo" });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Usuario no encontrado" });
    expect(userRepository.updateName).not.toHaveBeenCalled();
  });

  test("answers 404 when the user disappears between the lookup and the update", async () => {
    const prismaNotFound = Object.assign(new Error("Record not found"), {
      code: "P2025",
    });
    userRepository.updateName.mockRejectedValue(prismaNotFound);

    const response = await patch({ name: "Nuevo" });

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Usuario no encontrado" });
  });

  test("answers 500 with a generic message and never leaks the raw error", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const secret = "connect ECONNREFUSED 10.0.0.5 password=s3cr3t-db-pass";
    userRepository.updateName.mockRejectedValue(new Error(secret));

    const response = await patch({ name: "Nuevo" });

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ message: "Error interno del servidor." });
    expect(JSON.stringify(response.body)).not.toContain("s3cr3t");
    expect(JSON.stringify(response.body)).not.toContain("ECONNREFUSED");
    // The real error is still logged server-side.
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  test("GET /profile answers 500 with a generic message and never leaks the raw error", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    userRepository.getUserById.mockRejectedValue(
      new Error("connect ECONNREFUSED 10.0.0.5 password=s3cr3t-db-pass")
    );

    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ message: "Error interno del servidor." });
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  test("GET /profile keeps the specific 404 message", async () => {
    userRepository.getUserById.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Usuario no encontrado" });
  });

  test.each([
    ["only zero-width characters", "​‌‍﻿", "El nombre es obligatorio."],
    ["a NUL character", "Ana\u0000", "El nombre contiene caracteres no válidos."],
    ["a newline inside", "Ana\nGómez", "El nombre contiene caracteres no válidos."],
    ["a tab inside", "Ana\tGómez", "El nombre contiene caracteres no válidos."],
  ])("answers 400 when the name has %s", async (_label, name, message) => {
    const response = await patch({ name });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ message });
    expect(userRepository.updateName).not.toHaveBeenCalled();
  });

  test.each([
    ["an accented name", "José Ñandú"],
    ["an emoji name", "Ana 🚀"],
  ])("still accepts %s", async (_label, name) => {
    const response = await patch({ name });

    expect(response.statusCode).toBe(200);
    expect(userRepository.updateName).toHaveBeenCalledWith(USER_ID, name);
  });

  test("counts code points: 100 emoji are accepted and 101 are rejected", async () => {
    const ok = await patch({ name: "😀".repeat(100) });

    expect(ok.statusCode).toBe(200);
    expect(userRepository.updateName).toHaveBeenCalledWith(
      USER_ID,
      "😀".repeat(100)
    );

    userRepository.updateName.mockClear();

    const tooLong = await patch({ name: "😀".repeat(101) });

    expect(tooLong.statusCode).toBe(400);
    expect(tooLong.body).toEqual({
      message: "El nombre no puede superar 100 caracteres.",
    });
    expect(userRepository.updateName).not.toHaveBeenCalled();
  });
});
