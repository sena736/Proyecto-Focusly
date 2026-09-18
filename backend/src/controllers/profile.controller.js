const profileService = require("../services/profile.service");

const getProfile = async (req, res) => {
  try {
    const user = await profileService.getProfile(req.user.sub);

    return res.status(200).json(user);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener el perfil",
    });
  }
};

module.exports = {
  getProfile,
};
