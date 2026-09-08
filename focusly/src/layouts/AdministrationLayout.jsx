import React, { useState } from "react";
import "./AdministrationLayout.css";

const AdministrationLayout = ({
  children,
  adminName = "Administrador",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      icon: "▦",
      path: "/admin",
    },
    {
      label: "Usuarios",
      icon: "👥",
      path: "/admin/users",
    },
    {
      label: "Lecturas",
      icon: "📚",
      path: "/admin/readings",
    },
    {
      label: "Categorías",
      icon: "▤",
      path: "/admin/categories",
    },
    {
      label: "Estadísticas",
      icon: "📊",
      path: "/admin/statistics",
    },
    {
      label: "Reportes",
      icon: "📄",
      path: "/admin/reports",
    },
    {
      label: "Configuración",
      icon: "⚙",
      path: "/admin/settings",
    },
  ];

  const handleNavigation = (path) => {
    window.location.href = path;
    setSidebarOpen(false);
  };

  return (
    <div className="administration-layout">

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        {/* Logo */}
        <div className="admin-logo">
          <div className="admin-logo-icon">
            📖
          </div>

          <div>
            <h2>LectoGo</h2>
            <span>Administración</span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="admin-navigation">

          <span className="navigation-title">
            MENÚ PRINCIPAL
          </span>

          {menuItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className="admin-menu-item"
              onClick={() => handleNavigation(item.path)}
            >
              <span className="menu-icon">
                {item.icon}
              </span>

              <span className="menu-label">
                {item.label}
              </span>
            </button>
          ))}

        </nav>

        {/* Parte inferior */}
        <div className="admin-sidebar-footer">

          <button
            type="button"
            className="admin-menu-item"
            onClick={() => handleNavigation("/")}
          >
            <span className="menu-icon">←</span>
            <span className="menu-label">
              Volver a LectoGo
            </span>
          </button>

        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <div className="admin-main">

        {/* Header */}
        <header className="admin-header">

          <button
            type="button"
            className="admin-mobile-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <div className="admin-header-title">
            <h1>Panel de administración</h1>
            <span>
              Gestiona y supervisa LectoGo
            </span>
          </div>

          {/* Perfil */}
          <div className="admin-profile">

            <div className="admin-avatar">
              {adminName.charAt(0).toUpperCase()}
            </div>

            <div className="admin-profile-info">
              <strong>{adminName}</strong>
              <span>Administrador</span>
            </div>

          </div>

        </header>

        {/* Contenido */}
        <main className="admin-content">
          {children}
        </main>

      </div>

    </div>
  );
};

export default AdministrationLayout;