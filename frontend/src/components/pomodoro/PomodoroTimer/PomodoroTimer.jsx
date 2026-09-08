import React, { useEffect, useState } from "react";
import "./PomodoroTimer.css";

const PomodoroTimer = () => {
  // Tiempos en segundos
  const FOCUS_TIME = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);

  useEffect(() => {
    let timer;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (mode === "focus") {
      const newPomodoros = pomodoros + 1;
      setPomodoros(newPomodoros);

      // Cada 4 pomodoros → descanso largo
      if (newPomodoros % 4 === 0) {
        setMode("longBreak");
        setTimeLeft(LONG_BREAK);
      } else {
        setMode("shortBreak");
        setTimeLeft(SHORT_BREAK);
      }
    } else {
      setMode("focus");
      setTimeLeft(FOCUS_TIME);
    }
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);

    if (mode === "focus") {
      setTimeLeft(FOCUS_TIME);
    } else if (mode === "shortBreak") {
      setTimeLeft(SHORT_BREAK);
    } else {
      setTimeLeft(LONG_BREAK);
    }
  };

  const changeMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);

    if (newMode === "focus") {
      setTimeLeft(FOCUS_TIME);
    } else if (newMode === "shortBreak") {
      setTimeLeft(SHORT_BREAK);
    } else {
      setTimeLeft(LONG_BREAK);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getModeTitle = () => {
    if (mode === "focus") return "Tiempo de enfoque";
    if (mode === "shortBreak") return "Descanso corto";
    return "Descanso largo";
  };

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-card">
        <div className="pomodoro-header">
          <h2>Pomodoro</h2>
          <p>{getModeTitle()}</p>
        </div>

        <div className="pomodoro-modes">
          <button
            className={mode === "focus" ? "active" : ""}
            onClick={() => changeMode("focus")}
          >
            Enfoque
          </button>

          <button
            className={mode === "shortBreak" ? "active" : ""}
            onClick={() => changeMode("shortBreak")}
          >
            Descanso corto
          </button>

          <button
            className={mode === "longBreak" ? "active" : ""}
            onClick={() => changeMode("longBreak")}
          >
            Descanso largo
          </button>
        </div>

        <div className="pomodoro-time">{formatTime(timeLeft)}</div>

        <div className="pomodoro-controls">
          <button className="pomodoro-main-button" onClick={toggleTimer}>
            {isRunning ? "Pausar" : "Iniciar"}
          </button>

          <button className="pomodoro-reset-button" onClick={resetTimer}>
            Reiniciar
          </button>
        </div>

        <div className="pomodoro-progress">
          <span>Pomodoros completados</span>
          <strong>{pomodoros}</strong>
        </div>

        <div className="pomodoro-info">
          <p>
            Mantén el enfoque durante 25 minutos y luego toma un pequeño
            descanso. Después de 4 sesiones, disfruta de un descanso largo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
