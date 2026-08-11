import React from "react";
//  import "./TaskItem.css";

function TaskItem({ task, tasks, setTasks }) {
  const updateLocalStorage = (updatedTasks) => {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const toggleComplete = () => {
    const updatedTasks = tasks.map((item) =>
      item.id === task.id
        ? { ...item, completed: !item.completed }
        : item
    );

    updateLocalStorage(updatedTasks);
  };

  const deleteTask = () => {
    const updatedTasks = tasks.filter((item) => item.id !== task.id);
    updateLocalStorage(updatedTasks);
  };

  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>
      <span onClick={toggleComplete} className="task-text">
        {task.text}
      </span>

      <div className="task-buttons">
        <button className="complete-btn" onClick={toggleComplete}>
          {task.completed ? "Deshacer" : "Completar"}
        </button>

        <button className="delete-btn" onClick={deleteTask}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default TaskItem;import React from "react";
//  import "./TaskItem.css";

function TaskItem({ task, tasks, setTasks }) {
  const updateLocalStorage = (updatedTasks) => {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const toggleComplete = () => {
    const updatedTasks = tasks.map((item) =>
      item.id === task.id
        ? { ...item, completed: !item.completed }
        : item
    );

    updateLocalStorage(updatedTasks);
  };

  const deleteTask = () => {
    const updatedTasks = tasks.filter((item) => item.id !== task.id);
    updateLocalStorage(updatedTasks);
  };

  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>
      <span onClick={toggleComplete} className="task-text">
        {task.text}
      </span>

      <div className="task-buttons">
        <button className="complete-btn" onClick={toggleComplete}>
          {task.completed ? "Deshacer" : "Completar"}
        </button>

        <button className="delete-btn" onClick={deleteTask}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default TaskItem;