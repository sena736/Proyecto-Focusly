// The REAL repository runs here; only the Prisma client is replaced. The point
// is to assert on the exact `where` objects: the service-level tests use an
// in-memory fake repository, so they cannot notice a missing `userId` filter.
jest.mock("../src/config/prisma", () => ({
  pomodoroSession: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

const prisma = require("../src/config/prisma");
const repository = require("../src/repositories/pomodoroSession.repository");

const SESSION_ID = 7;
const USER_ID = 3;

describe("POMODORO SESSION REPOSITORY (real, Prisma mocked)", () => {
  describe("findOwnedById", () => {
    test("filters by id AND userId and returns the row", async () => {
      const row = { id: SESSION_ID, userId: USER_ID };
      prisma.pomodoroSession.findFirst.mockResolvedValue(row);

      const result = await repository.findOwnedById(SESSION_ID, USER_ID);

      expect(result).toBe(row);
      expect(prisma.pomodoroSession.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.pomodoroSession.findFirst).toHaveBeenCalledWith({
        where: { id: SESSION_ID, userId: USER_ID },
      });
    });

    test("returns null when nothing matches", async () => {
      prisma.pomodoroSession.findFirst.mockResolvedValue(null);

      await expect(repository.findOwnedById(SESSION_ID, USER_ID)).resolves.toBeNull();
    });
  });

  describe("updateOwned", () => {
    test("updates with where {id, userId} and ONLY the given data, then re-reads scoped to the user", async () => {
      const data = { durationMinutes: 30 };
      const row = { id: SESSION_ID, userId: USER_ID, durationMinutes: 30 };
      prisma.pomodoroSession.updateMany.mockResolvedValue({ count: 1 });
      prisma.pomodoroSession.findFirst.mockResolvedValue(row);

      const result = await repository.updateOwned(SESSION_ID, USER_ID, data);

      expect(result).toBe(row);
      expect(prisma.pomodoroSession.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.pomodoroSession.updateMany).toHaveBeenCalledWith({
        where: { id: SESSION_ID, userId: USER_ID },
        data: { durationMinutes: 30 },
      });
      expect(prisma.pomodoroSession.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.pomodoroSession.findFirst).toHaveBeenCalledWith({
        where: { id: SESSION_ID, userId: USER_ID },
      });
    });

    test("returns null without re-reading when no row matched", async () => {
      prisma.pomodoroSession.updateMany.mockResolvedValue({ count: 0 });

      const result = await repository.updateOwned(SESSION_ID, USER_ID, {
        durationMinutes: 30,
      });

      expect(result).toBeNull();
      expect(prisma.pomodoroSession.findFirst).not.toHaveBeenCalled();
    });
  });

  describe("removeOwned", () => {
    test("deletes with where {id, userId} and returns true when a row went away", async () => {
      prisma.pomodoroSession.deleteMany.mockResolvedValue({ count: 1 });

      const result = await repository.removeOwned(SESSION_ID, USER_ID);

      expect(result).toBe(true);
      expect(prisma.pomodoroSession.deleteMany).toHaveBeenCalledTimes(1);
      expect(prisma.pomodoroSession.deleteMany).toHaveBeenCalledWith({
        where: { id: SESSION_ID, userId: USER_ID },
      });
    });

    test("returns false when nothing matched", async () => {
      prisma.pomodoroSession.deleteMany.mockResolvedValue({ count: 0 });

      await expect(repository.removeOwned(SESSION_ID, USER_ID)).resolves.toBe(false);
    });
  });

  describe("findByUserId", () => {
    test("filters by userId", async () => {
      prisma.pomodoroSession.findMany.mockResolvedValue([]);

      await repository.findByUserId(USER_ID);

      expect(prisma.pomodoroSession.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { createdAt: "desc" },
      });
    });
  });
});
