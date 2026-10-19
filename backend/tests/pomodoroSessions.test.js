const request = require("supertest");

// Never touch a real database: the repository is replaced by a small
// in-memory fake that HONOURS userId in every lookup, so ownership is really
// exercised (a mock that ignores userId would prove nothing).
jest.mock("../src/repositories/pomodoroSession.repository", () => {
  const mockStore = { rows: [], nextId: 1 };

  return {
    __store: mockStore,
    create: jest.fn(async (data) => {
      const row = { id: mockStore.nextId++, createdAt: new Date(), ...data };
      mockStore.rows.push(row);
      return row;
    }),
    findOwnedById: jest.fn(async (id, userId) => {
      return (
        mockStore.rows.find((r) => r.id === id && r.userId === userId) || null
      );
    }),
    findByUserId: jest.fn(async (userId) =>
      mockStore.rows.filter((r) => r.userId === userId)
    ),
    findAll: jest.fn(async () => [...mockStore.rows]),
    updateOwned: jest.fn(async (id, userId, data) => {
      const row = mockStore.rows.find(
        (r) => r.id === id && r.userId === userId
      );
      if (!row) return null;
      Object.assign(row, data);
      return row;
    }),
    removeOwned: jest.fn(async (id, userId) => {
      const index = mockStore.rows.findIndex(
        (r) => r.id === id && r.userId === userId
      );
      if (index === -1) return false;
      mockStore.rows.splice(index, 1);
      return true;
    }),
  };
});

process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-for-pomodoro-sessions";

const repository = require("../src/repositories/pomodoroSession.repository");
const { signJwt } = require("../src/utils/jwt");
const app = require("../src/app");

const BASE = "/api/v1/pomodoro-sessions";
const NOT_FOUND = { message: "Sesión Pomodoro no encontrada" };

const ANA = 1;
const BEN = 2;
const ADMIN = 99;

const tokenFor = (sub, role = "USER") => signJwt({ sub, role });
const auth = (sub, role) => `Bearer ${tokenFor(sub, role)}`;

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60000);
const snapshotRows = () => repository.__store.rows.map((r) => ({ ...r }));

const validBody = (overrides = {}) => ({
  type: "WORK",
  startedAt: minutesAgo(25).toISOString(),
  endedAt: minutesAgo(0).toISOString(),
  durationMinutes: 25,
  ...overrides,
});

const seed = () => {
  repository.__store.rows = [
    {
      id: 1,
      userId: ANA,
      type: "WORK",
      startedAt: minutesAgo(60),
      endedAt: minutesAgo(35),
      durationMinutes: 25,
      createdAt: minutesAgo(35),
    },
    {
      id: 2,
      userId: BEN,
      type: "BREAK",
      startedAt: minutesAgo(30),
      endedAt: minutesAgo(25),
      durationMinutes: 5,
      createdAt: minutesAgo(25),
    },
  ];
  repository.__store.nextId = 3;
};

