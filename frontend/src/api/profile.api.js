import { getToken } from "../services/token.services";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1") +
  "/profile";

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
