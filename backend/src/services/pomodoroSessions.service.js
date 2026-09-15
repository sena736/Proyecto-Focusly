const repository = require("../repositories/pomodoroSession.repository");

const createSession = async (userId, data) => {
  return repository.create({
    ...data,
    userId,
  });
};

const getSessionById = async (id) => {
  const session = await repository.findById(id);

  if (!session) {
    const error = new Error("Sesión Pomodoro no encontrada");
    error.status = 404;
    throw error;
  }

  return session;
};

const getUserSessions = async (userId) => {
  return repository.findByUserId(userId);
};

const getAllSessions = async () => {
  return repository.findAll();
};

const updateSession = async (id, data) => {
  await getSessionById(id);

  return repository.update(id, data);
};

const deleteSession = async (id) => {
  await getSessionById(id);

  return repository.remove(id);
};

module.exports = {
  createSession,
  getSessionById,
  getUserSessions,
  getAllSessions,
  updateSession,
  deleteSession,
};