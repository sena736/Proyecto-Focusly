const bcrypt = require("bcryptjs");

// The seed must never reach a real database from a test. `main` receives the
// fake explicitly, and the shared client module is replaced by a proxy that
// forwards to the fake of the current test (used by the "default client" case).
let mockCurrent;

jest.mock("../src/config/prisma", () => {
  return new Proxy(
    {},
    { get: (_target, property) => mockCurrent && mockCurrent[property] }
  );
});

// Real session validation: the service is exercised with an in-memory
// repository so the rules are NOT duplicated in this test.
jest.mock("../src/repositories/pomodoroSession.repository", () => ({
  create: jest.fn(async (data) => ({ id: 1, ...data })),
}));

const sessionService = require("../src/services/pomodoroSessions.service");
const seed = require("../prisma/seed");
const {
  DEMO_EMAIL_DOMAIN,
  DEMO_PASSWORD,
  parseDatabaseTarget,
  assertSafeTarget,
  buildDemoData,
  runSeed,
  main,
} = require("../prisma/seed-demo");

const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const NOW = new Date("2026-10-21T15:30:00.000Z");
const TODAY_UTC = Date.UTC(2026, 9, 21);

const LOCAL_URL = "mysql://focusly_user:s3cr3t-pass@localhost:3306/focusly";
const REMOTE_URL = "mysql://remote_user:r3mote-pass@db.example.com:3306/focusly_prod";

const WRITE_METHODS = [
  "upsert",
  "create",
  "createMany",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
];

/**
 * In-memory stand-in for the Prisma client. Operations are lazy (executed when
 * awaited, like Prisma's), every executed call is recorded and flagged with
 * whether it ran inside `$transaction`.
 */
const makeFakePrisma = (initial = {}) => {
  const store = {
    users: [...(initial.users || [])],
    tasks: [...(initial.tasks || [])],
    sessions: [...(initial.sessions || [])],
    phrases: [...(initial.phrases || [])],
  };
  const nextId = {
    users: Math.max(0, ...store.users.map((r) => r.id)) + 1,
    tasks: Math.max(0, ...store.tasks.map((r) => r.id)) + 1,
    sessions: Math.max(0, ...store.sessions.map((r) => r.id)) + 1,
    phrases: Math.max(0, ...store.phrases.map((r) => r.id)) + 1,
  };
  const calls = [];
  let inTransaction = false;

  const matches = (row, where = {}) =>
    Object.entries(where).every(([key, condition]) => {
      if (condition && typeof condition === "object") {
        if ("in" in condition) return condition.in.includes(row[key]);
        if ("endsWith" in condition) {
          return String(row[key]).endsWith(condition.endsWith);
        }
        throw new Error(`Unsupported condition for ${key}`);
      }
      return row[key] === condition;
    });

  const lazy = (model, method, args, run) => {
    let promise;
    return {
      then: (resolve, reject) => {
        if (!promise) {
          calls.push({ model, method, args, inTransaction });
          promise = Promise.resolve().then(run);
        }
        return promise.then(resolve, reject);
      },
    };
  };

  const table = (model, key) => ({
    findMany: (args = {}) =>
      lazy(model, "findMany", args, () =>
        store[key].filter((row) => matches(row, args.where))
      ),
    count: (args = {}) =>
      lazy(model, "count", args, () =>
        store[key].filter((row) => matches(row, args.where)).length
      ),
    createMany: (args) =>
      lazy(model, "createMany", args, () => {
        args.data.forEach((row) =>
          store[key].push({ id: nextId[key]++, ...row })
        );
        return { count: args.data.length };
      }),
    deleteMany: (args = {}) =>
      lazy(model, "deleteMany", args, () => {
        const before = store[key].length;
        store[key] = store[key].filter((row) => !matches(row, args.where));
        return { count: before - store[key].length };
      }),
    delete: (args) =>
      lazy(model, "delete", args, () => {
        throw new Error("delete must never be used by the demo seed");
      }),
  });

  const user = {
    ...table("user", "users"),
    upsert: (args) =>
      lazy("user", "upsert", args, () => {
        const existing = store.users.find((row) => row.email === args.where.email);
        if (existing) {
          Object.assign(existing, args.update);
          return existing;
        }
        const created = { id: nextId.users++, ...args.create };
        store.users.push(created);
        return created;
      }),
  };

  const prisma = {
    user,
    task: table("task", "tasks"),
    pomodoroSession: table("pomodoroSession", "sessions"),
    motivationalPhrase: table("motivationalPhrase", "phrases"),
    $transaction: async (operations) => {
      calls.push({ model: null, method: "$transaction", inTransaction: false });
      inTransaction = true;
      try {
        if (typeof operations === "function") {
          return await operations(prisma);
        }
        const results = [];
        for (const operation of operations) {
          results.push(await operation);
        }
        return results;
      } finally {
        inTransaction = false;
      }
    },
    $disconnect: async () => {},
  };

  return { prisma, store, calls };
};

