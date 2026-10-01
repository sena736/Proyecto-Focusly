import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Dashboard from "./Dashboard";
import useTask from "../../hooks/useTask";
import useAuth from "../../hooks/useAuth";
import usePomodoro from "../../hooks/usePomodoro";
import { usePhrase } from "../../hooks/usePhrase";
import { STORAGE_KEYS } from "../../utils/constants";

vi.mock("../../hooks/useTask");
vi.mock("../../hooks/useAuth");
vi.mock("../../hooks/usePomodoro");
vi.mock("../../hooks/usePhrase");
vi.mock("../../services/token.services", () => ({
  getToken: () => "fake-token",
}));
const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

describe("Dashboard", () => {
  const makeTask = (id, title, status) => ({
    id,
    title,
    description: "desc",
    dueDate: null,
    status,
    priority: "MEDIUM",
  });

  const tasks = [
    makeTask(1, "Tarea A", "PENDING"),
    makeTask(2, "Tarea B", "COMPLETED"),
    makeTask(3, "Tarea C", "COMPLETED"),
    makeTask(4, "Tarea D", "PENDING"),
  ];

  let updateTaskAsync;

  beforeEach(() => {
    navigate.mockClear();
    updateTaskAsync = vi.fn().mockResolvedValue({});

    useTask.mockReturnValue({
      tasks,
      isLoading: false,
      isError: false,
      updateTaskAsync,
    });
    useAuth.mockReturnValue({ user: { name: "Ana Perez", role: "USER" } });
    usePomodoro.mockReturnValue({
      formattedTime: "15:00",
      remainingSeconds: 900,
      durationMinutes: 25,
      mode: "focus",
      isRunning: false,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
    });
    usePhrase.mockReturnValue({
      data: { text: "Frase" },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isRefetching: false,
    });
  });

  describe("profile button", () => {
    it("renders the real user name, initials and role", () => {
      render(<Dashboard />);

      const profile = screen.getByRole("button", { name: "Perfil de Ana Perez" });

      expect(profile).toHaveTextContent("Ana Perez");
      expect(profile).toHaveTextContent("AP");
      expect(profile).toHaveTextContent("Estudiante");
    });

    it("shows the Administrador role for admins", () => {
      useAuth.mockReturnValue({ user: { name: "Ana Perez", role: "ADMIN" } });
      render(<Dashboard />);

      expect(
        screen.getByRole("button", { name: "Perfil de Ana Perez" }),
      ).toHaveTextContent("Administrador");
    });

    it("falls back to Usuario without inventing another name", () => {
      useAuth.mockReturnValue({ user: null });
      render(<Dashboard />);

      expect(
        screen.getByRole("button", { name: "Perfil de Usuario" }),
      ).toBeInTheDocument();
      expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
    });

    it("navigates to /profile when clicked", async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      await user.click(
        screen.getByRole("button", { name: "Perfil de Ana Perez" }),
      );

      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith("/profile");
    });
  });

  it("derives pending/completed counters and progress from task.status", () => {
    render(<Dashboard />);

    expect(screen.getByText("pendientes").closest("span")).toHaveTextContent(
      "2 pendientes",
    );
    expect(screen.getByText("2 completadas")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("feeds the progress ring with the computed percentage", () => {
    render(<Dashboard />);

    const ring = screen.getByText("50%").closest(".focusly-progress-circle");

    expect(ring.style.getPropertyValue("--progress")).toBe("50%");
  });

  it("feeds the timer ring with the elapsed share of the cycle", () => {
    render(<Dashboard />);

    // 900s left of 25min (1500s) -> 600s elapsed -> 40%
    const ring = screen.getByText("15:00").closest(".focusly-timer-ring");

    expect(ring.style.getPropertyValue("--timer-progress")).toBe("40%");
  });

  it("keeps the timer ring empty at the start of a cycle", () => {
    usePomodoro.mockReturnValue({
      ...usePomodoro(),
      formattedTime: "25:00",
      remainingSeconds: 1500,
    });
    render(<Dashboard />);

    const ring = screen.getByText("25:00").closest(".focusly-timer-ring");

    expect(ring.style.getPropertyValue("--timer-progress")).toBe("0%");
  });

  it("falls back to an empty timer ring when remainingSeconds is missing", () => {
    usePomodoro.mockReturnValue({
      ...usePomodoro(),
      formattedTime: "--:--",
      remainingSeconds: undefined,
    });
    render(<Dashboard />);

    const ring = screen.getByText("--:--").closest(".focusly-timer-ring");

    expect(ring.style.getPropertyValue("--timer-progress")).toBe("0%");
  });

  describe("pomodoro card", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("runs the timer with the durations persisted by the Pomodoro page", () => {
      localStorage.setItem(
        STORAGE_KEYS.POMODORO_DURATIONS,
        JSON.stringify({ focusMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 30 }),
      );

      render(<Dashboard />);

      expect(usePomodoro).toHaveBeenLastCalledWith({
        focusMinutes: 50,
        shortBreakMinutes: 10,
        longBreakMinutes: 30,
      });
    });

    it("falls back to 25 / 5 / 15 when nothing is persisted", () => {
      render(<Dashboard />);

      expect(usePomodoro).toHaveBeenLastCalledWith({
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
      });
    });

    it.each([
      ["focus", "Sesión de enfoque"],
      ["shortBreak", "Descanso corto"],
      ["longBreak", "Descanso largo"],
    ])("titles the card after the current mode (%s)", (mode, title) => {
      usePomodoro.mockReturnValue({ ...usePomodoro(), mode });
      render(<Dashboard />);

      expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument();
    });

    it.each([
      ["focus", "● Enfoque"],
      ["shortBreak", "● Descanso"],
      ["longBreak", "● Descanso"],
    ])("shows the running chip for %s as %s", (mode, chip) => {
      usePomodoro.mockReturnValue({ ...usePomodoro(), mode, isRunning: true });
      render(<Dashboard />);

      expect(screen.getByText(chip)).toBeInTheDocument();
    });

    it("keeps ○ Pausado when the timer is not running, whatever the mode", () => {
      usePomodoro.mockReturnValue({ ...usePomodoro(), mode: "shortBreak", isRunning: false });
      render(<Dashboard />);

      expect(screen.getByText("○ Pausado")).toBeInTheDocument();
    });
  });

  it("renders controlled checkboxes reflecting the task status", () => {
    // Controlled input: React must not receive `checked={undefined}`.
    // The spy must exist before the (single) render to catch its warnings.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      render(<Dashboard />);

      const boxes = screen.getAllByRole("checkbox");

      expect(boxes.map((box) => box.checked)).toEqual([
        false,
        true,
        true,
        false,
      ]);
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("marks completed tasks with the is-completed class", () => {
    render(<Dashboard />);

    const boxes = screen.getAllByRole("checkbox");

    expect(boxes[0].closest("label")).not.toHaveClass("is-completed");
    expect(boxes[1].closest("label")).toHaveClass("is-completed");
  });

  it("sends only the new status when toggling a pending task", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getAllByRole("checkbox")[0]);

    expect(updateTaskAsync).toHaveBeenCalledTimes(1);
    expect(updateTaskAsync).toHaveBeenCalledWith({
      id: 1,
      data: { status: "COMPLETED" },
    });
  });

  it("sends PENDING when toggling a completed task", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getAllByRole("checkbox")[1]);

    expect(updateTaskAsync).toHaveBeenCalledTimes(1);
    expect(updateTaskAsync).toHaveBeenCalledWith({
      id: 2,
      data: { status: "PENDING" },
    });
  });

  describe("toggle errors", () => {
    let errorSpy;

    beforeEach(() => {
      // The Dashboard logs the failure, like Tasks does.
      errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      errorSpy.mockRestore();
    });

    it("shows no alert while nothing has failed", () => {
      render(<Dashboard />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows the error message in an alert when the toggle fails", async () => {
      updateTaskAsync.mockRejectedValue(new Error("Sin conexión con el servidor"));
      const user = userEvent.setup();
      render(<Dashboard />);

      await user.click(screen.getAllByRole("checkbox")[0]);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Sin conexión con el servidor",
      );
    });

    it("falls back to a generic message when the error has no message", async () => {
      updateTaskAsync.mockRejectedValue(new Error(""));
      const user = userEvent.setup();
      render(<Dashboard />);

      await user.click(screen.getAllByRole("checkbox")[0]);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "No se pudo actualizar la tarea. Intentá de nuevo.",
      );
    });

    it("lets the user dismiss the alert", async () => {
      updateTaskAsync.mockRejectedValue(new Error("Falló"));
      const user = userEvent.setup();
      render(<Dashboard />);

      await user.click(screen.getAllByRole("checkbox")[0]);
      await screen.findByRole("alert");

      await user.click(screen.getByRole("button", { name: "Cerrar alerta" }));

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("clears the alert when a later toggle succeeds", async () => {
      updateTaskAsync
        .mockRejectedValueOnce(new Error("Falló"))
        .mockResolvedValueOnce({});
      const user = userEvent.setup();
      render(<Dashboard />);

      await user.click(screen.getAllByRole("checkbox")[0]);
      await screen.findByRole("alert");

      await user.click(screen.getAllByRole("checkbox")[1]);

      await waitFor(() =>
        expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
      );
      expect(updateTaskAsync).toHaveBeenCalledTimes(2);
    });

    describe("overlapping toggles", () => {
      const deferred = () => {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });

        return { promise, resolve, reject };
      };

      it("ignores a stale failure that arrives after a newer toggle succeeded", async () => {
        const first = deferred();
        const second = deferred();
        updateTaskAsync
          .mockReturnValueOnce(first.promise)
          .mockReturnValueOnce(second.promise);
        const user = userEvent.setup();
        render(<Dashboard />);

        await user.click(screen.getAllByRole("checkbox")[0]);
        await user.click(screen.getAllByRole("checkbox")[1]);

        second.resolve({});
        await act(async () => {
          await second.promise;
        });

        first.reject(new Error("Falló el primero"));
        await act(async () => {
          await first.promise.catch(() => {});
        });

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });

      it("shows the latest failure even if an older one settles afterwards", async () => {
        const first = deferred();
        const second = deferred();
        updateTaskAsync
          .mockReturnValueOnce(first.promise)
          .mockReturnValueOnce(second.promise);
        const user = userEvent.setup();
        render(<Dashboard />);

        await user.click(screen.getAllByRole("checkbox")[0]);
        await user.click(screen.getAllByRole("checkbox")[1]);

        second.reject(new Error("Falló el segundo"));
        await act(async () => {
          await second.promise.catch(() => {});
        });

        first.reject(new Error("Falló el primero"));
        await act(async () => {
          await first.promise.catch(() => {});
        });

        const alert = await screen.findByRole("alert");

        expect(alert).toHaveTextContent("Falló el segundo");
        expect(alert).not.toHaveTextContent("Falló el primero");
      });
    });
  });
});
