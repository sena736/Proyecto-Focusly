import api from "./api";

// El interceptor de api.js ya agrega el header Authorization con el token en memoria.
export const createPomodoroSession = async (sessionData) => {
  const response = await api.post("/pomodoro-sessions", sessionData);

  return response.data;
};