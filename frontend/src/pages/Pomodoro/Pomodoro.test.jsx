import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, fireEvent, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Pomodoro from "./Pomodoro";
import usePomodoro from "../../hooks/usePomodoro";
import useMyPomodoroSessions from "../../hooks/useMyPomodoroSessions";
import { createPomodoroSession } from "../../api/pomodoro.api";
import { STORAGE_KEYS } from "../../utils/constants";

vi.mock("../../hooks/usePomodoro");
vi.mock("../../api/pomodoro.api", () => ({
  createPomodoroSession: vi.fn().mockResolvedValue({}),
}));

// History has its own tests; here only the timer wiring is under test.
vi.mock("../../hooks/useMyPomodoroSessions");
vi.mock("../../components/pomodoro/PomodoroHistory/PomodoroHistory", () => ({
  default: ({ sessions, isLoading, isError }) => (
    <div
      data-testid="history"
      data-loading={String(isLoading)}
      data-error={String(isError)}
      data-count={sessions ? sessions.length : "none"}
    />
  ),
}));

const makeState = (overrides = {}) => ({
  mode: "focus",
  remainingSeconds: 1500,
  formattedTime: "25:00",
  isRunning: false,
  isPaused: false,
  hasActiveCycle: false,
  isFinished: false,
  isLoading: false,
  error: null,
  completedPomodoros: 0,
  durationMinutes: 25,
  start: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  skip: vi.fn(),
  changeMode: vi.fn(),
  ...overrides,
});

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <Pomodoro />
    </QueryClientProvider>,
  );
};

