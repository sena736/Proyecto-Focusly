const userRepository = require("../repositories/user.repository");

const VALID_ROLES = ["USER", "ADMIN"];

/**
 * Quitar el hash de contraseña antes de devolver el usuario
 */
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;

  return safeUser;
};

/**
 * Listar todos los usuarios
 */
const listUsers = async () => {
  const users = await userRepository.findAll();

  return users.map(sanitizeUser);
};

/**
 * Cambiar el rol de un usuario
 */
const changeRole = async (id, role) => {
  if (!VALID_ROLES.includes(role)) {
    const error = new Error(
      `El rol debe ser uno de: ${VALID_ROLES.join(", ")}`
    );
    error.status = 400;

    throw error;
  }

  const updatedUser = await userRepository.updateRole(id, role);

  return sanitizeUser(updatedUser);
};

module.exports = {
  listUsers,
  changeRole,
};
