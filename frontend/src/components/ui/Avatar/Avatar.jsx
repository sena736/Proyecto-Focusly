import React from "react";
import { FiChevronDown, FiUser } from "react-icons/fi";
import "./Avatar.css";

// Up to two initials: first letter of the first two words of the name.
const getInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

// No fake defaults: when name or role are missing nothing is invented.
const Avatar = ({
  name = "",
  role = "",
  image = null,
  showInfo = true,
  showArrow = true,
  onClick,
}) => {
  const cleanName = name.trim();
  const initials = getInitials(cleanName);
  const hasInfo = showInfo && Boolean(cleanName);

  return (
    <button
      className="avatar-container"
      onClick={onClick}
      type="button"
      aria-label={cleanName ? `Perfil de ${cleanName}` : "Perfil"}
    >
      {/* Avatar */}
      <div className="avatar-image">
        {image ? (
          <img src={image} alt="" />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <FiUser aria-hidden="true" />
        )}
      </div>

      {/* Información del usuario */}
      {hasInfo && (
        <div className="avatar-info">
          <strong>{cleanName}</strong>
          {role && <span>{role}</span>}
        </div>
      )}

      {/* Flecha */}
      {showArrow && (
        <FiChevronDown className="avatar-arrow" aria-hidden="true" />
      )}
    </button>
  );
};

export default Avatar;
