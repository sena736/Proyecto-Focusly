import React from "react";
import {
  Home,
  CheckSquare,
  Timer,
  BarChart3,
  User,
} from "lucide-react";
import "./MobileNavigation.css";

const MobileNavigation = ({ activeItem = "home", onNavigate }) => {
  const navigationItems = [
    {
      id: "home",
      label: "Inicio",
      icon: Home,
    },
    {
      id: "tasks",
      label: "Tareas",
      icon: CheckSquare,
    },
    {
      id: "pomodoro",
      label: "Pomodoro",
      icon: Timer,
    },
    {
      id: "statistics",
      label: "Estadísticas",
      icon: BarChart3,
    },
    {
      id: "profile",
      label: "Perfil",
      icon: User,
    },
  ];

  const handleNavigation = (id) => {
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <nav className="mobile-navigation">
      <div className="mobile-navigation__container">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-navigation__item ${
                isActive ? "mobile-navigation__item--active" : ""
              }`}
              onClick={() => handleNavigation(item.id)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className="mobile-navigation__icon"
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
              />

              <span className="mobile-navigation__label">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;