const makeLogger = () => {
  const lines = [];
  const push = (...parts) => lines.push(parts.join(" "));
  return { log: push, logError: push, lines, text: () => lines.join("\n") };
};

const writes = (calls) =>
  calls.filter(
    (call) => WRITE_METHODS.includes(call.method) || call.method === "$transaction"
  );

const demoOf = (data, name) => data.users.find((u) => u.name === name);

describe("parseDatabaseTarget", () => {
  it("returns only host and database, never credentials", () => {
    const target = parseDatabaseTarget(LOCAL_URL);

    expect(target).toEqual({ host: "localhost", database: "focusly" });
    expect(Object.keys(target).sort()).toEqual(["database", "host"]);

    const serialised = JSON.stringify(target);
    expect(serialised).not.toContain("focusly_user");
    expect(serialised).not.toContain("s3cr3t-pass");
  });

  it("parses IPv4 hosts with port and query string", () => {
    expect(
      parseDatabaseTarget("mysql://u:p@127.0.0.1:3307/mydb?ssl=true&x=1")
    ).toEqual({ host: "127.0.0.1", database: "mydb" });
  });

  it("parses bracketed IPv6 hosts without the brackets", () => {
    expect(parseDatabaseTarget("mysql://u:p@[::1]:3306/mydb")).toEqual({
      host: "::1",
      database: "mydb",
    });
  });

  it("lower-cases the host and handles percent-encoded passwords", () => {
    expect(parseDatabaseTarget("mysql://u:p%40ss%2Fword@LocalHost/Mydb")).toEqual({
      host: "localhost",
      database: "Mydb",
    });
  });

  it("handles a URL without credentials or port", () => {
    expect(parseDatabaseTarget("mysql://db.example.com/focusly")).toEqual({
      host: "db.example.com",
      database: "focusly",
    });
  });

  it("throws on an invalid URL without echoing it", () => {
    expect(() => parseDatabaseTarget("not a url, secret-inside")).toThrow(
      /DATABASE_URL/
    );

    try {
      parseDatabaseTarget("not a url, secret-inside");
    } catch (error) {
      expect(error.message).not.toContain("secret-inside");
    }
  });
});

