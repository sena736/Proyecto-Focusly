import { getToken } from "../services/token.services";
import { API_BASE_URL } from "./config";

const API_URL = `${API_BASE_URL}/profile`;

export const getProfile = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al obtener el perfil");
  }

  return data;
};

export const updateProfile = async (data) => {
  const response = await fetch(API_URL, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Error al actualizar el perfil");
  }

  return result;
};
