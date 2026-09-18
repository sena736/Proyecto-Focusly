const prisma = require("../config/prisma");

const userRepository = {
  /**
   * Buscar usuario por correo electrónico
   */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  },

  /**
   * Buscar usuario por Google ID
   */
  async findByGoogleId(googleId) {
    return prisma.user.findUnique({
      where: {
        googleId,
      },
    });
  },

  /**
   * Buscar usuario por ID
   */
  async getUserById(id) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  },

  /**
   * Obtener todos los usuarios
   */
  async findAll() {
    return prisma.user.findMany();
  },

  /**
   * Actualizar el rol de un usuario
   */
  async updateRole(id, role) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        role,
      },
    });
  },

  /**
   * Crear nuevo usuario
   */
  async create(userData) {
    return prisma.user.create({
      data: userData,
    });
  },
};

module.exports = userRepository;
