import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import PomodoroHistory from "./PomodoroHistory";
import { formatDateTime } from "../../../utils/date";

const session = (id, overrides = {}) => ({
  id,
  type: "WORK",
  startedAt: "2026-09-30T10:00:00.000Z",
  endedAt: "2026-09-30T10:25:00.000Z",
  durationMinutes: 25,
  ...overrides,
});

const items = (container) => container.querySelectorAll(".pomodoro-history__item");

describe("PomodoroHistory", () => {
  it("keeps its heading", () => {
    render(<PomodoroHistory sessions={[]} />);

    expect(screen.getByRole("heading", { name: "Historial Pomodoro" })).toBeInTheDocument();
  });

  describe("loading", () => {
    it("shows the Loader and nothing else while loading", () => {
      const { container } = render(<PomodoroHistory isLoading />);

      expect(screen.getByText("Cargando historial...")).toBeInTheDocument();
      expect(items(container)).toHaveLength(0);
      expect(screen.queryByText(/todavía no completaste/i)).toBeNull();
    });
  });

  describe("error", () => {
    it("shows a friendly Spanish alert instead of a fake empty list", () => {
      render(<PomodoroHistory isError sessions={undefined} />);

      expect(screen.getByRole("alert")).toHaveTextContent(/no pudimos cargar tu historial/i);
      expect(screen.queryByText(/todavía no completaste/i)).toBeNull();
    });
  });

  describe("empty", () => {
    it.each([[[]], [undefined]])("shows the empty state for %j", (sessions) => {
      const { container } = render(<PomodoroHistory sessions={sessions} />);

      expect(screen.getByText("Todavía no completaste ninguna sesión")).toBeInTheDocument();
      expect(items(container)).toHaveLength(0);
    });

    it("no longer renders the hardcoded sample sessions", () => {
      render(<PomodoroHistory sessions={[]} />);

      expect(screen.queryByText("Estudiar matemáticas")).toBeNull();
      expect(screen.queryByText("Realizar proyecto")).toBeNull();
      expect(screen.queryByText("Leer capítulo 3")).toBeNull();
    });
  });

  describe("populated", () => {
    it("labels each session by type, with its duration and local date and time", () => {
      const work = session(1, { durationMinutes: 25 });
      const rest = session(2, {
        type: "BREAK",
        durationMinutes: 5,
        startedAt: "2026-09-30T09:00:00.000Z",
      });

      const { container } = render(<PomodoroHistory sessions={[work, rest]} />);

      const [first, second] = items(container);

      expect(within(first).getByText("Enfoque")).toBeInTheDocument();
      expect(within(first).getByText("25")).toBeInTheDocument();
      expect(within(first).getByText("min")).toBeInTheDocument();
      expect(within(first).getByText(formatDateTime(work.startedAt))).toBeInTheDocument();

      expect(within(second).getByText("Descanso")).toBeInTheDocument();
      expect(within(second).getByText("5")).toBeInTheDocument();
      expect(within(second).getByText(formatDateTime(rest.startedAt))).toBeInTheDocument();
    });

    it("uses the focus / break icon styles by type", () => {
      const { container } = render(
        <PomodoroHistory
          sessions={[session(1), session(2, { type: "BREAK", startedAt: "2026-09-29T10:00:00.000Z" })]}
        />,
      );

      expect(container.querySelectorAll(".pomodoro-history__icon--focus")).toHaveLength(1);
      expect(container.querySelectorAll(".pomodoro-history__icon--break")).toHaveLength(1);
    });

    it("sorts newest first by start time, regardless of the order received", () => {
      const oldest = session(1, { startedAt: "2026-09-28T10:00:00.000Z", durationMinutes: 11 });
      const newest = session(2, { startedAt: "2026-09-30T10:00:00.000Z", durationMinutes: 22 });
      const middle = session(3, { startedAt: "2026-09-29T10:00:00.000Z", durationMinutes: 33 });

      const { container } = render(<PomodoroHistory sessions={[oldest, newest, middle]} />);

      const minutes = [...items(container)].map(
        (item) => item.querySelector(".pomodoro-history__duration strong").textContent,
      );

      expect(minutes).toEqual(["22", "33", "11"]);
    });

    it("does not mutate the array it receives", () => {
      const received = [
        session(1, { startedAt: "2026-09-28T10:00:00.000Z" }),
        session(2, { startedAt: "2026-09-30T10:00:00.000Z" }),
      ];
      const copy = [...received];

      render(<PomodoroHistory sessions={received} />);

      expect(received).toEqual(copy);
    });

    it("shows at most the 10 most recent sessions", () => {
      const many = Array.from({ length: 13 }, (_, index) =>
        session(index + 1, {
          startedAt: new Date(Date.UTC(2026, 8, 1 + index, 10)).toISOString(),
          durationMinutes: index + 1,
        }),
      );

      const { container } = render(<PomodoroHistory sessions={many} />);

      const minutes = [...items(container)].map(
        (item) => item.querySelector(".pomodoro-history__duration strong").textContent,
      );

      expect(minutes).toHaveLength(10);
      expect(minutes[0]).toBe("13");
      expect(minutes[9]).toBe("4");
    });

    it("renders no date text (instead of 'Invalid Date') for a session without a valid start", () => {
      const { container } = render(
        <PomodoroHistory sessions={[session(1, { startedAt: "not-a-date" })]} />,
      );

      expect(items(container)).toHaveLength(1);
      expect(screen.queryByText(/invalid/i)).toBeNull();
    });
  });
});
