const request = require("supertest");
const app = require("../app");

describe("PHRASES API", () => {

  test("GET /api/v1/phrases/random debe responder correctamente", async () => {
    const response = await request(app)
      .get("/api/v1/phrases/random");

    expect([200, 404]).toContain(response.statusCode);
    expect(response.body).toBeDefined();
  });


  test("La respuesta debe contener success", async () => {
    const response = await request(app)
      .get("/api/v1/phrases/random");

    expect(response.body).toHaveProperty("success");
  });


  test("Si existe una frase, debe devolver success true", async () => {
    const response = await request(app)
      .get("/api/v1/phrases/random");

    if (response.statusCode === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    }
  });


  test("Si no existen frases activas, debe devolver 404", async () => {
    const response = await request(app)
      .get("/api/v1/phrases/random");

    if (response.statusCode === 404) {
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "No hay frases motivacionales disponibles"
      );
    }
  });

});