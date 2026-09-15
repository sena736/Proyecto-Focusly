import "./AuthLayout.css";

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-layout">
      {/* Parte izquierda */}
      <div className="auth-info">
        <div className="auth-logo">
          <span>F</span>
          <h1>FOCUSLY</h1>
        </div>
        <div className="auth-message">
          <h2>Organiza tu tiempo.</h2>
          <h2>Enfócate en tus metas.</h2>
          <p>
            Una forma sencilla de organizar tus tareas, mejorar tu concentración
            y aprovechar mejor tu tiempo de estudio.
          </p>
        </div>

        <div className="auth-decoration">
          <div className="decoration-circle circle-one"></div>
          <div className="decoration-circle circle-two"></div>
          <div className="decoration-circle circle-three"></div>
        </div>
      </div>

      {/* Parte derecha */}
      <div className="auth-form-container">
        <div className="auth-form-box">
          {title && <h2>{title}</h2>}
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}

          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
