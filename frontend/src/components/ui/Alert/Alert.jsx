import React from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
} from "react-icons/fi";

import "./Alert.css";

const Alert = ({
  type = "info",
  message,
  title,
  onClose,
  showClose = true,
}) => {
  const alertIcons = {
    success: <FiCheckCircle />,
    error: <FiAlertCircle />,
    warning: <FiAlertTriangle />,
    info: <FiInfo />,
  };

  return (
    <div className={`alert alert-${type}`} role="alert">
      {/* Icono */}
      <div className="alert-icon">
        {alertIcons[type]}
      </div>

      {/* Contenido */}
      <div className="alert-content">
        {title && (
          <h4 className="alert-title">
            {title}
          </h4>
        )}

        <p className="alert-message">
          {message}
        </p>
      </div>

      {/* Botón cerrar */}
      {showClose && onClose && (
        <button
          className="alert-close"
          onClick={onClose}
          aria-label="Cerrar alerta"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default Alert;