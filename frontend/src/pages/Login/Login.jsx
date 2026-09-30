import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { googleLogin, emailLogin } from "../../api/auth.api";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/ui/Button/Button";
import IconButton from "../../components/ui/IconButton/IconButton";
import Input from "../../components/ui/Input/Input";
import { isValidEmail } from "../../utils/validators";
import "./Login.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const { establishSession } = useContext(AuthContext);
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Email format only: no minimum password length on login, so accounts
    // created with older/shorter passwords can still sign in.
    if (!isValidEmail(formData.email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setError("");

    try {
      const data = await emailLogin({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!data.token) {
        throw new Error("El servidor no devolvió un token.");
      }

      const user = await establishSession(data.token);

      if (user) {
        navigate("/dashboard");
      }
    } catch (loginError) {
      setError(
        loginError.message ||
          "No fue posible iniciar sesión. Verifica tus credenciales.",
      );
    }
  };

  const handleGoogleLogin = useCallback(
    async (idToken) => {
      setError("");

      try {
        const data = await googleLogin(idToken);

        if (!data.token) {
          throw new Error("El servidor no devolvió un token.");
        }

        const user = await establishSession(data.token);

        if (user) {
          navigate("/dashboard");
        }
      } catch (loginError) {
        setError(
          loginError.message ||
            "No fue posible iniciar sesión con Google. Intenta nuevamente.",
        );
      }
    },
    [establishSession, navigate],
  );

  /**
   * Inicializa el SDK de Google Identity Services y renderiza su botón.
   * El script se carga async/defer desde index.html, por eso se
   * reintenta hasta que window.google exista.
   */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const tryInitialize = () => {
      if (cancelled) return;

      if (!window.google?.accounts?.id) {
        attempts += 1;

        if (attempts < 50) {
          setTimeout(tryInitialize, 100);
        }

        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          handleGoogleLogin(response.credential);
        },
      });

      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "left",
          width: 320,
        });
      }

      setGoogleReady(true);
    };

    tryInitialize();

    return () => {
      cancelled = true;
    };
  }, [handleGoogleLogin]);

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

        {GOOGLE_CLIENT_ID ? (
          <>
            {!googleReady && (
              <div className="login__google-button login__google-button--loading">
                <span>Cargando inicio de sesión con Google...</span>
              </div>
            )}

            {/*
              Este div nunca debe tener hijos renderizados por React:
              google.accounts.id.renderButton inyecta su propio markup
              directamente en el nodo del DOM, por fuera de React.
            */}
            <div
              className="login__google-button-container"
              style={{ display: googleReady ? "block" : "none" }}
              ref={googleButtonRef}
            />
          </>
        ) : (
          <div className="login__google-button login__google-button--disabled">
            <span>
              Inicio de sesión con Google no disponible (falta
              VITE_GOOGLE_CLIENT_ID)
            </span>
          </div>
        )}

        <div className="login__divider">
          <span>o</span>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <Input
            label="Correo electrónico"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ingresa tu correo"
            autoComplete="email"
            inputMode="email"
            icon={<FiMail aria-hidden="true" />}
            required
          />

          <Input
            label="Contraseña"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            icon={<FiLock aria-hidden="true" />}
            labelAction={
              <Link className="login__forgot" to="/forgot-password">
                ¿Olvidaste tu contraseña?
              </Link>
            }
            endAdornment={
              <IconButton
                size="small"
                variant="ghost"
                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShowPassword((prev) => !prev)}
              />
            }
            required
          />

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth className="login__submit">
            Iniciar sesión
          </Button>
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