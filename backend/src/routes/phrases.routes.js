const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/phrases/random
 *
 * Devuelve una frase motivacional aleatoria.
 */
router.get("/random", async (req, res) => {
  try {
    // Obtener todas las frases disponibles
    const phrases = await prisma.phrase.findMany({
      where: {
        active: true,
      },
    });

    // Verificar que existan frases
    if (phrases.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hay frases motivacionales disponibles",
      });
    }

    // Seleccionar una frase aleatoria
    const randomIndex = Math.floor(
      Math.random() * phrases.length
    );

    const randomPhrase = phrases[randomIndex];

    return res.status(200).json({
      success: true,
      data: randomPhrase,
    });
  } catch (error) {
    console.error(
      "Error obteniendo frase motivacional:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

module.exports = router;
