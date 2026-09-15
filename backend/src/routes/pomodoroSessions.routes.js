const express = require("express");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const controller = require("../controllers/pomodoroSessions.controller");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear una sesión Pomodoro
router.post("/", controller.createSession);

// Obtener las sesiones del usuario autenticado
router.get("/my", controller.getMySessions);

// Obtener una sesión específica
router.get("/:id", controller.getSessionById);

// Actualizar una sesión
router.put("/:id", controller.updateSession);

// Eliminar una sesión
router.delete("/:id", controller.deleteSession);

// Rutas exclusivas del administrador
router.get(
  "/",
  authorize("ADMIN"),
  controller.getAllSessions
);

module.exports = router;