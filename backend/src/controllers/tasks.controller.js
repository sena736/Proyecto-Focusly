const tasksService = require("../services/tasks.service");

const getTasks = async (req, res) => {
  try {
    const tasks = await tasksService.getTasks(req.user.sub);

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener las tareas",
    });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await tasksService.createTask(req.user.sub, req.body);

    return res.status(201).json(task);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear la tarea",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await tasksService.updateTask(
      Number(req.params.id),
      req.user.sub,
      req.body
    );

    return res.status(200).json(task);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar la tarea",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    await tasksService.deleteTask(Number(req.params.id), req.user.sub);

    return res.status(204).send();
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al eliminar la tarea",
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
