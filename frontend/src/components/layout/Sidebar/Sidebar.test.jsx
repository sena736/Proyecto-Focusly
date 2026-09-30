import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Sidebar from "./Sidebar";
import useAuth from "../../../hooks/useAuth";

vi.mock("../../../hooks/useAuth");

describe("Sidebar", () => {
  let logout;

  beforeEach(() => {
    logout = vi.fn().mockResolvedValue(undefined);
    useAuth.mockReturnValue({ logout });
  });

  const renderSidebar = (props = {}) =>
    render(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>,
    );

  it("renders the five navigation links and the logout button", () => {
    renderSidebar();

    const expectedLinks = {
      Dashboard: "/dashboard",
      Tareas: "/tasks",
      Pomodoro: "/pomodoro",
      Motivación: "/motivation",
      Configuración: "/settings",
    };

    Object.entries(expectedLinks).forEach(([name, href]) => {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    });

    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(
      screen.getByRole("button", { name: "Cerrar sesión" }),
    ).toBeInTheDocument();
  });

  it("hides the admin link for regular users", () => {
    renderSidebar();

    expect(
      screen.queryByRole("link", { name: "Administrar usuarios" }),
    ).not.toBeInTheDocument();
  });

  it("adds the admin link when isAdmin is true", () => {
    renderSidebar({ isAdmin: true });

    expect(
      screen.getByRole("link", { name: "Administrar usuarios" }),
    ).toHaveAttribute("href", "/admin/users");
    expect(screen.getAllByRole("link")).toHaveLength(6);
  });

  it("calls logout when pressing the logout button", async () => {
    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
