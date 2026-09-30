import { Link } from "react-router-dom";
import "./PublicHeader.css";

function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header-container">
        {/* Logo y nombre de Focusly */}
        <Link to="/" className="public-logo">
          <div className="public-logo-icon">F</div>

          <div className="public-logo-text">
            <p className="public-logo-name">FOCUSLY</p>
            <span className="public-logo-tagline">
              Organiza tu tiempo, alcanza tus metas
            </span>
          </div>
        </Link>

        {/* Navegación: los enlaces con hash funcionan también desde /about */}
        <nav className="public-nav" aria-label="Navegación principal">
          <Link to="/#inicio">Inicio</Link>
          <Link to="/#caracteristicas">Características</Link>
          <Link to="/#beneficios">Beneficios</Link>
          <Link to="/#nosotros">Nosotros</Link>
        </nav>

        {/* Botones */}
        <div className="public-header-actions">
          <Link to="/login" className="public-login-button">
            Iniciar sesión
          </Link>

          <Link to="/register" className="public-register-button">
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}

export default PublicHeader;
