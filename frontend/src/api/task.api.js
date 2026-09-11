const API_URL = "/api/v1/tasks";

/**
 * Obtener todas las tareas
 */
export const getTasks = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener las tareas");
  }

  return await response.json();
};

/**
 * Crear una nueva tarea
 */
export const createTask = async (taskData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la tarea");
  }

  return await response.json();
};

/**
 * Actualizar una tarea existente
 */
export const updateTask = async (taskId, taskData) => {
  const response = await fetch(`${API_URL}/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la tarea");
  }

  return await response.json();
};

/**
 * Eliminar una tarea
 */
export const deleteTask = async (taskId) => {
  const response = await fetch(`${API_URL}/${taskId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar la tarea");
  }

  return await response.json();
};