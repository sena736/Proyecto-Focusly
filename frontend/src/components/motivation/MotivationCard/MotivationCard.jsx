import "./MotivationCard.css";

function MotivationCard({ phrase, onNewPhrase, isRefreshing = false }) {
  return (
    <section className="motivation-card">
      <div className="motivation-card__icon">✨</div>

      <div className="motivation-card__content">
        <span className="motivation-card__label">MOTIVACIÓN</span>

        <blockquote className="motivation-card__quote">
          “{phrase?.text}”
        </blockquote>

        {phrase?.author && (
          <p className="motivation-card__author">— {phrase.author}</p>
        )}

        {onNewPhrase && (
          <button
            type="button"
            className="motivation-card__button"
            onClick={onNewPhrase}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Buscando frase..." : "Nueva frase"}
          </button>
        )}
      </div>
    </section>
  );
}

export default MotivationCard;
