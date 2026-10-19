const prisma = require("../config/prisma");

const create = async (data) => {
  return prisma.pomodoroSession.create({
    data,
  });
};

/**
 * Find a session only if it belongs to the given user.
 * Returns null both when it does not exist and when it is someone else's.
 */
const findOwnedById = async (id, userId) => {
  return prisma.pomodoroSession.findFirst({
    where: { id, userId },
  });
};

const findByUserId = async (userId) => {
  return prisma.pomodoroSession.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const findAll = async () => {
  return prisma.pomodoroSession.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Update a session only if it belongs to the given user.
 * updateMany never throws P2025; returns null when nothing matched.
 */
const updateOwned = async (id, userId, data) => {
  const { count } = await prisma.pomodoroSession.updateMany({
    where: { id, userId },
    data,
  });

  if (count === 0) {
    return null;
  }

  return prisma.pomodoroSession.findFirst({
    where: { id, userId },
  });
};

/**
 * Delete a session only if it belongs to the given user.
 * Returns true when a row was deleted.
 */
const removeOwned = async (id, userId) => {
  const { count } = await prisma.pomodoroSession.deleteMany({
    where: { id, userId },
  });

  return count > 0;
};

module.exports = {
  create,
  findOwnedById,
  findByUserId,
  findAll,
  updateOwned,
  removeOwned,
};
