import React, { useState } from "react";
import "./Pomodoro.css";

import usePomodoro from "../../hooks/usePomodoro";
import useMyPomodoroSessions from "../../hooks/useMyPomodoroSessions";
import {
  getPomodoroDurations,
  savePomodoroDurations,
} from "../../services/storage.service";
import { clampMinutes } from "../../utils/pomodoro";

import PageHeader from "../../components/layout/PageHeader/PageHeader";
import PomodoroTimer from "../../components/pomodoro/PomodoroTimer/PomodoroTimer";
import PomodoroControls from "../../components/pomodoro/PomodoroControls/PomodoroControls";
import PomodoroHistory from "../../components/pomodoro/PomodoroHistory/PomodoroHistory";
import PomodoroSettings from "../../components/pomodoro/PomodoroSettings/PomodoroSettings";

const Pomodoro = () => {
  // Chosen durations: the page owns them, the hook runs with them and
  // they are remembered across reloads.
  const [durations, setDurations] = useState(getPomodoroDurations);

  const {
    mode,
    formattedTime,
    isRunning,
    isPaused,
    hasActiveCycle,
    isFinished,
    isLoading,
    error,
    completedPomodoros,
    start,
    pause,
    reset,
    skip,
    changeMode,
  } = usePomodoro(durations);

  const {
    sessions,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useMyPomodoroSessions();

  const handleChangeDuration = (key, minutes) => {
    const next = { ...durations, [key]: clampMinutes(minutes) };

    setDurations(next);
    savePomodoroDurations(next);
  };

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
          formattedTime={formattedTime}
          completedPomodoros={completedPomodoros}
          onChangeMode={changeMode}
        />

        <PomodoroControls
          isRunning={isRunning}
          isPaused={isPaused}
          onStart={start}
          onPause={pause}
          onReset={reset}
          onSkip={skip}
        />

        <PomodoroSettings
          focusMinutes={durations.focusMinutes}
          shortBreakMinutes={durations.shortBreakMinutes}
          longBreakMinutes={durations.longBreakMinutes}
          onChange={handleChangeDuration}
          disabled={isRunning || hasActiveCycle}
        />
      </section>

      <section className="pomodoro-page__history">
        <PomodoroHistory
          sessions={sessions}
          isLoading={isHistoryLoading}
          isError={isHistoryError}
        />
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