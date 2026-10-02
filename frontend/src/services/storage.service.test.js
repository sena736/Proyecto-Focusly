import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  getPomodoroDurations,
  savePomodoroDurations,
} from "./storage.service";
import { STORAGE_KEYS } from "../utils/constants";

const DEFAULTS = { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 };

describe("pomodoro durations storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses its own storage key", () => {
    expect(STORAGE_KEYS.POMODORO_DURATIONS).toBe("focusly_pomodoro_durations");
    expect(STORAGE_KEYS.POMODORO_DURATIONS).not.toBe(STORAGE_KEYS.THEME);
  });

  it("returns 25 / 5 / 15 when nothing is stored", () => {
    expect(getPomodoroDurations()).toEqual(DEFAULTS);
  });

  it("round-trips saved durations", () => {
    const durations = { focusMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 30 };

    expect(savePomodoroDurations(durations)).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.POMODORO_DURATIONS))).toEqual(durations);
    expect(getPomodoroDurations()).toEqual(durations);
  });

  it("does not persist invalid durations", () => {
    expect(
      savePomodoroDurations({ focusMinutes: 0, shortBreakMinutes: 5, longBreakMinutes: 15 }),
    ).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.POMODORO_DURATIONS)).toBeNull();
  });

  it("falls back to the defaults for corrupt JSON", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem(STORAGE_KEYS.POMODORO_DURATIONS, "{not json");

    expect(getPomodoroDurations()).toEqual(DEFAULTS);
  });

  it("falls back per key for invalid stored values", () => {
    localStorage.setItem(
      STORAGE_KEYS.POMODORO_DURATIONS,
      JSON.stringify({ focusMinutes: 40, shortBreakMinutes: "x", longBreakMinutes: 999 }),
    );

    expect(getPomodoroDurations()).toEqual({
      focusMinutes: 40,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
    });
  });

  it("falls back to the defaults when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(getPomodoroDurations()).toEqual(DEFAULTS);
  });

  it("reports false instead of throwing when localStorage cannot be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });

    expect(savePomodoroDurations(DEFAULTS)).toBe(false);
  });
});
