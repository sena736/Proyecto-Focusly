const request = require("supertest");
const app = require("../app");

describe("PROFILE API", () => {

  // ==========================================
  // GET PROFILE
  // ==========================================

  test("GET /api/v1/profile debe rechazar una petición sin token", async () => {
    const response = await request(app)
      .get("/api/v1/profile");

    expect(response.statusCode).toBe(401);
    expect(response.body).toBeDefined();
  });

  test("GET /api/v1/profile debe rechazar un token inválido", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", "Bearer token-invalido");

    expect(response.statusCode).toBe(401);
    expect(response.body).toBeDefined();
  });

});