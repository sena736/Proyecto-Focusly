const API_URL = "http://localhost:3000/api/v1/tasks";

const getHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

/**
 * Obtener todas las tareas del usuario
 */
export const getTasks = async (token) => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al obtener las tareas");
  }

  return data;
};

/**
 * Crear una tarea
 */
export const createTask = async (taskData, token) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al crear la tarea");
  }

  return data;
};

/**
 * Actualizar una tarea
 */
export const updateTask = async (id, taskData, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al actualizar la tarea");
  }

  return data;
};

/**
 * Eliminar una tarea
 */
export const deleteTask = async (id, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al eliminar la tarea");
  }

  return data;
};
