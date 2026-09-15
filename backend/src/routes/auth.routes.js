import { Router } from "express";
import {
  googleLogin,
  getProfile,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";

const router = Router();

/**
 * Autenticación con Google
 */
router.post("/google", googleLogin);

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

export default router;