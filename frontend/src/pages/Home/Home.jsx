import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckSquare,
  FiClock,
  FiHeart,
  FiMoon,
  FiTarget,
  FiTrendingUp,
  FiEye,
} from "react-icons/fi";
import "./Home.css";

const FEATURES = [
  {
    icon: FiClock,
    title: "Temporizador Pomodoro",
    text: "Trabaja en sesiones de 25 minutos de enfoque con descansos de 5 minutos para mantener el ritmo sin agotarte.",
  },
  {
    icon: FiCheckSquare,
    title: "Gestor de tareas",
    text: "Crea tus tareas, ponles fecha límite y encuéntralas rápido con los filtros.",
  },
  {
    icon: FiHeart,
    title: "Frases motivacionales",
    text: "Encuentra frases que te acompañen y te den un empujón cuando más lo necesites.",
  },
  {
    icon: FiMoon,
    title: "Modo oscuro",
    text: "Cambia el tema de la aplicación para estudiar cómodamente a cualquier hora del día.",
  },
];

const BENEFITS = [
  {
    icon: FiTarget,
    title: "Mejora tu concentración",
    text: "Dedicar bloques de tiempo definidos a cada actividad reduce las distracciones.",
  },
  {
    icon: FiTrendingUp,
    title: "Avanza con constancia",
    text: "Ver lo pendiente y lo completado te ayuda a construir el hábito de estudiar todos los días.",
  },
  {
    icon: FiEye,
    title: "Ten todo a la vista",
    text: "Tus tareas, tus sesiones y tu motivación viven en un solo lugar, sin complicaciones.",
  },
];

const Home = () => {
  return (
    <div className="landing">
      {/* Inicio */}
      <section id="inicio" className="landing__section">
        <div className="landing__container landing__hero-inner">
          <div className="landing__hero-content">
            <span className="landing__eyebrow">BIENVENIDO A FOCUSLY</span>

            <h1 className="landing__title">
              Organiza tu tiempo.
              <span> Alcanza tus metas.</span>
            </h1>

            <p className="landing__lead">
              Focusly combina un temporizador Pomodoro, un gestor de tareas
              y frases motivacionales para ayudarte a estudiar con más
              enfoque y menos estrés.
            </p>

            <div className="landing__actions">
              <Link to="/register" className="landing__btn landing__btn--primary">
                Crear cuenta
                <FiArrowRight aria-hidden="true" />
              </Link>

              <Link to="/login" className="landing__btn landing__btn--secondary">
                Iniciar sesión
              </Link>
            </div>
          </div>

          {/* Ilustración decorativa del temporizador */}
          <div className="landing__timer" aria-hidden="true">
            <span className="landing__timer-label">Sesión de enfoque</span>
            <span className="landing__timer-time">25:00</span>
            <span className="landing__timer-hint">Después, 5 minutos de descanso</span>
          </div>
        </div>
      </section>

      {/* Características */}
      <section
        id="caracteristicas"
        className="landing__section landing__section--alt"
      >
        <div className="landing__container">
          <div className="landing__header">
            <span className="landing__eyebrow">CARACTERÍSTICAS</span>
            <h2>Todo lo que necesitas para estudiar mejor</h2>
            <p>Herramientas sencillas para organizarte y mantener el enfoque.</p>
          </div>

          <div className="landing__grid landing__grid--four">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="landing__card">
                <div className="landing__card-icon">
                  <Icon aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="landing__section">
        <div className="landing__container">
          <div className="landing__header">
            <span className="landing__eyebrow">BENEFICIOS</span>
            <h2>Pequeños hábitos, grandes resultados</h2>
            <p>Lo que puedes lograr al usar Focusly en tu rutina de estudio.</p>
          </div>

          <div className="landing__grid landing__grid--three">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <article key={title} className="landing__card">
                <div className="landing__card-icon">
                  <Icon aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros */}
      <section
        id="nosotros"
        className="landing__section landing__section--alt"
      >
        <div className="landing__container landing__about">
          <span className="landing__eyebrow">NOSOTROS</span>
          <h2>Una herramienta pensada para estudiantes</h2>
          <p>
            Focusly nació para ofrecer un espacio sencillo y agradable donde
            puedas planificar tus actividades y trabajar por períodos de
            concentración.
          </p>
          <Link to="/about" className="landing__link">
            Conoce más sobre Focusly
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
