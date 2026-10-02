import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import PomodoroSettings from "./PomodoroSettings";

const renderSettings = (props = {}) => {
  const onChange = vi.fn();

  render(
    <PomodoroSettings
      focusMinutes={25}
      shortBreakMinutes={5}
      longBreakMinutes={15}
      onChange={onChange}
      {...props}
    />,
  );

  return { onChange };
};

describe("PomodoroSettings (controlled)", () => {
  it("shows the values it receives", () => {
    renderSettings({ focusMinutes: 40, shortBreakMinutes: 8, longBreakMinutes: 20 });

    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it.each([
    ["Aumentar tiempo de trabajo", "focusMinutes", 26],
    ["Disminuir tiempo de trabajo", "focusMinutes", 24],
    ["Aumentar descanso corto", "shortBreakMinutes", 6],
    ["Disminuir descanso corto", "shortBreakMinutes", 4],
    ["Aumentar descanso largo", "longBreakMinutes", 16],
    ["Disminuir descanso largo", "longBreakMinutes", 14],
  ])("%s asks the page for %s = %s (steps of 1)", (label, key, value) => {
    const { onChange } = renderSettings();

    fireEvent.click(screen.getByRole("button", { name: label }));

    expect(onChange).toHaveBeenCalledWith(key, value);
  });

  it("does not keep its own state: the value only changes when the page passes a new one", () => {
    const { onChange } = renderSettings();

    fireEvent.click(screen.getByRole("button", { name: "Aumentar tiempo de trabajo" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.queryByText("26")).toBeNull();
  });

  it("cannot go below 1 minute", () => {
    const { onChange } = renderSettings({ focusMinutes: 1 });
    const decrease = screen.getByRole("button", { name: "Disminuir tiempo de trabajo" });

    expect(decrease).toBeDisabled();
    fireEvent.click(decrease);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("cannot go above 90 minutes", () => {
    const { onChange } = renderSettings({ longBreakMinutes: 90 });
    const increase = screen.getByRole("button", { name: "Aumentar descanso largo" });

    expect(increase).toBeDisabled();
    fireEvent.click(increase);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores every change and disables all six buttons while disabled (timer running)", () => {
    const { onChange } = renderSettings({ disabled: true });

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(6);
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("explains how to unlock the durations only while disabled", () => {
    const { unmount } = render(
      <PomodoroSettings
        focusMinutes={25}
        shortBreakMinutes={5}
        longBreakMinutes={15}
        disabled
      />,
    );

    expect(screen.getByText("Reiniciá el ciclo para cambiar las duraciones.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aumentar tiempo de trabajo" })).toBeDisabled();
    unmount();

    renderSettings();

    expect(screen.queryByText(/Reiniciá el ciclo/)).toBeNull();
  });
});
