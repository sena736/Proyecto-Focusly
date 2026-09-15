const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/**
 * Verifica el ID Token recibido desde Google.
 *
 * @param {string} idToken - ID Token proporcionado por Google.
 * @returns {Promise<Object>} Información del usuario autenticado.
 */
const verifyGoogleToken = async (idToken) => {
  try {
    if (!idToken) {
      throw new Error("Google ID Token es obligatorio");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("No se pudo obtener la información del usuario");
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      firstName: payload.given_name,
      lastName: payload.family_name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    console.error("Error verificando Google ID Token:", error.message);

    throw new Error("Token de Google inválido o expirado");
  }
};

module.exports = {
  googleClient,
  verifyGoogleToken,
};