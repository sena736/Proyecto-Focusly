import React from "react";
import "./Button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  icon = null,
  iconPosition = "left",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = "",
}) => {
  return (
    <button
      type={type}
      className={`
        focusly-button
        focusly-button--${variant}
        focusly-button--${size}
        ${fullWidth ? "focusly-button--full" : ""}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="focusly-button__loading">
          <span className="focusly-button__spinner"></span>
          Cargando...
        </span>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="focusly-button__icon">{icon}</span>
          )}

          <span className="focusly-button__text">{children}</span>

          {icon && iconPosition === "right" && (
            <span className="focusly-button__icon">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
