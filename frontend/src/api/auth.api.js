const API_URL = "http://localhost:3000/api/v1/auth";

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

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || "No se pudo iniciar sesión con Google.");
  }

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

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || "No se pudo crear la cuenta.");
  }

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

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || "No se pudo iniciar sesión.");
  }

  return body.data;
};
