const service = require("../services/pomodoroSessions.service");

const INTERNAL_ERROR_MESSAGE = "Error interno del servidor.";

/**
 * Only errors that carry a 4xx status are meant for the client. Anything else
 * (Prisma/DB failures, bugs) is logged and answered with a generic message so
 * internal details never leak.
 */
const sendError = (res, error, context) => {
  const status = error?.status;

  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return res.status(status).json({ message: error.message });
  }

  console.error(`[pomodoroSessions] ${context}:`, error);

  return res.status(500).json({ message: INTERNAL_ERROR_MESSAGE });
};

const createSession = async (req, res) => {
  try {
    const session = await service.createSession(req.user.sub, req.body);

    return res.status(201).json({
      message: "Sesión Pomodoro creada correctamente",
      data: session,
    });
  } catch (error) {
    return sendError(res, error, "createSession failed");
  }
};

const getMySessions = async (req, res) => {
  try {
    const sessions = await service.getUserSessions(req.user.sub);

    return res.status(200).json({
      data: sessions,
    });
  } catch (error) {
    return sendError(res, error, "getMySessions failed");
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await service.getSessionById(
      req.params.id,
      req.user.sub
    );

    return res.status(200).json({
      data: session,
    });
  } catch (error) {
    return sendError(res, error, "getSessionById failed");
  }
};

const getAllSessions = async (req, res) => {
  try {
    const sessions = await service.getAllSessions();

    return res.status(200).json({
      data: sessions,
    });
  } catch (error) {
    return sendError(res, error, "getAllSessions failed");
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await service.updateSession(
      req.params.id,
      req.user.sub,
      req.body
    );

    return res.status(200).json({
      message: "Sesión actualizada correctamente",
      data: session,
    });
  } catch (error) {
    return sendError(res, error, "updateSession failed");
  }
};

const deleteSession = async (req, res) => {
  try {
    await service.deleteSession(req.params.id, req.user.sub);

    return res.status(200).json({
      message: "Sesión eliminada correctamente",
    });
  } catch (error) {
    return sendError(res, error, "deleteSession failed");
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