const prisma = require("../config/prisma");

const getTasksByUserId = async (userId) => {
  return await prisma.task.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getTaskById = async (taskId, userId) => {
  return await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });
};

const createTask = async (userId, data) => {
  return await prisma.task.create({
    data: {
      ...data,
      userId,
    },
  });
};

const updateTask = async (taskId, userId, data) => {
  return await prisma.task.updateMany({
    where: {
      id: taskId,
      userId,
    },
    data,
  });
};

const deleteTask = async (taskId, userId) => {
  return await prisma.task.deleteMany({
    where: {
      id: taskId,
      userId,
    },
  });
};

module.exports = {
  getTasksByUserId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
