const request = require("supertest");
const bcrypt = require("bcryptjs");

jest.mock("../src/repositories/user.repository", () => ({
  findByEmail: jest.fn(),
  getUserById: jest.fn(),
  findAll: jest.fn(),
  updateRole: jest.fn(),
}));

const userRepository = require("../src/repositories/user.repository");
const app = require("../src/app");

describe("USERS API (administración)", () => {
  const PASSWORD = "clave-super-secreta";

  const ADMIN_USER = {
    id: 1,
    name: "Admin de Prueba",
    email: "admin@focusly.test",
    role: "ADMIN",
  };

  const REGULAR_USER = {
    id: 2,
    name: "Usuaria de Prueba",
    email: "usuaria@focusly.test",
    role: "USER",
  };

  const loginAs = async (user) => {
    userRepository.findByEmail.mockResolvedValueOnce(user);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: PASSWORD,
    });

    return response.body.data.token;
  };

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    ADMIN_USER.password = hashedPassword;
    REGULAR_USER.password = hashedPassword;
  });

  test("rechaza listar usuarios sin autenticación", async () => {
    const response = await request(app).get("/api/v1/users");

    expect(response.statusCode).toBe(401);
  });

  test("rechaza listar usuarios a un usuario sin rol ADMIN", async () => {
    const token = await loginAs(REGULAR_USER);

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
  });

  test("un ADMIN puede listar usuarios sin que se filtre el password", async () => {
    const token = await loginAs(ADMIN_USER);

    userRepository.findAll.mockResolvedValue([ADMIN_USER, REGULAR_USER]);

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].password).toBeUndefined();
  });

  test("un ADMIN puede cambiar el rol de un usuario", async () => {
    const token = await loginAs(ADMIN_USER);

    userRepository.updateRole.mockResolvedValue({
      ...REGULAR_USER,
      role: "ADMIN",
    });

    const response = await request(app)
      .patch(`/api/v1/users/${REGULAR_USER.id}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "ADMIN" });

    expect(response.statusCode).toBe(200);
    expect(response.body.role).toBe("ADMIN");
    expect(userRepository.updateRole).toHaveBeenCalledWith(
      REGULAR_USER.id,
      "ADMIN"
    );
  });

  test("rechaza cambiar el rol a un valor que no existe en el enum", async () => {
    const token = await loginAs(ADMIN_USER);

    const response = await request(app)
      .patch(`/api/v1/users/${REGULAR_USER.id}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "SUPERADMIN" });

    expect(response.statusCode).toBe(400);
    expect(userRepository.updateRole).not.toHaveBeenCalled();
  });
});
