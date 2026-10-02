import { useQuery } from "@tanstack/react-query";

import { getMyPomodoroSessions } from "../api/pomodoro.api";
import { hasToken } from "../services/token.services";
import { QUERY_KEYS } from "../utils/constants";
import { shouldRetryAdminQuery } from "./queryRetry";

// Historial Pomodoro del usuario autenticado.
// La key cuelga de QUERY_KEYS.POMODORO_SESSIONS para que usePomodoro
// pueda invalidarla al guardar una sesión.
const useMyPomodoroSessions = () => {
  const sessionsQuery = useQuery({
    queryKey: [...QUERY_KEYS.POMODORO_SESSIONS, "my"],
    queryFn: getMyPomodoroSessions,
    enabled: hasToken(),
    // Nunca reintenta 401/403: un reintento no puede arreglarlos.
    retry: shouldRetryAdminQuery,
  });

  return {
    sessions: sessionsQuery.data,
    isLoading: sessionsQuery.isLoading,
    isError: sessionsQuery.isError,
    error: sessionsQuery.error,
  };
};

export default useMyPomodoroSessions;
