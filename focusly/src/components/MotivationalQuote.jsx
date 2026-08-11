import { useState } from "react";
import "./MotivationalQuote.css";

const frases = [
  "No tienes que hacerlo perfecto, solo tienes que seguir avanzando.",
  "Cada página que estudias te acerca un poco más a tu meta.",
  "Tu esfuerzo de hoy construye tu futuro.",
  "No subestimes lo que puedes lograr con constancia.",
  "Un paso a la vez. Lo importante es no detenerse.",
  "Estudiar hoy es invertir en la persona que quieres ser mañana.",
  "No necesitas motivación todos los días; necesitas constancia.",
  "Los grandes resultados empiezan con pequeños esfuerzos.",
  "Concéntrate en avanzar, no en hacerlo todo de una vez.",
  "Tú puedes con esto. Respira, organiza y comienza.",
  "Tu progreso también cuenta cuando parece pequeño.",
  "No compares tu proceso con el de nadie más.",
  "Descansar también forma parte del progreso.",
  "Cada error es una oportunidad para aprender algo nuevo.",
  "La disciplina te lleva donde la motivación no siempre puede.",
  "Hazlo por la versión de ti que algún día agradecerá que no te rendiste.",
  "Tu futuro yo está orgulloso de que hayas empezado.",
  "No necesitas saberlo todo; solo necesitas estar dispuesto a aprender.",
  "Cree en tu proceso, incluso cuando todavía no puedas ver el resultado.",
  "Hoy puede ser un buen día para comenzar de nuevo.",
  "Cada sesión de estudio es una pequeña victoria.",
  "No abandones por tener un día difícil.",
  "Aprender toma tiempo. Date permiso para avanzar a tu propio ritmo.",
  "Tu esfuerzo tiene valor, incluso cuando nadie lo ve.",
  "Hoy estudias, mañana agradeces."
];

function MotivationalQuote() {
  const [frase, setFrase] = useState(frases[0]);

  const cambiarFrase = () => {
    let nuevaFrase;

    do {
      nuevaFrase = frases[Math.floor(Math.random() * frases.length)];
    } while (nuevaFrase === frase);

    setFrase(nuevaFrase);
  };

  return (
    <section className="motivational-card">
      <div className="motivational-icon">✨</div>

      <h2>Un pequeño recordatorio</h2>

      <p className="motivational-quote">
        "{frase}"
      </p>

      <button onClick={cambiarFrase}>
        ✨ Nueva frase
      </button>
    </section>
  );
}

export default MotivationalQuote;