const express = require("express");

const authenticate = require("../middlewares/authenticate");
const controller = require("../controllers/profile.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", controller.getProfile);

module.exports = router;
