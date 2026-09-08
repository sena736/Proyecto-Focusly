import { NavLink } from "react-router-dom";
import {
  Home,
  Clock3,
  ClipboardList,
  Star,
  User,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar({ role = "user", onLogout }) {
  const isAdmin = role === "admin";

  const menuItems = [
    {
      name: "Inicio",
      path: isAdmin ? "/admin/dashboard" : "/dashboard",
      icon: Home,
    },
    {
      name: "Pomodoro",
      path: isAdmin ? "/admin/pomodoro" : "/pomodoro",
      icon: Clock3,
    },
    {
      name: "Tareas",
      path: isAdmin ? "/admin/tareas" : "/tareas",
      icon: ClipboardList,
    },
    {
      name: "Motivación",
      path: isAdmin ? "/admin/motivacion" : "/motivacion",
      icon: Star,
    },
  ];

  // Perfil para usuarios y Usuarios para administradores
  if (isAdmin) {
    menuItems.push({
      name: "Usuarios",
      path: "/admin/usuarios",
      icon: Users,
    });
  } else {
    menuItems.push({
      name: "Perfil",
      path: "/perfil",
      icon: User,
    });
  }

  menuItems.push({
    name: "Configuración",
    path: isAdmin ? "/admin/configuracion" : "/configuracion",
    icon: Settings,
  });

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">F</div>

        <div className="sidebar-brand">
          <h2>FOCUSLY</h2>
          <span>{isAdmin ? "Panel administrativo" : "Organiza tu tiempo"}</span>
        </div>
      </div>

      {/* Menú */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} strokeWidth={2} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Usuario / parte inferior */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{isAdmin ? "A" : "U"}</div>

          <div className="sidebar-user-info">
            <strong>{isAdmin ? "Administrador" : "Usuario"}</strong>

            <span>{isAdmin ? "Administrador" : "Estudiante"}</span>
          </div>
        </div>

        {/* Cerrar sesión */}
        {onLogout && (
          <button className="sidebar-logout" onClick={onLogout}>
            <LogOut size={18} />

            <span>Cerrar sesión</span>
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
