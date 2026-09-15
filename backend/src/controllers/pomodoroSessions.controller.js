const service = require("../services/pomodoroSessions.service");

const createSession = async (req, res) => {
  try {
    const session = await service.createSession(req.user.sub, req.body);

    return res.status(201).json({
      message: "Sesión Pomodoro creada correctamente",
      data: session,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear la sesión Pomodoro",
    });
  }
};

const getMySessions = async (req, res) => {
  try {
    const sessions = await service.getUserSessions(req.user.sub);

    return res.status(200).json({
      data: sessions,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener las sesiones",
    });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await service.getSessionById(req.params.id);

    return res.status(200).json({
      data: session,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener la sesión",
    });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const sessions = await service.getAllSessions();

    return res.status(200).json({
      data: sessions,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener las sesiones",
    });
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await service.updateSession(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      message: "Sesión actualizada correctamente",
      data: session,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar la sesión",
    });
  }
};

const deleteSession = async (req, res) => {
  try {
    await service.deleteSession(req.params.id);

    return res.status(200).json({
      message: "Sesión eliminada correctamente",
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al eliminar la sesión",
    });
  }
};

module.exports = {
  createSession,
  getMySessions,
  getSessionById,
  getAllSessions,
  updateSession,
  deleteSession,
};