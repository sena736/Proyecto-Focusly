import { API_BASE_URL } from "./config";
import { readApiBody } from "./http";

const API_URL = `${API_BASE_URL}/tasks`;

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

  return readApiBody(response, "Error al obtener las tareas");
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

  return readApiBody(response, "Error al crear la tarea");
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

  return readApiBody(response, "Error al actualizar la tarea");
};

/**
 * Eliminar una tarea
 *
 * El backend responde 204 sin cuerpo: un cuerpo vacío es un éxito.
 */
export const deleteTask = async (id, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  return readApiBody(response, "Error al eliminar la tarea", {
    allowEmpty: true,
  });
};
