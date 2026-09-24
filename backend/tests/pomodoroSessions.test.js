const request = require("supertest");
const app = require("../app");

describe("POMODORO SESSIONS API", () => {
  test("Debe rechazar consultar sesiones sin autenticación", async () => {
    const response = await request(app)
      .get("/api/pomodoro-sessions");

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("Debe rechazar crear una sesión sin autenticación", async () => {
    const response = await request(app)
      .post("/api/pomodoro-sessions")
      .send({
        duracion: 25,
        tipo: "focus",
      });

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("Debe rechazar una sesión sin duración", async () => {
    const response = await request(app)
      .post("/api/pomodoro-sessions")
      .send({
        tipo: "focus",
      });

    expect(response.statusCode).toBeGreaterThanOrEqual(400);
  });
});