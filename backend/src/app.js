const express = require("express");
const cors = require("cors");

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

module.exports = app;