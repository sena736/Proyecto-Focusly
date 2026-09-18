const request = require("supertest");
const app = require("../app");

describe("AUTH API", () => {

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  test("POST /api/v1/auth/google debe rechazar un id_token vacío", async () => {
    const response = await request(app)
      .post("/api/v1/auth/google")
      .send({
        id_token: ""
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/v1/auth/google debe rechazar una petición sin id_token", async () => {
    const response = await request(app)
      .post("/api/v1/auth/google")
      .send({});

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBeDefined();
  });


  // ==========================================
  // GET PROFILE
  // ==========================================

  test("GET /api/v1/auth/profile debe rechazar una petición sin token", async () => {
    const response = await request(app)
      .get("/api/v1/auth/profile");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Token no proporcionado");
  });

  test("GET /api/v1/auth/profile debe rechazar un token inválido", async () => {
    const response = await request(app)
      .get("/api/v1/auth/profile")
      .set("Authorization", "Bearer token-invalido");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Token inválido o expirado"
    );
  });


  // ==========================================
  // REFRESH TOKEN
  // ==========================================

  test("POST /api/v1/auth/refresh debe rechazar una petición sin token", async () => {
    const response = await request(app)
      .post("/api/v1/auth/refresh");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Token no proporcionado"
    );
  });

  test("POST /api/v1/auth/refresh debe rechazar un token inválido", async () => {
    const response = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Authorization", "Bearer token-invalido");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });


  // ==========================================
  // LOGOUT
  // ==========================================

  test("POST /api/v1/auth/logout debe responder correctamente", async () => {
    const response = await request(app)
      .post("/api/v1/auth/logout");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

});