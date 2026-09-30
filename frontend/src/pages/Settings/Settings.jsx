import React, { useState } from "react";
import ToggleSwitch from "../../components/ui/ToggleSwitch/ToggleSwitch";
import useTheme from "../../hooks/useTheme";
import { THEMES } from "../../utils/constants";
import "./Settings.css";

/**
 * Componente de configuración de Focusly.
 *
 * Basado en el ERS/SDD:
 * - Permite cambiar entre modo claro y modo oscuro.
 * - Actualiza inmediatamente la interfaz.
 *
 * El tema vive en ThemeProvider (único responsable de aplicar `data-theme`
 * al documento y de persistirlo); esta página solo lo consume con useTheme.
 *
 * Props:
 *   onSavePreference function Opcional: callback para persistir la preferencia
 *                             en la capa de datos/API.
 */
export default function Configuracion({ onSavePreference }) {
  const { isDarkMode, changeTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const handleThemeChange = (dark) => {
    if (dark === isDarkMode) return;

    changeTheme(dark ? THEMES.DARK : THEMES.LIGHT);
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

          <ToggleSwitch
            label="Modo oscuro"
            description="Reduce el brillo de la interfaz"
            checked={isDarkMode}
            onChange={handleThemeChange}
          />
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
          Los cambios se aplican inmediatamente y tu preferencia se guarda en
          este dispositivo.
        </p>
      </section>
    </main>
  );
}