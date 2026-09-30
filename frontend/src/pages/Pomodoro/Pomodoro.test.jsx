import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import Pomodoro from "./Pomodoro";
import usePomodoro from "../../hooks/usePomodoro";

vi.mock("../../hooks/usePomodoro");

// The page header is what is under test: the widgets have their own concerns.
vi.mock("../../components/pomodoro/PomodoroTimer/PomodoroTimer", () => ({
  default: () => <div data-testid="timer" />,
}));
vi.mock("../../components/pomodoro/PomodoroControls/PomodoroControls", () => ({
  default: () => <div data-testid="controls" />,
}));
vi.mock("../../components/pomodoro/PomodoroHistory/PomodoroHistory", () => ({
  default: () => <div data-testid="history" />,
}));
vi.mock("../../components/pomodoro/PomodoroSettings/PomodoroSettings", () => ({
  default: () => <div data-testid="settings" />,
}));

const baseState = {
  mode: "focus",
  remainingSeconds: 1500,
  formattedTime: "25:00",
  isRunning: false,
  isFinished: false,
  isLoading: false,
  error: null,
  durationMinutes: 25,
  start: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  changeMode: vi.fn(),
};

describe("Pomodoro page", () => {
  it("renders its heading and subtitle through PageHeader", () => {
    usePomodoro.mockReturnValue(baseState);

    const { container } = render(<Pomodoro />);

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
    usePomodoro.mockReturnValue(baseState);

    render(<Pomodoro />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByTestId("timer")).toBeInTheDocument();
    expect(screen.getByTestId("controls")).toBeInTheDocument();
    expect(screen.getByTestId("settings")).toBeInTheDocument();
    expect(screen.getByTestId("history")).toBeInTheDocument();
  });
});
