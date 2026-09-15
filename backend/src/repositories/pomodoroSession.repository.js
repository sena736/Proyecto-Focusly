const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const create = async (data) => {
  return prisma.pomodoroSession.create({
    data,
  });
};

const findById = async (id) => {
  return prisma.pomodoroSession.findUnique({
    where: { id },
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

const update = async (id, data) => {
  return prisma.pomodoroSession.update({
    where: { id },
    data,
  });
};

const remove = async (id) => {
  return prisma.pomodoroSession.delete({
    where: { id },
  });
};

module.exports = {
  create,
  findById,
  findByUserId,
  findAll,
  update,
  remove,
};