const usersService = require("../services/users.service");

const getUsers = async (req, res) => {
  try {
    const users = await usersService.listUsers();

    return res.status(200).json(users);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener los usuarios",
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await usersService.changeRole(
      Number(req.params.id),
      req.body.role
    );

    return res.status(200).json(user);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar el rol del usuario",
    });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
};
