const express = require("express");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const usersController = require("../controllers/users.controller");

const router = express.Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", usersController.getUsers);
router.patch("/:id/role", usersController.updateUserRole);

module.exports = router;
