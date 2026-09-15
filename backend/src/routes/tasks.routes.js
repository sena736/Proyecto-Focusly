const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Lista de tareas",
  });
});

module.exports = router;
