import React, { useEffect, useState } from "react";
import "./Settings.css";

/**
 * Componente de configuración de Focusly.
 *
 * Basado en el ERS/SDD:
 * - Permite cambiar entre modo claro y modo oscuro.
 * - Actualiza inmediatamente la interfaz.
 * - Expone onThemeChange para que la aplicación persista la preferencia
 *   mediante su capa de datos/API.
 *
 * Props:
 *   isDarkMode      boolean   Estado actual del tema.
 *   onThemeChange   function  Callback ejecutado al cambiar el tema.
 *   onSavePreference function Opcional: callback para persistir la preferencia.
 */
export default function Configuracion({
  isDarkMode = false,
  onThemeChange,
  onSavePreference,
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  const handleThemeChange = (dark) => {
    if (dark === isDarkMode) return;

    onThemeChange?.(dark);
    onSavePreference?.({
      modo_oscuro: dark,
    });

    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <main className={`config-page ${isDarkMode ? "config-page--dark" : ""}`}>
      <section className="config-container" aria-labelledby="config-title">
        <header className="config-header">
          <div className="config-header__icon" aria-hidden="true">
            ⚙
          </div>

          <div>
            <p className="config-eyebrow">FOCUSLY</p>
            <h1 id="config-title">Configuración</h1>
            <p className="config-description">
              Personaliza la apariencia de tu espacio de estudio.
            </p>
          </div>
        </header>

        <section className="config-card" aria-labelledby="appearance-title">
          <div className="config-card__heading">
            <div className="config-card__icon" aria-hidden="true">
              ◐
            </div>

            <div>
              <h2 id="appearance-title">Apariencia</h2>
              <p>Selecciona el modo visual que prefieras.</p>
            </div>
          </div>

          <div className="theme-options" role="radiogroup" aria-label="Tema de la aplicación">
            <button
              type="button"
              className={`theme-option ${!isDarkMode ? "theme-option--active" : ""}`}
              role="radio"
              aria-checked={!isDarkMode}
              onClick={() => handleThemeChange(false)}
            >
              <span className="theme-preview theme-preview--light" aria-hidden="true">
                <span className="theme-preview__bar" />
                <span className="theme-preview__line" />
                <span className="theme-preview__line theme-preview__line--short" />
              </span>

              <span className="theme-option__content">
                <strong>Modo claro</strong>
                <small>Interfaz clara y luminosa</small>
              </span>

              <span className="theme-option__check" aria-hidden="true">
                {!isDarkMode ? "✓" : ""}
              </span>
            </button>

            <button
              type="button"
              className={`theme-option ${isDarkMode ? "theme-option--active" : ""}`}
              role="radio"
              aria-checked={isDarkMode}
              onClick={() => handleThemeChange(true)}
            >
              <span className="theme-preview theme-preview--dark" aria-hidden="true">
                <span className="theme-preview__bar" />
                <span className="theme-preview__line" />
                <span className="theme-preview__line theme-preview__line--short" />
              </span>

              <span className="theme-option__content">
                <strong>Modo oscuro</strong>
                <small>Reduce el brillo de la interfaz</small>
              </span>

              <span className="theme-option__check" aria-hidden="true">
                {isDarkMode ? "✓" : ""}
              </span>
            </button>
          </div>
        </section>

        <section className="config-card config-status" aria-live="polite">
          <div className="config-status__icon" aria-hidden="true">
            ✓
          </div>

          <div className="config-status__content">
            <h2>Preferencia actual</h2>
            <p>
              {isDarkMode
                ? "El modo oscuro está activo."
                : "El modo claro está activo."}
            </p>
          </div>

          <span className={`config-status__saved ${saved ? "is-visible" : ""}`}>
            Guardado
          </span>
        </section>

        <p className="config-note">
          Los cambios se aplican inmediatamente y la preferencia puede ser
          persistida por la aplicación.
        </p>
      </section>
    </main>
  );
}