const profileService = require("../services/profile.service");

const INTERNAL_ERROR_MESSAGE = "Error interno del servidor.";

/**
 * Only errors that carry a 4xx status are meant for the client. Anything else
 * (Prisma/DB failures, bugs) is logged and answered with a generic message so
 * internal details never leak.
 */
const sendError = (res, error, context) => {
  const status = error?.status;

  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return res.status(status).json({ message: error.message });
  }

  console.error(`[profile] ${context}:`, error);

  return res.status(500).json({ message: INTERNAL_ERROR_MESSAGE });
};

const getProfile = async (req, res) => {
  try {
    const user = await profileService.getProfile(req.user.sub);

    return res.status(200).json(user);
  } catch (error) {
    return sendError(res, error, "getProfile failed");
  }
};

/**
 * PATCH /api/v1/profile
 *
 * Only `name` is editable: the service reads that single field from the body,
 * so nothing else in the payload can ever reach the database.
 */
const updateProfile = async (req, res) => {
  try {
    const user = await profileService.updateProfile(req.user.sub, req.body);

    return res.status(200).json(user);
  } catch (error) {
    return sendError(res, error, "updateProfile failed");
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
