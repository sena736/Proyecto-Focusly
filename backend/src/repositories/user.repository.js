const getUserById = async (id) => {
  return {
    id,
    name: "Usuario Focusly",
    email: "usuario@focusly.com",
    role: "user",
  };
};

module.exports = {
  getUserById,
};
