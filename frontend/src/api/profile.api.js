import { getToken } from "../services/token.services";
import { API_BASE_URL } from "./config";
import { readApiBody } from "./http";

const API_URL = `${API_BASE_URL}/profile`;

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

export const getProfile = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  return readApiBody(response, "Error al obtener el perfil");
};

export const updateProfile = async (data) => {
  const response = await fetch(API_URL, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return readApiBody(response, "Error al actualizar el perfil");
};
