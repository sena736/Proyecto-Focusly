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
  loadingText = "Cargando...",
  fullWidth = false,
  onClick,
  className = "",
  ...props
}) => {
  const classes = [
    "focusly-button",
    `focusly-button--${variant}`,
    `focusly-button--${size}`,
    fullWidth ? "focusly-button--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="focusly-button__loading">
          <span className="focusly-button__spinner" aria-hidden="true"></span>
          {loadingText}
        </span>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="focusly-button__icon" aria-hidden="true">
              {icon}
            </span>
          )}

          <span className="focusly-button__text">{children}</span>

          {icon && iconPosition === "right" && (
            <span className="focusly-button__icon" aria-hidden="true">
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
