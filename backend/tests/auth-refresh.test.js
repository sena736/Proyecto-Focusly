const request = require("supertest");
const jwt = require("jsonwebtoken");

// Never touch a real database: only the user repository is mocked.
jest.mock("../src/repositories/user.repository", () => ({
  getUserById: jest.fn(),
}));

process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-for-auth-refresh";

const userRepository = require("../src/repositories/user.repository");
const app = require("../src/app");

const SECRET = process.env.JWT_SECRET;
const USER_ID = 42;

const STORED_USER = {
  id: USER_ID,
  email: "ana@focusly.test",
  password: "hashed-secret",
  name: "Ana",
  role: "USER",
};

const b64url = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const nowSeconds = () => Math.floor(Date.now() / 1000);

const refresh = (token) => {
  const req = request(app).post("/api/v1/auth/refresh");
  return token === undefined ? req : req.set("Authorization", `Bearer ${token}`);
};

describe("AUTH API - POST /api/v1/auth/refresh", () => {
  let consoleError;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    userRepository.getUserById.mockResolvedValue(STORED_USER);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  const expectRejected = (response) => {
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "No se pudo renovar el token",
    });
  };

  test("a valid token returns 200 with a new token and the user without password", async () => {
    const token = jwt.sign({ sub: USER_ID, role: "USER" }, SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    });

    const response = await refresh(token);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).not.toHaveProperty("password");
    expect(response.body.data.user.id).toBe(USER_ID);

    const decoded = jwt.verify(response.body.data.token, SECRET, {
      algorithms: ["HS256"],
    });
    expect(decoded.sub).toBe(USER_ID);
    expect(decoded.role).toBe("USER");
    expect(decoded.exp).toBeGreaterThan(nowSeconds());
    expect(userRepository.getUserById).toHaveBeenCalledWith(USER_ID);
  });

  test("the new token takes its role from the database, not from the old token", async () => {
    // The old token still says ADMIN but the user was demoted afterwards.
    const token = jwt.sign({ sub: USER_ID, role: "ADMIN" }, SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    userRepository.getUserById.mockResolvedValue({
      ...STORED_USER,
      role: "USER",
    });

    const response = await refresh(token);

    expect(response.statusCode).toBe(200);
    const decoded = jwt.verify(response.body.data.token, SECRET, {
      algorithms: ["HS256"],
    });
    expect(decoded.role).toBe("USER");
    expect(response.body.data.user.role).toBe("USER");
  });

  test("an expired token answers 401 and the user is not even looked up", async () => {
    const token = jwt.sign(
      { sub: USER_ID, role: "USER", exp: nowSeconds() - 3600 },
      SECRET,
      { algorithm: "HS256" }
    );

    const response = await refresh(token);

    expectRejected(response);
    expect(userRepository.getUserById).not.toHaveBeenCalled();
  });

  test("an expired token created with a negative expiresIn answers 401", async () => {
    const token = jwt.sign({ sub: USER_ID, role: "USER" }, SECRET, {
      algorithm: "HS256",
      expiresIn: -10,
    });

    expectRejected(await refresh(token));
  });

  test("a token with a tampered signature answers 401", async () => {
    const valid = jwt.sign({ sub: USER_ID, role: "USER" }, SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    const other = jwt.sign({ sub: 7, role: "ADMIN" }, SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    const [header, payload] = valid.split(".");
    const foreignSignature = other.split(".")[2];

    expectRejected(await refresh(`${header}.${payload}.${foreignSignature}`));
    expect(userRepository.getUserById).not.toHaveBeenCalled();
  });

  test("a token with a tampered payload answers 401", async () => {
    const valid = jwt.sign({ sub: USER_ID, role: "USER" }, SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    const [header, , signature] = valid.split(".");
    const forgedPayload = b64url({
      sub: 1,
      role: "ADMIN",
      exp: nowSeconds() + 3600,
    });

    expectRejected(await refresh(`${header}.${forgedPayload}.${signature}`));
  });

  test("a token signed with a different secret answers 401", async () => {
    const token = jwt.sign({ sub: USER_ID, role: "USER" }, "another-secret", {
      algorithm: "HS256",
      expiresIn: "1h",
    });

    expectRejected(await refresh(token));
  });

  test("a token signed with HS512 and the right secret answers 401", async () => {
    const token = jwt.sign({ sub: USER_ID, role: "USER" }, SECRET, {
      algorithm: "HS512",
      expiresIn: "1h",
    });

    expectRejected(await refresh(token));
    expect(userRepository.getUserById).not.toHaveBeenCalled();
  });

  test("an unsigned token (alg none) answers 401", async () => {
    const token = `${b64url({ alg: "none", typ: "JWT" })}.${b64url({
      sub: USER_ID,
      role: "ADMIN",
      exp: nowSeconds() + 3600,
    })}.`;

    expectRejected(await refresh(token));
    expect(userRepository.getUserById).not.toHaveBeenCalled();
  });

  test.each([
    ["a malformed string", "token-invalido"],
    ["two dots only", ".."],
    ["a three-segment string that is not a JWT", "a.b.c"],
  ])("%s answers 401", async (_label, token) => {
    expectRejected(await refresh(token));
  });

  test("a request without Authorization header answers 401", async () => {
    const response = await refresh(undefined);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Token no proporcionado",
    });
  });

  test("a valid token whose user was deleted answers 401", async () => {
    userRepository.getUserById.mockResolvedValue(null);
    const token = jwt.sign({ sub: USER_ID, role: "USER" }, SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    });

    expectRejected(await refresh(token));
    expect(userRepository.getUserById).toHaveBeenCalledWith(USER_ID);
    // The rejection must come from the explicit "user not found" check, not from
    // an accidental TypeError when building a token for a null user.
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][1]).toEqual(
      expect.objectContaining({ message: "Usuario no encontrado" })
    );
  });
});

describe("AUTH API - GET /api/v1/auth/profile token verification", () => {
  let consoleError;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    userRepository.getUserById.mockResolvedValue(STORED_USER);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  const profile = (token) =>
    request(app)
      .get("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${token}`);

  test("a valid HS256 token still works", async () => {
    const token = jwt.sign({ sub: USER_ID, role: "USER" }, SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    });

    const response = await profile(token);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).not.toHaveProperty("password");
  });

  test("a token signed with HS512 answers 401", async () => {
    const token = jwt.sign({ sub: USER_ID, role: "USER" }, SECRET, {
      algorithm: "HS512",
      expiresIn: "1h",
    });

    const response = await profile(token);

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Token inválido o expirado");
    expect(userRepository.getUserById).not.toHaveBeenCalled();
  });

  test("an unsigned token (alg none) answers 401", async () => {
    const token = `${b64url({ alg: "none", typ: "JWT" })}.${b64url({
      sub: USER_ID,
      exp: nowSeconds() + 3600,
    })}.`;

    const response = await profile(token);

    expect(response.statusCode).toBe(401);
    expect(userRepository.getUserById).not.toHaveBeenCalled();
  });
});
