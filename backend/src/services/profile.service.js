const userRepository = require("../repositories/user.repository");

const getProfile = async (userId) => {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  return user;
};

const MAX_NAME_LENGTH = 100;

const badRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const userNotFound = () => {
  const error = new Error("Usuario no encontrado");
  error.status = 404;
  return error;
};

/**
 * Validates the only editable field. Returns the trimmed name.
 */
const parseName = (body) => {
  const name = body?.name;

  if (name === undefined || name === null) {
    throw badRequest("El nombre es obligatorio.");
  }

  if (typeof name !== "string") {
    throw badRequest("El nombre debe ser un texto.");
  }

  const trimmed = name.trim();

  if (/\p{Cc}/u.test(trimmed)) {
    throw badRequest("El nombre contiene caracteres no válidos.");
  }

  // Nothing visible left once format/zero-width characters are removed.
  if (!trimmed.replace(/[\p{Cf}\s]/gu, "")) {
    throw badRequest("El nombre es obligatorio.");
  }

  // Count code points, not UTF-16 units, so an emoji is one character.
  if ([...trimmed].length > MAX_NAME_LENGTH) {
    throw badRequest(
      `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres.`
    );
  }

  return trimmed;
};

/**
 * Updates the user's name. It reads `name` explicitly from the body (never
 * spreads it), so role, email, id, password, etc. cannot be changed here.
 */
const updateProfile = async (userId, body) => {
  const name = parseName(body);

  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw userNotFound();
  }

  let updated;

  try {
    updated = await userRepository.updateName(userId, name);
  } catch (error) {
    // Prisma "record to update not found": deleted between lookup and update.
    if (error?.code === "P2025") {
      throw userNotFound();
    }

    throw error;
  }

  const { password, ...safeUser } = updated;

  return safeUser;
};

module.exports = {
  getProfile,
  updateProfile,
};
