import React from "react";
import "./IconButton.css";

const IconButton = ({
  icon,
  label = "Botón",
  onClick,
  variant = "default",
  size = "medium",
  disabled = false,
  type = "button",
  active = false,
  title,
}) => {
  return (
    <button
      type={type}
      className={`
        icon-button
        icon-button-${variant}
        icon-button-${size}
        ${active ? "icon-button-active" : ""}
      `}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title || label}
    >
      <span className="icon-button-icon">
        {icon}
      </span>
    </button>
  );
};

export default IconButton;