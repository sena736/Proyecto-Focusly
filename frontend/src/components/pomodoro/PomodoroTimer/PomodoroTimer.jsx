import React from "react";
import "./PomodoroTimer.css";

import { POMODORO_MODES } from "../../../utils/pomodoro";

const MODE_TABS = [
  { mode: POMODORO_MODES.FOCUS, label: "Enfoque" },
  { mode: POMODORO_MODES.SHORT_BREAK, label: "Descanso corto" },
  { mode: POMODORO_MODES.LONG_BREAK, label: "Descanso largo" },
];

const MODE_TITLES = {
  [POMODORO_MODES.FOCUS]: "Tiempo de enfoque",
  [POMODORO_MODES.SHORT_BREAK]: "Descanso corto",
  [POMODORO_MODES.LONG_BREAK]: "Descanso largo",
};

// Presentational: the timer itself lives in usePomodoro and is driven by the page.
const PomodoroTimer = ({
  mode = POMODORO_MODES.FOCUS,
  formattedTime = "00:00",
  completedPomodoros = 0,
  onChangeMode,
}) => {
  return (
    <div className="pomodoro-container">
      <div className="pomodoro-card">
        <div className="pomodoro-header">
          <h2>Pomodoro</h2>
          <p>{MODE_TITLES[mode]}</p>
        </div>

        <div className="pomodoro-modes">
          {MODE_TABS.map((tab) => (
            <button
              key={tab.mode}
              type="button"
              className={mode === tab.mode ? "active" : ""}
              onClick={() => onChangeMode?.(tab.mode)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pomodoro-time">{formattedTime}</div>

        <div className="pomodoro-progress">
          <span>Pomodoros completados</span>
          <strong>{completedPomodoros}</strong>
        </div>

        <div className="pomodoro-info">
          <p>
            Mantén el enfoque durante la sesión y luego toma un pequeño
            descanso. Después de 4 sesiones, disfruta de un descanso largo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
