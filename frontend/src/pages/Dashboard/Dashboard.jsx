import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

import useAuth from "../../hooks/useAuth";
import useTask from "../../hooks/useTask";
import usePomodoro from "../../hooks/usePomodoro";
import { usePhrase } from "../../hooks/usePhrase";
import { getToken } from "../../services/token.services";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userName = user?.name || "Usuario";

  const {
    tasks = [],
    isLoading: isLoadingTasks,
    isError: isTasksError,
    updateTask,
  } = useTask(getToken());

  const {
    formattedTime,
    isRunning,
    start: startPomodoro,
    pause: pausePomodoro,
    reset: resetPomodoro,
  } = usePomodoro();

  const {
    data: phrase,
    isLoading: isLoadingPhrase,
    isError: isPhraseError,
    refetch: refetchPhrase,
    isRefetching: isRefetchingPhrase,
  } = usePhrase();

  const pendingTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks],
  );

  const previewTasks = useMemo(() => tasks.slice(0, 5), [tasks]);

  const progressPercent = tasks.length
    ? Math.round(((tasks.length - pendingTasks.length) / tasks.length) * 100)
    : 0;

  const toggleTask = (task) => {
    updateTask({
      id: task.id,
      data: { ...task, completed: !task.completed },
    });
  };

  return (
    <div className="focusly-dashboard">
      <main className="focusly-main">
        <header className="focusly-header">
          <div>
            <p className="focusly-eyebrow">Panel principal</p>

            <h1>¡Hola, {userName.split(" ")[0]}!</h1>

            <p className="focusly-subtitle">
              Organiza tu tiempo, mantén el enfoque y avanza en tus metas.
            </p>
          </div>

          <button
            className="focusly-profile"
            onClick={() => navigate("/profile")}
            aria-label="Abrir perfil"
          >
            <span className="focusly-avatar">
              {userName
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </span>

            <span className="focusly-profile-info">
              <strong>{userName}</strong>
              <small>{user?.role === "ADMIN" ? "Administrador" : "Estudiante"}</small>
            </span>

            <span className="focusly-chevron">⌄</span>
          </button>
        </header>

        <section className="focusly-hero-grid">
          <article className="focusly-card focusly-pomodoro-card">
            <div className="focusly-card-heading">
              <div>
                <span className="focusly-kicker">POMODORO</span>

                <h2>Sesión de enfoque</h2>
              </div>

              <span className="focusly-status-dot">
                {isRunning ? "● Enfoque" : "○ Pausado"}
              </span>
            </div>

            <div className="focusly-timer">
              <div className="focusly-timer-ring">
                <div className="focusly-timer-content">
                  <strong>{formattedTime}</strong>

                  <span>minutos restantes</span>
                </div>
              </div>
            </div>

            <div className="focusly-timer-actions">
              <button
                className="focusly-primary-button"
                onClick={() => (isRunning ? pausePomodoro() : startPomodoro())}
              >
                {isRunning ? "Pausar" : "Iniciar"}
              </button>

              <button
                className="focusly-secondary-button"
                onClick={resetPomodoro}
              >
                Reiniciar
              </button>
            </div>
          </article>

          <article className="focusly-card focusly-motivation-card">
            <div className="focusly-card-heading">
              <div>
                <span className="focusly-kicker">MOTIVACIÓN</span>

                <h2>Tu impulso de hoy</h2>
              </div>

              <span className="focusly-sparkle">✦</span>
            </div>

            <div className="focusly-quote">
              <span className="focusly-quote-mark">“</span>

              <p>
                {isLoadingPhrase
                  ? "Cargando frase..."
                  : isPhraseError
                    ? "No se pudo cargar la frase motivacional."
                    : phrase?.text}
              </p>
            </div>

            <button
              className="focusly-link-button"
              onClick={() => refetchPhrase()}
              disabled={isRefetchingPhrase}
            >
              Nueva frase <span>→</span>
            </button>
          </article>
        </section>

        <section className="focusly-task-section">
          <div className="focusly-section-heading">
            <div>
              <span className="focusly-kicker">ORGANIZACIÓN</span>

              <h2>Mis tareas</h2>
            </div>

            <button
              className="focusly-add-button"
              onClick={() => navigate("/tasks")}
            >
              + Nueva tarea
            </button>
          </div>

          <div className="focusly-task-layout">
            <div className="focusly-card focusly-tasks-card">
              <div className="focusly-task-summary">
                <span>
                  <strong>{pendingTasks.length}</strong> pendientes
                </span>

                <span>{tasks.length - pendingTasks.length} completadas</span>
              </div>

              <div className="focusly-task-list">
                {isLoadingTasks && (
                  <div className="focusly-task">
                    <span className="focusly-task-copy">
                      <strong>Cargando tareas...</strong>
                    </span>
                  </div>
                )}

                {isTasksError && (
                  <div className="focusly-task">
                    <span className="focusly-task-copy">
                      <strong>No se pudieron cargar las tareas.</strong>
                    </span>
                  </div>
                )}

                {!isLoadingTasks && !isTasksError && previewTasks.length === 0 && (
                  <div className="focusly-task">
                    <span className="focusly-task-copy">
                      <strong>No tenés tareas todavía.</strong>
                    </span>
                  </div>
                )}

                {previewTasks.map((task) => (
                  <label
                    className={`focusly-task ${
                      task.completed ? "is-completed" : ""
                    }`}
                    key={task.id}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                    />

                    <span className="focusly-checkmark">✓</span>

                    <span className="focusly-task-copy">
                      <strong>{task.title}</strong>

                      <small>
                        {task.description || "Sin descripción"}
                        {task.dueDate
                          ? ` · ${new Date(task.dueDate).toLocaleDateString()}`
                          : ""}
                      </small>
                    </span>

                    <span className="focusly-task-menu">•••</span>
                  </label>
                ))}
              </div>

              <button
                className="focusly-view-all"
                onClick={() => navigate("/tasks")}
              >
                Ver todas las tareas <span>→</span>
              </button>
            </div>

            <aside className="focusly-card focusly-progress-card">
              <span className="focusly-kicker">RESUMEN</span>

              <h3>Tu progreso</h3>

              <div className="focusly-progress-circle">
                <span>{progressPercent}%</span>
              </div>

              <p>
                Sigue así. Completar pequeñas tareas mantiene tu ritmo de
                estudio.
              </p>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
