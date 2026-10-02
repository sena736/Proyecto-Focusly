import api from "./api";

// El interceptor de api.js ya agrega el header Authorization con el token en memoria.
export const createPomodoroSession = async (sessionData) => {
  const response = await api.post("/pomodoro-sessions", sessionData);

  return response.data;
};

// Historial del usuario autenticado (GET /pomodoro-sessions/my).
// El backend responde { data: [...] } sin paginación, del más reciente al más antiguo.
// Si la respuesta no trae un arreglo se rechaza: nunca se devuelve una lista vacía falsa.
export const getMyPomodoroSessions = async () => {
  const response = await api.get("/pomodoro-sessions/my");

  const sessions = response.data?.data;

  if (!Array.isArray(sessions)) {
    throw new Error(
      "Respuesta inesperada del servidor al cargar tus sesiones Pomodoro."
    );
  }

  return sessions;
};

// Listado de TODAS las sesiones (solo ADMIN, GET /pomodoro-sessions).
// El backend responde { data: [...] } sin paginación. Si la respuesta no trae
// un arreglo se rechaza: nunca se inventa un conteo (un 0 falso).
export const getPomodoroSessions = async () => {
  const response = await api.get("/pomodoro-sessions");

  const sessions = response.data?.data;

  if (!Array.isArray(sessions)) {
    throw new Error(
      "Respuesta inesperada del servidor al cargar las sesiones Pomodoro."
    );
  }

  return sessions;
};
