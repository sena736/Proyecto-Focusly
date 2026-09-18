const taskRepository = require("../repositories/task.repository");

const getTasks = async (userId) => {
  return taskRepository.getTasksByUserId(userId);
};

const createTask = async (userId, data) => {
  if (!data || !data.title) {
    const error = new Error("El título de la tarea es obligatorio");
    error.status = 400;
    throw error;
  }

  return taskRepository.createTask(userId, data);
};

const updateTask = async (taskId, userId, data) => {
  const existing = await taskRepository.getTaskById(taskId, userId);

  if (!existing) {
    const error = new Error("La tarea no existe o no pertenece al usuario");
    error.status = 404;
    throw error;
  }

  await taskRepository.updateTask(taskId, userId, data);

  return taskRepository.getTaskById(taskId, userId);
};

const deleteTask = async (taskId, userId) => {
  const existing = await taskRepository.getTaskById(taskId, userId);

  if (!existing) {
    const error = new Error("La tarea no existe o no pertenece al usuario");
    error.status = 404;
    throw error;
  }

  await taskRepository.deleteTask(taskId, userId);
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
