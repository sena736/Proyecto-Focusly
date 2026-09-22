import React from "react";
import {
  FiClock,
  FiCheckSquare,
  FiTarget,
  FiHeart,
} from "react-icons/fi";
import "./About.css";

const About = () => {
  return (
    <main className="about">
      <div className="about__container">
        {/* Encabezado */}
        <section className="about__hero">
          <span className="about__eyebrow">SOBRE FOCUSLY</span>

          <h1 className="about__title">
            Organiza tu tiempo.
            <span> Enfócate en lo importante.</span>
          </h1>

          <p className="about__intro">
            Focusly es una aplicación diseñada para estudiantes que
            buscan organizar mejor su tiempo, mejorar su concentración
            y alcanzar sus objetivos académicos de una manera sencilla.
          </p>
        </section>

        {/* ¿Qué es Focusly? */}
        <section className="about__section">
          <h2>¿Qué es Focusly?</h2>

          <p>
            Focusly es una herramienta de productividad que combina
            organización de tareas y técnicas de concentración para
            ayudarte a aprovechar mejor tu tiempo de estudio.
          </p>

          <p>
            Su objetivo es ofrecer un espacio sencillo y agradable donde
            puedas planificar tus actividades, trabajar por períodos de
            concentración y llevar un seguimiento de tu progreso.
          </p>
        </section>

        {/* Características */}
        <section className="about__section">
          <h2>¿Qué puedes hacer con Focusly?</h2>

          <div className="about__features">
            <article className="about__feature">
              <div className="about__feature-icon">
                <FiClock />
              </div>

              <div>
                <h3>Gestiona tu tiempo</h3>
                <p>
                  Utiliza el temporizador Pomodoro para organizar tus
                  sesiones de estudio y descanso.
                </p>
              </div>
            </article>

            <article className="about__feature">
              <div className="about__feature-icon">
                <FiCheckSquare />
              </div>

              <div>
                <h3>Organiza tus tareas</h3>
                <p>
                  Crea y administra tus tareas para mantener claras
                  tus actividades pendientes.
                </p>
              </div>
            </article>

            <article className="about__feature">
              <div className="about__feature-icon">
                <FiTarget />
              </div>

              <div>
                <h3>Mejora tu enfoque</h3>
                <p>
                  Reduce las distracciones y dedica períodos de tiempo
                  específicos a cada actividad.
                </p>
              </div>
            </article>

            <article className="about__feature">
              <div className="about__feature-icon">
                <FiHeart />
              </div>

              <div>
                <h3>Mantén la motivación</h3>
                <p>
                  Encuentra frases motivacionales que te ayuden a
                  continuar avanzando hacia tus objetivos.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Propósito */}
        <section className="about__purpose">
          <div className="about__purpose-content">
            <span className="about__eyebrow">NUESTRO PROPÓSITO</span>

            <h2>
              Pequeños momentos de enfoque pueden convertirse en grandes
              logros.
            </h2>

            <p>
              Focusly busca acompañarte durante tu proceso académico,
              ayudándote a construir hábitos de organización,
              concentración y constancia.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default About;