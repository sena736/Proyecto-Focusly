import React, { useState } from "react";
import "./TaskAction.css";

function TaskAction({ tasks, setTasks }) {
  const [text, setText] = useState("");

  const addTask = () => {
    if (text.trim() === "") return;

    const newTask = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
    };

    const updatedTasks = [...tasks, newTask];

    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  return (
    <div className="task-action">
      <input
        type="text"
        placeholder="Escribe una nueva tarea..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyPress}
      />

      <button onClick={addTask}>
        Agregar
      </button>
    </div>
  );
}

export default TaskAction;

import React from "react";

const TaskAction = ({ completed, onToggle, onDelete }) => {
  return (
    <div className="task-actions">
      <button className="btn-complete" onClick={onToggle}>
        {completed ? "Desmarcar" : "Completar"}
      </button>

      <button className="btn-delete" onClick={onDelete}>
        Eliminar
      </button>
    </div>
  );
};

export default TaskAction;