import React, { useState } from "react";
import "./TaskList.css";

const TaskList = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Estudiar para el examen",
      completed: false,
    },
    {
      id: 2,
      title: "Realizar actividad pendiente",
      completed: false,
    },
  ]);

  const [newTask, setNewTask] = useState("");

  const addTask = (e) => {
    e.preventDefault();

    if (newTask.trim() === "") return;

    const task = {
      id: Date.now(),
      title: newTask.trim(),
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <div className="task-list-container">
      <div className="task-list-card">
        <div className="task-list-header">
          <div>
            <h2>Mis tareas</h2>
            <p>Organiza tus actividades y mantén el enfoque.</p>
          </div>

          <span className="task-counter">
            {completedTasks}/{tasks.length}
          </span>
        </div>

        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="¿Qué necesitas hacer?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />

          <button type="submit">+ Agregar</button>
        </form>

        <div className="tasks-container">
          {tasks.length === 0 ? (
            <div className="empty-tasks">
              <span>✨</span>
              <p>No tienes tareas pendientes.</p>
              <small>Agrega una tarea para comenzar.</small>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                className={`task-item ${task.completed ? "completed" : ""}`}
                key={task.id}
              >
                <div className="task-left">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />

                  <span className="task-title">{task.title}</span>
                </div>

                <button
                  className="delete-task"
                  onClick={() => deleteTask(task.id)}
                  aria-label="Eliminar tarea"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {tasks.length > 0 && (
          <div className="task-list-footer">
            <span>
              {completedTasks === tasks.length
                ? "🎉 ¡Todas las tareas completadas!"
                : `${tasks.length - completedTasks} tarea(s) pendiente(s)`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
