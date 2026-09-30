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

  it("hides the admin links for regular users", () => {
    renderSidebar();

    expect(
      screen.queryByRole("link", { name: "Administrar usuarios" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Panel de administración" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("ADMINISTRACIÓN")).not.toBeInTheDocument();
  });

  it("adds the admin panel and users links when isAdmin is true", () => {
    renderSidebar({ isAdmin: true });

    expect(
      screen.getByRole("link", { name: "Panel de administración" }),
    ).toHaveAttribute("href", "/admin");
    expect(
      screen.getByRole("link", { name: "Administrar usuarios" }),
    ).toHaveAttribute("href", "/admin/users");
    expect(screen.getAllByRole("link")).toHaveLength(7);
  });

  it("lists the admin panel above the users administration link", () => {
    renderSidebar({ isAdmin: true });

    const links = screen.getAllByRole("link").map((link) => link.textContent);

    expect(links.indexOf("Panel de administración")).toBeGreaterThan(-1);
    expect(links.indexOf("Panel de administración")).toBeLessThan(
      links.indexOf("Administrar usuarios"),
    );
  });

  it("highlights only the admin panel at /admin, not the users page (exact match)", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Sidebar isAdmin />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: "Panel de administración" }),
    ).toHaveClass("sidebar__link--active");
    expect(
      screen.getByRole("link", { name: "Administrar usuarios" }),
    ).not.toHaveClass("sidebar__link--active");
  });

  it("highlights only the users link at /admin/users", () => {
    render(
      <MemoryRouter initialEntries={["/admin/users"]}>
        <Sidebar isAdmin />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: "Administrar usuarios" }),
    ).toHaveClass("sidebar__link--active");
    expect(
      screen.getByRole("link", { name: "Panel de administración" }),
    ).not.toHaveClass("sidebar__link--active");
  });

  it("calls logout when pressing the logout button", async () => {
    const user = userEvent.setup();

    renderSidebar();

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
