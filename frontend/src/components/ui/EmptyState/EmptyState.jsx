import React from "react";
import "./EmptyState.css";

const EmptyState = ({
  icon = "📭",
  title = "No hay información",
  message = "Aún no hay elementos para mostrar.",
  buttonText = "",
  onAction,
  variant = "default",
}) => {
  return (
    <section
      className={`empty-state empty-state-${variant}`}
      aria-label={title}
    >
      <div className="empty-state-icon">
        {icon}
      </div>

      <div className="empty-state-content">
        <h3 className="empty-state-title">
          {title}
        </h3>

        <p className="empty-state-message">
          {message}
        </p>

        {buttonText && onAction && (
          <button
            type="button"
            className="empty-state-button"
            onClick={onAction}
          >
            {buttonText}
          </button>
        )}
      </div>
    </section>
  );
};

export default EmptyState;