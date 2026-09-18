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

  async getUserById(id) {
    return prisma.user.findUnique({
      where: {
        id,
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
