import { useState } from "react";
import "./MotivationCard.css";

const motivationalQuotes = [
  {
    text: "Cada pequeño paso te acerca a tu objetivo.",
    author: "Focusly",
  },
  {
    text: "Concéntrate en el proceso, no solamente en el resultado.",
    author: "Focusly",
  },
  {
    text: "Tu esfuerzo de hoy construye tu éxito de mañana.",
    author: "Focusly",
  },
  {
    text: "No necesitas hacerlo perfecto, solo necesitas comenzar.",
    author: "Focusly",
  },
  {
    text: "Organiza tu tiempo y convierte tus metas en acciones.",
    author: "Focusly",
  },
];

function MotivationCard() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const currentQuote = motivationalQuotes[quoteIndex];

  const handleNewQuote = () => {
    let newIndex;

    do {
      newIndex = Math.floor(Math.random() * motivationalQuotes.length);
    } while (motivationalQuotes.length > 1 && newIndex === quoteIndex);

    setQuoteIndex(newIndex);
  };

  return (
    <section className="motivation-card">
      <div className="motivation-card__icon">✨</div>

      <div className="motivation-card__content">
        <span className="motivation-card__label">MOTIVACIÓN</span>

        <blockquote className="motivation-card__quote">
          “{currentQuote.text}”
        </blockquote>

        <p className="motivation-card__author">— {currentQuote.author}</p>

        <button
          type="button"
          className="motivation-card__button"
          onClick={handleNewQuote}
        >
          Nueva frase
        </button>
      </div>
    </section>
  );
}

export default MotivationCard;
