import React, { useState } from "react";
import {
  FiSettings,
  FiUser,
  FiLock,
  FiBell,
  FiSave,
  FiShield,
} from "react-icons/fi";
import "./AdminSettings.css";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    name: "",
    email: "",
    notifications: true,
    securityAlerts: true,
    twoFactor: false,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Aquí posteriormente puedes conectar la actualización
    // de configuración con tu API.
    setSaved(true);
  };

  return (
    <main className="admin-settings">
      <div className="admin-settings__container">
        {/* Encabezado */}
        <header className="admin-settings__header">
          <div className="admin-settings__header-icon">
            <FiSettings />
          </div>

          <div>
            <h1>Configuración</h1>
            <p>
              Administra las preferencias y configuraciones de tu cuenta.
            </p>
          </div>
        </header>

        <form
          className="admin-settings__form"
          onSubmit={handleSubmit}
        >
          {/* Información de la cuenta */}
          <section className="admin-settings__card">
            <div className="admin-settings__card-header">
              <div className="admin-settings__card-icon">
                <FiUser />
              </div>

              <div>
                <h2>Información de la cuenta</h2>
                <p>Actualiza la información del administrador.</p>
              </div>
            </div>

            <div className="admin-settings__fields">
              <div className="admin-settings__field">
                <label htmlFor="name">Nombre</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={settings.name}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre"
                />
              </div>

              <div className="admin-settings__field">
                <label htmlFor="email">Correo electrónico</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="admin@focusly.com"
                />
              </div>
            </div>
          </section>

          {/* Notificaciones */}
          <section className="admin-settings__card">
            <div className="admin-settings__card-header">
              <div className="admin-settings__card-icon">
                <FiBell />
              </div>

              <div>
                <h2>Notificaciones</h2>
                <p>Controla las notificaciones que recibes.</p>
              </div>
            </div>

            <div className="admin-settings__options">
              <label className="admin-settings__option">
                <div className="admin-settings__option-info">
                  <strong>Notificaciones generales</strong>
                  <span>
                    Recibir información y novedades de Focusly.
                  </span>
                </div>

                <input
                  type="checkbox"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleChange}
                />

                <span className="admin-settings__switch" />
              </label>

              <label className="admin-settings__option">
                <div className="admin-settings__option-info">
                  <strong>Alertas de seguridad</strong>
                  <span>
                    Recibir avisos sobre cambios importantes de seguridad.
                  </span>
                </div>

                <input
                  type="checkbox"
                  name="securityAlerts"
                  checked={settings.securityAlerts}
                  onChange={handleChange}
                />

                <span className="admin-settings__switch" />
              </label>
            </div>
          </section>

          {/* Seguridad */}
          <section className="admin-settings__card">
            <div className="admin-settings__card-header">
              <div className="admin-settings__card-icon">
                <FiShield />
              </div>

              <div>
                <h2>Seguridad</h2>
                <p>Protege la cuenta del administrador.</p>
              </div>
            </div>

            <div className="admin-settings__options">
              <label className="admin-settings__option">
                <div className="admin-settings__option-info">
                  <strong>Autenticación de dos factores</strong>
                  <span>
                    Añade una capa adicional de seguridad a tu cuenta.
                  </span>
                </div>

                <input
                  type="checkbox"
                  name="twoFactor"
                  checked={settings.twoFactor}
                  onChange={handleChange}
                />

                <span className="admin-settings__switch" />
              </label>

              <button
                type="button"
                className="admin-settings__password-button"
              >
                <FiLock />
                Cambiar contraseña
              </button>
            </div>
          </section>

          {/* Acciones */}
          <div className="admin-settings__actions">
            {saved && (
              <span className="admin-settings__success">
                Configuración guardada correctamente.
              </span>
            )}

            <button
              type="submit"
              className="admin-settings__save-button"
            >
              <FiSave />
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AdminSettings;