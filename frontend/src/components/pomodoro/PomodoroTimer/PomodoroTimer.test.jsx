import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import PomodoroTimer from "./PomodoroTimer";

const renderTimer = (props = {}) =>
  render(
    <PomodoroTimer
      mode="focus"
      formattedTime="25:00"
      completedPomodoros={0}
      onChangeMode={vi.fn()}
      {...props}
    />,
  );

describe("PomodoroTimer (presentational)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the time and the completed counter it receives", () => {
    renderTimer({ formattedTime: "12:34", completedPomodoros: 3 });

    expect(screen.getByText("12:34")).toBeInTheDocument();
    expect(screen.getByText("Pomodoros completados")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it.each([
    ["focus", "Tiempo de enfoque"],
    ["shortBreak", "Descanso corto"],
    ["longBreak", "Descanso largo"],
  ])("shows the title for %s mode", (mode, title) => {
    const { container } = renderTimer({ mode });

    expect(container.querySelector(".pomodoro-header p")).toHaveTextContent(title);
  });

  it("renders its output purely from props (no own timer)", () => {
    vi.useFakeTimers();
    const { rerender } = renderTimer({ isRunning: true, formattedTime: "10:00" });

    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });
    expect(screen.getByText("10:00")).toBeInTheDocument();

    rerender(
      <PomodoroTimer
        mode="shortBreak"
        formattedTime="04:59"
        completedPomodoros={2}
        onChangeMode={vi.fn()}
      />,
    );

    expect(screen.getByText("04:59")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("marks only the current mode tab as active", () => {
    renderTimer({ mode: "shortBreak" });

    expect(screen.getByRole("button", { name: "Descanso corto" })).toHaveClass("active");
    expect(screen.getByRole("button", { name: "Enfoque" })).not.toHaveClass("active");
    expect(screen.getByRole("button", { name: "Descanso largo" })).not.toHaveClass("active");
  });

  it.each([
    ["Enfoque", "focus"],
    ["Descanso corto", "shortBreak"],
    ["Descanso largo", "longBreak"],
  ])("clicking the %s tab calls onChangeMode('%s')", (label, mode) => {
    const onChangeMode = vi.fn();
    renderTimer({ onChangeMode });

    fireEvent.click(screen.getByRole("button", { name: label }));

    expect(onChangeMode).toHaveBeenCalledWith(mode);
  });

  it("has no start / reset buttons of its own (PomodoroControls owns them)", () => {
    renderTimer();

    expect(screen.queryByRole("button", { name: /iniciar/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /pausar/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /reiniciar/i })).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });
});
