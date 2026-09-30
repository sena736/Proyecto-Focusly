import { API_BASE_URL } from "./config";
import { readApiBody } from "./http";

const API_URL = `${API_BASE_URL}/auth`;

export const googleLogin = async (idToken) => {
  const response = await fetch(`${API_URL}/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: idToken,
    }),
  });

  const body = await readApiBody(
    response,
    "No se pudo iniciar sesión con Google.",
  );

  return body.data;
};

export const registerUser = async ({ name, email, password }) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const body = await readApiBody(response, "No se pudo crear la cuenta.");

  return body.data;
};

export const emailLogin = async ({ email, password }) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const body = await readApiBody(response, "No se pudo iniciar sesión.");

  return body.data;
};
