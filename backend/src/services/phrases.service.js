const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Obtiene todas las frases motivacionales activas.
 */
const getActivePhrases = async () => {
  return await prisma.phrase.findMany({
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
 * Obtiene una frase motivacional aleatoria.
 */
const getRandomPhrase = async () => {
  const phrases = await getActivePhrases();

  if (phrases.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(
    Math.random() * phrases.length
  );

  return phrases[randomIndex];
};

module.exports = {
  getActivePhrases,
  getRandomPhrase,
};