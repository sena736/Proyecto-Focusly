const getProfile = (req, res) => {
  res.json({
    message: "Perfil del usuario",
  });
};

module.exports = {
  getProfile,
};
