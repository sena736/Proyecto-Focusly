import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import PomodoroControls from "./PomodoroControls";

describe("PomodoroControls", () => {
  it("renders Reiniciar, Iniciar and Siguiente while idle", () => {
    render(<PomodoroControls />);

    expect(screen.getByRole("button", { name: "Reiniciar temporizador" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar temporizador" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente fase" })).toBeInTheDocument();
  });

  it("the main button starts when idle", () => {
    const onStart = vi.fn();
    const onPause = vi.fn();
    render(<PomodoroControls isRunning={false} onStart={onStart} onPause={onPause} />);

    fireEvent.click(screen.getByRole("button", { name: "Iniciar temporizador" }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onPause).not.toHaveBeenCalled();
  });

  it("shows Continuar and resumes (onStart) while paused", () => {
    const onStart = vi.fn();
    const onPause = vi.fn();
    render(<PomodoroControls isRunning={false} isPaused onStart={onStart} onPause={onPause} />);

    expect(screen.queryByRole("button", { name: "Iniciar temporizador" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continuar temporizador" }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onPause).not.toHaveBeenCalled();
  });

  it("the main button pauses while running", () => {
    const onStart = vi.fn();
    const onPause = vi.fn();
    render(<PomodoroControls isRunning onStart={onStart} onPause={onPause} />);

    fireEvent.click(screen.getByRole("button", { name: "Pausar temporizador" }));

    expect(onPause).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
  });

  it("Reiniciar calls onReset", () => {
    const onReset = vi.fn();
    render(<PomodoroControls onReset={onReset} />);

    fireEvent.click(screen.getByRole("button", { name: "Reiniciar temporizador" }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("Siguiente calls onSkip", () => {
    const onSkip = vi.fn();
    render(<PomodoroControls onSkip={onSkip} />);

    fireEvent.click(screen.getByRole("button", { name: "Siguiente fase" }));

    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
