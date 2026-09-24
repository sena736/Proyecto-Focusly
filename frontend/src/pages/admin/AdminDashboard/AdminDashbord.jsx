import React from "react";
import "./AdminDashboard.css";

const AdminDashbord = () => {
  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard__container">
        <header className="admin-dashboard__header">
          <div>
            <h1>Panel de administración</h1>
            <p>
              Gestiona y supervisa la información de Focusly.
            </p>
          </div>
        </header>

        <section className="admin-dashboard__stats">
          <article className="admin-dashboard__card">
            <span className="admin-dashboard__card-label">
              Usuarios
            </span>

            <strong className="admin-dashboard__card-value">
              0
            </strong>
          </article>

          <article className="admin-dashboard__card">
            <span className="admin-dashboard__card-label">
              Tareas
            </span>

            <strong className="admin-dashboard__card-value">
              0
            </strong>
          </article>

          <article className="admin-dashboard__card">
            <span className="admin-dashboard__card-label">
              Sesiones Pomodoro
            </span>

            <strong className="admin-dashboard__card-value">
              0
            </strong>
          </article>

          <article className="admin-dashboard__card">
            <span className="admin-dashboard__card-label">
              Frases
            </span>

            <strong className="admin-dashboard__card-value">
              0
            </strong>
          </article>
        </section>

        <section className="admin-dashboard__content">
          <div className="admin-dashboard__panel">
            <h2>Resumen</h2>

            <p>
              Desde este panel puedes consultar y administrar
              la información de la aplicación.
            </p>
          </div>

          <div className="admin-dashboard__panel">
            <h2>Actividad reciente</h2>

            <p>
              No hay actividad reciente para mostrar.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminDashbord;