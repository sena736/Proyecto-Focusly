import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Conectar posteriormente con el endpoint de autenticación.
  };

  const handleGoogleLogin = () => {
    // Conectar posteriormente con autenticación mediante Google.
  };

  return (
    <main className="login">
      <section className="login__card">
        <div className="login__header">
          <div className="login__icon">
            <FiLogIn />
          </div>

          <h1>Bienvenido a Focusly</h1>

          <p>
            Inicia sesión para continuar organizando tu tiempo.
          </p>
        </div>

        <button
          type="button"
          className="login__google-button"
          onClick={handleGoogleLogin}
        >
          <span className="login__google-icon" aria-hidden="true">
            G
          </span>

          <span>Continuar con Google</span>
        </button>

        <div className="login__divider">
          <span>o</span>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label htmlFor="email">Correo electrónico</label>

            <div className="login__input-wrapper">
              <FiMail aria-hidden="true" />

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingresa tu correo"
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>
          </div>

          <div className="login__field">
            <div className="login__label-row">
              <label htmlFor="password">Contraseña</label>

              <Link to="/forgot-password">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="login__input-wrapper">
              <FiLock aria-hidden="true" />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login__password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="login__submit">
            Iniciar sesión
          </button>
        </form>

        <p className="login__register">
          ¿No tienes una cuenta?{" "}
          <Link to="/register">Crear cuenta</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;