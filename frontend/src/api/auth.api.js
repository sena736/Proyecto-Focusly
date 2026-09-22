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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo iniciar sesión con Google.");
  }

  return data;
};
