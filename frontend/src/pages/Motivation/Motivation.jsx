import React from "react";
import { usePhrase } from "../../hooks/usePhrase";
import MotivationCard from "../../components/MotivationCard/MotivationCard";
import "./Motivation.css";

const Motivation = () => {
  const {
    data: phrase,
    isLoading,
    isError,
  } = usePhrase();

  if (isLoading) {
    return (
      <main className="motivation-page">
        <div className="motivation-page__container">
          <div
            className="motivation-page__loader"
            role="status"
            aria-live="polite"
          >
            <span>Cargando frase motivacional...</span>
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="motivation-page">
        <div className="motivation-page__container">
          <div className="motivation-page__message" role="alert">
            <p>
              No se pudo cargar la frase motivacional.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="motivation-page">
      <div className="motivation-page__container">
        <header className="motivation-page__header">
          <h1>Motivación</h1>

          <p>
            Encuentra inspiración para continuar con tus
            objetivos.
          </p>
        </header>

        <section className="motivation-page__content">
          {phrase ? (
            <div className="motivation-page__card">
              <MotivationCard phrase={phrase} />
            </div>
          ) : (
            <div className="motivation-page__message">
              <p>
                No hay frases motivacionales disponibles.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Motivation;