describe("Pomodoro page", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useMyPomodoroSessions.mockReturnValue({
      sessions: [],
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders its heading and subtitle through PageHeader", () => {
    usePomodoro.mockReturnValue(makeState());

    const { container } = renderPage();

    const header = container.querySelector("header.focusly-page-header");

    expect(header).not.toBeNull();
    expect(
      within(header).getByRole("heading", { level: 1, name: "Pomodoro" }),
    ).toBeInTheDocument();
    expect(
      within(header).getByText(/concéntrate, trabaja con propósito/i),
    ).toBeInTheDocument();
  });

  it("renders exactly one h1 and keeps the widgets", () => {
    usePomodoro.mockReturnValue(makeState());

    renderPage();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("25:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reiniciar temporizador" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aumentar tiempo de trabajo" })).toBeInTheDocument();
    expect(screen.getByTestId("history")).toBeInTheDocument();
  });

  describe("one source of truth for the timer", () => {
    it("shows the hook's time and completed counter in the timer card", () => {
      usePomodoro.mockReturnValue(
        makeState({ formattedTime: "07:42", completedPomodoros: 2, mode: "shortBreak" }),
      );

      renderPage();

      expect(screen.getByText("07:42")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Descanso corto" })).toHaveClass("active");
    });

    it("has only ONE start button on the page", () => {
      usePomodoro.mockReturnValue(makeState());

      renderPage();

      expect(screen.getAllByRole("button", { name: /^iniciar/i })).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: /reiniciar/i })).toHaveLength(1);
    });

    it("shows the running state exactly once (a single Pausar, no Iniciar)", () => {
      usePomodoro.mockReturnValue(makeState({ isRunning: true }));

      renderPage();

      expect(screen.getAllByRole("button", { name: /pausar/i })).toHaveLength(1);
      expect(screen.queryByRole("button", { name: /^iniciar/i })).toBeNull();
    });

    it("wires Iniciar, Pausar, Reiniciar and Siguiente to the hook", () => {
      const idle = makeState();
      usePomodoro.mockReturnValue(idle);
      const { unmount } = renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Iniciar temporizador" }));
      fireEvent.click(screen.getByRole("button", { name: "Reiniciar temporizador" }));
      fireEvent.click(screen.getByRole("button", { name: "Siguiente fase" }));

      expect(idle.start).toHaveBeenCalledTimes(1);
      expect(idle.reset).toHaveBeenCalledTimes(1);
      expect(idle.skip).toHaveBeenCalledTimes(1);
      unmount();

      const running = makeState({ isRunning: true });
      usePomodoro.mockReturnValue(running);
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Pausar temporizador" }));

      expect(running.pause).toHaveBeenCalledTimes(1);
    });

    it("clicking a mode tab calls changeMode", () => {
      const state = makeState();
      usePomodoro.mockReturnValue(state);

      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Descanso largo" }));

      expect(state.changeMode).toHaveBeenCalledWith("longBreak");
    });
  });

  describe("settings", () => {
    it("starts from 25 / 5 / 15 and feeds the durations to the hook", () => {
      usePomodoro.mockReturnValue(makeState());

      renderPage();

      expect(usePomodoro).toHaveBeenLastCalledWith({
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      });
    });

    it("changing a duration updates the hook params and persists them", () => {
      usePomodoro.mockReturnValue(makeState());

      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Aumentar tiempo de trabajo" }));
      fireEvent.click(screen.getByRole("button", { name: "Disminuir descanso largo" }));

      expect(usePomodoro).toHaveBeenLastCalledWith({
        focusMinutes: 26,
        shortBreakMinutes: 5,
        longBreakMinutes: 14,
      });
      expect(screen.getByText("26")).toBeInTheDocument();
      expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.POMODORO_DURATIONS))).toEqual({
        focusMinutes: 26,
        shortBreakMinutes: 5,
        longBreakMinutes: 14,
      });
    });

    it("restores the persisted durations on load", () => {
      localStorage.setItem(
        STORAGE_KEYS.POMODORO_DURATIONS,
        JSON.stringify({ focusMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 30 }),
      );
      usePomodoro.mockReturnValue(makeState());

      renderPage();

      expect(usePomodoro).toHaveBeenLastCalledWith({
        focusMinutes: 50,
        shortBreakMinutes: 10,
        longBreakMinutes: 30,
      });
    });

    it("falls back to 25 / 5 / 15 when the stored durations are invalid", () => {
      localStorage.setItem(STORAGE_KEYS.POMODORO_DURATIONS, JSON.stringify({ focusMinutes: 999 }));
      usePomodoro.mockReturnValue(makeState());

      renderPage();

      expect(usePomodoro).toHaveBeenLastCalledWith({
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      });
    });

    it("locks the settings while the timer is running", () => {
      usePomodoro.mockReturnValue(makeState({ isRunning: true }));

      renderPage();

      expect(screen.getByRole("button", { name: "Aumentar tiempo de trabajo" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Disminuir descanso corto" })).toBeDisabled();
    });

    it("locks the settings while paused mid-cycle and explains why", () => {
      usePomodoro.mockReturnValue(makeState({ isPaused: true, hasActiveCycle: true }));

      renderPage();

      expect(screen.getByRole("button", { name: "Aumentar tiempo de trabajo" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Disminuir descanso largo" })).toBeDisabled();
      expect(screen.getByText("Reiniciá el ciclo para cambiar las duraciones.")).toBeInTheDocument();
    });

    it("keeps the settings editable on a fresh cycle", () => {
      usePomodoro.mockReturnValue(makeState());

      renderPage();

      expect(screen.getByRole("button", { name: "Aumentar tiempo de trabajo" })).toBeEnabled();
      expect(screen.queryByText(/Reiniciá el ciclo/)).toBeNull();
    });
  });

  describe("paused state", () => {
    it("shows Continuar (not Iniciar) when the hook reports paused", () => {
      usePomodoro.mockReturnValue(makeState({ isPaused: true, hasActiveCycle: true }));

      renderPage();

      expect(screen.getByRole("button", { name: "Continuar temporizador" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Iniciar temporizador" })).toBeNull();
    });

    it("shows Iniciar on a fresh timer", () => {
      usePomodoro.mockReturnValue(makeState());

      renderPage();

      expect(screen.getByRole("button", { name: "Iniciar temporizador" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Continuar temporizador" })).toBeNull();
    });
  });

  describe("history", () => {
    it("passes the real sessions from useMyPomodoroSessions to the history", () => {
      usePomodoro.mockReturnValue(makeState());
      useMyPomodoroSessions.mockReturnValue({
        sessions: [{ id: 1 }, { id: 2 }, { id: 3 }],
        isLoading: false,
        isError: false,
      });

      renderPage();

      const history = screen.getByTestId("history");
      expect(history).toHaveAttribute("data-count", "3");
      expect(history).toHaveAttribute("data-loading", "false");
      expect(history).toHaveAttribute("data-error", "false");
    });

    it("passes the loading and error states through", () => {
      usePomodoro.mockReturnValue(makeState());
      useMyPomodoroSessions.mockReturnValue({
        sessions: undefined,
        isLoading: true,
        isError: true,
      });

      renderPage();

      const history = screen.getByTestId("history");
      expect(history).toHaveAttribute("data-loading", "true");
      expect(history).toHaveAttribute("data-error", "true");
      expect(history).toHaveAttribute("data-count", "none");
    });
  });

  describe("feedback", () => {
    it("shows the finished-cycle notification", () => {
      usePomodoro.mockReturnValue(makeState({ isFinished: true }));

      renderPage();

      expect(screen.getByRole("status")).toHaveTextContent("¡Ciclo terminado!");
    });

    it("shows the error alert", () => {
      usePomodoro.mockReturnValue(makeState({ error: "No se pudo guardar la sesión Pomodoro." }));

      renderPage();

      expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar");
    });

    it("shows the saving text", () => {
      usePomodoro.mockReturnValue(makeState({ isLoading: true }));

      renderPage();

      expect(screen.getByText("Guardando sesión...")).toBeInTheDocument();
    });
  });

  describe("with the real hook", () => {
    it("starts counting from the page and shows a single running control", async () => {
      vi.useFakeTimers();
      const actual = await vi.importActual("../../hooks/usePomodoro");
      usePomodoro.mockImplementation(actual.default);

      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Iniciar temporizador" }));

      await act(async () => {
        vi.advanceTimersByTime(5 * 1000);
      });

      expect(screen.getByText("24:55")).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /pausar/i })).toHaveLength(1);
      expect(screen.queryByRole("button", { name: /^iniciar/i })).toBeNull();
    });

    it("Siguiente moves to the next phase and never saves a session", async () => {
      const actual = await vi.importActual("../../hooks/usePomodoro");
      usePomodoro.mockImplementation(actual.default);

      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Siguiente fase" }));

      expect(screen.getByText("05:00")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Descanso corto" })).toHaveClass("active");
      expect(createPomodoroSession).not.toHaveBeenCalled();
    });

    it("a duration change shows up in the timer while idle", async () => {
      const actual = await vi.importActual("../../hooks/usePomodoro");
      usePomodoro.mockImplementation(actual.default);

      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Aumentar tiempo de trabajo" }));

      expect(screen.getByText("26:00")).toBeInTheDocument();
    });

    it("pausing mid-cycle shows Continuar and locks the durations; Reiniciar unlocks them", async () => {
      vi.useFakeTimers();
      const actual = await vi.importActual("../../hooks/usePomodoro");
      usePomodoro.mockImplementation(actual.default);

      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "Iniciar temporizador" }));
      await act(async () => {
        vi.advanceTimersByTime(5 * 1000);
      });
      fireEvent.click(screen.getByRole("button", { name: "Pausar temporizador" }));

      expect(screen.getByRole("button", { name: "Continuar temporizador" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Aumentar tiempo de trabajo" })).toBeDisabled();
      expect(screen.getByText("Reiniciá el ciclo para cambiar las duraciones.")).toBeInTheDocument();
      expect(screen.getByText("24:55")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Reiniciar temporizador" }));

      expect(screen.getByRole("button", { name: "Iniciar temporizador" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Aumentar tiempo de trabajo" })).toBeEnabled();
      expect(screen.queryByText(/Reiniciá el ciclo/)).toBeNull();
    });
  });
});
