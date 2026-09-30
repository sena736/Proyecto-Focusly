import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";
import { registerUser } from "../../api/auth.api";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import { hasMinLength, isValidEmail } from "../../utils/validators";
import "./Register.css";

const MIN_PASSWORD_LENGTH = 6;

const Register = () => {
  const { establishSession } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValidEmail(formData.email)) {
      setSuccess("");
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (!hasMinLength(formData.password, MIN_PASSWORD_LENGTH)) {
      setSuccess("");
      setError(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const data = await registerUser({
        name: formData.name,
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!data.token) {
        throw new Error("El servidor no devolvió un token.");
      }

      setSuccess("Cuenta creada correctamente.");

      const user = await establishSession(data.token);

      if (user) {
        navigate("/dashboard");
      }
    } catch (registerError) {
      setError(
        registerError.message ||
          "No se pudo crear la cuenta. Intenta nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="register">
      <section className="register__card">
        <div className="register__header">
          <div className="register__icon">
            <FiUserPlus />
          </div>

          <h1>Crear cuenta</h1>

          <p>
            Regístrate en Focusly y comienza a organizar mejor tu tiempo.
          </p>
        </div>

        <form className="register__form" onSubmit={handleSubmit}>
          <div className="register__fields">
            <Input
              label="Nombre"
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              autoComplete="name"
              icon={<FiUser aria-hidden="true" />}
              required
            />

            <Input
              label="Correo electrónico"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingresa tu correo"
              autoComplete="email"
              icon={<FiMail aria-hidden="true" />}
              required
            />

            <Input
              label="Contraseña"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Crea una contraseña"
              autoComplete="new-password"
              icon={<FiLock aria-hidden="true" />}
              required
            />

            <Input
              label="Confirmar contraseña"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              icon={<FiLock aria-hidden="true" />}
              required
            />
          </div>

          {error && (
            <p className="register__message register__message--error">
              {error}
            </p>
          )}

          {success && (
            <p className="register__message register__message--success">
              {success}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            className="register__button"
            icon={<FiUserPlus />}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>

        <p className="register__login">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
};

export default Register;