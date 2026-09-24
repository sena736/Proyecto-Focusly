import React from "react";
import { usePhrase } from "../../hooks/usePhrase";
import MotivationCard from "../../components/MotivationCard/MotivationCard";

const Motivation = () => {
  const {
    data: phrase,
    isLoading,
    isError,
  } = usePhrase();

  if (isLoading) {
    return (
      <main className="motivation-page">
        <div className="motivation-page__loader">
          <span>Cargando frase motivacional...</span>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="motivation-page">
        <div className="motivation-page__error">
          <p>
            No se pudo cargar la frase motivacional.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="motivation-page">
      <header className="motivation-page__header">
        <h1>Motivación</h1>
        <p>
          Encuentra inspiración para continuar con tus objetivos.
        </p>
      </header>

      {phrase ? (
        <MotivationCard phrase={phrase} />
      ) : (
        <div className="motivation-page__error">
          <p>No hay frases motivacionales disponibles.</p>
        </div>
      )}
    </main>
  );
};

export default Motivation;