describe("assertSafeTarget", () => {
  it("refuses production, even for a local database and with confirmation", () => {
    expect(() =>
      assertSafeTarget({ nodeEnv: "production", url: LOCAL_URL })
    ).toThrow(/producci/i);

    expect(() =>
      assertSafeTarget({
        nodeEnv: "production",
        url: LOCAL_URL,
        allowRemote: "focusly",
      })
    ).toThrow(/producci/i);
  });

  it("refuses a remote host without confirmation", () => {
    expect(() =>
      assertSafeTarget({ nodeEnv: "development", url: REMOTE_URL })
    ).toThrow(/DEMO_SEED_ALLOW_REMOTE/);
  });

  it("refuses a remote host when the confirmation is not the exact database name", () => {
    for (const allowRemote of ["true", "1", "FOCUSLY_PROD", "focusly", ""]) {
      expect(() =>
        assertSafeTarget({ nodeEnv: "development", url: REMOTE_URL, allowRemote })
      ).toThrow(/DEMO_SEED_ALLOW_REMOTE/);
    }
  });

  it("accepts a remote host with the exact database name as confirmation", () => {
    expect(
      assertSafeTarget({
        nodeEnv: "development",
        url: REMOTE_URL,
        allowRemote: "focusly_prod",
      })
    ).toMatchObject({ host: "db.example.com", database: "focusly_prod", isLocal: false });
  });

  it("accepts localhost, 127.0.0.1 and ::1", () => {
    for (const url of [
      "mysql://u:p@localhost:3306/d",
      "mysql://u:p@127.0.0.1:3306/d",
      "mysql://u:p@[::1]:3306/d",
    ]) {
      expect(assertSafeTarget({ nodeEnv: "development", url })).toMatchObject({
        isLocal: true,
      });
    }
  });

  it("does not treat look-alike hosts as local", () => {
    expect(() =>
      assertSafeTarget({
        nodeEnv: "development",
        url: "mysql://u:p@localhost.evil.com:3306/d",
      })
    ).toThrow(/DEMO_SEED_ALLOW_REMOTE/);
  });

  it("refuses when DATABASE_URL is missing", () => {
    expect(() => assertSafeTarget({ nodeEnv: "development", url: "" })).toThrow(
      /DATABASE_URL/
    );
  });

  it("never leaks credentials in its error messages", () => {
    try {
      assertSafeTarget({ nodeEnv: "development", url: REMOTE_URL });
    } catch (error) {
      expect(error.message).not.toContain("r3mote-pass");
      expect(error.message).not.toContain("remote_user");
    }
  });
});

