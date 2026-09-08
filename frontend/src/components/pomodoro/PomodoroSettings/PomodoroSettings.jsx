import React from "react";
import "./PomodoroSettings.css";

const PomodoroSettings = ({
  workTime = 25,
  shortBreak = 5,
  longBreak = 15,
  onChange = () => {},
}) => {
  // =========================================
  // CAMBIAR VALOR
  // =========================================

  const handleChange = (type, operation) => {
    let currentValue;

    switch (type) {
      case "workTime":
        currentValue = workTime;
        break;

      case "shortBreak":
        currentValue = shortBreak;
        break;

      case "longBreak":
        currentValue = longBreak;
        break;

      default:
        return;
    }

    const newValue =
      operation === "increase" ? currentValue + 1 : currentValue - 1;

    // Evitar valores menores a 1 minuto
    if (newValue < 1) {
      return;
    }

    onChange(type, newValue);
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="pomodoro-settings">
      {/* =====================================
          TRABAJO
          ===================================== */}

      <div className="pomodoro-setting">
        <div className="pomodoro-setting__info">
          <span className="pomodoro-setting__title">Trabajo</span>

          <span className="pomodoro-setting__description">
            Tiempo de concentración
          </span>
        </div>

        <div className="pomodoro-setting__controls">
          <button
            type="button"
            className="pomodoro-setting__button"
            onClick={() => handleChange("workTime", "decrease")}
            aria-label="Disminuir tiempo de trabajo"
          >
            −
          </button>

          <span className="pomodoro-setting__value">{workTime}</span>

          <button
            type="button"
            className="pomodoro-setting__button"
            onClick={() => handleChange("workTime", "increase")}
            aria-label="Aumentar tiempo de trabajo"
          >
            +
          </button>
        </div>
      </div>

      {/* =====================================
          DESCANSO CORTO
          ===================================== */}

      <div className="pomodoro-setting">
        <div className="pomodoro-setting__info">
          <span className="pomodoro-setting__title">Descanso corto</span>

          <span className="pomodoro-setting__description">
            Pausa entre sesiones
          </span>
        </div>

        <div className="pomodoro-setting__controls">
          <button
            type="button"
            className="pomodoro-setting__button"
            onClick={() => handleChange("shortBreak", "decrease")}
            aria-label="Disminuir descanso corto"
          >
            −
          </button>

          <span className="pomodoro-setting__value">{shortBreak}</span>

          <button
            type="button"
            className="pomodoro-setting__button"
            onClick={() => handleChange("shortBreak", "increase")}
            aria-label="Aumentar descanso corto"
          >
            +
          </button>
        </div>
      </div>

      {/* =====================================
          DESCANSO LARGO
          ===================================== */}

      <div className="pomodoro-setting">
        <div className="pomodoro-setting__info">
          <span className="pomodoro-setting__title">Descanso largo</span>

          <span className="pomodoro-setting__description">
            Pausa después de varias sesiones
          </span>
        </div>

        <div className="pomodoro-setting__controls">
          <button
            type="button"
            className="pomodoro-setting__button"
            onClick={() => handleChange("longBreak", "decrease")}
            aria-label="Disminuir descanso largo"
          >
            −
          </button>

          <span className="pomodoro-setting__value">{longBreak}</span>

          <button
            type="button"
            className="pomodoro-setting__button"
            onClick={() => handleChange("longBreak", "increase")}
            aria-label="Aumentar descanso largo"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroSettings;
