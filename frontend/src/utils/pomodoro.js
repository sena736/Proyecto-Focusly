// src/utils/pomodoro.js

import { POMODORO_DEFAULTS, POMODORO_TYPES } from "./constants";

/* =========================================================
   FOCUSLY - REGLAS DEL POMODORO
========================================================= */

export const POMODORO_MODES = {
  FOCUS: "focus",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak",
};

const DEFAULT_DURATIONS = {
  focusMinutes: POMODORO_DEFAULTS.FOCUS_MINUTES,
  shortBreakMinutes: POMODORO_DEFAULTS.SHORT_BREAK_MINUTES,
  longBreakMinutes: POMODORO_DEFAULTS.LONG_BREAK_MINUTES,
};

const isValidMinutes = (value) =>
  Number.isInteger(value) &&
  value >= POMODORO_DEFAULTS.MIN_MINUTES &&
  value <= POMODORO_DEFAULTS.MAX_MINUTES;

/** Forces a duration into the 1..90 minute range (whole minutes). */
export const clampMinutes = (value) =>
  Math.min(
    POMODORO_DEFAULTS.MAX_MINUTES,
    Math.max(POMODORO_DEFAULTS.MIN_MINUTES, Math.round(value)),
  );

/**
 * Validates a stored / external durations object. Every key that is not a whole
 * number of minutes between 1 and 90 falls back to its default (25 / 5 / 15).
 */
export const sanitizeDurations = (raw) => {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};

  return Object.fromEntries(
    Object.entries(DEFAULT_DURATIONS).map(([key, fallback]) => [
      key,
      isValidMinutes(source[key]) ? source[key] : fallback,
    ]),
  );
};

/**
 * The backend only accepts the PomodoroType enum (WORK | BREAK): focus is WORK
 * and both break kinds are BREAK (the real length goes in durationMinutes).
 */
export const sessionTypeForMode = (mode) =>
  mode === POMODORO_MODES.FOCUS ? POMODORO_TYPES.WORK : POMODORO_TYPES.BREAK;

/** Long break after every 4th completed focus session, short break otherwise. */
export const nextModeAfterFocus = (completedFocusSessions) =>
  completedFocusSessions > 0 &&
  completedFocusSessions % POMODORO_DEFAULTS.LONG_BREAK_EVERY === 0
    ? POMODORO_MODES.LONG_BREAK
    : POMODORO_MODES.SHORT_BREAK;
