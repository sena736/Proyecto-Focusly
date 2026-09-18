const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const tasksRoutes = require("./routes/tasks.routes");
const pomodoroSessionsRoutes = require("./routes/pomodoroSessions.routes");
const phrasesRoutes = require("./routes/phrases.routes");

const app = express();

// ======================================
// MIDDLEWARES
// ======================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ======================================
// RUTA DE PRUEBA
// ======================================

app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Focusly funcionando correctamente",
  });
});

// ======================================
// RUTA HEALTH CHECK
// ======================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    mensaje: "Servidor Focusly funcionando",
  });
});

// ======================================
// RUTAS DE LA API (MOD-01 a MOD-05)
// ======================================

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/tasks", tasksRoutes);
app.use("/api/v1/pomodoro-sessions", pomodoroSessionsRoutes);
app.use("/api/v1/phrases", phrasesRoutes);

module.exports = app;