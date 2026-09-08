import React from "react";
import {
  ListTodo,
  Clock3,
  CheckCircle2,
  Flag,
} from "lucide-react";
import "./TaskFilters.css";

const TaskFilters = ({
  activeFilter = "all",
  onFilterChange,
}) => {
  const filters = [
    {
      id: "all",
      label: "Todas",
      icon: ListTodo,
    },
    {
      id: "pending",
      label: "Pendientes",
      icon: Clock3,
    },
    {
      id: "completed",
      label: "Completadas",
      icon: CheckCircle2,
    },
    {
      id: "priority",
      label: "Prioridad",
      icon: Flag,
    },
  ];

  const handleFilterChange = (filterId) => {
    if (onFilterChange) {
      onFilterChange(filterId);
    }
  };

  return (
    <div className="task-filters">
      <div className="task-filters__header">
        <h3 className="task-filters__title">
          Filtrar tareas
        </h3>
      </div>

      <div className="task-filters__list">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              className={`task-filters__button ${
                isActive ? "task-filters__button--active" : ""
              }`}
              onClick={() => handleFilterChange(filter.id)}
              aria-pressed={isActive}
            >
              <Icon
                className="task-filters__icon"
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
              />

              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TaskFilters;