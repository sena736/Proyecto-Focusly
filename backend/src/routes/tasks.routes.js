const express = require("express");

const authenticate = require("../middlewares/authenticate");
const controller = require("../controllers/tasks.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", controller.getTasks);
router.post("/", controller.createTask);
router.patch("/:id", controller.updateTask);
router.delete("/:id", controller.deleteTask);

module.exports = router;
