const { Router } = require("express");
const {
  googleLogin,
  register,
  emailLogin,
  getProfile,
  refreshToken,
  logout,
} = require("../controllers/auth.controller");

const router = Router();

/**
 * Autenticación con Google
 */
router.post("/google", googleLogin);

/**
 * Registro con correo y contraseña
 */
router.post("/register", register);

/**
 * Login con correo y contraseña
 */
router.post("/login", emailLogin);

/**
 * Obtener perfil del usuario autenticado
 */
router.get("/profile", getProfile);

/**
 * Renovar JWT
 */
router.post("/refresh", refreshToken);

/**
 * Cerrar sesión
 */
router.post("/logout", logout);

module.exports = router;