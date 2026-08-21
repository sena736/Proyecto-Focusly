import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const INITIAL_TASKS = [
  { id: 1, title: "Repasar fundamentos de React", subject: "Desarrollo web", date: "Hoy", completed: false },
  { id: 2, title: "Entregar informe de proyecto", subject: "Proyecto Focusly", date: "Hoy", completed: false },
  { id: 3, title: "Leer capítulo de bases de datos", subject: "Bases de datos", date: "Mañana", completed: true },
];

const MOTIVATIONAL_QUOTES = [
  "La constancia de hoy construye tus resultados de mañana.",
  "Un paso a la vez también es avanzar.",
  "Concéntrate en lo que puedes completar ahora.",
];

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

export default function Dashboard({
  userName = "Juan Pérez",
  onNavigate = () => {},
}) {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const pendingTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks]
  );

  useEffect(() => {
    if (!pomodoroRunning) return;

    const interval = window.setInterval(() => {
      setPomodoroSeconds((seconds) => {
        if (seconds <= 1) {
          setPomodoroRunning(false);
          return 25 * 60;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [pomodoroRunning]);

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const resetPomodoro = () => {
    setPomodoroRunning(false);
    setPomodoroSeconds(25 * 60);
  };

  const addTask = (event) => {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;

    setTasks((current) => [
      {
        id: Date.now(),
        title,
        subject: "Nueva tarea",
        date: "Hoy",
        completed: false,
      },
      ...current,
    ]);

    setNewTaskTitle("");
    setShowNewTask(false);
  };

  return (
    <div className={`focusly-dashboard ${darkMode ? "is-dark" : ""}`}>
      <aside className="focusly-sidebar">
        <div className="focusly-brand">
          <div className="focusly-brand-mark" aria-hidden="true">
            F
          </div>
          <span>FOCUSLY</span>
        </div>

        <nav className="focusly-nav" aria-label="Navegación principal">
          <button className="focusly-nav-item is-active" onClick={() => onNavigate("dashboard")}>
            <span>⌂</span>
            Inicio
          </button>
          <button className="focusly-nav-item" onClick={() => onNavigate("pomodoro")}>
            <span>◷</span>
            Pomodoro
          </button>
          <button className="focusly-nav-item" onClick={() => onNavigate("tasks")}>
            <span>☑</span>
            Tareas
          </button>
          <button className="focusly-nav-item" onClick={() => onNavigate("motivation")}>
            <span>✦</span>
            Motivación
          </button>
          <button className="focusly-nav-item" onClick={() => onNavigate("settings")}>
            <span>⚙</span>
            Configuración
          </button>
        </nav>

        <div className="focusly-sidebar-footer">
          <button className="focusly-theme-toggle" onClick={() => setDarkMode((value) => !value)}>
            <span>{darkMode ? "☀" : "☾"}</span>
            {darkMode ? "Modo claro" : "Modo oscuro"}
          </button>
        </div>
      </aside>

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
            onClick={() => onNavigate("profile")}
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
              <small>Estudiante</small>
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
              <span className="focusly-status-dot">● Enfoque</span>
            </div>

            <div className="focusly-timer">
              <div className="focusly-timer-ring">
                <div className="focusly-timer-content">
                  <strong>{formatTime(pomodoroSeconds)}</strong>
                  <span>minutos restantes</span>
                </div>
              </div>
            </div>

            <div className="focusly-timer-actions">
              <button
                className="focusly-primary-button"
                onClick={() => setPomodoroRunning((value) => !value)}
              >
                {pomodoroRunning ? "Pausar" : "Iniciar"}
              </button>
              <button className="focusly-secondary-button" onClick={resetPomodoro}>
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
              <p>{MOTIVATIONAL_QUOTES[quoteIndex]}</p>
            </div>

            <button
              className="focusly-link-button"
              onClick={() =>
                setQuoteIndex((index) => (index + 1) % MOTIVATIONAL_QUOTES.length)
              }
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
              onClick={() => setShowNewTask((value) => !value)}
            >
              + Nueva tarea
            </button>
          </div>

          {showNewTask && (
            <form className="focusly-new-task" onSubmit={addTask}>
              <input
                autoFocus
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="Escribe el nombre de la tarea"
                aria-label="Nombre de la nueva tarea"
              />
              <button type="submit" className="focusly-primary-button">
                Guardar
              </button>
              <button
                type="button"
                className="focusly-secondary-button"
                onClick={() => setShowNewTask(false)}
              >
                Cancelar
              </button>
            </form>
          )}

          <div className="focusly-task-layout">
            <div className="focusly-card focusly-tasks-card">
              <div className="focusly-task-summary">
                <span>
                  <strong>{pendingTasks.length}</strong> pendientes
                </span>
                <span>{tasks.length - pendingTasks.length} completadas</span>
              </div>

              <div className="focusly-task-list">
                {tasks.map((task) => (
                  <label
                    className={`focusly-task ${task.completed ? "is-completed" : ""}`}
                    key={task.id}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span className="focusly-checkmark">✓</span>

                    <span className="focusly-task-copy">
                      <strong>{task.title}</strong>
                      <small>
                        {task.subject} · {task.date}
                      </small>
                    </span>

                    <span className="focusly-task-menu">•••</span>
                  </label>
                ))}
              </div>

              <button
                className="focusly-view-all"
                onClick={() => onNavigate("tasks")}
              >
                Ver todas las tareas <span>→</span>
              </button>
            </div>

            <aside className="focusly-card focusly-progress-card">
              <span className="focusly-kicker">RESUMEN</span>
              <h3>Tu progreso</h3>

              <div className="focusly-progress-circle">
                <span>
                  {tasks.length
                    ? Math.round(
                        ((tasks.length - pendingTasks.length) / tasks.length) * 100
                      )
                    : 0}
                  %
                </span>
              </div>

              <p>
                Sigue así. Completar pequeñas tareas mantiene tu ritmo de estudio.
              </p>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}