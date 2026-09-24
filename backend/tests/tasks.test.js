const request = require("supertest");
const app = require("../app");

describe("TASKS API", () => {

  // ==========================================
  // OBTENER TAREAS
  // ==========================================

  test("GET /api/v1/tasks debe rechazar una petición sin token", async () => {
    const response = await request(app)
      .get("/api/v1/tasks");

    expect(response.statusCode).toBe(401);
    expect(response.body).toBeDefined();
  });


  // ==========================================
  // CREAR TAREA
  // ==========================================

  test("POST /api/v1/tasks debe rechazar una petición sin token", async () => {
    const response = await request(app)
      .post("/api/v1/tasks")
      .send({
        titulo: "Tarea de prueba",
        descripcion: "Revisar matemáticas",
        completada: false
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toBeDefined();
  });


  // ==========================================
  // ACTUALIZAR TAREA
  // ==========================================

  test("PATCH /api/v1/tasks/1 debe rechazar una petición sin token", async () => {
    const response = await request(app)
      .patch("/api/v1/tasks/1")
      .send({
        titulo: "Tarea actualizada"
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toBeDefined();
  });


  // ==========================================
  // ELIMINAR TAREA
  // ==========================================

  test("DELETE /api/v1/tasks/1 debe rechazar una petición sin token", async () => {
    const response = await request(app)
      .delete("/api/v1/tasks/1");

    expect(response.statusCode).toBe(401);
    expect(response.body).toBeDefined();
  });


  // ==========================================
  // TOKEN INVÁLIDO
  // ==========================================

  test("GET /api/v1/tasks debe rechazar un token inválido", async () => {
    const response = await request(app)
      .get("/api/v1/tasks")
      .set("Authorization", "Bearer token-invalido");

    expect(response.statusCode).toBe(401);
    expect(response.body).toBeDefined();
  });

});