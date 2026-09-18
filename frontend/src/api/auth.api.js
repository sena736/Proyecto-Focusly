const API_URL = "http://localhost:3000/api/v1/auth";

export const googleLogin = async (idToken) => {
  try {
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
      throw new Error(data.message || "Error al iniciar sesión con Google");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "No se pudo iniciar sesión con Google");
  }
};