describe("buildDemoData", () => {
  const data = buildDemoData(NOW);

  it("defines the five demo users with the demo email domain", () => {
    expect(data.users).toHaveLength(5);
    data.users.forEach((u) => expect(u.email.endsWith(DEMO_EMAIL_DOMAIN)).toBe(true));
    expect(new Set(data.users.map((u) => u.email)).size).toBe(5);
    expect(data.users.filter((u) => u.role === "ADMIN")).toHaveLength(1);
    expect(demoOf(data, "Administrador Demo").role).toBe("ADMIN");
    ["Camila Rojas", "Andrés Gómez", "Laura Pérez", "Sofía Martínez"].forEach(
      (name) => expect(demoOf(data, name).role).toBe("USER")
    );
  });

  it("is deterministic for a given `now`", () => {
    expect(buildDemoData(NOW)).toEqual(data);
  });

  it("gives each user the expected amount of data (Sofía and admin have no tasks)", () => {
    const countTasks = (name) => data.tasks[demoOf(data, name).email].length;
    const countSessions = (name) => data.sessions[demoOf(data, name).email].length;

    expect(countTasks("Camila Rojas")).toBe(12);
    expect(countTasks("Andrés Gómez")).toBe(6);
    expect(countTasks("Laura Pérez")).toBe(3);
    expect(countTasks("Administrador Demo")).toBe(0);
    expect(countTasks("Sofía Martínez")).toBe(0);

    expect(countSessions("Camila Rojas")).toBe(17);
    expect(countSessions("Andrés Gómez")).toBe(8);
    expect(countSessions("Laura Pérez")).toBe(4);
    expect(countSessions("Administrador Demo")).toBe(2);
    expect(countSessions("Sofía Martínez")).toBe(0);
  });

  describe("Camila's tasks cover every filter of the Tasks page", () => {
    const tasks = data.tasks[demoOf(data, "Camila Rojas").email];
    const pending = tasks.filter((t) => t.status === "PENDING");
    const completed = tasks.filter((t) => t.status === "COMPLETED");
    const dayOffset = (task) => (task.dueDate.getTime() - TODAY_UTC) / DAY;

    it("has pending, completed and HIGH tasks plus LOW and MEDIUM ones", () => {
      expect(pending.length).toBeGreaterThanOrEqual(6);
      expect(completed.length).toBeGreaterThanOrEqual(4);
      expect(tasks.filter((t) => t.priority === "HIGH").length).toBeGreaterThanOrEqual(3);
      expect(tasks.some((t) => t.priority === "LOW")).toBe(true);
      expect(tasks.some((t) => t.priority === "MEDIUM")).toBe(true);
    });

    it("lands the completed percentage between 35% and 45%", () => {
      const percent = Math.round((completed.length / tasks.length) * 100);
      expect(percent).toBeGreaterThanOrEqual(35);
      expect(percent).toBeLessThanOrEqual(45);
    });

    it("has one overdue pending task, one due today, one tomorrow and some next week", () => {
      const dated = tasks.filter((t) => t.dueDate);

      const overdue = dated.filter((t) => dayOffset(t) === -3);
      expect(overdue).toHaveLength(1);
      expect(overdue[0].status).toBe("PENDING");

      expect(dated.filter((t) => dayOffset(t) === 0)).toHaveLength(1);
      expect(dated.filter((t) => dayOffset(t) === 1)).toHaveLength(1);
      expect(
        dated.filter((t) => dayOffset(t) >= 4 && dayOffset(t) <= 10).length
      ).toBeGreaterThanOrEqual(2);
    });

    it("has exactly two tasks without a due date", () => {
      expect(tasks.filter((t) => t.dueDate === null)).toHaveLength(2);
    });
  });

  it("stores every due date at UTC midnight", () => {
    Object.values(data.tasks)
      .flat()
      .filter((t) => t.dueDate)
      .forEach((t) => {
        expect(t.dueDate).toBeInstanceOf(Date);
        expect(t.dueDate.getTime() % DAY).toBe(0);
        expect(t.dueDate.toISOString().endsWith("T00:00:00.000Z")).toBe(true);
      });
  });

  it("uses realistic content: short titles and descriptions for most tasks", () => {
    const all = Object.values(data.tasks).flat();

    all.forEach((t) => {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.title.length).toBeLessThanOrEqual(60);
      expect(["LOW", "MEDIUM", "HIGH"]).toContain(t.priority);
      expect(["PENDING", "COMPLETED"]).toContain(t.status);
    });

    const withDescription = all.filter((t) => t.description);
    expect(withDescription.length / all.length).toBeGreaterThanOrEqual(0.75);
  });

  describe("sessions", () => {
    const allSessions = Object.values(data.sessions).flat();

    it("are all in the past relative to `now`", () => {
      allSessions.forEach((s) => {
        expect(s.endedAt.getTime()).toBeLessThan(NOW.getTime());
        expect(s.startedAt.getTime()).toBeLessThan(s.endedAt.getTime());
      });
    });

    it("end exactly `durationMinutes` after they start", () => {
      allSessions.forEach((s) => {
        expect(s.endedAt.getTime() - s.startedAt.getTime()).toBe(
          s.durationMinutes * MINUTE
        );
      });
    });

    it("give Camila a realistic week of focus and breaks", () => {
      const sessions = data.sessions[demoOf(data, "Camila Rojas").email];

      sessions.forEach((s) => {
        expect(s.startedAt.getTime()).toBeGreaterThanOrEqual(NOW.getTime() - 7 * DAY);
      });

      const work = sessions.filter((s) => s.type === "WORK");
      const breaks = sessions.filter((s) => s.type === "BREAK");

      expect(work.filter((s) => s.durationMinutes === 25).length).toBeGreaterThan(
        work.length / 2
      );
      expect(work.filter((s) => s.durationMinutes === 50).length).toBeGreaterThanOrEqual(1);
      expect(breaks.some((s) => s.durationMinutes === 5)).toBe(true);
      expect(breaks.some((s) => s.durationMinutes === 15)).toBe(true);
    });

    it("do not overlap within a user", () => {
      Object.values(data.sessions).forEach((sessions) => {
        const ordered = [...sessions].sort((a, b) => a.startedAt - b.startedAt);
        for (let i = 1; i < ordered.length; i += 1) {
          expect(ordered[i].startedAt.getTime()).toBeGreaterThanOrEqual(
            ordered[i - 1].endedAt.getTime()
          );
        }
      });
    });

    it("pass the REAL pomodoro session validation of the backend service", async () => {
      // Real clock on purpose: the service rejects dates in the future.
      const live = buildDemoData(new Date());
      const liveSessions = Object.values(live.sessions).flat();
      expect(liveSessions.length).toBeGreaterThan(0);

      for (const s of liveSessions) {
        await expect(
          sessionService.createSession(1, {
            type: s.type,
            startedAt: s.startedAt.toISOString(),
            endedAt: s.endedAt.toISOString(),
            durationMinutes: s.durationMinutes,
          })
        ).resolves.toMatchObject({ type: s.type, durationMinutes: s.durationMinutes });
      }
    });

    it("have distinct start times, so the newest-first history order is stable", () => {
      // Mirrors frontend utils/date.sortByDateDescending (by startedAt, desc).
      const sessions = data.sessions[demoOf(data, "Camila Rojas").email];
      const history = [...sessions].sort(
        (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
      );

      expect(new Set(sessions.map((s) => s.startedAt.getTime())).size).toBe(
        sessions.length
      );
      for (let i = 1; i < history.length; i += 1) {
        expect(history[i - 1].startedAt.getTime()).toBeGreaterThan(
          history[i].startedAt.getTime()
        );
      }
      // The 10 newest (what the history shows) include today's session first.
      const newest = Math.max(...sessions.map((s) => s.startedAt.getTime()));
      expect(history[0].startedAt.getTime()).toBe(newest);
      expect(history.slice(0, 10)).toHaveLength(10);
    });
  });
});

