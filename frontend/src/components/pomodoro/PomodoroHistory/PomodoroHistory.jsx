import React from "react";
import {
  Clock,
  CheckCircle2,
  Coffee,
  CalendarDays,
} from "lucide-react";
import "./PomodoroHistory.css";

const PomodoroHistory = ({ sessions = [] }) => {
  const defaultSessions = [
    {
      id: 1,
      date: "Hoy",
      time: "10:30 AM",
      duration: 25,
      type: "focus",
      task: "Estudiar matemáticas",
      completed: true,
    },
    {
      id: 2,
      date: "Hoy",
      time: "11:05 AM",
      duration: 25,
      type: "focus",
      task: "Realizar proyecto",
      completed: true,
    },
    {
      id: 3,
      date: "Ayer",
      time: "4:20 PM",
      duration: 15,
      type: "break",
      task: "Descanso",
      completed: true,
    },
    {
      id: 4,
      date: "Ayer",
      time: "5:00 PM",
      duration: 25,
      type: "focus",
      task: "Leer capítulo 3",
      completed: true,
    },
  ];

  const history = sessions.length > 0 ? sessions : defaultSessions;

  return (
    <section className="pomodoro-history">
      <div className="pomodoro-history__header">
        <div>
          <h2 className="pomodoro-history__title">
            Historial Pomodoro
          </h2>

          <p className="pomodoro-history__subtitle">
            Revisa tus sesiones de concentración
          </p>
        </div>

        <div className="pomodoro-history__calendar">
          <CalendarDays size={20} />
        </div>
      </div>

      <div className="pomodoro-history__list">
        {history.length > 0 ? (
          history.map((session) => {
            const isBreak = session.type === "break";

            return (
              <div
                className="pomodoro-history__item"
                key={session.id}
              >
                <div
                  className={`pomodoro-history__icon ${
                    isBreak
                      ? "pomodoro-history__icon--break"
                      : "pomodoro-history__icon--focus"
                  }`}
                >
                  {isBreak ? (
                    <Coffee size={20} />
                  ) : (
                    <Clock size={20} />
                  )}
                </div>

                <div className="pomodoro-history__info">
                  <h3 className="pomodoro-history__task">
                    {session.task}
                  </h3>

                  <div className="pomodoro-history__details">
                    <span>{session.date}</span>
                    <span>•</span>
                    <span>{session.time}</span>
                  </div>
                </div>

                <div className="pomodoro-history__duration">
                  <strong>{session.duration}</strong>
                  <span>min</span>
                </div>

                {session.completed && (
                  <CheckCircle2
                    className="pomodoro-history__completed"
                    size={19}
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="pomodoro-history__empty">
            <Clock size={36} />

            <h3>No hay sesiones todavía</h3>

            <p>
              Completa una sesión Pomodoro para verla aquí.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PomodoroHistory;