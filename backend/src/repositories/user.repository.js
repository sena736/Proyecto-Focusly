import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    return {
      id,
      name: "Usuario Focusly",
      email: "usuario@focusly.com",
      role: "user",
    };
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

export default userRepository;