describe("runSeed", () => {
  const demoEmails = buildDemoData(NOW).users.map((u) => u.email);

  it("creates the demo users, tasks and sessions", async () => {
    const { prisma, store } = makeFakePrisma();

    const summary = await runSeed(prisma, { now: NOW });

    expect(store.users.map((u) => u.email).sort()).toEqual([...demoEmails].sort());
    expect(store.tasks).toHaveLength(21);
    expect(store.sessions).toHaveLength(31);
    expect(summary).toMatchObject({ users: 5, tasks: 21, sessions: 31 });
  });

  it("is idempotent: a second run yields the same counts and the same user ids", async () => {
    const { prisma, store } = makeFakePrisma();

    await runSeed(prisma, { now: NOW });
    const idsAfterFirst = store.users.map((u) => [u.email, u.id]);
    const counts = [store.users.length, store.tasks.length, store.sessions.length];

    await runSeed(prisma, { now: NOW });

    expect([store.users.length, store.tasks.length, store.sessions.length]).toEqual(
      counts
    );
    expect(store.users.map((u) => [u.email, u.id])).toEqual(idsAfterFirst);
  });

  it("deletes ONLY tasks and sessions of demo users, never users", async () => {
    const { prisma, calls } = makeFakePrisma({
      users: [{ id: 500, email: "real@example.com", name: "Real" }],
    });

    await runSeed(prisma, { now: NOW });

    const deletes = calls.filter((c) => c.method === "deleteMany");
    expect(deletes.map((c) => c.model).sort()).toEqual(["pomodoroSession", "task"]);

    deletes.forEach((c) => {
      expect(Object.keys(c.args.where)).toEqual(["userId"]);
      expect(c.args.where.userId.in.length).toBe(5);
      expect(c.args.where.userId.in).not.toContain(500);
    });

    expect(calls.some((c) => c.model === "user" && c.method === "deleteMany")).toBe(false);
    expect(calls.some((c) => c.method === "delete")).toBe(false);
  });

  it("leaves non-demo users and their data untouched", async () => {
    const realTasks = [
      { id: 1, userId: 500, title: "Mi tarea real", status: "PENDING" },
      { id: 2, userId: 500, title: "Otra tarea real", status: "COMPLETED" },
    ];
    const realSessions = [
      { id: 1, userId: 500, type: "WORK", durationMinutes: 25 },
      { id: 2, userId: 501, type: "BREAK", durationMinutes: 5 },
    ];
    const realUsers = [
      { id: 500, email: "real@example.com", name: "Real" },
      { id: 501, email: "alguien@focusly.demo.example.com", name: "Lookalike" },
    ];
    const { prisma, store } = makeFakePrisma({
      users: realUsers,
      tasks: realTasks,
      sessions: realSessions,
    });

    await runSeed(prisma, { now: NOW });
    await runSeed(prisma, { now: NOW });

    expect(store.users.filter((u) => u.id === 500 || u.id === 501)).toEqual(realUsers);
    expect(store.tasks.filter((t) => t.userId === 500)).toEqual(realTasks);
    expect(store.sessions.filter((s) => s.userId === 500 || s.userId === 501)).toEqual(
      realSessions
    );
  });

  it("replaces previous demo rows (stale demo data does not survive)", async () => {
    const { prisma, store } = makeFakePrisma();
    await runSeed(prisma, { now: NOW });

    const camilaId = store.users.find((u) => u.name === "Camila Rojas").id;
    store.tasks.push({ id: 9999, userId: camilaId, title: "Tarea vieja", status: "PENDING" });

    await runSeed(prisma, { now: NOW });

    expect(store.tasks.some((t) => t.title === "Tarea vieja")).toBe(false);
    expect(store.tasks).toHaveLength(21);
  });

  it("performs the data replacement inside a transaction", async () => {
    const { prisma, calls } = makeFakePrisma();

    await runSeed(prisma, { now: NOW });

    const dataOps = calls.filter(
      (c) =>
        (c.model === "task" || c.model === "pomodoroSession") &&
        (c.method === "deleteMany" || c.method === "createMany")
    );

    expect(dataOps).toHaveLength(4);
    dataOps.forEach((c) => expect(c.inTransaction).toBe(true));
  });

  it("stores the demo password as a bcrypt hash (cost 10) that verifies", async () => {
    const { prisma, store } = makeFakePrisma();

    await runSeed(prisma, { now: NOW });

    store.users.forEach((u) => {
      expect(u.password).not.toBe(DEMO_PASSWORD);
      expect(u.password).toMatch(/^\$2[aby]\$10\$/);
    });
    expect(DEMO_PASSWORD.length).toBeGreaterThanOrEqual(6);
    await expect(bcrypt.compare(DEMO_PASSWORD, store.users[0].password)).resolves.toBe(true);
    await expect(bcrypt.compare("otra-clave", store.users[0].password)).resolves.toBe(false);
  });

  it("updates name, role and password hash of existing demo users", async () => {
    const { prisma, store } = makeFakePrisma({
      users: [
        {
          id: 7,
          email: "camila.rojas@focusly.demo",
          name: "Nombre viejo",
          role: "ADMIN",
          password: "hash-viejo",
        },
      ],
    });
    // The seed must reuse the existing row (stable id) and refresh its fields.
    const demoCamila = buildDemoData(NOW).users.find((u) => u.name === "Camila Rojas");
    store.users[0].email = demoCamila.email;

    await runSeed(prisma, { now: NOW, hash: async () => "hash-nuevo" });

    const camila = store.users.find((u) => u.email === demoCamila.email);
    expect(camila.id).toBe(7);
    expect(camila.name).toBe("Camila Rojas");
    expect(camila.role).toBe("USER");
    expect(camila.password).toBe("hash-nuevo");
  });

  describe("phrases", () => {
    it("inserts the full list into an empty table without deleting anything", async () => {
      const { prisma, store, calls } = makeFakePrisma();

      await runSeed(prisma, { now: NOW });

      expect(store.phrases).toHaveLength(seed.motivationalPhrases.length);
      expect(calls.some((c) => c.model === "motivationalPhrase" && c.method === "deleteMany")).toBe(
        false
      );
    });

    it("keeps existing phrases and inserts only the missing texts", async () => {
      const existing = [
        { id: 1, text: seed.motivationalPhrases[0].text, author: "x", active: true },
        { id: 2, text: seed.motivationalPhrases[1].text, author: "x", active: true },
        { id: 3, text: "Una frase propia del usuario", author: null, active: true },
      ];
      const { prisma, store, calls } = makeFakePrisma({ phrases: existing });

      await runSeed(prisma, { now: NOW });

      expect(store.phrases).toHaveLength(existing.length + seed.motivationalPhrases.length - 2);
      expect(store.phrases.slice(0, 3)).toEqual(existing);

      const texts = store.phrases.map((p) => p.text);
      expect(new Set(texts).size).toBe(texts.length);
      expect(calls.some((c) => c.model === "motivationalPhrase" && c.method === "deleteMany")).toBe(
        false
      );
    });

    it("does nothing when there are already 20 or more active phrases", async () => {
      const phrases = Array.from({ length: 22 }, (_, i) => ({
        id: i + 1,
        text: `Frase ${i}`,
        author: null,
        active: true,
      }));
      const { prisma, store, calls } = makeFakePrisma({ phrases });

      await runSeed(prisma, { now: NOW });

      expect(store.phrases).toHaveLength(22);
      expect(
        calls.some((c) => c.model === "motivationalPhrase" && c.method === "createMany")
      ).toBe(false);
    });

    it("is idempotent across runs", async () => {
      const { prisma, store } = makeFakePrisma();

      await runSeed(prisma, { now: NOW });
      await runSeed(prisma, { now: NOW });

      expect(store.phrases).toHaveLength(seed.motivationalPhrases.length);
    });
  });
});

