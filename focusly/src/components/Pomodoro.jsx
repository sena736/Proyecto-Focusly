import React, { useEffect, useState } from "react";
import { FiPlay, FiPause, FiRotateCcw } from "react-icons/fi";
import "./Pomodoro.css";

function Pomodoro() {
  const DURACION_TOTAL = 25 * 60;

  const [segundosRestantes, setSegundosRestantes] =
    useState(DURACION_TOTAL);

  const [activo, setActivo] = useState(false);

  // Convertir segundos a MM:SS
  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    return `${String(minutos).padStart(2, "0")}:${String(
      segundosRestantes
    ).padStart(2, "0")}`;
  };

  // Iniciar / detener temporizador
  useEffect(() => {
    if (!activo) return;

    const intervalo = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          setActivo(false);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [activo]);

  // Reiniciar Pomodoro
  const reiniciar = () => {
    setActivo(false);
    setSegundosRestantes(DURACION_TOTAL);
  };

  // Calcular progreso del círculo
  const progreso =
    ((DURACION_TOTAL - segundosRestantes) / DURACION_TOTAL) * 100;

  const radio = 60;
  const circunferencia = 2 * Math.PI * radio;

  const offset =
    circunferencia - (progreso / 100) * circunferencia;

  return (
    <div className="pomodoro-card">
      <h3>Pomodoro</h3>

      <div className="timer-circle">
        <svg
          className="progress-ring"
          width="145"
          height="145"
        >
          <circle
            className="circle-background"
            cx="72"
            cy="72"
            r={radio}
          />

          <circle
            className="circle-progress"
            cx="72"
            cy="72"
            r={radio}
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="timer-content">
          <span>{formatearTiempo(segundosRestantes)}</span>

          <small>
            {activo ? "Sesión de enfoque" : "Listo para comenzar"}
          </small>
        </div>
      </div>

      <div className="pomodoro-buttons">
        <button
          className="start-button"
          onClick={() => setActivo(!activo)}
        >
          {activo ? <FiPause /> : <FiPlay />}
          {activo ? "Pausar" : "Iniciar"}
        </button>

        <button
          className="reset-button"
          onClick={reiniciar}
        >
          <FiRotateCcw />
          Reiniciar
        </button>
      </div>
    </div>
  );
}

export default Pomodoro;