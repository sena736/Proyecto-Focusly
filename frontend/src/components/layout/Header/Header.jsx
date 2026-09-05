import { useState } from "react";
import "./Header.css";

/**
 * Header reutilizable para Focusly.
 *
 * Soporta:
 * - Usuario invitado / vista pública
 * - Usuario registrado
 * - Administrador
 * - Menú responsive
 *
 * Ejemplo:
 * <Header
 *   user={{ name: "Juan Pérez", role: "Estudiante" }}
 *   isAuthenticated
 * />
 */
export default function Header({
  user = null,
  isAuthenticated = false,
  isAdmin = false,
  activeItem = "inicio",
  onNavigate,
  onProfile,
  onLogout,
  showNavigation = true,
  className = "",
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = isAdmin
    ? [
        { id: "inicio", label: "Inicio", href: "/dashboard" },
        { id: "pomodoro", label: "Pomodoro", href: "/pomodoro" },
        { id: "tareas", label: "Tareas", href: "/tareas" },
        { id: "motivacion", label: "Motivación", href: "/motivación" },
        { id: "usuarios", label: "Usuarios", href: "/admin" },
        { id: "configuracion", label: "Configuración", href: "/configuracion" },
      ]
    : isAuthenticated
      ? [
          { id: "inicio", label: "Inicio", href: "/dashboard" },
          { id: "pomodoro", label: "Pomodoro", href: "/pomodoro" },
          { id: "tareas", label: "Tareas", href: "/tareas" },
          { id: "motivacion", label: "Motivación", href: "/motivación" },
          { id: "perfil", label: "Perfil", href: "/perfil" },
          {
            id: "configuracion",
            label: "Configuración",
            href: "/configuracion",
          },
        ]
      : [
          { id: "inicio", label: "Inicio", href: "/" },
          {
            id: "motivacion",
            label: "Frases motivacionales",
            href: "/motivación",
          },
          { id: "conoce", label: "Conoce la app", href: "/conoce" },
        ];

  const displayName = user?.name || (isAdmin ? "Admin" : "Invitado");
  const role = user?.role || (isAdmin ? "Administrador" : "Usuario invitado");

  const handleNavigate = (item) => {
    setMenuOpen(false);

    if (onNavigate) {
      onNavigate(item);
      return;
    }

    window.location.href = item.href;
  };

  const handleProfile = () => {
    setMenuOpen(false);
    onProfile?.();
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout?.();
  };

  const classes = ["focusly-header", className].filter(Boolean).join(" ");

  return (
    <header className={classes}>
      <div className="focusly-header__container">
        <a
          className="focusly-header__brand"
          href={isAuthenticated ? "/dashboard" : "/"}
          onClick={(event) => {
            if (onNavigate) {
              event.preventDefault();
              handleNavigate(
                isAuthenticated
                  ? { id: "inicio", label: "Inicio", href: "/dashboard" }
                  : { id: "inicio", label: "Inicio", href: "/" },
              );
            }
          }}
          aria-label="Focusly - Inicio"
        >
          <span className="focusly-header__logo" aria-hidden="true">
            <span>F</span>
            <i>✦</i>
          </span>

          <span className="focusly-header__brand-text">
            <strong>FOCUSLY</strong>
            <small>Organiza tu tiempo, alcanza tus metas</small>
          </span>
        </a>

        {showNavigation && (
          <nav
            className={`focusly-header__nav ${menuOpen ? "is-open" : ""}`}
            aria-label="Navegación principal"
          >
            {navigation.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={
                  activeItem === item.id
                    ? "focusly-header__nav-link is-active"
                    : "focusly-header__nav-link"
                }
                onClick={(event) => {
                  if (onNavigate) {
                    event.preventDefault();
                    handleNavigate(item);
                  } else {
                    setMenuOpen(false);
                  }
                }}
              >
                {item.label}
              </a>
            ))}

            {!isAuthenticated && (
              <div className="focusly-header__public-actions">
                <a href="/login" className="focusly-header__login">
                  Iniciar sesión
                </a>
                <a href="/registro" className="focusly-header__register">
                  Registrarse
                </a>
              </div>
            )}
          </nav>
        )}

        {isAuthenticated && (
          <div className="focusly-header__user">
            <button
              type="button"
              className="focusly-header__notification"
              aria-label="Notificaciones"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span />
            </button>

            <button
              type="button"
              className="focusly-header__profile"
              onClick={handleProfile}
              aria-label={`Abrir perfil de ${displayName}`}
            >
              <span className="focusly-header__avatar">
                {displayName.charAt(0).toUpperCase()}
              </span>

              <span className="focusly-header__user-info">
                <strong>{displayName}</strong>
                <small>{role}</small>
              </span>

              <svg
                className="focusly-header__chevron"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="m7 9 5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="focusly-header__user-menu">
              <button type="button" onClick={handleProfile}>
                Mi perfil
              </button>
              {onLogout && (
                <button type="button" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        )}

        {!isAuthenticated && showNavigation && (
          <button
            type="button"
            className={`focusly-header__menu-button ${
              menuOpen ? "is-open" : ""
            }`}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        )}
      </div>
    </header>
  );
}
