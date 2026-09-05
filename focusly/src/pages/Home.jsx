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
import Pomodoro from "../components/Pomodoro";
import SeccionTareas from "../components/SeccionTareas";
import { Link } from "react-router-dom";

const Home = () => {
  

  const [tiempo, setTiempo] = useState("25:00");

  

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
          <Pomodoro/>

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
        <SeccionTareas/>

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
