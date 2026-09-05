import React, { useState } from "react";
import "./Home.css";

import {
  FiHome,
  FiClock,
  FiCheckSquare,
  FiStar,
  FiSettings,
  FiBell,
  FiChevronDown,
  FiPlus,
  FiMoreVertical,
  FiPlay,
  FiRotateCcw,
  FiTarget,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const Home = () => {
  const [tareas, setTareas] = useState([
    {
      id: 1,
      titulo: "Tarea 1",
      descripcion: "Revisar matemáticas",
      completada: false,
    },
    {
      id: 2,
      titulo: "Tarea 2",
      descripcion: "Repasar inglés",
      completada: false,
    },
    {
      id: 3,
      titulo: "Tarea 3",
      descripcion: "Resolver ejercicios de biología",
      completada: true,
    },
  ]);

  const [tiempo, setTiempo] = useState("25:00");

  const cambiarEstadoTarea = (id) => {
    setTareas(
      tareas.map((tarea) =>
        tarea.id === id ? { ...tarea, completada: !tarea.completada } : tarea,
      ),
    );
  };

  return (
    <div className="home">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="logo">
          <span>FOCUSLY</span>
        </div>

        <nav className="menu">
          <button className="menu-item active">
            <FiHome />
            <Link to={"/"}>Inicio</Link>
          </button>

          <button className="menu-item">
            <FiClock />
            <Link to={"/pomodoro"}>Pomodoro</Link>
          </button>

          <button className="menu-item">
            <FiCheckSquare />
            <Link to={"/tareas"}>Tareas</Link>
          </button>

          <button className="menu-item">
            <FiStar />
            <Link to={"/motivacion"}>Motivación</Link>
          </button>

          <button className="menu-item">
            <FiSettings />
            <Link to={"/configuracion"}>Configuración</Link>
          </button>
        </nav>
      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="main-content">
        {/* HEADER */}
        <header className="topbar">
          <div className="welcome">
            <h1>¡Hola, Juan! 👋</h1>
            <p>Es hora de comenzar y dar lo mejor de ti.</p>
          </div>

          <div className="user-area">
            <button className="notification">
              <FiBell />
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile">
              <div className="avatar">J</div>

              <div className="user-info">
                <strong>Juan Pérez</strong>
                <span>Estudiante</span>
              </div>

              <FiChevronDown className="arrow-down" />
            </div>
          </div>
        </header>

        {/* CONTENIDO SUPERIOR */}
        <section className="dashboard-top">
          {/* POMODORO */}
          <div className="pomodoro-card">
            <h3>Pomodoro</h3>

            <div className="timer-circle">
              <svg className="progress-ring" width="145" height="145">
                <circle className="circle-background" cx="72" cy="72" r="60" />

                <circle className="circle-progress" cx="72" cy="72" r="60" />
              </svg>

              <div className="timer-content">
                <span>{tiempo}</span>
                <small>Sesión de enfoque</small>
              </div>
            </div>

            <div className="pomodoro-buttons">
              <button className="start-button">
                <FiPlay />
                Iniciar
              </button>

              <button
                className="reset-button"
                onClick={() => setTiempo("25:00")}
              >
                <FiRotateCcw />
                Reiniciar
              </button>
            </div>
          </div>

          {/* MOTIVACIÓN */}
          <div className="motivation-card">
            <div className="motivation-content">
              <h3>Motivación</h3>

              <p>
                “La disciplina de hoy
                <br />
                es el éxito de mañana.”
              </p>

              <button>Nueva frase</button>
            </div>

            <div className="motivation-image">
              <div className="moon"></div>
              <div className="mountain mountain-back"></div>
              <div className="mountain mountain-front"></div>
              <div className="flag"></div>
            </div>
          </div>
        </section>

        {/* TAREAS */}
        <section className="tasks-section">
          <div className="section-header">
            <div>
              <h2>Mis tareas</h2>
              <p>Organiza tus actividades y mantén el enfoque.</p>
            </div>

            <button className="new-task-button">
              <FiPlus />
              Nueva tarea
            </button>
          </div>

          <div className="tasks-card">
            {tareas.map((tarea) => (
              <div className="task-item" key={tarea.id}>
                <button
                  className={`task-check ${
                    tarea.completada ? "completed" : ""
                  }`}
                  onClick={() => cambiarEstadoTarea(tarea.id)}
                >
                  {tarea.completada && "✓"}
                </button>

                <div className="task-information">
                  <h4 className={tarea.completada ? "task-completed-text" : ""}>
                    {tarea.titulo}
                  </h4>

                  <p>{tarea.descripcion}</p>
                </div>

                <span className="task-status">
                  {tarea.completada ? "Hecha" : "Hoy"}
                </span>

                <button className="more-button">
                  <FiMoreVertical />
                </button>
              </div>
            ))}

            <button className="view-tasks">Ver todas las tareas</button>
          </div>
        </section>

        {/* RESUMEN */}
        <section className="summary-card">
          <div className="summary-icon">
            <FiTarget />
          </div>

          <div className="summary-text">
            <h3>Resumen de hoy</h3>
            <p>Cada pequeño esfuerzo te acerca a tus metas. ¡Sigue adelante!</p>
          </div>

          <button className="summary-button">Ver progreso</button>
        </section>
      </main>
    </div>
  );
};

export default Home;
