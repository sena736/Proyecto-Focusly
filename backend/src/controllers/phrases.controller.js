const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Obtener una frase motivacional aleatoria
 */
const getRandomPhrase = async (req, res) => {
  try {
    // Obtener las frases activas
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
      data: {
        id: randomPhrase.id,
        text: randomPhrase.text,
        author: randomPhrase.author,
      },
    });
  } catch (error) {
    console.error(
      "Error al obtener la frase motivacional:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  getRandomPhrase,
};