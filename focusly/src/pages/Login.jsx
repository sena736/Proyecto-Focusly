import React, { useState } from "react";
import "./Login.css";
import { Link } from "react-router-dom";

const Login = ({ onLogin, onRegister }) => {
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validación en tiempo real
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.correo.trim()) {
      newErrors.correo = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "Ingresa un correo electrónico válido.";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      /*
       * Endpoint definido en el DDS:
       * POST /api/auth/login
       *
       * Body esperado:
       * {
       *   correo: "...",
       *   password: "..."
       * }
       */

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: formData.correo,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.mensaje || "Las credenciales ingresadas no son válidas."
        );
      }

      /*
       * El DDS propone una respuesta:
       * {
       *   token: "JWT_TOKEN",
       *   usuario: {
       *      id: 1,
       *      nombre: "Usuario"
       *   }
       * }
       */

      if (data.token) {
        localStorage.setItem("focusly_token", data.token);
      }

      localStorage.setItem(
        "focusly_usuario",
        JSON.stringify(data.usuario || {})
      );

      // Permite que App.jsx/Router controle la navegación
      if (onLogin) {
        onLogin(data);
      }
    } catch (error) {
      setServerError(
        error.message ||
          "No fue posible iniciar sesión. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        {/* Decoraciones del mockup */}
        <div className="decoration decoration-top"></div>
        <div className="decoration decoration-bottom"></div>

        {/* Logo */}
        <div className="login-brand">
          <div className="brand-logo">
            <span className="brand-f">F</span>

            <span className="brand-clock">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>

            <span className="brand-book">
              <svg
                viewBox="0 0 40 28"
                aria-hidden="true"
              >
                <path d="M20 25C15 20 10 18 4 18V3c7 0 12 2 16 6z" />
                <path d="M20 25c5-5 10-7 16-7V3c-7 0-12 2-16 6z" />
                <path d="M20 9v16" />
              </svg>
            </span>
          </div>

          <h1>FOCUSLY</h1>

          <div className="brand-line">
            <span></span>
            <b>•</b>
            <span></span>
          </div>

          <p>INICIAR SESIÓN</p>
          <small>Accede a tu cuenta para continuar.</small>
        </div>

        {/* Formulario */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Correo */}
          <div className="form-group">
            <label htmlFor="correo">Correo electrónico</label>

            <div
              className={`input-wrapper ${
                errors.correo ? "input-error" : ""
              }`}
            >
              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>

              <input
                id="correo"
                name="correo"
                type="email"
                placeholder="Ej: juan@gmail.com"
                value={formData.correo}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {errors.correo && (
              <span className="error-message">{errors.correo}</span>
            )}
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>

            <div
              className={`input-wrapper ${
                errors.password ? "input-error" : ""
              }`}
            >
              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A11.7 11.7 0 0 1 12 4c5 0 8.5 4 9.5 6-.4.8-1.4 2.1-2.9 3.3" />
                    <path d="M6.2 6.2C4.2 7.4 2.9 9 2.5 10c1 2 4.5 6 9.5 6 1 0 1.9-.2 2.7-.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}

            {/* Funcionalidad futura según ERS */}
            <Link
              to={"/ForgotPassword"}
              type="button"
              className="forgot-password"
              title="Funcionalidad prevista para una versión futura"
              onClick={() => {}}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Error del servidor */}
          {serverError && (
            <div className="server-error" role="alert">
              <span>!</span>
              {serverError}
            </div>
          )}

          {/* Botón principal */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "INICIANDO..." : "INICIAR SESIÓN"}
          </button>

          {/* Google: solo visual, no integrado en esta versión */}
          <div className="separator">
            <span></span>
            <b>o</b>
            <span></span>
          </div>

          <button
            type="button"
            className="google-button"
            disabled
            title="Integración externa no contemplada en la primera versión"
          >
            <span className="google-icon">G</span>
            Continuar con Google
          </button>

          {/* Registro */}
          <div className="register-link">
            <span>¿No tienes cuenta?</span>

            <button
              type="button"
              onClick={onRegister}
            >
              Registrarse
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Login;