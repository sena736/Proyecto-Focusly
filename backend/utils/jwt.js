const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está configurado en las variables de entorno");
}

/**
 * Genera un JWT firmado con HS256.
 *
 * @param {Object} payload - Datos que se almacenarán en el token.
 * @returns {string} JWT generado.
 */
const signJwt = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verifica un JWT firmado por el backend.
 *
 * @param {string} token - JWT recibido.
 * @returns {Object} Payload decodificado y verificado.
 */
const verifyJwt = (token) => {
  if (!token) {
    throw new Error("Token no proporcionado");
  }

  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("El token ha expirado");
    }

    if (error.name === "JsonWebTokenError") {
      throw new Error("Token inválido");
    }

    throw new Error("No se pudo verificar el token");
  }
};

module.exports = {
  signJwt,
  verifyJwt,
};