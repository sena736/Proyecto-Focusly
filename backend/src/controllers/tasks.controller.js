const getTasks = (req, res) => {
  res.json({
    message: "Lista de tareas",
    tasks: [],
  });
};

module.exports = {
  getTasks,
};
