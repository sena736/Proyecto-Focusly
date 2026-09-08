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
            <h1>FOCUSLY</h1>
            <span>Organiza tu tiempo, alcanza tus metas</span>
          </div>
        </Link>

        {/* Navegación */}
        <nav className="public-nav">
          <Link to="/">Inicio</Link>
          <a href="#caracteristicas">Características</a>
          <a href="#beneficios">Beneficios</a>
          <a href="#nosotros">Nosotros</a>
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
