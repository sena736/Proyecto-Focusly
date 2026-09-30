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
  className = "",
  ...props
}) => {
  const classes = [
    "icon-button",
    `icon-button-${variant}`,
    `icon-button-${size}`,
    active ? "icon-button-active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title || label}
      {...props}
    >
      <span className="icon-button-icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
};

export default IconButton;
