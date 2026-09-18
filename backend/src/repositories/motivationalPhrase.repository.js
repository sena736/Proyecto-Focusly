const prisma = require("../config/prisma");

/**
 * Obtiene todas las frases motivacionales activas.
 */
const findActivePhrases = async () => {
  return await prisma.motivationalPhrase.findMany({
    where: {
      active: true,
    },
    select: {
      id: true,
      text: true,
      author: true,
    },
  });
};

/**
 * Obtiene una frase motivacional por su ID.
 */
const findPhraseById = async (id) => {
  return await prisma.motivationalPhrase.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      text: true,
      author: true,
      active: true,
    },
  });
};

module.exports = {
  findActivePhrases,
  findPhraseById,
};