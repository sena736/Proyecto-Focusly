import React from "react";
import {
  Clock,
  CheckCircle2,
  Coffee,
  CalendarDays,
} from "lucide-react";
import "./PomodoroHistory.css";

import Loader from "../../ui/Loader/Loader";
import Alert from "../../ui/Alert/Alert";
import EmptyState from "../../ui/EmptyState/EmptyState";

import { POMODORO_TYPES } from "../../../utils/constants";
import { formatDateTime, sortByDateDescending } from "../../../utils/date";

const MAX_SESSIONS = 10;

const PomodoroHistory = ({
  sessions = [],
  isLoading = false,
  isError = false,
}) => {
  // Las sesiones tienen marcas de tiempo reales: se muestran en hora local.
  const history = sortByDateDescending(sessions ?? [], "startedAt").slice(
    0,
    MAX_SESSIONS
  );

  const renderContent = () => {
    if (isLoading) {
      return <Loader text="Cargando historial..." />;
    }

    if (isError) {
      return (
        <Alert
          type="error"
          message="No pudimos cargar tu historial. Inténtalo de nuevo más tarde."
          showClose={false}
        />
      );
    }

    if (history.length === 0) {
      return (
        <EmptyState
          icon="⏱️"
          title="Todavía no completaste ninguna sesión"
          message="Completa un ciclo Pomodoro para verlo aquí."
        />
      );
    }

    return history.map((session) => {
      const isBreak = session.type === POMODORO_TYPES.BREAK;

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
              {isBreak ? "Descanso" : "Enfoque"}
            </h3>

            <div className="pomodoro-history__details">
              <span>{formatDateTime(session.startedAt)}</span>
            </div>
          </div>

          <div className="pomodoro-history__duration">
            <strong>{session.durationMinutes}</strong>
            <span>min</span>
          </div>

          <CheckCircle2
            className="pomodoro-history__completed"
            size={19}
          />
        </div>
      );
    });
  };

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
        {renderContent()}
      </div>
    </section>
  );
};

export default PomodoroHistory;
