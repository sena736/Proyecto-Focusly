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
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority,
      status: data.status,
      userId,
    },
  });
};

const updateTask = async (taskId, userId, data) => {
  const allowedData = {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.dueDate !== undefined && {
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    }),
    ...(data.priority !== undefined && { priority: data.priority }),
    ...(data.status !== undefined && { status: data.status }),
  };

  return await prisma.task.updateMany({
    where: {
      id: taskId,
      userId,
    },
    data: allowedData,
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
