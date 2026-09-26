const authService = require("../services/auth.service");

/**
 * POST /api/v1/auth/google
 */
const googleLogin = async (req, res) => {
  try {
    const { id_token } = req.body;

    const result = await authService.googleLogin(
      id_token
    );

    return res.status(200).json({
      success: true,
      message: "Autenticación exitosa",
      data: result,
    });
  } catch (error) {
    console.error("Google Login Error:", error);

    return res.status(401).json({
      success: false,
      message: error.message || "Error de autenticación",
    });
  }
};

/**
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const result = await authService.register({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Cuenta creada correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "No se pudo crear la cuenta",
    });
  }
};

/**
 * POST /api/v1/auth/login
 */
const emailLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.emailLogin({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Autenticación exitosa",
      data: result,
    });
  } catch (error) {
    console.error("Email Login Error:", error);

    return res.status(401).json({
      success: false,
      message: error.message || "Credenciales inválidas",
    });
  }
};

/**
 * GET /api/v1/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado",
      });
    }

    const token = authorization.replace(
      "Bearer ",
      ""
    );

    const user = await authService.getProfile(token);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

/**
 * POST /api/v1/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado",
      });
    }

    const token = authorization.replace(
      "Bearer ",
      ""
    );

    const result =
      await authService.refreshToken(token);

    return res.status(200).json({
      success: true,
      message: "Token renovado correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);

    return res.status(401).json({
      success: false,
      message: "No se pudo renovar el token",
    });
  }
};

/**
 * POST /api/v1/auth/logout
 */
const logout = async (req, res) => {
  try {
    const result = await authService.logout();

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudo cerrar la sesión",
    });
  }
};

module.exports = {
  googleLogin,
  register,
  emailLogin,
  getProfile,
  refreshToken,
  logout,
};