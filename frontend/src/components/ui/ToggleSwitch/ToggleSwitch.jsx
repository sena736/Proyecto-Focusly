import { useId } from "react";
import "./ToggleSwitch.css";

/**
 * ToggleSwitch reutilizable para Focusly.
 *
 * Ejemplo:
 * <ToggleSwitch
 *   label="Modo oscuro"
 *   checked={darkMode}
 *   onChange={setDarkMode}
 * />
 *
 * También puede usarse sin texto:
 * <ToggleSwitch
 *   checked={notifications}
 *   onChange={setNotifications}
 *   ariaLabel="Activar notificaciones"
 * />
 */

export default function ToggleSwitch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  id,
  name,
  ariaLabel,
  size = "medium",
  className = "",
}) {
  const generatedId = useId();
  const switchId = id || `focusly-toggle-${generatedId}`;

  const handleChange = (event) => {
    if (disabled) return;
    onChange?.(event.target.checked, event);
  };

  const classes = [
    "focusly-toggle",
    `focusly-toggle--${size}`,
    checked ? "is-checked" : "",
    disabled ? "is-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes} htmlFor={switchId}>
      <input
        id={switchId}
        name={name}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-label={!label ? ariaLabel : undefined}
        onChange={handleChange}
      />

      <span className="focusly-toggle__track" aria-hidden="true">
        <span className="focusly-toggle__thumb" />
      </span>

      {(label || description) && (
        <span className="focusly-toggle__content">
          {label && <span className="focusly-toggle__label">{label}</span>}

          {description && (
            <span className="focusly-toggle__description">{description}</span>
          )}
        </span>
      )}
    </label>
  );
}
