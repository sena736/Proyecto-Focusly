const request = require("supertest");
const bcrypt = require("bcryptjs");

jest.mock("../src/repositories/user.repository", () => ({
  findByEmail: jest.fn(),
  getUserById: jest.fn(),
}));

jest.mock("../src/repositories/task.repository", () => ({
  getTasksByUserId: jest.fn(),
}));

const userRepository = require("../src/repositories/user.repository");
const taskRepository = require("../src/repositories/task.repository");
const app = require("../src/app");

describe("REGRESIÓN: login real -> ruta protegida", () => {

  const PASSWORD = "clave-super-secreta";

  const FAKE_USER = {
    id: 42,
    name: "Usuaria de Prueba",
    email: "regresion@focusly.test",
    role: "USER",
  };

  beforeEach(async () => {
    FAKE_USER.password = await bcrypt.hash(PASSWORD, 10);
    userRepository.findByEmail.mockResolvedValue(FAKE_USER);
    userRepository.getUserById.mockResolvedValue(FAKE_USER);
  });

  // ==========================================
  // El bug: generateToken() firmaba con `id`,
  // authenticate.js exigía `sub` -> 401 siempre.
  // ==========================================

  test("un token emitido por /auth/login debe ser aceptado por una ruta protegida real", async () => {
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: FAKE_USER.email,
        password: PASSWORD,
      });

    expect(loginResponse.statusCode).toBe(200);

    const { token } = loginResponse.body.data;

    expect(token).toBeDefined();

    taskRepository.getTasksByUserId.mockResolvedValue([]);

    const tasksResponse = await request(app)
      .get("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(tasksResponse.statusCode).toBe(200);
    expect(taskRepository.getTasksByUserId).toHaveBeenCalledWith(
      FAKE_USER.id
    );
  });

  test("/auth/profile debe resolver el usuario a partir de un token real (por id, no por email)", async () => {
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: FAKE_USER.email,
        password: PASSWORD,
      });

    const { token } = loginResponse.body.data;

    const profileResponse = await request(app)
      .get("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(profileResponse.statusCode).toBe(200);
    expect(profileResponse.body.data.email).toBe(FAKE_USER.email);
    expect(userRepository.getUserById).toHaveBeenCalledWith(FAKE_USER.id);
  });

});
