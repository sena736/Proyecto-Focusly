import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiCheckSquare,
  FiClock,
  FiHome,
  FiUser,
  FiZap,
} from "react-icons/fi";
import "./MobileNavigation.css";

// Only real routes belong here. Settings, admin and logout stay in the Sidebar
// (opened from the hamburger button of UserLayout).
const NAVIGATION_ITEMS = [
  { label: "Inicio", path: "/dashboard", icon: FiHome },
  { label: "Tareas", path: "/tasks", icon: FiCheckSquare },
  { label: "Pomodoro", path: "/pomodoro", icon: FiClock },
  { label: "Motivación", path: "/motivation", icon: FiZap },
  { label: "Perfil", path: "/profile", icon: FiUser },
];

const MobileNavigation = () => {
  return (
    <nav className="mobile-navigation" aria-label="Navegación móvil">
      <div className="mobile-navigation__container">
        {NAVIGATION_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `mobile-navigation__item${
                isActive ? " mobile-navigation__item--active" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="mobile-navigation__icon"
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />

                <span className="mobile-navigation__label">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;
