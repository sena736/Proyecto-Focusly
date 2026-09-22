import React from "react";
import "./Pomodoro.css";

import PomodoroTimer from "../../components/PomodoroTimer/PomodoroTimer";
import PomodoroControls from "../../components/PomodoroControls/PomodoroControls";
import PomodoroHistory from "../../components/PomodoroHistory/PomodoroHistory";
import PomodoroSettings from "../../components/PomodoroSettings/PomodoroSettings";

const Pomodoro = () => {
  return (
    <main className="pomodoro-page">
      <div className="pomodoro-page__container">
        <header className="pomodoro-page__header">
          <h1>Pomodoro</h1>
          <p>
            Concéntrate en tus tareas y aprovecha mejor tu tiempo.
          </p>
        </header>

        <section className="pomodoro-page__timer-section">
          <div className="pomodoro-page__timer">
            <PomodoroTimer />
          </div>

          <div className="pomodoro-page__controls">
            <PomodoroControls />
          </div>
        </section>

        <section className="pomodoro-page__panels">
          <aside className="pomodoro-page__panel pomodoro-page__history">
            <PomodoroHistory />
          </aside>

          <aside className="pomodoro-page__panel pomodoro-page__settings">
            <PomodoroSettings />
          </aside>
        </section>
      </div>
    </main>
  );
};

export default Pomodoro;