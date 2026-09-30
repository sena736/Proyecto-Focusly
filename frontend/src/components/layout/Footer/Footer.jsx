import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer({
  showNavigation = true,
  showCopyright = true,
  className = "",
}) {
  const currentYear = new Date().getFullYear();

  const classes = ["focusly-footer", className].filter(Boolean).join(" ");

  return (
    <footer className={classes}>
      <div className="focusly-footer__container">
        <div className="focusly-footer__main">
          <div className="focusly-footer__brand">
            <div className="focusly-footer__logo" aria-hidden="true">
              F
            </div>

            <div>
              <h2>FOCUSLY</h2>
              <p>Organiza tu tiempo, alcanza tus metas</p>
            </div>
          </div>

          {showNavigation && (
            <nav
              className="focusly-footer__navigation"
              aria-label="Navegación del pie de página"
            >
              <div className="focusly-footer__column">
                <h3>Focusly</h3>
                <Link to="/#inicio">Inicio</Link>
                <Link to="/#caracteristicas">Características</Link>
                <Link to="/#beneficios">Beneficios</Link>
              </div>

              <div className="focusly-footer__column">
                <h3>Acceso</h3>
                <Link to="/login">Iniciar sesión</Link>
                <Link to="/register">Registrarse</Link>
              </div>

              <div className="focusly-footer__column">
                <h3>Conócenos</h3>
                <Link to="/#nosotros">Nosotros</Link>
                <Link to="/about">Sobre Focusly</Link>
              </div>
            </nav>
          )}

          <div className="focusly-footer__quote">
            <span className="focusly-footer__quote-icon" aria-hidden="true">
              ✦
            </span>
            <p>Pequeños pasos cada día te llevan a grandes logros.</p>
          </div>
        </div>

        <div className="focusly-footer__divider" />

        <div className="focusly-footer__bottom">
          {showCopyright && (
            <p>© {currentYear} Focusly. Todos los derechos reservados.</p>
          )}
        </div>
      </div>
    </footer>
  );
}
