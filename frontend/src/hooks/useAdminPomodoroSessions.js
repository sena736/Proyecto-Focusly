import { useQuery } from "@tanstack/react-query";

import { getPomodoroSessions } from "../api/pomodoro.api";
import { shouldRetryAdminQuery } from "./queryRetry";

// Todas las sesiones Pomodoro (endpoint exclusivo de ADMIN).
const useAdminPomodoroSessions = () => {
  const sessionsQuery = useQuery({
    queryKey: ["admin", "pomodoro-sessions"],
    queryFn: getPomodoroSessions,
    retry: shouldRetryAdminQuery,
  });

  return {
    sessions: sessionsQuery.data,
    isLoading: sessionsQuery.isLoading,
    isError: sessionsQuery.isError,
    error: sessionsQuery.error,
  };
};

export default useAdminPomodoroSessions;
