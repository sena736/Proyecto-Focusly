import React from "react";
import "./TaskCard.css";

const TaskCard = ({
  title = "Nueva tarea",
  description = "",
  date = "Hoy",
  completed = false,
  priority = "normal",
  category = "",
  onToggle,
  onEdit,
  onDelete,
}) => {
  const priorityLabels = {
    low: "Baja",
    normal: "Normal",
    high: "Alta",
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle(!completed);
    }
  };

  return (
    <article
      className={`task-card ${
        completed ? "task-card-completed" : ""
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        className={`task-checkbox ${
          completed ? "task-checkbox-checked" : ""
        }`}
        onClick={handleToggle}
        aria-label={
          completed
            ? `Marcar ${title} como pendiente`
            : `Marcar ${title} como completada`
        }
      >
        {completed && <span>✓</span>}
      </button>

      {/* Información */}
      <div className="task-content">
        <div className="task-main">
          <h3 className="task-title">
            {title}
          </h3>

          {description && (
            <p className="task-description">
              {description}
            </p>
          )}
        </div>

        {/* Información adicional */}
        <div className="task-meta">
          {date && (
            <span className="task-date">
              <span className="task-meta-icon">▣</span>
              {date}
            </span>
          )}

          {category && (
            <span className="task-category">
              {category}
            </span>
          )}

          <span
            className={`task-priority task-priority-${priority}`}
          >
            {priorityLabels[priority] || priority}
          </span>
        </div>
      </div>

      {/* Acciones */}
      {(onEdit || onDelete) && (
        <div className="task-actions">
          {onEdit && (
            <button
              type="button"
              className="task-action-button"
              onClick={() => onEdit()}
              aria-label={`Editar ${title}`}
              title="Editar"
            >
              ✎
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              className="task-action-button task-action-delete"
              onClick={() => onDelete()}
              aria-label={`Eliminar ${title}`}
              title="Eliminar"
            >
              ⋮
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default TaskCard;