import React from "react";
import "./Card.css";

const Card = ({
  children,
  title = "",
  subtitle = "",
  icon = null,
  headerAction = null,
  variant = "default",
  padding = "medium",
  hover = false,
  fullWidth = false,
  className = "",
  onClick = null,
}) => {
  return (
    <div
      className={`
        focusly-card
        focusly-card--${variant}
        focusly-card--padding-${padding}
        ${hover ? "focusly-card--hover" : ""}
        ${fullWidth ? "focusly-card--full" : ""}
        ${onClick ? "focusly-card--clickable" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {/* =====================================
          HEADER
          ===================================== */}

      {(title || icon || headerAction) && (
        <div className="focusly-card__header">
          <div className="focusly-card__heading">
            {icon && <div className="focusly-card__icon">{icon}</div>}

            <div className="focusly-card__titles">
              {title && <h3 className="focusly-card__title">{title}</h3>}

              {subtitle && <p className="focusly-card__subtitle">{subtitle}</p>}
            </div>
          </div>

          {headerAction && (
            <div className="focusly-card__action">{headerAction}</div>
          )}
        </div>
      )}

      {/* =====================================
          CONTENT
          ===================================== */}

      <div className="focusly-card__content">{children}</div>
    </div>
  );
};

export default Card;
