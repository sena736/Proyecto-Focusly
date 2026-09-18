require("dotenv").config();

const prisma = require("../src/config/prisma");

const motivationalPhrases = [
  {
    text: "Cada pequeño paso te acerca a tu objetivo.",
    author: "Focusly",
  },
  {
    text: "No necesitas hacerlo perfecto, solo necesitas comenzar.",
    author: "Focusly",
  },
  {
    text: "Tu esfuerzo de hoy construye tu éxito de mañana.",
    author: "Focusly",
  },
  {
    text: "Concéntrate en el proceso y confía en tu progreso.",
    author: "Focusly",
  },
  {
    text: "Una tarea a la vez. Un objetivo a la vez.",
    author: "Focusly",
  },
  {
    text: "La constancia convierte pequeños esfuerzos en grandes resultados.",
    author: "Focusly",
  },
  {
    text: "Organiza tu tiempo y convierte tus metas en acciones.",
    author: "Focusly",
  },
  {
    text: "Tu tiempo es valioso. Úsalo para construir lo que quieres.",
    author: "Focusly",
  },
  {
    text: "El éxito comienza cuando decides no rendirte.",
    author: "Focusly",
  },
  {
    text: "Cree en tu capacidad para aprender y mejorar cada día.",
    author: "Focusly",
  },
  {
    text: "Los grandes logros son el resultado de pequeños esfuerzos constantes.",
    author: "Focusly",
  },
  {
    text: "Enfócate en lo que puedes hacer hoy.",
    author: "Focusly",
  },
  {
    text: "Cada sesión de concentración es una inversión en tu futuro.",
    author: "Focusly",
  },
  {
    text: "No compares tu progreso con el de los demás. Avanza a tu propio ritmo.",
    author: "Focusly",
  },
  {
    text: "Cuando tengas una meta clara, cada minuto cuenta.",
    author: "Focusly",
  },
  {
    text: "Descansar también es parte de ser productivo.",
    author: "Focusly",
  },
  {
    text: "Tu disciplina de hoy puede convertirse en el éxito de mañana.",
    author: "Focusly",
  },
  {
    text: "Empieza con lo que tienes y mejora mientras avanzas.",
    author: "Focusly",
  },
  {
    text: "La concentración transforma el tiempo en resultados.",
    author: "Focusly",
  },
  {
    text: "No abandones una meta solo porque el camino sea difícil.",
    author: "Focusly",
  },
];

async function main() {
  console.log("Iniciando seed de frases motivacionales...");

  // Eliminar frases existentes para evitar duplicados
  await prisma.motivationalPhrase.deleteMany();

  // Insertar las frases iniciales
  await prisma.motivationalPhrase.createMany({
    data: motivationalPhrases,
  });

  console.log(
    `Se insertaron ${motivationalPhrases.length} frases motivacionales.`
  );
}

main()
  .catch((error) => {
    console.error("Error ejecutando el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });