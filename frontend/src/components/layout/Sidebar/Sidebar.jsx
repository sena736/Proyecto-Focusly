import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import "./Sidebar.css";

function Sidebar({ isAdmin = false, isOpen = false, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
    },
    {
      name: "Tareas",
      path: "/tasks",
      icon: "✓",
    },
    {
      name: "Pomodoro",
      path: "/pomodoro",
      icon: "◷",
    },
    {
      name: "Motivación",
      path: "/motivation",
      icon: "✦",
    },
    {
      name: "Configuración",
      path: "/settings",
      icon: "⚙",
    },
  ];

  const handleLogout = async () => {
    await logout();

    navigate("/login");

    // Cerrar Sidebar en dispositivos móviles
    if (onClose) {
      onClose();
    }
  };

  const handleNavigation = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
      {/* Logo */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">F</div>

          <span className="sidebar__logo-text">Focusly</span>
        </div>

        {onClose && (
          <button
            type="button"
            className="sidebar__close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            ×
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="sidebar__nav">
        <span className="sidebar__section-title">MENÚ</span>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavigation}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <span className="sidebar__link-icon">{item.icon}</span>

            <span className="sidebar__link-text">{item.name}</span>
          </NavLink>
        ))}

        {/* Administración */}
        {isAdmin && (
          <>
            <span className="sidebar__section-title sidebar__section-title--admin">
              ADMINISTRACIÓN
            </span>

            <NavLink
              to="/admin/users"
              onClick={handleNavigation}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
            >
              <span className="sidebar__link-icon">◈</span>

              <span className="sidebar__link-text">Administrar usuarios</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Parte inferior */}
      <div className="sidebar__footer">
        <button
          type="button"
          className="sidebar__logout"
          onClick={handleLogout}
        >
          <span className="sidebar__link-icon">↪</span>

          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
