import React from "react";
import { FiChevronDown, FiUser } from "react-icons/fi";
import "./Avatar.css";

const Avatar = ({
  name = "Juan Pérez",
  role = "Estudiante",
  image = null,
  showInfo = true,
  showArrow = true,
  onClick,
}) => {
  // Obtener la primera letra del nombre
  const initial = name.charAt(0).toUpperCase();

  return (
    <button
      className="avatar-container"
      onClick={onClick}
      type="button"
      aria-label={`Perfil de ${name}`}
    >
      {/* Avatar */}
      <div className="avatar-image">
        {image ? (
          <img src={image} alt={`Perfil de ${name}`} />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      {/* Información del usuario */}
      {showInfo && (
        <div className="avatar-info">
          <strong>{name}</strong>
          <span>{role}</span>
        </div>
      )}

      {/* Flecha */}
      {showArrow && (
        <FiChevronDown className="avatar-arrow" />
      )}
    </button>
  );
};

export default Avatar;