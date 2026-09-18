const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const userRepository = require("../repositories/user.repository");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

/**
 * Generar JWT de la aplicación
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

/**
 * Autenticación mediante Google ID Token
 */
const googleLogin = async (idToken) => {
  if (!idToken) {
    throw new Error("El id_token es obligatorio");
  }

  /**
   * Verificar el token recibido desde Google
   */
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("No se pudo obtener la información de Google");
  }

  const {
    sub: googleId,
    email,
    name,
    picture,
  } = payload;

  if (!email || !googleId) {
    throw new Error(
      "El token de Google no contiene la información necesaria"
    );
  }

  /**
   * Buscar primero por Google ID
   */
  let user = await userRepository.findByGoogleId(googleId);

  /**
   * Si no existe, intentar buscar por correo
   */
  if (!user) {
    user = await userRepository.findByEmail(email);
  }

  /**
   * Si tampoco existe, crear usuario
   */
  if (!user) {
    user = await userRepository.create({
      email,
      googleId,
      name: name || email.split("@")[0],
      avatarUrl: picture || null,
      role: "USER",
    });
  }

  /**
   * Generar JWT propio de LectoGo
   */
  const token = generateToken(user);

  return {
    user,
    token,
  };
};

/**
 * Obtener usuario a partir del JWT
 */
const getProfile = async (token) => {
  if (!token) {
    throw new Error("Token no proporcionado");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  const user = await userRepository.findByEmail(
    decoded.email
  );

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return user;
};

/**
 * Renovar token
 */
const refreshToken = async (token) => {
  if (!token) {
    throw new Error("Token no proporcionado");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET,
    {
      ignoreExpiration: true,
    }
  );

  const user = await userRepository.findByEmail(
    decoded.email
  );

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return {
    token: generateToken(user),
    user,
  };
};

/**
 * Logout
 *
 * En JWT stateless, el logout normalmente se maneja
 * eliminando el token del cliente.
 */
const logout = async () => {
  return {
    message: "Sesión cerrada correctamente",
  };
};

module.exports = {
  googleLogin,
  getProfile,
  refreshToken,
  logout,
};