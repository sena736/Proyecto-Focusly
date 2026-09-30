import { NavLink, useNavigate } from "react-router-dom";
import {
  FiCheckSquare,
  FiClock,
  FiGrid,
  FiHome,
  FiLogOut,
  FiSettings,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import useAuth from "../../../hooks/useAuth";
import "./Sidebar.css";

function Sidebar({ isAdmin = false, isOpen = false, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: FiHome,
    },
    {
      name: "Tareas",
      path: "/tasks",
      icon: FiCheckSquare,
    },
    {
      name: "Pomodoro",
      path: "/pomodoro",
      icon: FiClock,
    },
    {
      name: "Motivación",
      path: "/motivation",
      icon: FiZap,
    },
    {
      name: "Configuración",
      path: "/settings",
      icon: FiSettings,
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
            <FiX aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="sidebar__nav">
        <span className="sidebar__section-title">MENÚ</span>

        {menuItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={handleNavigation}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <span className="sidebar__link-icon">
              <Icon aria-hidden="true" />
            </span>

            <span className="sidebar__link-text">{name}</span>
          </NavLink>
        ))}

        {/* Administración */}
        {isAdmin && (
          <>
            <span className="sidebar__section-title sidebar__section-title--admin">
              ADMINISTRACIÓN
            </span>

            {/* `end`: /admin/users must not keep the panel link highlighted */}
            <NavLink
              to="/admin"
              end
              onClick={handleNavigation}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
            >
              <span className="sidebar__link-icon">
                <FiGrid aria-hidden="true" />
              </span>

              <span className="sidebar__link-text">Panel de administración</span>
            </NavLink>

            <NavLink
              to="/admin/users"
              onClick={handleNavigation}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
            >
              <span className="sidebar__link-icon">
                <FiUsers aria-hidden="true" />
              </span>

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
          <span className="sidebar__link-icon">
            <FiLogOut aria-hidden="true" />
          </span>

          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