describe("main", () => {
  const ENV = { NODE_ENV: "development", DATABASE_URL: LOCAL_URL };

  it("--check performs no writes and prints only host, database and counts", async () => {
    const { prisma, calls } = makeFakePrisma({
      users: [{ id: 1, email: "camila.rojas@focusly.demo", name: "C" }],
      tasks: [{ id: 1, userId: 1, title: "t" }],
      sessions: [{ id: 1, userId: 1 }],
      phrases: [{ id: 1, text: "a", active: true }],
    });
    const out = makeLogger();

    const code = await main({ argv: ["--check"], env: ENV, prisma, now: NOW, ...out });

    expect(code).toBe(0);
    expect(writes(calls)).toEqual([]);

    const text = out.text();
    expect(text).toContain("localhost");
    expect(text).toContain("focusly");
    expect(text).not.toContain("focusly_user");
    expect(text).not.toContain("s3cr3t-pass");
    expect(text).not.toContain("mysql://");
  });

  it("--check reports the target is not allowed for a remote host without confirmation", async () => {
    const { prisma, calls } = makeFakePrisma();
    const out = makeLogger();

    const code = await main({
      argv: ["--check"],
      env: { NODE_ENV: "development", DATABASE_URL: REMOTE_URL },
      prisma,
      now: NOW,
      ...out,
    });

    expect(code).toBe(0);
    expect(writes(calls)).toEqual([]);
    expect(out.text()).toContain("db.example.com");
    expect(out.text()).not.toContain("r3mote-pass");
    expect(out.text()).not.toContain("remote_user");
  });

  it("runs the seed for a local database and prints a summary without credentials", async () => {
    const { prisma, store } = makeFakePrisma();
    const out = makeLogger();

    const code = await main({ argv: [], env: ENV, prisma, now: NOW, ...out });

    expect(code).toBe(0);
    expect(store.users).toHaveLength(5);

    const text = out.text();
    expect(text).not.toContain(DEMO_PASSWORD);
    expect(text).not.toContain(store.users[0].password);
    expect(text).not.toContain("$2");
    expect(text).not.toContain("s3cr3t-pass");
    expect(text).not.toContain("focusly_user");
    expect(text).not.toContain("mysql://");
  });

  it("refuses production with exit code 1 and touches nothing", async () => {
    const { prisma, calls } = makeFakePrisma();
    const out = makeLogger();

    const code = await main({
      argv: [],
      env: { ...ENV, NODE_ENV: "production" },
      prisma,
      now: NOW,
      ...out,
    });

    expect(code).toBe(1);
    expect(calls).toEqual([]);
    expect(out.text()).toMatch(/producci/i);
  });

  it("refuses a remote database without the exact confirmation", async () => {
    const { prisma, calls } = makeFakePrisma();
    const out = makeLogger();

    const code = await main({
      argv: [],
      env: { NODE_ENV: "development", DATABASE_URL: REMOTE_URL },
      prisma,
      now: NOW,
      ...out,
    });

    expect(code).toBe(1);
    expect(calls).toEqual([]);
    expect(out.text()).not.toContain("r3mote-pass");
  });

  it("runs against a remote database when DEMO_SEED_ALLOW_REMOTE is the exact name", async () => {
    const { prisma, store } = makeFakePrisma();
    const out = makeLogger();

    const code = await main({
      argv: [],
      env: {
        NODE_ENV: "development",
        DATABASE_URL: REMOTE_URL,
        DEMO_SEED_ALLOW_REMOTE: "focusly_prod",
      },
      prisma,
      now: NOW,
      ...out,
    });

    expect(code).toBe(0);
    expect(store.users).toHaveLength(5);
  });

  it("uses DEMO_PASSWORD from the environment when provided (minimum 6 chars)", async () => {
    const { prisma, store } = makeFakePrisma();
    const out = makeLogger();

    const code = await main({
      argv: [],
      env: { ...ENV, DEMO_PASSWORD: "otra-clave-9" },
      prisma,
      now: NOW,
      ...out,
    });

    expect(code).toBe(0);
    await expect(bcrypt.compare("otra-clave-9", store.users[0].password)).resolves.toBe(true);
    expect(out.text()).not.toContain("otra-clave-9");

    const short = makeFakePrisma();
    const shortCode = await main({
      argv: [],
      env: { ...ENV, DEMO_PASSWORD: "abc" },
      prisma: short.prisma,
      now: NOW,
      ...makeLogger(),
    });
    expect(shortCode).toBe(1);
    expect(short.calls).toEqual([]);
  });

  it("returns 1 and does not print the connection string when the seed fails", async () => {
    const { prisma } = makeFakePrisma();
    prisma.user.upsert = () => {
      throw new Error(`connect failed for ${LOCAL_URL}`);
    };
    const out = makeLogger();

    const code = await main({ argv: [], env: ENV, prisma, now: NOW, ...out });

    expect(code).toBe(1);
    expect(out.text()).not.toContain("s3cr3t-pass");
  });

  it("falls back to the shared prisma client module when none is injected", async () => {
    const fake = makeFakePrisma();
    mockCurrent = fake.prisma;

    const code = await main({ argv: ["--check"], env: ENV, now: NOW, ...makeLogger() });

    expect(code).toBe(0);
    expect(fake.calls.length).toBeGreaterThan(0);
  });
});

describe("seed.js (phrases)", () => {
  it("exports the phrases list and does not run when imported", () => {
    const fake = makeFakePrisma();
    mockCurrent = fake.prisma;

    expect(Array.isArray(seed.motivationalPhrases)).toBe(true);
    expect(seed.motivationalPhrases).toHaveLength(20);
    seed.motivationalPhrases.forEach((p) => {
      expect(typeof p.text).toBe("string");
      expect(p.author).toBe("Focusly");
    });
    expect(fake.calls).toEqual([]);
  });
});
