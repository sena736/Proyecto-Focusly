/**
 * Seed de DATOS DE DEMOSTRACION de Focusly.
 *
 *   npm run seed:demo               -> carga los datos de demostracion
 *   npm run seed:demo -- --check    -> solo muestra el destino y lo que ya existe
 *
 * Es idempotente y seguro:
 *  - Los usuarios demo se identifican por el dominio de correo @focusly.demo.
 *  - Solo se reemplazan las tareas y sesiones Pomodoro de ESOS usuarios.
 *  - Nunca se borra un usuario ni se toca nada de usuarios que no son demo.
 *  - Las frases motivacionales solo se completan (nunca se borran).
 *  - Se niega a correr con NODE_ENV=production o contra una base remota sin
 *    confirmacion explicita (DEMO_SEED_ALLOW_REMOTE=<nombre exacto de la base>).
 */

const bcrypt = require("bcryptjs");

const { motivationalPhrases } = require("./seed");

const DEMO_EMAIL_DOMAIN = "@focusly.demo";

// Contraseña de TODAS las cuentas demo. Se puede reemplazar con la variable de
// entorno DEMO_PASSWORD (minimo 6 caracteres). Nunca se imprime en los logs.
const DEMO_PASSWORD = "Focusly-Demo-2026";

const BCRYPT_COST = 10; // el mismo costo que usa el registro (auth.service)
const MIN_PASSWORD_LENGTH = 6;
const MIN_ACTIVE_PHRASES = 20;
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1"];

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/* =========================================================
   1. SEGURIDAD: DESTINO DE LA BASE DE DATOS
========================================================= */

/**
 * Devuelve SOLO { host, database }. Nunca usuario ni contraseña, y los errores
 * tampoco repiten la URL recibida.
 */
