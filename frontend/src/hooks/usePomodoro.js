import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createPomodoroSession } from "../api/pomodoro.api";
import { POMODORO_DEFAULTS, QUERY_KEYS } from "../utils/constants";
import {
  POMODORO_MODES,
  nextModeAfterFocus,
  sessionTypeForMode,
} from "../utils/pomodoro";

const VALID_MODES = Object.values(POMODORO_MODES);

const usePomodoro = ({
  focusMinutes = POMODORO_DEFAULTS.FOCUS_MINUTES,
  shortBreakMinutes = POMODORO_DEFAULTS.SHORT_BREAK_MINUTES,
  longBreakMinutes = POMODORO_DEFAULTS.LONG_BREAK_MINUTES,
} = {}) => {
  const queryClient = useQueryClient();

  // Latest configured durations (read from timers and callbacks).
  const minutesRef = useRef({
    [POMODORO_MODES.FOCUS]: focusMinutes,
    [POMODORO_MODES.SHORT_BREAK]: shortBreakMinutes,
    [POMODORO_MODES.LONG_BREAK]: longBreakMinutes,
  });

  const modeRef = useRef(POMODORO_MODES.FOCUS);
  const completedRef = useRef(0);
  const isRunningRef = useRef(false);

  // Minutes that the idle display was last synchronised with.
  const appliedMinutesRef = useRef(focusMinutes);

  // Momento en que comenzó el ciclo actual.
  const startedAtRef = useRef(null);

  // Duración (en minutos) con la que comenzó el ciclo actual.
  const cycleMinutesRef = useRef(focusMinutes);

  // Timestamp exacto en el que debería terminar.
  const targetTimeRef = useRef(null);

  // Tiempo restante justo antes de pausar.
  const pausedRemainingRef = useRef(focusMinutes * 60);

  const intervalRef = useRef(null);

  const [mode, setMode] = useState(POMODORO_MODES.FOCUS);
  const [remainingSeconds, setRemainingSeconds] = useState(focusMinutes * 60);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  // True from the first start of a cycle until it finishes or is discarded.
  const [hasActiveCycle, setHasActiveCycle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remaining
    ).padStart(2, "0")}`;
  }, []);

  const setRunning = useCallback((value) => {
    isRunningRef.current = value;
    setIsRunning(value);
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Deja un modo parado, con su duración completa y sin ciclo en curso.
  const enterMode = useCallback(
    (nextMode) => {
      clearTimer();

      const minutes = minutesRef.current[nextMode];
      const duration = minutes * 60;

      modeRef.current = nextMode;
      appliedMinutesRef.current = minutes;

      setMode(nextMode);
      setRemainingSeconds(duration);
      setRunning(false);
      setHasActiveCycle(false);

      pausedRemainingRef.current = duration;
      startedAtRef.current = null;
      targetTimeRef.current = null;
    },
    [clearTimer, setRunning]
  );

  const saveSession = useCallback(
    async ({ sessionMode, startedAt, endedAt, minutes }) => {
      try {
        setIsLoading(true);
        setError(null);

        await createPomodoroSession({
          type: sessionTypeForMode(sessionMode),
          startedAt: new Date(startedAt).toISOString(),
          endedAt: new Date(endedAt).toISOString(),
          durationMinutes: minutes,
        });

        // El historial debe mostrar la sesión recién guardada.
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.POMODORO_SESSIONS,
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "No se pudo guardar la sesión Pomodoro."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  const finishCycle = useCallback(async () => {
    clearTimer();

    // The target is when the cycle really ended; a throttled or slept tab
    // only notices later, so never stamp a time past it.
    const endedAt = Math.min(Date.now(), targetTimeRef.current ?? Date.now());
    const finishedMode = modeRef.current;
    const startedAt = startedAtRef.current;
    const minutes = cycleMinutesRef.current;

    let nextMode = POMODORO_MODES.FOCUS;

    if (finishedMode === POMODORO_MODES.FOCUS) {
      completedRef.current += 1;
      setCompletedPomodoros(completedRef.current);

      nextMode = nextModeAfterFocus(completedRef.current);
    }

    // Cambiar automáticamente al siguiente ciclo.
    setIsFinished(true);
    enterMode(nextMode);

    if (startedAt) {
      await saveSession({
        sessionMode: finishedMode,
        startedAt,
        endedAt,
        minutes,
      });
    }
  }, [clearTimer, enterMode, saveSession]);

  const tick = useCallback(() => {
    if (!targetTimeRef.current) return;

    const difference = targetTimeRef.current - Date.now();

    if (difference <= 0) {
      finishCycle();
      return;
    }

    setRemainingSeconds(Math.ceil(difference / 1000));
  }, [finishCycle]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;

    setIsFinished(false);
    setError(null);

    const now = Date.now();

    // Si estaba pausado, usamos exactamente el tiempo restante.
    const secondsToRun = pausedRemainingRef.current;

    if (!startedAtRef.current) {
      startedAtRef.current = now;
      cycleMinutesRef.current = minutesRef.current[modeRef.current];
      setHasActiveCycle(true);
    }

    targetTimeRef.current = now + secondsToRun * 1000;

    setRunning(true);

    clearTimer();

    intervalRef.current = setInterval(tick, 250);

    tick();
  }, [clearTimer, setRunning, tick]);

  const pause = useCallback(() => {
    if (!isRunningRef.current || !targetTimeRef.current) {
      return;
    }

    const secondsRemaining = Math.max(
      0,
      Math.ceil((targetTimeRef.current - Date.now()) / 1000)
    );

    pausedRemainingRef.current = secondsRemaining;

    setRemainingSeconds(secondsRemaining);
    setRunning(false);

    clearTimer();
  }, [clearTimer, setRunning]);

  const reset = useCallback(() => {
    enterMode(modeRef.current);

    setIsFinished(false);
    setError(null);
  }, [enterMode]);

  // "Siguiente": avanza de fase SIN guardar ni contar la sesión.
  const skip = useCallback(() => {
    enterMode(
      modeRef.current === POMODORO_MODES.FOCUS
        ? POMODORO_MODES.SHORT_BREAK
        : POMODORO_MODES.FOCUS
    );

    setIsFinished(false);
    setError(null);
  }, [enterMode]);

  const changeMode = useCallback(
    (newMode) => {
      if (!VALID_MODES.includes(newMode)) return;

      enterMode(newMode);

      setIsFinished(false);
      setError(null);
    },
    [enterMode]
  );

  // Sincroniza las duraciones configuradas. Mientras hay un ciclo en curso
  // (corriendo o en pausa) se ignora el cambio visible; se aplica en la
  // siguiente fase.
  useEffect(() => {
    minutesRef.current = {
      [POMODORO_MODES.FOCUS]: focusMinutes,
      [POMODORO_MODES.SHORT_BREAK]: shortBreakMinutes,
      [POMODORO_MODES.LONG_BREAK]: longBreakMinutes,
    };

    if (isRunningRef.current || startedAtRef.current) return;

    if (minutesRef.current[modeRef.current] !== appliedMinutesRef.current) {
      enterMode(modeRef.current);
    }
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes, enterMode]);

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
    hasActiveCycle,
    isPaused: hasActiveCycle && !isRunning,
    isFinished,
    isLoading,
    error,

    completedPomodoros,

    durationMinutes: {
      [POMODORO_MODES.FOCUS]: focusMinutes,
      [POMODORO_MODES.SHORT_BREAK]: shortBreakMinutes,
      [POMODORO_MODES.LONG_BREAK]: longBreakMinutes,
    }[mode],

    start,
    pause,
    reset,
    skip,
    changeMode,
  };
};

export default usePomodoro;
