const request = require("supertest");
const app = require("../app");

describe("USERS API", () => {
  test("Debe rechazar consultar usuarios sin autenticación", async () => {
    const response = await request(app)
      .get("/api/users");

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("Debe rechazar crear un usuario con datos incompletos", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        nombre: "Usuario",
      });

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("Debe rechazar un email inválido", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        nombre: "Usuario Test",
        email: "correo-invalido",
        password: "123456",
      });

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });
});