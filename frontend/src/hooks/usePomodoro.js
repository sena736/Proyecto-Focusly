import { useCallback, useEffect, useRef, useState } from "react";
import { createPomodoroSession } from "../api/pomodoro.api";

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

const usePomodoro = ({
  workMinutes = DEFAULT_WORK_MINUTES,
  breakMinutes = DEFAULT_BREAK_MINUTES,
} = {}) => {
  const [mode, setMode] = useState("work");
  const [remainingSeconds, setRemainingSeconds] = useState(
    workMinutes * 60
  );

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);

  // Momento en que comenzó el ciclo actual.
  const startedAtRef = useRef(null);

  // Timestamp exacto en el que debería terminar.
  const targetTimeRef = useRef(null);

  // Tiempo restante justo antes de pausar.
  const pausedRemainingRef = useRef(workMinutes * 60);

  const intervalRef = useRef(null);

  const durationSeconds =
    mode === "work"
      ? workMinutes * 60
      : breakMinutes * 60;

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remaining
    ).padStart(2, "0")}`;
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const saveSession = useCallback(async (endedAt) => {
    if (!startedAtRef.current) return;

    const startedAt = startedAtRef.current;

    const sessionData = {
      type: mode,
      startedAt: new Date(startedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      durationMinutes:
        mode === "work" ? workMinutes : breakMinutes,
    };

    try {
      setIsLoading(true);
      setError(null);

      await createPomodoroSession(sessionData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo guardar la sesión Pomodoro."
      );
    } finally {
      setIsLoading(false);
    }
  }, [mode, workMinutes, breakMinutes]);

  const finishCycle = useCallback(async () => {
    clearTimer();

    const endedAt = Date.now();

    setRemainingSeconds(0);
    setIsRunning(false);
    setIsFinished(true);

    await saveSession(endedAt);

    // Cambiar automáticamente al siguiente ciclo.
    const nextMode = mode === "work" ? "break" : "work";

    setMode(nextMode);

    const nextDuration =
      nextMode === "work"
        ? workMinutes * 60
        : breakMinutes * 60;

    setRemainingSeconds(nextDuration);
    pausedRemainingRef.current = nextDuration;
    startedAtRef.current = null;
    targetTimeRef.current = null;
  }, [
    clearTimer,
    saveSession,
    mode,
    workMinutes,
    breakMinutes,
  ]);

  const tick = useCallback(() => {
    if (!targetTimeRef.current) return;

    const now = Date.now();
    const difference = targetTimeRef.current - now;

    if (difference <= 0) {
      setRemainingSeconds(0);
      finishCycle();
      return;
    }

    setRemainingSeconds(Math.ceil(difference / 1000));
  }, [finishCycle]);

  const start = useCallback(() => {
    if (isRunning) return;

    setIsFinished(false);
    setError(null);

    const now = Date.now();

    // Si estaba pausado, usamos exactamente el tiempo restante.
    const secondsToRun = pausedRemainingRef.current;

    if (!startedAtRef.current) {
      startedAtRef.current = now;
    }

    targetTimeRef.current =
      now + secondsToRun * 1000;

    setIsRunning(true);

    clearTimer();

    intervalRef.current = setInterval(tick, 250);

    tick();
  }, [isRunning, clearTimer, tick]);

  const pause = useCallback(() => {
    if (!isRunning || !targetTimeRef.current) {
      return;
    }

    const now = Date.now();

    const difference =
      targetTimeRef.current - now;

    const secondsRemaining = Math.max(
      0,
      Math.ceil(difference / 1000)
    );

    pausedRemainingRef.current = secondsRemaining;

    setRemainingSeconds(secondsRemaining);
    setIsRunning(false);

    clearTimer();
  }, [isRunning, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();

    const duration =
      mode === "work"
        ? workMinutes * 60
        : breakMinutes * 60;

    setRemainingSeconds(duration);
    pausedRemainingRef.current = duration;

    setIsRunning(false);
    setIsFinished(false);
    setError(null);

    startedAtRef.current = null;
    targetTimeRef.current = null;
  }, [
    clearTimer,
    mode,
    workMinutes,
    breakMinutes,
  ]);

  const changeMode = useCallback(
    (newMode) => {
      clearTimer();

      const duration =
        newMode === "work"
          ? workMinutes * 60
          : breakMinutes * 60;

      setMode(newMode);
      setRemainingSeconds(duration);
      pausedRemainingRef.current = duration;

      setIsRunning(false);
      setIsFinished(false);
      setError(null);

      startedAtRef.current = null;
      targetTimeRef.current = null;
    },
    [clearTimer, workMinutes, breakMinutes]
  );

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    mode,
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),

    isRunning,
    isFinished,
    isLoading,
    error,

    durationMinutes:
      mode === "work"
        ? workMinutes
        : breakMinutes,

    start,
    pause,
    reset,
    changeMode,
  };
};

export default usePomodoro;
