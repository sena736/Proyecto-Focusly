import React from "react";
import "./Pomodoro.css";

import usePomodoro from "../../hooks/usePomodoro";

import PageHeader from "../../components/layout/PageHeader/PageHeader";
import PomodoroTimer from "../../components/pomodoro/PomodoroTimer/PomodoroTimer";
import PomodoroControls from "../../components/pomodoro/PomodoroControls/PomodoroControls";
import PomodoroHistory from "../../components/pomodoro/PomodoroHistory/PomodoroHistory";
import PomodoroSettings from "../../components/pomodoro/PomodoroSettings/PomodoroSettings";

const Pomodoro = () => {
  const {
    mode,
    remainingSeconds,
    formattedTime,
    isRunning,
    isFinished,
    isLoading,
    error,
    durationMinutes,
    start,
    pause,
    reset,
    changeMode,
  } = usePomodoro();

  return (
    <main className="pomodoro-page">
      <PageHeader
        className="pomodoro-page__header"
        title="Pomodoro"
        subtitle="Concéntrate, trabaja con propósito y aprovecha mejor tu tiempo."
      />

      {isFinished && (
        <div
          className="pomodoro-page__notification"
          role="status"
        >
          <strong>¡Ciclo terminado! 🎉</strong>
          <span>
            Es momento de continuar con tu siguiente sesión.
          </span>
        </div>
      )}

      {error && (
        <div
          className="pomodoro-page__error"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="pomodoro-page__main">
        <PomodoroTimer
          mode={mode}
          remainingSeconds={remainingSeconds}
          formattedTime={formattedTime}
          isRunning={isRunning}
          durationMinutes={durationMinutes}
        />

        <PomodoroControls
          isRunning={isRunning}
          onStart={start}
          onPause={pause}
          onReset={reset}
        />

        <PomodoroSettings
          mode={mode}
          onChangeMode={changeMode}
        />
      </section>

      <section className="pomodoro-page__history">
        <PomodoroHistory />
      </section>

      {isLoading && (
        <p className="pomodoro-page__saving">
          Guardando sesión...
        </p>
      )}
    </main>
  );
};

export default Pomodoro;