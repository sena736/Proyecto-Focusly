import { Link, useNavigate } from "react-router-dom";

import Avatar from "../../ui/Avatar/Avatar";
import useAuth from "../../../hooks/useAuth";
import { getRoleLabel } from "../../../utils/roleLabel";
import "./PublicHeader.css";

function PublicHeader() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();

  const hasSession = Boolean(isAuthenticated && user);

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

        {/* Acciones según la sesión */}
        {loading ? (
          // Sesión sin resolver: espacio reservado, sin botones de invitado.
          <div
            className="public-header-actions public-header-actions--pending"
            aria-hidden="true"
          />
        ) : hasSession ? (
          <div className="public-header-actions">
            <Avatar
              name={user.name || ""}
              role={getRoleLabel(user.role)}
              showArrow={false}
              onClick={() => navigate("/profile")}
            />

            <Link to="/dashboard" className="public-dashboard-button">
              Ir al dashboard
            </Link>
          </div>
        ) : (
          <div className="public-header-actions">
            <Link to="/login" className="public-login-button">
              Iniciar sesión
            </Link>

            <Link to="/register" className="public-register-button">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default PublicHeader;
