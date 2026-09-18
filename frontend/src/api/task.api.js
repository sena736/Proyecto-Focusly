import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getTasks = async () => {
  const response = await api.get("/tasks", {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post("/tasks", taskData, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const updateTask = async ({ id, data }) => {
  const response = await api.patch(`/tasks/${id}`, data, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};