describe("POMODORO SESSIONS API", () => {
  beforeEach(() => {
    seed();
  });

  describe("authentication", () => {
    test.each([
      ["POST", "post", BASE],
      ["GET /my", "get", `${BASE}/my`],
      ["GET /", "get", BASE],
      ["GET /:id", "get", `${BASE}/1`],
      ["PUT /:id", "put", `${BASE}/1`],
      ["DELETE /:id", "delete", `${BASE}/1`],
    ])("%s without token answers 401", async (_label, method, url) => {
      const response = await request(app)[method](url).send(validBody());

      expect(response.statusCode).toBe(401);
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.updateOwned).not.toHaveBeenCalled();
      expect(repository.removeOwned).not.toHaveBeenCalled();
    });
  });

  describe("POST /", () => {
    const post = (body, sub = ANA) =>
      request(app).post(BASE).set("Authorization", auth(sub)).send(body);

    test("creates the session with the userId from the token and ignores a body userId", async () => {
      const body = validBody({ userId: BEN, id: 777, createdAt: "2000-01-01" });

      const response = await post(body);

      expect(response.statusCode).toBe(201);
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith({
        userId: ANA,
        type: "WORK",
        startedAt: new Date(body.startedAt),
        endedAt: new Date(body.endedAt),
        durationMinutes: 25,
      });
      expect(response.body.data.userId).toBe(ANA);
      expect(response.body.data.id).not.toBe(777);
    });

    test("accepts BREAK and the duration bounds 1 and 180", async () => {
      const short = await post(validBody({ type: "BREAK", durationMinutes: 1 }));
      const long = await post(validBody({ durationMinutes: 180 }));

      expect(short.statusCode).toBe(201);
      expect(long.statusCode).toBe(201);
    });

    test.each([
      ["type missing", { type: undefined }, "El tipo de sesión es obligatorio"],
      ["type invalid", { type: "FOCUS" }, "El tipo de sesión no es válido"],
      ["type lowercase", { type: "work" }, "El tipo de sesión no es válido"],
      ["type not a string", { type: 1 }, "El tipo de sesión no es válido"],
      ["startedAt missing", { startedAt: undefined }, "La fecha de inicio es obligatoria"],
      ["startedAt invalid", { startedAt: "not-a-date" }, "La fecha de inicio no es válida"],
      ["startedAt a number", { startedAt: 1700000000000 }, "La fecha de inicio no es válida"],
      ["endedAt missing", { endedAt: undefined }, "La fecha de fin es obligatoria"],
      ["endedAt invalid", { endedAt: "2024-13-45T00:00:00Z" }, "La fecha de fin no es válida"],
      [
        "endedAt before startedAt",
        {
          startedAt: minutesAgo(10).toISOString(),
          endedAt: minutesAgo(20).toISOString(),
        },
        "La fecha de fin debe ser posterior a la de inicio",
      ],
      [
        "endedAt equal to startedAt",
        {
          startedAt: minutesAgo(10).toISOString(),
          endedAt: minutesAgo(10).toISOString(),
        },
        "La fecha de fin debe ser posterior a la de inicio",
      ],
      [
        "startedAt far in the future",
        {
          startedAt: new Date(Date.now() + 10 * 86400000).toISOString(),
          endedAt: new Date(Date.now() + 11 * 86400000).toISOString(),
        },
        "Las fechas no pueden estar en el futuro",
      ],
      [
        "endedAt far in the future",
        { endedAt: new Date(Date.now() + 10 * 86400000).toISOString() },
        "Las fechas no pueden estar en el futuro",
      ],
      ["duration missing", { durationMinutes: undefined }, "La duración es obligatoria"],
      ["duration 0", { durationMinutes: 0 }, "La duración debe ser un entero entre 1 y 180 minutos"],
      ["duration 181", { durationMinutes: 181 }, "La duración debe ser un entero entre 1 y 180 minutos"],
      ["duration 1.5", { durationMinutes: 1.5 }, "La duración debe ser un entero entre 1 y 180 minutos"],
      ["duration a string", { durationMinutes: "25" }, "La duración debe ser un entero entre 1 y 180 minutos"],
      ["duration negative", { durationMinutes: -5 }, "La duración debe ser un entero entre 1 y 180 minutos"],
    ])("answers 400 when %s", async (_label, overrides, message) => {
      const response = await post(validBody(overrides));

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message });
      expect(repository.create).not.toHaveBeenCalled();
    });

    describe("date strictness", () => {
      const dayStamp = (daysAgo) =>
        new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);

      test.each([
        ["Feb 30 (date only)", "2025-02-30"],
        ["Apr 31 (date only)", "2025-04-31"],
        ["Feb 29 of a non-leap year", "2023-02-29"],
        ["Feb 30 with a time", "2025-02-30T10:00:00Z"],
        ["Apr 31 with a time", "2025-04-31T10:00:00Z"],
        ["hour 24", "2025-03-01T24:00:00Z"],
        ["minute 60", "2025-03-01T10:60:00Z"],
        ["a datetime without timezone", "2025-03-01T10:00:00"],
        ["a datetime without timezone and seconds", "2025-03-01T10:00"],
        ["a datetime with milliseconds but no timezone", "2025-03-01T10:00:00.123"],
        ["a year before 2000", "1999-12-31T23:59:59Z"],
        ["year 0001", "0001-01-01T00:00:00Z"],
        ["year 0001 (date only)", "0001-01-01"],
      ])("rejects startedAt with %s", async (_label, startedAt) => {
        const response = await post(validBody({ startedAt }));

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ message: "La fecha de inicio no es válida" });
        expect(repository.create).not.toHaveBeenCalled();
      });

      test("rejects endedAt without timezone", async () => {
        const response = await post(validBody({ endedAt: "2025-03-01T10:00:00" }));

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ message: "La fecha de fin no es válida" });
      });

      test("accepts the exact toISOString() output the frontend sends", async () => {
        const response = await post(
          validBody({
            startedAt: "2026-10-19T14:03:09.123Z",
            endedAt: "2026-10-19T14:28:09.123Z",
          })
        );

        expect(response.statusCode).toBe(201);
      });

      test("accepts an explicit offset and stores the right instant", async () => {
        const response = await post(
          validBody({
            startedAt: "2026-03-01T10:00:00+02:00",
            endedAt: "2026-03-01T10:25:00+02:00",
          })
        );

        expect(response.statusCode).toBe(201);
        expect(repository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            startedAt: new Date("2026-03-01T08:00:00.000Z"),
            endedAt: new Date("2026-03-01T08:25:00.000Z"),
          })
        );
      });

      test("accepts a valid leap day", async () => {
        const response = await post(
          validBody({
            startedAt: "2024-02-29T10:00:00Z",
            endedAt: "2024-02-29T10:25:00Z",
          })
        );

        expect(response.statusCode).toBe(201);
      });

      test("accepts date-only input and treats it as UTC midnight", async () => {
        const response = await post(
          validBody({ startedAt: dayStamp(3), endedAt: dayStamp(2) })
        );

        expect(response.statusCode).toBe(201);
        expect(repository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            startedAt: new Date(`${dayStamp(3)}T00:00:00.000Z`),
            endedAt: new Date(`${dayStamp(2)}T00:00:00.000Z`),
          })
        );
      });
    });

    test.each([
      ["an empty object", {}],
      ["an array", [validBody()]],
    ])("answers 400 with a message when the body is %s", async (_label, body) => {
      const response = await request(app)
        .post(BASE)
        .set("Authorization", auth(ANA))
        .set("Content-Type", "application/json")
        .send(JSON.stringify(body));

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(repository.create).not.toHaveBeenCalled();
    });

    test("answers 400 when there is no body at all", async () => {
      const response = await request(app)
        .post(BASE)
        .set("Authorization", auth(ANA));

      expect(response.statusCode).toBe(400);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /my", () => {
    test("returns only the sessions of the caller", async () => {
      const response = await request(app)
        .get(`${BASE}/my`)
        .set("Authorization", auth(ANA));

      expect(response.statusCode).toBe(200);
      expect(response.body.data.map((s) => s.id)).toEqual([1]);
      expect(repository.findByUserId).toHaveBeenCalledWith(ANA);
    });
  });

  describe("GET /:id", () => {
    test("returns an own session", async () => {
      const response = await request(app)
        .get(`${BASE}/1`)
        .set("Authorization", auth(ANA));

      expect(response.statusCode).toBe(200);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.userId).toBe(ANA);
    });

    test("answers 404 for a session of another user", async () => {
      const response = await request(app)
        .get(`${BASE}/2`)
        .set("Authorization", auth(ANA));

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
    });

    test("answers the same 404 for a missing session (ids cannot be probed)", async () => {
      const response = await request(app)
        .get(`${BASE}/12345`)
        .set("Authorization", auth(ANA));

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
    });

    test.each(["abc", "1.5", "-1", "0", "1e3"])(
      "answers 404 (not 500) for the non-id value %s",
      async (value) => {
        const response = await request(app)
          .get(`${BASE}/${value}`)
          .set("Authorization", auth(ANA));

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual(NOT_FOUND);
      }
    );

    test("reaches the repository with the largest int32 id (and answers 404 if absent)", async () => {
      const response = await request(app)
        .get(`${BASE}/2147483647`)
        .set("Authorization", auth(ANA));

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
      expect(repository.findOwnedById).toHaveBeenCalledWith(2147483647, ANA);
    });

    test.each(["2147483648", "99999999999", "9007199254740991", "01", "0001"])(
      "answers 404 without touching the repository for the non-canonical or out-of-range id %s",
      async (value) => {
        const response = await request(app)
          .get(`${BASE}/${value}`)
          .set("Authorization", auth(ANA));

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual(NOT_FOUND);
        expect(repository.findOwnedById).not.toHaveBeenCalled();
      }
    );

    test.each(["2147483648", "01"])(
      "PUT and DELETE also answer 404 without the repository for the id %s",
      async (value) => {
        const put = await request(app)
          .put(`${BASE}/${value}`)
          .set("Authorization", auth(ANA))
          .send({ durationMinutes: 10 });
        const del = await request(app)
          .delete(`${BASE}/${value}`)
          .set("Authorization", auth(ANA));

        expect(put.statusCode).toBe(404);
        expect(del.statusCode).toBe(404);
        expect(repository.findOwnedById).not.toHaveBeenCalled();
        expect(repository.updateOwned).not.toHaveBeenCalled();
        expect(repository.removeOwned).not.toHaveBeenCalled();
      }
    );

    test("an ADMIN cannot read another user's session through /:id", async () => {
      const response = await request(app)
        .get(`${BASE}/1`)
        .set("Authorization", auth(ADMIN, "ADMIN"));

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
    });
  });

  describe("PUT /:id", () => {
    const put = (id, body, sub = ANA, role) =>
      request(app)
        .put(`${BASE}/${id}`)
        .set("Authorization", auth(sub, role))
        .send(body);

    test("updates an own session and only passes the whitelisted fields", async () => {
      const response = await put(1, {
        durationMinutes: 30,
        userId: BEN,
        id: 999,
        createdAt: "2000-01-01T00:00:00.000Z",
        role: "ADMIN",
      });

      expect(response.statusCode).toBe(200);
      expect(repository.updateOwned).toHaveBeenCalledTimes(1);
      expect(repository.updateOwned).toHaveBeenCalledWith(1, ANA, {
        durationMinutes: 30,
      });
      expect(response.body.data.userId).toBe(ANA);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.durationMinutes).toBe(30);
    });

    test("can edit type and the dates together", async () => {
      const startedAt = minutesAgo(50).toISOString();
      const endedAt = minutesAgo(40).toISOString();

      const response = await put(1, {
        type: "BREAK",
        startedAt,
        endedAt,
        durationMinutes: 10,
      });

      expect(response.statusCode).toBe(200);
      expect(repository.updateOwned).toHaveBeenCalledWith(1, ANA, {
        type: "BREAK",
        startedAt: new Date(startedAt),
        endedAt: new Date(endedAt),
        durationMinutes: 10,
      });
    });

    test("answers 400 when there is nothing editable to update", async () => {
      const response = await put(1, { userId: BEN });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(repository.updateOwned).not.toHaveBeenCalled();
    });

    test.each([
      ["type invalid", { type: "work" }, "El tipo de sesión no es válido"],
      ["duration 0", { durationMinutes: 0 }, "La duración debe ser un entero entre 1 y 180 minutos"],
      ["duration 181", { durationMinutes: 181 }, "La duración debe ser un entero entre 1 y 180 minutos"],
      ["duration a string", { durationMinutes: "25" }, "La duración debe ser un entero entre 1 y 180 minutos"],
      ["startedAt invalid", { startedAt: "nope" }, "La fecha de inicio no es válida"],
      ["endedAt invalid", { endedAt: "nope" }, "La fecha de fin no es válida"],
      [
        "endedAt before startedAt",
        {
          startedAt: minutesAgo(10).toISOString(),
          endedAt: minutesAgo(20).toISOString(),
        },
        "La fecha de fin debe ser posterior a la de inicio",
      ],
      [
        "a date in the far future",
        { endedAt: new Date(Date.now() + 10 * 86400000).toISOString() },
        "Las fechas no pueden estar en el futuro",
      ],
    ])("answers 400 when %s", async (_label, body, message) => {
      const response = await put(1, body);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ message });
      expect(repository.updateOwned).not.toHaveBeenCalled();
    });

    test("answers 404 for a session of another user and changes nothing", async () => {
      const before = snapshotRows();

      const response = await put(2, { durationMinutes: 99, type: "WORK" });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
      expect(snapshotRows()).toEqual(before);
    });

    describe("cross-check against the stored dates", () => {
      const ORDER_MESSAGE = "La fecha de fin debe ser posterior a la de inicio";

      test("rejects an endedAt earlier than the stored startedAt", async () => {
        const response = await put(1, { endedAt: minutesAgo(70).toISOString() });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ message: ORDER_MESSAGE });
        expect(repository.updateOwned).not.toHaveBeenCalled();
      });

      test("rejects a startedAt later than the stored endedAt", async () => {
        const response = await put(1, { startedAt: minutesAgo(10).toISOString() });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ message: ORDER_MESSAGE });
        expect(repository.updateOwned).not.toHaveBeenCalled();
      });

      test("accepts an endedAt or startedAt consistent with the stored counterpart", async () => {
        const ended = await put(1, { endedAt: minutesAgo(30).toISOString() });
        const started = await put(1, { startedAt: minutesAgo(70).toISOString() });

        expect(ended.statusCode).toBe(200);
        expect(started.statusCode).toBe(200);
      });

      test("does not trap a legacy row whose stored dates are already inconsistent when the dates are untouched", async () => {
        const row = repository.__store.rows.find((r) => r.id === 1);
        row.startedAt = minutesAgo(10);
        row.endedAt = minutesAgo(20);

        const duration = await put(1, { durationMinutes: 30 });
        const type = await put(1, { type: "BREAK" });

        expect(duration.statusCode).toBe(200);
        expect(type.statusCode).toBe(200);
        expect(repository.updateOwned).toHaveBeenCalledWith(1, ANA, {
          durationMinutes: 30,
        });
      });

      test("still validates a changed date against the stored counterpart on a legacy row", async () => {
        const row = repository.__store.rows.find((r) => r.id === 1);
        row.startedAt = minutesAgo(10);
        row.endedAt = minutesAgo(20);

        const response = await put(1, { endedAt: minutesAgo(15).toISOString() });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ message: ORDER_MESSAGE });
      });
    });

    test("answers 404 when the row disappears between the check and the update (race)", async () => {
      repository.updateOwned.mockResolvedValueOnce(null);

      const response = await put(1, { durationMinutes: 10 });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
      expect(repository.updateOwned).toHaveBeenCalledTimes(1);
    });

    test("cannot steal a session by sending userId", async () => {
      const response = await put(2, { userId: ANA, durationMinutes: 10 });

      expect(response.statusCode).toBe(404);
      expect(repository.__store.rows.find((r) => r.id === 2).userId).toBe(BEN);
    });

    test("answers 404 for a missing session", async () => {
      const response = await put(12345, { durationMinutes: 10 });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
    });

    test("an ADMIN cannot edit another user's session through /:id", async () => {
      const response = await put(1, { durationMinutes: 10 }, ADMIN, "ADMIN");

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
      expect(repository.__store.rows.find((r) => r.id === 1).durationMinutes).toBe(25);
    });
  });

  describe("DELETE /:id", () => {
    const del = (id, sub = ANA, role) =>
      request(app).delete(`${BASE}/${id}`).set("Authorization", auth(sub, role));

    test("deletes an own session (200 with the existing message)", async () => {
      const response = await del(1);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        message: "Sesión eliminada correctamente",
      });
      expect(repository.__store.rows.map((r) => r.id)).toEqual([2]);
    });

    test("answers 404 for a session of another user and does not delete it", async () => {
      const before = snapshotRows();

      const response = await del(2);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
      expect(repository.__store.rows.map((r) => r.id)).toEqual([1, 2]);
      expect(snapshotRows()).toEqual(before);
    });

    test("answers 404 for a missing session", async () => {
      const response = await del(12345);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
    });

    test("an ADMIN cannot delete another user's session through /:id", async () => {
      const response = await del(1, ADMIN, "ADMIN");

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(NOT_FOUND);
      expect(repository.__store.rows.map((r) => r.id)).toEqual([1, 2]);
    });
  });

  describe("internal errors never leak details", () => {
    const LEAKY = "connect ECONNREFUSED 10.0.0.5 password=s3cr3t";
    let consoleError;

    beforeEach(() => {
      consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleError.mockRestore();
    });

    test.each([
      ["POST /", "post", BASE, "create", validBody()],
      ["GET /my", "get", `${BASE}/my`, "findByUserId", {}],
      ["GET /:id", "get", `${BASE}/1`, "findOwnedById", {}],
      ["PUT /:id", "put", `${BASE}/1`, "findOwnedById", { durationMinutes: 10 }],
      ["DELETE /:id", "delete", `${BASE}/1`, "removeOwned", {}],
    ])("%s answers a generic 500", async (_label, method, url, repoMethod, body) => {
      repository[repoMethod].mockRejectedValueOnce(new Error(LEAKY));

      const response = await request(app)
        [method](url)
        .set("Authorization", auth(ANA))
        .send(body);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ message: "Error interno del servidor." });
      expect(JSON.stringify(response.body)).not.toMatch(/s3cr3t|ECONNREFUSED/);
      expect(consoleError).toHaveBeenCalled();
    });

    test("GET / (admin) answers a generic 500", async () => {
      repository.findAll.mockRejectedValueOnce(new Error(LEAKY));

      const response = await request(app)
        .get(BASE)
        .set("Authorization", auth(ADMIN, "ADMIN"));

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ message: "Error interno del servidor." });
      expect(JSON.stringify(response.body)).not.toMatch(/s3cr3t|ECONNREFUSED/);
      expect(consoleError).toHaveBeenCalled();
    });

    test("PUT /:id also hides a failure thrown by the update itself", async () => {
      repository.updateOwned.mockRejectedValueOnce(new Error(LEAKY));

      const response = await request(app)
        .put(`${BASE}/1`)
        .set("Authorization", auth(ANA))
        .send({ durationMinutes: 10 });

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ message: "Error interno del servidor." });
    });

    test("an error with a non-4xx status is still answered generically", async () => {
      const error = new Error(LEAKY);
      error.status = 503;
      repository.findByUserId.mockRejectedValueOnce(error);

      const response = await request(app)
        .get(`${BASE}/my`)
        .set("Authorization", auth(ANA));

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ message: "Error interno del servidor." });
    });
  });

  describe("GET / (admin list)", () => {
    test("an ADMIN gets every session", async () => {
      const response = await request(app)
        .get(BASE)
        .set("Authorization", auth(ADMIN, "ADMIN"));

      expect(response.statusCode).toBe(200);
      expect(response.body.data.map((s) => s.id)).toEqual([1, 2]);
    });

    test("a USER gets 403", async () => {
      const response = await request(app)
        .get(BASE)
        .set("Authorization", auth(ANA));

      expect(response.statusCode).toBe(403);
      expect(repository.findAll).not.toHaveBeenCalled();
    });
  });
});
