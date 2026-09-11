import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user, loading } = useAuth();

  const [nickname, setNickname] = useState("");
  const [preferences, setPreferences] = useState({
    notifications: true,
    sound: true,
    autoStartBreaks: false,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || "");
      setPreferences({
        notifications: user.preferences?.notifications ?? true,
        sound: user.preferences?.sound ?? true,
        autoStartBreaks: user.preferences?.autoStartBreaks ?? false,
      });
    }
  }, [user]);

  if (loading) {
    return (
      <main className="profile">
        <div className="profile__loading">Cargando perfil...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile">
        <div className="profile__empty">
          <h1>No hay una sesión activa</h1>
          <p>Inicia sesión para consultar tu perfil.</p>
        </div>
      </main>
    );
  }

  const handlePreferenceChange = (preference) => {
    setPreferences((current) => ({
      ...current,
      [preference]: !current[preference],
    }));

    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      /*
       * Aquí puedes conectar posteriormente:
       *
       * PUT /api/v1/users/profile
       *
       * con:
       * {
       *   nickname,
       *   preferences
       * }
       */

      await new Promise((resolve) => setTimeout(resolve, 500));

      setMessage("Perfil actualizado correctamente.");
    } catch (error) {
      setMessage("No fue posible actualizar el perfil. Inténtalo nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = user.name || user.displayName || "Usuario Focusly";

  const email = user.email || "";

  const googlePhoto = user.photoURL || user.picture || user.avatar || null;

  const initials = displayName
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return (
    <main className="profile">
      <div className="profile__container">
        {/* Encabezado */}
        <header className="profile__header">
          <div>
            <span className="profile__eyebrow">MI CUENTA</span>

            <h1 className="profile__title">Mi perfil</h1>

            <p className="profile__subtitle">
              Consulta y personaliza tu información en Focusly.
            </p>
          </div>
        </header>

        <form className="profile__form" onSubmit={handleSubmit}>
          {/* Información de Google */}
          <section className="profile-card">
            <div className="profile-card__header">
              <div>
                <h2>Información personal</h2>
                <p>Estos datos provienen de tu cuenta de Google.</p>
              </div>
            </div>

            <div className="profile-card__body">
              {/* Foto */}
              <div className="profile-photo">
                <div className="profile-photo__avatar">
                  {googlePhoto ? (
                    <img src={googlePhoto} alt={`Foto de ${displayName}`} />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div className="profile-photo__info">
                  <strong>Foto de perfil</strong>

                  <span>Foto proporcionada por Google</span>

                  <small>Solo lectura</small>
                </div>
              </div>

              {/* Nombre */}
              <div className="profile-field">
                <label htmlFor="profile-name">Nombre</label>

                <input
                  id="profile-name"
                  type="text"
                  value={displayName}
                  readOnly
                  disabled
                />

                <span className="profile-field__hint">
                  Este nombre se obtiene de Google.
                </span>
              </div>

              {/* Correo */}
              <div className="profile-field">
                <label htmlFor="profile-email">Correo electrónico</label>

                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                />

                <span className="profile-field__hint">
                  Tu correo de Google no puede modificarse desde Focusly.
                </span>
              </div>
            </div>
          </section>

          {/* Información editable */}
          <section className="profile-card">
            <div className="profile-card__header">
              <div>
                <h2>Personalización</h2>

                <p>Personaliza cómo quieres utilizar Focusly.</p>
              </div>
            </div>

            <div className="profile-card__body">
              {/* Apodo */}
              <div className="profile-field">
                <label htmlFor="nickname">Apodo</label>

                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(event) => {
                    setNickname(event.target.value);
                    setMessage("");
                  }}
                  placeholder="Escribe tu apodo"
                  maxLength={30}
                />

                <span className="profile-field__hint">
                  Este nombre se utilizará dentro de Focusly.
                </span>
              </div>

              {/* Preferencias */}
              <div className="profile-preferences">
                <h3>Preferencias</h3>

                <div className="profile-preference">
                  <div className="profile-preference__content">
                    <strong>Notificaciones</strong>

                    <span>Recibir recordatorios y avisos de Focusly.</span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.notifications}
                    className={`profile-switch ${
                      preferences.notifications ? "profile-switch--active" : ""
                    }`}
                    onClick={() => handlePreferenceChange("notifications")}
                  >
                    <span />
                  </button>
                </div>

                <div className="profile-preference">
                  <div className="profile-preference__content">
                    <strong>Sonidos</strong>

                    <span>
                      Reproducir sonidos al finalizar un temporizador.
                    </span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.sound}
                    className={`profile-switch ${
                      preferences.sound ? "profile-switch--active" : ""
                    }`}
                    onClick={() => handlePreferenceChange("sound")}
                  >
                    <span />
                  </button>
                </div>

                <div className="profile-preference">
                  <div className="profile-preference__content">
                    <strong>Iniciar descansos automáticamente</strong>

                    <span>
                      Comenzar automáticamente el descanso al finalizar un
                      Pomodoro.
                    </span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.autoStartBreaks}
                    className={`profile-switch ${
                      preferences.autoStartBreaks
                        ? "profile-switch--active"
                        : ""
                    }`}
                    onClick={() => handlePreferenceChange("autoStartBreaks")}
                  >
                    <span />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Footer del formulario */}
          <div className="profile__footer">
            {message && (
              <p
                className={`profile__message ${
                  message.includes("correctamente")
                    ? "profile__message--success"
                    : "profile__message--error"
                }`}
              >
                {message}
              </p>
            )}

            <button type="submit" className="profile__save" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Profile;
