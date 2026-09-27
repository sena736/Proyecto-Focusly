const request = require("supertest");

jest.mock("../src/config/prisma", () => ({
  motivationalPhrase: {
    findMany: jest.fn(),
  },
}));

const prisma = require("../src/config/prisma");
const app = require("../src/app");

describe("PHRASES API", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/v1/phrases/random debe responder correctamente", async () => {
    prisma.motivationalPhrase.findMany.mockResolvedValue([
      { id: 1, text: "Seguí adelante", active: true },
    ]);

    const response = await request(app)
      .get("/api/v1/phrases/random");

    expect([200, 404]).toContain(response.statusCode);
    expect(response.body).toBeDefined();
  });


  test("La respuesta debe contener success", async () => {
    prisma.motivationalPhrase.findMany.mockResolvedValue([
      { id: 1, text: "Seguí adelante", active: true },
    ]);

    const response = await request(app)
      .get("/api/v1/phrases/random");

    expect(response.body).toHaveProperty("success");
  });


  test("Si existe una frase, debe devolver success true", async () => {
    prisma.motivationalPhrase.findMany.mockResolvedValue([
      { id: 1, text: "Seguí adelante", active: true },
    ]);

    const response = await request(app)
      .get("/api/v1/phrases/random");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });


  test("Si no existen frases activas, debe devolver 404", async () => {
    prisma.motivationalPhrase.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/v1/phrases/random");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "No hay frases motivacionales disponibles"
    );
  });

});
