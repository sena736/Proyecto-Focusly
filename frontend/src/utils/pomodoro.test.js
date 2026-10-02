import { describe, it, expect } from "vitest";

import {
  POMODORO_MODES,
  clampMinutes,
  sanitizeDurations,
  sessionTypeForMode,
  nextModeAfterFocus,
} from "./pomodoro";
import { POMODORO_DEFAULTS, POMODORO_TYPES } from "./constants";

describe("clampMinutes", () => {
  it.each([
    [0, 1],
    [-5, 1],
    [1, 1],
    [25, 25],
    [90, 90],
    [91, 90],
    [1000, 90],
  ])("clamps %s to %s", (value, expected) => {
    expect(clampMinutes(value)).toBe(expected);
  });

  it("rounds non-integers", () => {
    expect(clampMinutes(24.6)).toBe(25);
  });
});

describe("sanitizeDurations", () => {
  it("keeps valid values", () => {
    expect(
      sanitizeDurations({ focusMinutes: 30, shortBreakMinutes: 7, longBreakMinutes: 20 }),
    ).toEqual({ focusMinutes: 30, shortBreakMinutes: 7, longBreakMinutes: 20 });
  });

  it("falls back to 25 / 5 / 15 for anything that is not an integer between 1 and 90", () => {
    expect(
      sanitizeDurations({ focusMinutes: "abc", shortBreakMinutes: 0, longBreakMinutes: 500 }),
    ).toEqual({ focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 });
    expect(
      sanitizeDurations({ focusMinutes: 2.5, shortBreakMinutes: null, longBreakMinutes: NaN }),
    ).toEqual({ focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 });
  });

  it("only falls back the invalid keys", () => {
    expect(sanitizeDurations({ focusMinutes: 40, shortBreakMinutes: -1 })).toEqual({
      focusMinutes: 40,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
    });
  });

  it.each([null, undefined, "x", 42, []])("returns the defaults for %j", (raw) => {
    expect(sanitizeDurations(raw)).toEqual({
      focusMinutes: POMODORO_DEFAULTS.FOCUS_MINUTES,
      shortBreakMinutes: POMODORO_DEFAULTS.SHORT_BREAK_MINUTES,
      longBreakMinutes: POMODORO_DEFAULTS.LONG_BREAK_MINUTES,
    });
  });
});

describe("sessionTypeForMode", () => {
  it("maps focus to the backend WORK enum and both breaks to BREAK", () => {
    expect(sessionTypeForMode(POMODORO_MODES.FOCUS)).toBe(POMODORO_TYPES.WORK);
    expect(sessionTypeForMode(POMODORO_MODES.SHORT_BREAK)).toBe(POMODORO_TYPES.BREAK);
    expect(sessionTypeForMode(POMODORO_MODES.LONG_BREAK)).toBe(POMODORO_TYPES.BREAK);
    expect(POMODORO_TYPES).toEqual({ WORK: "WORK", BREAK: "BREAK" });
  });
});

describe("nextModeAfterFocus", () => {
  it.each([
    [1, POMODORO_MODES.SHORT_BREAK],
    [2, POMODORO_MODES.SHORT_BREAK],
    [3, POMODORO_MODES.SHORT_BREAK],
    [4, POMODORO_MODES.LONG_BREAK],
    [5, POMODORO_MODES.SHORT_BREAK],
    [8, POMODORO_MODES.LONG_BREAK],
  ])("after %s completed focus sessions comes %s", (completed, expected) => {
    expect(nextModeAfterFocus(completed)).toBe(expected);
  });
});
