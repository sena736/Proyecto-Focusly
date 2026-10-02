import React from "react";
import "./PomodoroSettings.css";

import { POMODORO_DEFAULTS } from "../../../utils/constants";

const { MIN_MINUTES, MAX_MINUTES } = POMODORO_DEFAULTS;

// Each row: the duration key it controls plus its copy and accessible labels.
const SETTINGS = [
  {
    key: "focusMinutes",
    title: "Trabajo",
    description: "Tiempo de concentración",
    decreaseLabel: "Disminuir tiempo de trabajo",
    increaseLabel: "Aumentar tiempo de trabajo",
  },
  {
    key: "shortBreakMinutes",
    title: "Descanso corto",
    description: "Pausa entre sesiones",
    decreaseLabel: "Disminuir descanso corto",
    increaseLabel: "Aumentar descanso corto",
  },
  {
    key: "longBreakMinutes",
    title: "Descanso largo",
    description: "Pausa después de varias sesiones",
    decreaseLabel: "Disminuir descanso largo",
    increaseLabel: "Aumentar descanso largo",
  },
];

// Controlled by the page: it owns the values, this only asks for +1 / -1.
const PomodoroSettings = ({
  focusMinutes,
  shortBreakMinutes,
  longBreakMinutes,
  onChange,
  disabled = false,
}) => {
  const values = { focusMinutes, shortBreakMinutes, longBreakMinutes };

  const handleChange = (key, step) => {
    if (disabled) return;

    const newValue = values[key] + step;

    if (newValue < MIN_MINUTES || newValue > MAX_MINUTES) {
      return;
    }

    onChange?.(key, newValue);
  };

  return (
    <div className="pomodoro-settings">
      {SETTINGS.map((setting) => (
        <div className="pomodoro-setting" key={setting.key}>
          <div className="pomodoro-setting__info">
            <span className="pomodoro-setting__title">{setting.title}</span>

            <span className="pomodoro-setting__description">
              {setting.description}
            </span>
          </div>

          <div className="pomodoro-setting__controls">
            <button
              type="button"
              className="pomodoro-setting__button"
              onClick={() => handleChange(setting.key, -1)}
              disabled={disabled || values[setting.key] <= MIN_MINUTES}
              aria-label={setting.decreaseLabel}
            >
              −
            </button>

            <span className="pomodoro-setting__value">
              {values[setting.key]}
            </span>

            <button
              type="button"
              className="pomodoro-setting__button"
              onClick={() => handleChange(setting.key, 1)}
              disabled={disabled || values[setting.key] >= MAX_MINUTES}
              aria-label={setting.increaseLabel}
            >
              +
            </button>
          </div>
        </div>
      ))}

      {disabled && (
        <p className="pomodoro-setting__description">
          Reiniciá el ciclo para cambiar las duraciones.
        </p>
      )}
    </div>
  );
};

export default PomodoroSettings;
