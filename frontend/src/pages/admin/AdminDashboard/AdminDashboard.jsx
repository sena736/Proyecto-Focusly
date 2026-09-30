import React from "react";
import { FiGrid } from "react-icons/fi";
import PageHeader from "../../../components/layout/PageHeader/PageHeader";
import Alert from "../../../components/ui/Alert/Alert";
import Loader from "../../../components/ui/Loader/Loader";
import useAdminPomodoroSessions from "../../../hooks/useAdminPomodoroSessions";
import useUsers from "../../../hooks/useUsers";
import "./AdminDashboard.css";

/**
 * Normalises a query into the three states the panel cares about.
 * `items` must be an array to count as a success: any other payload is an
 * error, so the panel never shows an invented number.
 */
const toStat = ({ items, isLoading, isError, error }, unexpectedMessage) => {
  if (isLoading) {
    return { status: "loading" };
  }

  if (isError) {
    return { status: "error", error };
  }

  if (!Array.isArray(items)) {
    return { status: "error", error: new Error(unexpectedMessage) };
  }

  return { status: "success", total: items.length };
};

const PERMISSION_MESSAGE = "No tenés permisos para ver esta información.";
const GENERIC_MESSAGE = "No se pudieron cargar los datos. Intentá de nuevo.";

/** Never surfaces the raw axios text ("Request failed with status code 403"). */
const friendlyMessage = (error) =>
  [401, 403].includes(error?.response?.status) ? PERMISSION_MESSAGE : GENERIC_MESSAGE;

const STAT_DEFINITIONS = [
  {
    id: "users",
    label: "Usuarios",
    errorTitle: "No se pudieron cargar los usuarios",
    errorFallback: "Ocurrió un error al obtener los usuarios.",
    emptyHint: "Todavía no hay usuarios registrados.",
  },
  {
    id: "sessions",
    label: "Sesiones Pomodoro",
    errorTitle: "No se pudieron cargar las sesiones Pomodoro",
    errorFallback: "Ocurrió un error al obtener las sesiones Pomodoro.",
    emptyHint: "Todavía no se registraron sesiones.",
  },
];

const AdminDashboard = () => {
  const usersQuery = useUsers();
  const sessionsQuery = useAdminPomodoroSessions();

  const stats = {
    users: toStat(
      {
        items: usersQuery.users,
        isLoading: usersQuery.isLoading,
        isError: usersQuery.isError,
        error: usersQuery.error,
      },
      STAT_DEFINITIONS[0].errorFallback,
    ),
    sessions: toStat(
      {
        items: sessionsQuery.sessions,
        isLoading: sessionsQuery.isLoading,
        isError: sessionsQuery.isError,
        error: sessionsQuery.error,
      },
      STAT_DEFINITIONS[1].errorFallback,
    ),
  };

  const failed = STAT_DEFINITIONS.filter(
    ({ id }) => stats[id].status === "error",
  );

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard__container">
        <PageHeader
          className="admin-dashboard__header"
          icon={<FiGrid aria-hidden="true" />}
          title="Panel de administración"
          subtitle="Gestiona y supervisa la información de Focusly."
        />

        <section className="admin-dashboard__stats">
          {STAT_DEFINITIONS.map(({ id, label, emptyHint }) => {
            const stat = stats[id];
            const labelId = `admin-stat-${id}`;

            return (
              <article
                key={id}
                className="admin-dashboard__card"
                aria-labelledby={labelId}
              >
                <span id={labelId} className="admin-dashboard__card-label">
                  {label}
                </span>

                {stat.status === "loading" && (
                  <div className="admin-dashboard__card-state">
                    <Loader size="small" text="Cargando..." />
                  </div>
                )}

                {stat.status === "success" && (
                  <>
                    <strong className="admin-dashboard__card-value">
                      {stat.total}
                    </strong>

                    {stat.total === 0 && (
                      <span className="admin-dashboard__card-hint">
                        {emptyHint}
                      </span>
                    )}
                  </>
                )}

                {stat.status === "error" && (
                  <span className="admin-dashboard__card-hint">
                    No disponible
                  </span>
                )}
              </article>
            );
          })}
        </section>

        {failed.length > 0 && (
          <div className="admin-dashboard__alerts">
            {failed.map(({ id, errorTitle }) => (
              <Alert
                key={id}
                type="error"
                title={errorTitle}
                message={friendlyMessage(stats[id].error)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
