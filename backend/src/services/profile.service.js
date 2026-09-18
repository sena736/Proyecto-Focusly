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

module.exports = {
  getProfile,
};
