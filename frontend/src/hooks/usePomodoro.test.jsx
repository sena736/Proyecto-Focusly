import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../api/pomodoro.api", () => ({
  createPomodoroSession: vi.fn(),
}));

import { createPomodoroSession } from "../api/pomodoro.api";
import usePomodoro from "./usePomodoro";

const MINUTE = 60 * 1000;

let queryClient;

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const setup = (initialProps) =>
  renderHook((props) => usePomodoro(props), { wrapper, initialProps });

const advance = async (ms) => {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
};

// Starts the current mode and lets it run to completion.
const completeCycle = async (result, minutes) => {
  act(() => result.current.start());
  await advance(minutes * MINUTE);
};

describe("usePomodoro", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T10:00:00.000Z"));
    vi.clearAllMocks();
    createPomodoroSession.mockResolvedValue({ data: { id: 1 } });
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state and durations", () => {
    it("starts idle in focus mode with 25 minutes and no completed pomodoros", () => {
      const { result } = setup();

      expect(result.current.mode).toBe("focus");
      expect(result.current.formattedTime).toBe("25:00");
      expect(result.current.remainingSeconds).toBe(1500);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.isFinished).toBe(false);
      expect(result.current.completedPomodoros).toBe(0);
      expect(result.current.durationMinutes).toBe(25);
    });

    it("uses the durations passed as params for each mode", () => {
      const { result } = setup({ focusMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 30 });

      expect(result.current.formattedTime).toBe("50:00");

      act(() => result.current.changeMode("shortBreak"));
      expect(result.current.formattedTime).toBe("10:00");
      expect(result.current.durationMinutes).toBe(10);

      act(() => result.current.changeMode("longBreak"));
      expect(result.current.formattedTime).toBe("30:00");
      expect(result.current.durationMinutes).toBe(30);
    });

    it("changeMode ignores unknown modes", () => {
      const { result } = setup();

      act(() => result.current.changeMode("nap"));

      expect(result.current.mode).toBe("focus");
    });
  });

  describe("timestamp-based ticking, pause and resume", () => {
    it("counts down while running", async () => {
      const { result } = setup();

      act(() => result.current.start());
      expect(result.current.isRunning).toBe(true);

      await advance(10 * 1000);

      expect(result.current.formattedTime).toBe("24:50");
    });

    it("keeps counting from wall-clock time even if interval ticks are throttled", async () => {
      const { result } = setup();

      act(() => result.current.start());
      // A background tab fires one late tick: Date jumps 5 minutes at once.
      await act(async () => {
        vi.setSystemTime(Date.now() + 5 * MINUTE);
        vi.advanceTimersByTime(250);
      });

      expect(result.current.formattedTime).toBe("20:00");
    });

    it("pause freezes the remaining time and resume continues from it", async () => {
      const { result } = setup();

      act(() => result.current.start());
      await advance(30 * 1000);
      act(() => result.current.pause());

      expect(result.current.isRunning).toBe(false);
      expect(result.current.formattedTime).toBe("24:30");

      await advance(60 * 1000);
      expect(result.current.formattedTime).toBe("24:30");

      act(() => result.current.start());
      await advance(10 * 1000);

      expect(result.current.formattedTime).toBe("24:20");
      expect(createPomodoroSession).not.toHaveBeenCalled();
    });

    it("start is a no-op while already running", async () => {
      const { result } = setup();

      act(() => result.current.start());
      await advance(5 * 1000);
      act(() => result.current.start());

      expect(result.current.formattedTime).toBe("24:55");
    });
  });

  describe("saving completed cycles", () => {
    it("saves a finished focus cycle as WORK with its real duration and timestamps", async () => {
      const { result } = setup();
      const startedAt = Date.now();

      await completeCycle(result, 25);

      expect(createPomodoroSession).toHaveBeenCalledTimes(1);
      expect(createPomodoroSession).toHaveBeenCalledWith({
        type: "WORK",
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(startedAt + 25 * MINUTE).toISOString(),
        durationMinutes: 25,
      });
    });

    it("moves to the short break, counts the pomodoro and flags the finished cycle", async () => {
      const { result } = setup();

      await completeCycle(result, 25);

      expect(result.current.mode).toBe("shortBreak");
      expect(result.current.formattedTime).toBe("05:00");
      expect(result.current.completedPomodoros).toBe(1);
      expect(result.current.isFinished).toBe(true);
      expect(result.current.isRunning).toBe(false);
    });

    it("saves a finished short break as BREAK with the short break duration, then returns to focus", async () => {
      const { result } = setup({ focusMinutes: 25, shortBreakMinutes: 7, longBreakMinutes: 15 });

      act(() => result.current.changeMode("shortBreak"));
      await completeCycle(result, 7);

      expect(createPomodoroSession).toHaveBeenCalledWith(
        expect.objectContaining({ type: "BREAK", durationMinutes: 7 }),
      );
      expect(result.current.mode).toBe("focus");
      expect(result.current.completedPomodoros).toBe(0);
    });

    it("gives a long break (saved as BREAK with its own duration) after every 4th focus session", async () => {
      const { result } = setup({ focusMinutes: 1, shortBreakMinutes: 1, longBreakMinutes: 15 });

      for (let round = 1; round <= 3; round += 1) {
        await completeCycle(result, 1); // focus
        expect(result.current.mode).toBe("shortBreak");
        await completeCycle(result, 1); // short break
        expect(result.current.mode).toBe("focus");
      }

      await completeCycle(result, 1); // 4th focus

      expect(result.current.completedPomodoros).toBe(4);
      expect(result.current.mode).toBe("longBreak");
      expect(result.current.formattedTime).toBe("15:00");

      await completeCycle(result, 15);

      expect(createPomodoroSession).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: "BREAK", durationMinutes: 15 }),
      );
      expect(result.current.mode).toBe("focus");
      expect(createPomodoroSession).toHaveBeenCalledTimes(8);
    });

    it("invalidates the pomodoro history query once the session is saved", async () => {
      const spy = vi.spyOn(queryClient, "invalidateQueries");
      const { result } = setup();

      await completeCycle(result, 25);

      expect(spy).toHaveBeenCalledWith({ queryKey: ["pomodoro-sessions"] });
    });

    it("shows the saving state while the request is in flight", async () => {
      let resolveSave;
      createPomodoroSession.mockReturnValue(
        new Promise((resolve) => {
          resolveSave = resolve;
        }),
      );
      const { result } = setup();

      await completeCycle(result, 25);
      expect(result.current.isLoading).toBe(true);

      await act(async () => resolveSave({}));
      expect(result.current.isLoading).toBe(false);
    });

    it("exposes the server message on failure, still advances, and does not invalidate the history", async () => {
      createPomodoroSession.mockRejectedValue({
        response: { data: { message: "Boom" } },
      });
      const spy = vi.spyOn(queryClient, "invalidateQueries");
      const { result } = setup();

      await completeCycle(result, 25);

      expect(result.current.error).toBe("Boom");
      expect(result.current.mode).toBe("shortBreak");
      expect(spy).not.toHaveBeenCalled();
    });

    it("falls back to a friendly message when the error has no server message", async () => {
      createPomodoroSession.mockRejectedValue(new Error("network"));
      const { result } = setup();

      await completeCycle(result, 25);

      expect(result.current.error).toBe("No se pudo guardar la sesión Pomodoro.");
    });

    it("saves the duration the cycle started with even if the setting changes mid-cycle", async () => {
      const { result, rerender } = setup({
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      });

      act(() => result.current.start());
      await advance(1 * MINUTE);
      rerender({ focusMinutes: 40, shortBreakMinutes: 5, longBreakMinutes: 15 });
      await advance(24 * MINUTE);

      expect(createPomodoroSession).toHaveBeenCalledWith(
        expect.objectContaining({ type: "WORK", durationMinutes: 25 }),
      );
    });
  });

  describe("cycles that are NOT saved", () => {
    it("skip advances focus -> short break without saving or counting", async () => {
      const { result } = setup();

      act(() => result.current.start());
      await advance(5 * 1000);
      act(() => result.current.skip());

      expect(result.current.mode).toBe("shortBreak");
      expect(result.current.formattedTime).toBe("05:00");
      expect(result.current.isRunning).toBe(false);
      expect(result.current.completedPomodoros).toBe(0);
      expect(result.current.isFinished).toBe(false);
      expect(createPomodoroSession).not.toHaveBeenCalled();

      await advance(10 * MINUTE);
      expect(createPomodoroSession).not.toHaveBeenCalled();
    });

    it("skip advances any break -> focus without saving", () => {
      const { result } = setup();

      act(() => result.current.changeMode("longBreak"));
      act(() => result.current.skip());
      expect(result.current.mode).toBe("focus");

      act(() => result.current.changeMode("shortBreak"));
      act(() => result.current.skip());
      expect(result.current.mode).toBe("focus");

      expect(createPomodoroSession).not.toHaveBeenCalled();
    });

    it("reset restores the full duration and never saves", async () => {
      const { result } = setup();

      act(() => result.current.start());
      await advance(2 * MINUTE);
      act(() => result.current.reset());

      expect(result.current.formattedTime).toBe("25:00");
      expect(result.current.isRunning).toBe(false);

      await advance(30 * MINUTE);
      expect(result.current.formattedTime).toBe("25:00");
      expect(createPomodoroSession).not.toHaveBeenCalled();
    });

    it("changing mode mid-cycle never saves", async () => {
      const { result } = setup();

      act(() => result.current.start());
      await advance(2 * MINUTE);
      act(() => result.current.changeMode("shortBreak"));

      expect(result.current.mode).toBe("shortBreak");
      expect(result.current.isRunning).toBe(false);
      expect(createPomodoroSession).not.toHaveBeenCalled();
    });

    it("unmounting mid-cycle stops the timer without saving", async () => {
      const { result, unmount } = setup();

      act(() => result.current.start());
      unmount();
      await advance(30 * MINUTE);

      expect(createPomodoroSession).not.toHaveBeenCalled();
    });
  });

  describe("changing durations", () => {
    it("updates the displayed time when the current mode's duration changes while idle", () => {
      const { result, rerender } = setup({
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      });

      rerender({ focusMinutes: 30, shortBreakMinutes: 5, longBreakMinutes: 15 });

      expect(result.current.formattedTime).toBe("30:00");
      expect(result.current.durationMinutes).toBe(30);
    });

    it("does not touch the display when another mode's duration changes", async () => {
      const { result, rerender } = setup({
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      });

      act(() => result.current.start());
      await advance(1 * MINUTE);
      act(() => result.current.pause());

      rerender({ focusMinutes: 25, shortBreakMinutes: 9, longBreakMinutes: 15 });

      expect(result.current.formattedTime).toBe("24:00");
    });

    it("ignores a change while the timer is running and applies it on the next phase", async () => {
      const { result, rerender } = setup({
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      });

      act(() => result.current.start());
      await advance(1 * MINUTE);
      rerender({ focusMinutes: 25, shortBreakMinutes: 8, longBreakMinutes: 15 });

      expect(result.current.formattedTime).toBe("24:00");
      expect(result.current.isRunning).toBe(true);

      await advance(24 * MINUTE);

      expect(result.current.mode).toBe("shortBreak");
      expect(result.current.formattedTime).toBe("08:00");
    });

    it("keeps a paused mid-cycle intact when the current duration changes", async () => {
      const { result, rerender } = setup({
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      });

      act(() => result.current.start());
      await advance(15 * MINUTE);
      act(() => result.current.pause());
      expect(result.current.formattedTime).toBe("10:00");

      rerender({ focusMinutes: 26, shortBreakMinutes: 5, longBreakMinutes: 15 });

      expect(result.current.formattedTime).toBe("10:00");
      expect(result.current.hasActiveCycle).toBe(true);
      expect(result.current.isPaused).toBe(true);

      // Resuming still finishes the ORIGINAL cycle, saved with its real startedAt.
      const startedAt = Date.now() - 15 * MINUTE;
      act(() => result.current.start());
      await advance(10 * MINUTE);

      expect(createPomodoroSession).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "WORK",
          durationMinutes: 25,
          startedAt: new Date(startedAt).toISOString(),
        }),
      );
    });

    it("applies the new duration at the next phase after a paused cycle finishes", async () => {
      const { result, rerender } = setup({
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      });

      act(() => result.current.start());
      await advance(1 * MINUTE);
      act(() => result.current.pause());
      rerender({ focusMinutes: 30, shortBreakMinutes: 5, longBreakMinutes: 15 });

      act(() => result.current.start());
      await advance(24 * MINUTE);
      act(() => result.current.changeMode("focus"));

      expect(result.current.formattedTime).toBe("30:00");
    });

    it("still applies a duration change immediately on a fresh, untouched cycle", () => {
      const { result, rerender } = setup({
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      });

      expect(result.current.hasActiveCycle).toBe(false);
      expect(result.current.isPaused).toBe(false);

      rerender({ focusMinutes: 26, shortBreakMinutes: 5, longBreakMinutes: 15 });

      expect(result.current.formattedTime).toBe("26:00");
    });

    it("makes durations editable again after reset", async () => {
      const { result, rerender } = setup({
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      });

      act(() => result.current.start());
      await advance(1 * MINUTE);
      act(() => result.current.pause());
      rerender({ focusMinutes: 26, shortBreakMinutes: 5, longBreakMinutes: 15 });
      expect(result.current.formattedTime).toBe("24:00");

      act(() => result.current.reset());

      expect(result.current.hasActiveCycle).toBe(false);
      expect(result.current.formattedTime).toBe("26:00");

      rerender({ focusMinutes: 27, shortBreakMinutes: 5, longBreakMinutes: 15 });
      expect(result.current.formattedTime).toBe("27:00");
    });
  });

  describe("active cycle and paused flags", () => {
    it("hasActiveCycle is true from the first start; isPaused only while stopped mid-cycle", async () => {
      const { result } = setup();

      act(() => result.current.start());
      expect(result.current.hasActiveCycle).toBe(true);
      expect(result.current.isPaused).toBe(false);

      await advance(5 * 1000);
      act(() => result.current.pause());
      expect(result.current.hasActiveCycle).toBe(true);
      expect(result.current.isPaused).toBe(true);

      act(() => result.current.start());
      expect(result.current.isPaused).toBe(false);
    });

    it("clears both flags when the cycle finishes, is skipped, reset or the mode changes", async () => {
      const { result } = setup();

      await completeCycle(result, 25);
      expect(result.current.hasActiveCycle).toBe(false);
      expect(result.current.isPaused).toBe(false);

      act(() => result.current.start());
      act(() => result.current.skip());
      expect(result.current.hasActiveCycle).toBe(false);

      act(() => result.current.start());
      act(() => result.current.changeMode("longBreak"));
      expect(result.current.hasActiveCycle).toBe(false);

      act(() => result.current.start());
      act(() => result.current.pause());
      act(() => result.current.reset());
      expect(result.current.hasActiveCycle).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe("endedAt accuracy", () => {
    it("stamps endedAt at the real target even if the finishing tick arrives hours late", async () => {
      const { result } = setup();
      const startedAt = Date.now();

      act(() => result.current.start());
      // The tab slept: the first tick after the target fires 3 hours late.
      await act(async () => {
        vi.setSystemTime(Date.now() + 3 * 60 * MINUTE);
        vi.advanceTimersByTime(250);
      });

      expect(createPomodoroSession).toHaveBeenCalledWith({
        type: "WORK",
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(startedAt + 25 * MINUTE).toISOString(),
        durationMinutes: 25,
      });
    });
  });

  describe("errors of in-flight saves", () => {
    it("does not lose an error from a save that was still pending when the next cycle started", async () => {
      let rejectSave;
      createPomodoroSession.mockReturnValue(
        new Promise((_, reject) => {
          rejectSave = reject;
        }),
      );
      const { result } = setup();

      await completeCycle(result, 25);
      expect(result.current.isLoading).toBe(true);

      act(() => result.current.start());
      await act(async () => rejectSave(new Error("network")));

      expect(result.current.error).toBe("No se pudo guardar la sesión Pomodoro.");
    });
  });
});
