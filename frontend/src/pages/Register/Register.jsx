import { useState } from "react";
import "./Register.css";

/**
 * Register
 *
 * Componente de registro de Focusly.
 *
 * Props:
 * - onRegister(formData): función que conecta el formulario con el servicio/API.
 * - onLogin(): navega a la pantalla de inicio de sesión.
 * - isLoading: muestra el estado de procesamiento.
 * - serverError: mensaje devuelto por el backend.
 * - successMessage: mensaje de registro exitoso.
 */
export default function Register({
  onRegister,
  onLogin,
  isLoading = false,
  serverError = "",
  successMessage = "",
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dataConsent: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Ingresa tu nombre.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Ingresa tu correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }

    if (!form.password) {
      nextErrors.password = "Ingresa una contraseña.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Confirma tu contraseña.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (!form.dataConsent) {
      nextErrors.dataConsent =
        "Debes aceptar el tratamiento de tus datos para registrarte.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    if (typeof onRegister === "function") {
      await onRegister(payload);
    }
  };

  return (
    <main className="register-page">
      <div className="register-decoration register-decoration--top" />
      <div className="register-decoration register-decoration--bottom" />

      <section
        className="register-card"
        aria-labelledby="register-title"
      >
        <div className="register-brand" aria-label="Focusly">
          <div className="register-logo" aria-hidden="true">
            F
          </div>

          <span className="register-brand-name">
            FOCUSLY
          </span>
        </div>

        <div className="register-heading">
          <span className="register-eyebrow">
            CREA TU CUENTA
          </span>

          <h1 id="register-title">
            REGISTRO
          </h1>

          <p>
            Completa tus datos para comenzar a organizar
            tu tiempo.
          </p>
        </div>

        {serverError && (
          <div
            className="register-alert register-alert--error"
            role="alert"
          >
            {serverError}
          </div>
        )}

        {successMessage && (
          <div
            className="register-alert register-alert--success"
            role="status"
          >
            {successMessage}
          </div>
        )}

        <form
          className="register-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Nombre */}
          <div className="register-field">
            <label htmlFor="register-name">
              Nombre completo
            </label>

            <div
              className={`register-input-wrap ${
                errors.name ? "has-error" : ""
              }`}
            >
              <span
                className="register-input-icon"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>

              <input
                id="register-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={
                  errors.name ? "name-error" : undefined
                }
                required
              />
            </div>

            {errors.name && (
              <span
                id="name-error"
                className="register-error"
              >
                {errors.name}
              </span>
            )}
          </div>

          {/* Correo */}
          <div className="register-field">
            <label htmlFor="register-email">
              Correo electrónico
            </label>

            <div
              className={`register-input-wrap ${
                errors.email ? "has-error" : ""
              }`}
            >
              <span
                className="register-input-icon"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24">
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>

              <input
                id="register-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ej. juan@gmail.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "email-error" : undefined
                }
                required
              />
            </div>

            {errors.email && (
              <span
                id="email-error"
                className="register-error"
              >
                {errors.email}
              </span>
            )}
          </div>

          {/* Contraseña */}
          <div className="register-field">
            <label htmlFor="register-password">
              Contraseña
            </label>

            <div
              className={`register-input-wrap ${
                errors.password ? "has-error" : ""
              }`}
            >
              <span
                className="register-input-icon"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>

              <input
                id="register-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Crea una contraseña"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? "password-error"
                    : undefined
                }
                required
              />
            </div>

            {errors.password && (
              <span
                id="password-error"
                className="register-error"
              >
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="register-field">
            <label htmlFor="register-confirm-password">
              Confirmar contraseña
            </label>

            <div
              className={`register-input-wrap ${
                errors.confirmPassword ? "has-error" : ""
              }`}
            >
              <span
                className="register-input-icon"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="m9 15 2 2 4-4" />
                </svg>
              </span>

              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                aria-invalid={Boolean(
                  errors.confirmPassword
                )}
                aria-describedby={
                  errors.confirmPassword
                    ? "confirm-password-error"
                    : undefined
                }
                required
              />
            </div>

            {errors.confirmPassword && (
              <span
                id="confirm-password-error"
                className="register-error"
              >
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Tratamiento de datos */}
          <label
            className={`register-consent ${
              errors.dataConsent ? "has-error" : ""
            }`}
          >
            <input
              type="checkbox"
              name="dataConsent"
              checked={form.dataConsent}
              onChange={handleChange}
              aria-invalid={Boolean(errors.dataConsent)}
            />

            <span>
              Acepto el tratamiento de mis datos personales
              de acuerdo con la política de privacidad de
              Focusly.
            </span>
          </label>

          {errors.dataConsent && (
            <span className="register-error register-consent-error">
              {errors.dataConsent}
            </span>
          )}

          {/* Botón */}
          <button
            className="register-submit"
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? "CREANDO CUENTA..."
              : "REGISTRARSE"}
          </button>
        </form>

        {/* Inicio de sesión */}
        <div className="register-footer">
          <span>
            ¿Ya tienes cuenta?
          </span>

          <button
            type="button"
            onClick={onLogin}
            className="register-login"
          >
            Iniciar sesión
          </button>
        </div>
      </section>
    </main>
  );
} 