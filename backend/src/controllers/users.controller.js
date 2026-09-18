const getUsers = (req, res) => {
  res.json({
    message: "Lista de usuarios",
    users: [],
  });
};

module.exports = {
  getUsers,
};
