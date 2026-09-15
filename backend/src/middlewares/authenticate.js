const { verifyJwt } = require("../utils/jwt");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token de autenticación requerido",
      });
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyJwt(token);

    if (!payload || !payload.sub || !payload.role) {
      return res.status(401).json({
        message: "Token inválido o expirado",
      });
    }

    req.user = {
      sub: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};

module.exports = authenticate;