const parseDatabaseTarget = (url) => {
  if (typeof url !== "string" || url.trim() === "") {
    throw new Error("DATABASE_URL no está definida.");
  }

  let parsed;

  try {
    parsed = new URL(url.trim());
  } catch {
    throw new Error(
      "DATABASE_URL no tiene un formato válido (se esperaba mysql://usuario:clave@host:puerto/base)."
    );
  }

  const host = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();

  let database = "";

  try {
    database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    database = parsed.pathname.replace(/^\//, "");
  }

  return { host, database };
};

/**
 * Evalua si el seed puede correr contra el destino. No lanza por un destino
 * no permitido: devuelve { allowed: false, reason }.
 */
const evaluateTarget = ({ nodeEnv, url, allowRemote }) => {
  const { host, database } = parseDatabaseTarget(url);
  const isLocal = LOCAL_HOSTS.includes(host);

  if (nodeEnv === "production") {
    return {
      host,
      database,
      isLocal,
      allowed: false,
      reason:
        "NODE_ENV=production: el seed de demostración nunca se ejecuta en producción.",
    };
  }

  if (!isLocal && !(database !== "" && allowRemote === database)) {
    return {
      host,
      database,
      isLocal,
      allowed: false,
      reason:
        `La base de datos "${database}" está en un host remoto (${host}). ` +
        "Si realmente querés sembrarla, definí DEMO_SEED_ALLOW_REMOTE con el " +
        "nombre exacto de la base (DEMO_SEED_ALLOW_REMOTE=<nombre de la base>).",
    };
  }

  return { host, database, isLocal, allowed: true, reason: null };
};

const assertSafeTarget = (options) => {
  const result = evaluateTarget(options);

  if (!result.allowed) {
    throw new Error(result.reason);
  }

  return result;
};

/* =========================================================
   2. DATOS DE DEMOSTRACION (puros, derivados de `now`)
========================================================= */

const startOfUtcDay = (now) =>
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

/**
 * Sesiones consecutivas (sin huecos) a partir de un bloque de plan.
 * `daysAgo === 0` ancla el bloque a `now` (termina 10 minutos antes) para que
 * nunca quede en el futuro; los demas dias arrancan a `hourUtc`.
 */
const buildSessionBlock = (now, todayUtc, [daysAgo, hourUtc, plan]) => {
  const totalMinutes = plan.reduce((sum, [, minutes]) => sum + minutes, 0);

  let cursor =
    daysAgo === 0
      ? now.getTime() - (totalMinutes + 10) * MINUTE
      : todayUtc - daysAgo * DAY + hourUtc * HOUR;

  return plan.map(([type, durationMinutes]) => {
    const startedAt = new Date(cursor);
    const endedAt = new Date(cursor + durationMinutes * MINUTE);

    cursor = endedAt.getTime();

    return { type, startedAt, endedAt, durationMinutes };
  });
};

const W25 = ["WORK", 25];
const W50 = ["WORK", 50];
const B5 = ["BREAK", 5];
const B15 = ["BREAK", 15];

// [diasAtras, horaUTC, plan]
const SESSION_PLANS = {
  camila: [
    [6, 14, [W25, B5, W25, B15]],
    [5, 15, [W25, B5, W25, B5]],
    [3, 14, [W50, B15, W25]],
    [2, 16, [W50, B5, W25]],
    [1, 15, [W25, B5]],
    [0, 0, [W25]],
  ],
  andres: [
    [5, 14, [W25, B5, W25, B5]],
    [2, 15, [W25, B5, W25, B15]],
  ],
  laura: [
    [3, 16, [W25, B5]],
    [1, 14, [W25, B5]],
  ],
  admin: [[1, 17, [W25, B5]]],
  sofia: [],
};

const buildDemoData = (now = new Date()) => {
  const todayUtc = startOfUtcDay(now);

  // Las fechas de vencimiento son medianoche UTC, como las guarda la app.
  const due = (offsetDays) => new Date(todayUtc + offsetDays * DAY);

  const task = (title, description, priority, status, offsetDays) => ({
    title,
    description,
    priority,
    status,
    dueDate: offsetDays === null ? null : due(offsetDays),
  });

  const users = [
    {
      key: "admin",
      email: `administrador${DEMO_EMAIL_DOMAIN}`,
      name: "Administrador Demo",
      role: "ADMIN",
    },
    {
      key: "camila",
      email: `camila.rojas${DEMO_EMAIL_DOMAIN}`,
      name: "Camila Rojas",
      role: "USER",
    },
    {
      key: "andres",
      email: `andres.gomez${DEMO_EMAIL_DOMAIN}`,
      name: "Andrés Gómez",
      role: "USER",
    },
    {
      key: "laura",
      email: `laura.perez${DEMO_EMAIL_DOMAIN}`,
      name: "Laura Pérez",
      role: "USER",
    },
    {
      key: "sofia",
      email: `sofia.martinez${DEMO_EMAIL_DOMAIN}`,
      name: "Sofía Martínez",
      role: "USER",
    },
  ];

  const taskLists = {
    admin: [],
    sofia: [],
    camila: [
      task(
        "Estudiar para el parcial de Cálculo",
        "Repasar límites, derivadas e integrales. Hacer el simulacro.",
        "HIGH",
        "PENDING",
        1
      ),
      task(
        "Entregar informe de Bases de Datos",
        "Modelo entidad-relación y consultas SQL del laboratorio 3.",
        "HIGH",
        "PENDING",
        -3
      ),
      task(
        "Lectura de Ingeniería de Software",
        "Capítulo 4: requisitos y casos de uso. Tomar notas.",
        "MEDIUM",
        "PENDING",
        0
      ),
      task(
        "Preparar la presentación del proyecto",
        "Diapositivas, demo en vivo y reparto de roles del equipo.",
        "HIGH",
        "PENDING",
        5
      ),
      task(
        "Resolver el taller de Álgebra Lineal",
        "Ejercicios de matrices y sistemas de ecuaciones.",
        "MEDIUM",
        "PENDING",
        7
      ),
      task(
        "Repasar apuntes de Física",
        "Cinemática y dinámica, con los ejercicios del profesor.",
        "LOW",
        "PENDING",
        null
      ),
      task(
        "Ordenar el material de estudio",
        null,
        "LOW",
        "PENDING",
        null
      ),
      task(
        "Pagar la matrícula del semestre",
        "Descargar el recibo y guardarlo en la carpeta de trámites.",
        "HIGH",
        "COMPLETED",
        -6
      ),
      task(
        "Inscribir las materias electivas",
        "Confirmar horarios para que no se crucen.",
        "MEDIUM",
        "COMPLETED",
        -8
      ),
      task(
        "Quiz de Programación",
        "Estructuras de control y funciones.",
        "MEDIUM",
        "COMPLETED",
        -2
      ),
      task(
        "Comprar el libro de Estadística",
        "Edición actualizada, versión digital.",
        "LOW",
        "COMPLETED",
        -5
      ),
      task(
        "Armar el grupo del proyecto final",
        "Definir integrantes y herramienta de comunicación.",
        "LOW",
        "COMPLETED",
        -10
      ),
    ],
    andres: [
      task(
        "Taller de Programación Orientada a Objetos",
        "Ejercicios 3 al 7 sobre herencia y polimorfismo.",
        "HIGH",
        "PENDING",
        2
      ),
      task(
        "Leer artículo de Redes de Computadores",
        "Resumen de una página con las ideas principales.",
        "MEDIUM",
        "PENDING",
        4
      ),
      task(
        "Preparar exposición de Estadística",
        "Ejemplos con datos reales y gráficos.",
        "HIGH",
        "PENDING",
        6
      ),
      task("Repasar la guía de Física II", null, "LOW", "PENDING", null),
      task(
        "Entregar laboratorio de Circuitos",
        "Informe con mediciones y conclusiones.",
        "HIGH",
        "COMPLETED",
        -2
      ),
      task(
        "Inscribir el curso de Inglés",
        "Nivel intermedio, horario de la tarde.",
        "LOW",
        "COMPLETED",
        -7
      ),
    ],
    laura: [
      task(
        "Estudiar para el quiz de Química",
        "Reacciones y balanceo de ecuaciones.",
        "HIGH",
        "PENDING",
        1
      ),
      task(
        "Ensayo de Ética Profesional",
        "Dos páginas sobre un dilema ético en tecnología.",
        "MEDIUM",
        "PENDING",
        3
      ),
      task(
        "Organizar el horario del semestre",
        "Bloques de estudio por materia.",
        "LOW",
        "COMPLETED",
        -4
      ),
    ],
  };

  const tasks = {};
  const sessions = {};

  users.forEach(({ key, email }) => {
    tasks[email] = taskLists[key];
    sessions[email] = SESSION_PLANS[key].flatMap((block) =>
      buildSessionBlock(now, todayUtc, block)
    );
  });

  return {
    users: users.map(({ key, ...user }) => user),
    tasks,
    sessions,
  };
};

/* =========================================================
   3. EJECUCION DEL SEED
========================================================= */

const defaultHash = (password) => bcrypt.hash(password, BCRYPT_COST);

const resolvePassword = (env = process.env) => {
  const fromEnv = env.DEMO_PASSWORD;

  if (fromEnv === undefined || fromEnv === "") {
    return DEMO_PASSWORD;
  }

  if (fromEnv.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `DEMO_PASSWORD debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    );
  }

  return fromEnv;
};

/** Completa las frases motivacionales sin borrar ninguna existente. */
const topUpPhrases = async (prisma) => {
  const active = await prisma.motivationalPhrase.count({
    where: { active: true },
  });

  if (active >= MIN_ACTIVE_PHRASES) {
    return 0;
  }

  const existing = await prisma.motivationalPhrase.findMany({
    select: { text: true },
  });
  const known = new Set(existing.map((phrase) => phrase.text));
  const missing = motivationalPhrases.filter(({ text }) => !known.has(text));

  if (missing.length > 0) {
    await prisma.motivationalPhrase.createMany({ data: missing });
  }

  return missing.length;
};

const runSeed = async (prisma, { now = new Date(), hash, password } = {}) => {
  const data = buildDemoData(now);
  const passwordHash = await (hash || defaultHash)(password || DEMO_PASSWORD);

  // 1) Usuarios: upsert por correo (los ids se mantienen estables).
  const ids = {};

  for (const user of data.users) {
    const row = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, password: passwordHash },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        password: passwordHash,
      },
    });

    ids[user.email] = row.id;
  }

  const demoIds = Object.values(ids);

  const taskRows = data.users.flatMap((user) =>
    data.tasks[user.email].map((task) => ({ ...task, userId: ids[user.email] }))
  );
  const sessionRows = data.users.flatMap((user) =>
    data.sessions[user.email].map((session) => ({
      ...session,
      userId: ids[user.email],
    }))
  );

  // 2) Reemplazo de tareas y sesiones SOLO de los usuarios demo, atomico.
  const operations = [
    prisma.task.deleteMany({ where: { userId: { in: demoIds } } }),
    prisma.pomodoroSession.deleteMany({ where: { userId: { in: demoIds } } }),
  ];

  if (taskRows.length > 0) {
    operations.push(prisma.task.createMany({ data: taskRows }));
  }

  if (sessionRows.length > 0) {
    operations.push(prisma.pomodoroSession.createMany({ data: sessionRows }));
  }

  await prisma.$transaction(operations);

  // 3) Frases: solo se completan las que faltan.
  const phrasesAdded = await topUpPhrases(prisma);

  return {
    users: data.users.length,
    tasks: taskRows.length,
    sessions: sessionRows.length,
    phrasesAdded,
  };
};

/* =========================================================
   4. CLI
========================================================= */

const collectExisting = async (prisma) => {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_EMAIL_DOMAIN } },
    select: { id: true },
  });
  const ids = demoUsers.map((user) => user.id);

  const [tasks, sessions, phrasesTotal, phrasesActive] = await Promise.all([
    ids.length ? prisma.task.count({ where: { userId: { in: ids } } }) : 0,
    ids.length
      ? prisma.pomodoroSession.count({ where: { userId: { in: ids } } })
      : 0,
    prisma.motivationalPhrase.count(),
    prisma.motivationalPhrase.count({ where: { active: true } }),
  ]);

  return { users: ids.length, tasks, sessions, phrasesTotal, phrasesActive };
};

/** Quita cualquier cadena de conexion que se cuele en un mensaje de error. */
const sanitizeMessage = (message, env) => {
  let text = String(message);

  if (env.DATABASE_URL) {
    text = text.split(env.DATABASE_URL).join("[oculto]");
  }

  return text.replace(/\b[a-z][a-z0-9+.-]*:\/\/\S+/gi, "[oculto]");
};

const yesNo = (value) => (value ? "sí" : "no");

const main = async ({
  argv = process.argv.slice(2),
  env = process.env,
  prisma,
  now = new Date(),
  hash,
  log = console.log,
  logError = console.error,
} = {}) => {
  const isCheck = argv.includes("--check");
  let client = prisma;
  let ownsClient = false;

  try {
    const target = evaluateTarget({
      nodeEnv: env.NODE_ENV,
      url: env.DATABASE_URL,
      allowRemote: env.DEMO_SEED_ALLOW_REMOTE,
    });

    if (!isCheck && !target.allowed) {
      logError(`Seed de demostración cancelado. ${target.reason}`);
      return 1;
    }

    const password = isCheck ? null : resolvePassword(env);

    // El cliente solo se crea (y por lo tanto solo se conecta) si el destino
    // fue aprobado o si se pidió --check.
    if (!client) {
      client = require("../src/config/prisma");
      ownsClient = true;
    }

    if (isCheck) {
      const existing = await collectExisting(client);

      log("Verificación del destino (solo lectura, no se escribió nada)");
      log(`  Host:                 ${target.host}`);
      log(`  Base de datos:        ${target.database}`);
      log(`  Es local:             ${yesNo(target.isLocal)}`);
      log(`  El seed se permitiría: ${yesNo(target.allowed)}`);
      if (!target.allowed) {
        log(`  Motivo:               ${target.reason}`);
      }
      log("Datos de demostración existentes");
      log(`  Usuarios demo:        ${existing.users}`);
      log(`  Tareas demo:          ${existing.tasks}`);
      log(`  Sesiones demo:        ${existing.sessions}`);
      log(
        `  Frases (activas/total): ${existing.phrasesActive}/${existing.phrasesTotal}`
      );

      return 0;
    }

    log(
      `Sembrando datos de demostración en "${target.database}" (host ${target.host})...`
    );

    const summary = await runSeed(client, { now, hash, password });

    log("Seed de demostración completado.");
    log(`  Usuarios demo (upsert): ${summary.users}`);
    log(`  Tareas creadas:         ${summary.tasks}`);
    log(`  Sesiones Pomodoro:      ${summary.sessions}`);
    log(`  Frases agregadas:       ${summary.phrasesAdded}`);
    log(
      "La contraseña de las cuentas demo es la constante DEMO_PASSWORD de prisma/seed-demo.js (o la variable de entorno DEMO_PASSWORD)."
    );

    return 0;
  } catch (error) {
    logError(
      `Error ejecutando el seed de demostración: ${sanitizeMessage(
        error && error.message,
        env
      )}`
    );
    return 1;
  } finally {
    if (ownsClient && client && typeof client.$disconnect === "function") {
      await client.$disconnect();
    }
  }
};

module.exports = {
  DEMO_EMAIL_DOMAIN,
  DEMO_PASSWORD,
  parseDatabaseTarget,
  evaluateTarget,
  assertSafeTarget,
  buildDemoData,
  runSeed,
  main,
};

// Solo corre cuando se ejecuta directamente (node prisma/seed-demo.js).
if (require.main === module) {
  require("dotenv").config();

  main().then((code) => {
    process.exit(code);
  });
}
