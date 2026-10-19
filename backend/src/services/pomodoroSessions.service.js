const repository = require("../repositories/pomodoroSession.repository");

const SESSION_TYPES = ["WORK", "BREAK"];
const MIN_DURATION_MINUTES = 1;
const MAX_DURATION_MINUTES = 180;
const MAX_FUTURE_MS = 24 * 60 * 60 * 1000;
const MAX_ID = 2147483647; // Prisma `Int` (MySQL INT) upper bound.
const MIN_YEAR = 2000;
const CANONICAL_ID = /^[1-9]\d*$/;
const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
// A datetime must carry an explicit zone (Z or +-HH:MM): without it the server
// would parse it in its own local time.
const ISO_DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

const badRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const notFound = () => {
  const error = new Error("Sesión Pomodoro no encontrada");
  error.status = 404;
  return error;
};

/**
 * Session ids are canonical positive int32 values (no leading zeros). Anything
 * else cannot match a row, so answer the same 404 instead of letting Prisma
 * fail with a 500.
 */
const parseId = (rawId) => {
  if (typeof rawId !== "string" || !CANONICAL_ID.test(rawId)) {
    throw notFound();
  }

  const id = Number(rawId);

  if (id > MAX_ID) {
    throw notFound();
  }

  return id;
};

/**
 * True when the calendar day exists (rejects 2025-02-30, which V8 would
 * silently roll over to March 2).
 */
const isRealCalendarDay = (year, month, day) => {
  const probe = new Date(Date.UTC(year, month - 1, day));

  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
};

const parseDate = (value, label, article) => {
  if (value === undefined || value === null || value === "") {
    throw badRequest(`${article} ${label} es obligatoria`);
  }

  const match =
    typeof value === "string"
      ? ISO_DATE_TIME.exec(value) || ISO_DATE_ONLY.exec(value)
      : null;

  if (!match) {
    throw badRequest(`${article} ${label} no es válida`);
  }

  const [year, month, day] = match.slice(1, 4).map(Number);

  if (year < MIN_YEAR || !isRealCalendarDay(year, month, day)) {
    throw badRequest(`${article} ${label} no es válida`);
  }

  // Date-only input is parsed by the spec as UTC midnight.
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw badRequest(`${article} ${label} no es válida`);
  }

  return date;
};

const validators = {
  type: (value) => {
    if (value === undefined || value === null || value === "") {
      throw badRequest("El tipo de sesión es obligatorio");
    }

    if (typeof value !== "string" || !SESSION_TYPES.includes(value)) {
      throw badRequest("El tipo de sesión no es válido");
    }

    return value;
  },
  startedAt: (value) => parseDate(value, "fecha de inicio", "La"),
  endedAt: (value) => parseDate(value, "fecha de fin", "La"),
  durationMinutes: (value) => {
    if (value === undefined || value === null) {
      throw badRequest("La duración es obligatoria");
    }

    if (
      !Number.isInteger(value) ||
      value < MIN_DURATION_MINUTES ||
      value > MAX_DURATION_MINUTES
    ) {
      throw badRequest(
        `La duración debe ser un entero entre ${MIN_DURATION_MINUTES} y ${MAX_DURATION_MINUTES} minutos`
      );
    }

    return value;
  },
};

const EDITABLE_FIELDS = Object.keys(validators);

const assertPlainObject = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw badRequest("El cuerpo de la solicitud no es válido");
  }
};

/**
 * Validate the whitelisted fields that are present (or all of them when
 * `requireAll` is set) and return a clean object. Any other key is dropped.
 */
const pickValidated = (data, { requireAll }) => {
  assertPlainObject(data);

  const clean = {};

  for (const field of EDITABLE_FIELDS) {
    if (requireAll || data[field] !== undefined) {
      clean[field] = validators[field](data[field]);
    }
  }

  return clean;
};

const assertOrder = (startedAt, endedAt) => {
  if (endedAt.getTime() <= startedAt.getTime()) {
    throw badRequest("La fecha de fin debe ser posterior a la de inicio");
  }
};

const assertDateRules = (startedAt, endedAt) => {
  const limit = Date.now() + MAX_FUTURE_MS;

  if (
    (startedAt && startedAt.getTime() > limit) ||
    (endedAt && endedAt.getTime() > limit)
  ) {
    throw badRequest("Las fechas no pueden estar en el futuro");
  }

  if (startedAt && endedAt) {
    assertOrder(startedAt, endedAt);
  }
};

const createSession = async (userId, data) => {
  const clean = pickValidated(data, { requireAll: true });

  assertDateRules(clean.startedAt, clean.endedAt);

  return repository.create({
    ...clean,
    userId,
  });
};

const getSessionById = async (id, userId) => {
  const session = await repository.findOwnedById(parseId(id), userId);

  if (!session) {
    throw notFound();
  }

  return session;
};

const getUserSessions = async (userId) => {
  return repository.findByUserId(userId);
};

const getAllSessions = async () => {
  return repository.findAll();
};

const updateSession = async (id, userId, data) => {
  const sessionId = parseId(id);
  const clean = pickValidated(data, { requireAll: false });

  if (Object.keys(clean).length === 0) {
    throw badRequest("No hay campos para actualizar");
  }

  assertDateRules(clean.startedAt, clean.endedAt);

  const session = await repository.findOwnedById(sessionId, userId);

  if (!session) {
    throw notFound();
  }

  // Only the dates being changed are checked against the stored counterpart,
  // so a legacy row with already inconsistent dates is not trapped when the
  // update does not touch them.
  if (clean.startedAt && !clean.endedAt) {
    assertOrder(clean.startedAt, session.endedAt);
  }

  if (clean.endedAt && !clean.startedAt) {
    assertOrder(session.startedAt, clean.endedAt);
  }

  const updated = await repository.updateOwned(sessionId, userId, clean);

  if (!updated) {
    throw notFound();
  }

  return updated;
};

const deleteSession = async (id, userId) => {
  const removed = await repository.removeOwned(parseId(id), userId);

  if (!removed) {
    throw notFound();
  }
};

module.exports = {
  createSession,
  getSessionById,
  getUserSessions,
  getAllSessions,
  updateSession,
  deleteSession,
};
