import React from "react";
import "./PageHeader.css";

const PageHeader = ({
  title,
  subtitle = "",
  icon = null,
  action = null,
  breadcrumb = null,
  align = "left",
  className = "",
}) => {
  return (
    <header
      className={`
        focusly-page-header
        focusly-page-header--${align}
        ${className}
      `}
    >
      {/* =====================================
          BREADCRUMB
          ===================================== */}

      {breadcrumb && (
        <div className="focusly-page-header__breadcrumb">{breadcrumb}</div>
      )}

      {/* =====================================
          CONTENIDO PRINCIPAL
          ===================================== */}

      <div className="focusly-page-header__main">
        {/* Información */}
        <div className="focusly-page-header__info">
          {/* Icono */}
          {icon && <div className="focusly-page-header__icon">{icon}</div>}

          {/* Títulos */}
          <div className="focusly-page-header__text">
            {title && <h1 className="focusly-page-header__title">{title}</h1>}

            {subtitle && (
              <p className="focusly-page-header__subtitle">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Acción */}
        {action && <div className="focusly-page-header__action">{action}</div>}
      </div>
    </header>
  );
};

export default PageHeader;
