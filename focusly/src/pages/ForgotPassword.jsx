import React, { useState } from "react";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Por favor, ingresa tu correo electrónico.");
      return;
    }

    setMessage(
      "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña."
    );
  };

  return (
    <div className="forgot-password-page">

      {/* Botón regresar */}
      <button
        className="back-button"
        onClick={() => window.history.back()}
      >
        <FiArrowLeft />
        Volver
      </button>

      {/* Tarjeta */}
      <div className="forgot-password-card">

        {/* Logo */}
        <div className="forgot-logo">
          <div className="logo-circle">
            F
          </div>

          <h1>FOCUSLY</h1>
        </div>

        {/* Título */}
        <div className="forgot-header">
          <h2>¿Olvidaste tu contraseña?</h2>

          <p>
            No te preocupes. Ingresa tu correo electrónico
            y te ayudaremos a recuperar el acceso a tu cuenta.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label htmlFor="email">
              Correo electrónico
            </label>

            <div className="input-container">
              <FiMail />

              <input
                id="email"
                type="email"
                placeholder="Ej. juan@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="recover-button"
          >
            Recuperar contraseña
          </button>

        </form>

        {/* Mensaje */}
        {message && (
          <div className="forgot-message">
            {message}
          </div>
        )}

        {/* Regresar al login */}
        <div className="login-link">
          <span>¿Ya recuerdas tu contraseña?</span>

          <button
            onClick={() => window.history.back()}
          >
            Iniciar sesión
          </button>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;