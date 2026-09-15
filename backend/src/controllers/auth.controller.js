import authService from "../services/auth.service.js";

/**
 * POST /api/v1/auth/google
 */
export const googleLogin = async (req, res) => {
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
 * GET /api/v1/auth/profile
 */
export const getProfile = async (req, res) => {
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
export const refreshToken = async (req, res) => {
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
export const logout = async (req, res) => {
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