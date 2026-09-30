import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";

import AdminDashboard from "./AdminDashboard";
import useUsers from "../../../hooks/useUsers";
import useAdminPomodoroSessions from "../../../hooks/useAdminPomodoroSessions";

vi.mock("../../../hooks/useUsers");
vi.mock("../../../hooks/useAdminPomodoroSessions");

const usersState = (overrides = {}) => ({
  users: [],
  isLoading: false,
  isError: false,
  error: null,
  ...overrides,
});

const sessionsState = (overrides = {}) => ({
  sessions: [],
  isLoading: false,
  isError: false,
  error: null,
  ...overrides,
});

const card = (label) => screen.getByRole("article", { name: label });

describe("AdminDashboard", () => {
  beforeEach(() => {
    useUsers.mockReturnValue(
      usersState({ users: [{ id: 1 }, { id: 2 }, { id: 3 }] }),
    );
    useAdminPomodoroSessions.mockReturnValue(
      sessionsState({ sessions: new Array(12).fill({}) }),
    );
  });

  it("renders its title and subtitle through PageHeader with a single h1", () => {
    const { container } = render(<AdminDashboard />);

    const header = container.querySelector("header.focusly-page-header");

    expect(header).not.toBeNull();
    expect(
      within(header).getByRole("heading", {
        level: 1,
        name: "Panel de administración",
      }),
    ).toBeInTheDocument();
    expect(
      within(header).getByText(/supervisa la información de focusly/i),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  describe("success", () => {
    it("shows the real totals of users and Pomodoro sessions", () => {
      render(<AdminDashboard />);

      expect(within(card("Usuarios")).getByText("3")).toBeInTheDocument();
      expect(
        within(card("Sesiones Pomodoro")).getByText("12"),
      ).toBeInTheDocument();
    });

    it("only offers the cards backed by a real endpoint (no tasks, no phrases)", () => {
      render(<AdminDashboard />);

      expect(screen.getAllByRole("article")).toHaveLength(2);
      expect(screen.queryByText("Tareas")).toBeNull();
      expect(screen.queryByText("Frases")).toBeNull();
    });

    it("does not render invented panels (Resumen / Actividad reciente)", () => {
      render(<AdminDashboard />);

      expect(screen.queryByText("Actividad reciente")).toBeNull();
      expect(screen.queryByText(/no hay actividad reciente/i)).toBeNull();
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  describe("loading", () => {
    it("shows a Loader in each pending card and no number", () => {
      useUsers.mockReturnValue(usersState({ isLoading: true }));
      useAdminPomodoroSessions.mockReturnValue(
        sessionsState({ sessions: undefined, isLoading: true }),
      );

      const { container } = render(<AdminDashboard />);

      expect(container.querySelectorAll(".loader-container")).toHaveLength(2);
      expect(screen.queryByText("0")).toBeNull();
      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("keeps the loaded card visible while the other one is still loading", () => {
      useAdminPomodoroSessions.mockReturnValue(
        sessionsState({ sessions: undefined, isLoading: true }),
      );

      const { container } = render(<AdminDashboard />);

      expect(within(card("Usuarios")).getByText("3")).toBeInTheDocument();
      expect(container.querySelectorAll(".loader-container")).toHaveLength(1);
    });
  });

  describe("error", () => {
    it("shows an error Alert and no number for the failing source only", () => {
      useUsers.mockReturnValue(
        usersState({ isError: true, error: new Error("Sin permisos") }),
      );

      render(<AdminDashboard />);

      const alert = screen.getByRole("alert");

      expect(alert).toHaveClass("alert-error");
      expect(alert).toHaveTextContent("No se pudieron cargar los usuarios");

      expect(within(card("Usuarios")).queryByText("3")).toBeNull();
      expect(within(card("Usuarios")).queryByText("0")).toBeNull();
      // The other source is unaffected.
      expect(
        within(card("Sesiones Pomodoro")).getByText("12"),
      ).toBeInTheDocument();
    });

    it.each([401, 403])(
      "shows a friendly permissions message (not the raw axios text) on a %i",
      (status) => {
        const error = Object.assign(
          new Error(`Request failed with status code ${status}`),
          { response: { status } },
        );
        useUsers.mockReturnValue(usersState({ isError: true, error }));

        render(<AdminDashboard />);

        const alert = screen.getByRole("alert");

        expect(alert).toHaveTextContent("No tenés permisos para ver esta información.");
        expect(alert).not.toHaveTextContent(/request failed/i);
      },
    );

    it("shows a generic message (not the raw axios text) on a 500", () => {
      const error = Object.assign(new Error("Request failed with status code 500"), {
        response: { status: 500 },
      });
      useAdminPomodoroSessions.mockReturnValue(
        sessionsState({ sessions: undefined, isError: true, error }),
      );

      render(<AdminDashboard />);

      const alert = screen.getByRole("alert");

      expect(alert).toHaveTextContent("No se pudieron cargar los datos. Intentá de nuevo.");
      expect(alert).not.toHaveTextContent(/request failed/i);
    });

    it("uses a default message when the error carries none, one Alert per failing source", () => {
      useUsers.mockReturnValue(usersState({ isError: true, error: null }));
      useAdminPomodoroSessions.mockReturnValue(
        sessionsState({ sessions: undefined, isError: true, error: null }),
      );

      render(<AdminDashboard />);

      const alerts = screen.getAllByRole("alert");

      expect(alerts).toHaveLength(2);
      expect(alerts[0]).toHaveTextContent(/usuarios/i);
      expect(alerts[1]).toHaveTextContent(/sesiones pomodoro/i);
      expect(screen.queryByText("0")).toBeNull();
    });

    it("treats a non-array users payload as an error instead of showing a number", () => {
      useUsers.mockReturnValue(usersState({ users: { unexpected: true } }));

      render(<AdminDashboard />);

      expect(screen.getByRole("alert")).toHaveTextContent(/usuarios/i);
      expect(within(card("Usuarios")).queryByText("undefined")).toBeNull();
    });
  });

  describe("empty", () => {
    it("shows a real 0 and an explanatory hint when there are no sessions", () => {
      useAdminPomodoroSessions.mockReturnValue(sessionsState({ sessions: [] }));

      render(<AdminDashboard />);

      const sessions = card("Sesiones Pomodoro");

      expect(within(sessions).getByText("0")).toBeInTheDocument();
      expect(
        within(sessions).getByText(/todavía no se registraron sesiones/i),
      ).toBeInTheDocument();
    });
  });
});
