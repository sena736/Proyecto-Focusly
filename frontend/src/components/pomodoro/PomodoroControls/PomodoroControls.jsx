import "./PomodoroControls.css";

const PomodoroControls = ({
  isRunning = false,
  isPaused = false,
  onStart,
  onPause,
  onReset,
  onSkip,
  disabled = false,
}) => {
  const handleMainAction = () => {
    if (isRunning && !isPaused) {
      onPause?.();
    } else {
      onStart?.();
    }
  };

  return (
    <div className="pomodoro-controls">
      {/* Reiniciar */}
      <button
        type="button"
        className="pomodoro-controls__button pomodoro-controls__button--secondary"
        onClick={onReset}
        disabled={disabled}
        aria-label="Reiniciar temporizador"
      >
        <svg
          viewBox="0 0 24 24"
          className="pomodoro-controls__icon"
          aria-hidden="true"
        >
          <path
            d="M4 12a8 8 0 1 0 2.34-5.66"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M4 5v4h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span>Reiniciar</span>
      </button>

      {/* Iniciar / Pausar */}
      <button
        type="button"
        className="pomodoro-controls__button pomodoro-controls__button--primary"
        onClick={handleMainAction}
        disabled={disabled}
        aria-label={
          isRunning && !isPaused
            ? "Pausar temporizador"
            : isPaused
              ? "Continuar temporizador"
              : "Iniciar temporizador"
        }
      >
        {isRunning && !isPaused ? (
          <>
            <svg
              viewBox="0 0 24 24"
              className="pomodoro-controls__icon"
              aria-hidden="true"
            >
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>

            <span>Pausar</span>
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              className="pomodoro-controls__icon"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7L8 5z" />
            </svg>

            <span>{isPaused ? "Continuar" : "Iniciar"}</span>
          </>
        )}
      </button>

      {/* Siguiente */}
      <button
        type="button"
        className="pomodoro-controls__button pomodoro-controls__button--secondary"
        onClick={onSkip}
        disabled={disabled}
        aria-label="Siguiente fase"
      >
        <span>Siguiente</span>

        <svg
          viewBox="0 0 24 24"
          className="pomodoro-controls__icon"
          aria-hidden="true"
        >
          <path
            d="M5 5v14l10-7L5 5zM19 5v14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default PomodoroControls;
