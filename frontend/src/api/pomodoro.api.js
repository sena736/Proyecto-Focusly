import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createPomodoroSession = async (sessionData) => {
  const response = await api.post(
    "/pomodoro-sessions",
    sessionData,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};