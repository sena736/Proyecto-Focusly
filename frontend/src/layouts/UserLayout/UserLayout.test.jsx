import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import UserLayout from "./UserLayout";
import useAuth from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

const renderLayout = (path = "/tasks") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/tasks" element={<h1>Página de tareas</h1>} />
          <Route path="/profile" element={<h1>Página de perfil</h1>} />
          <Route path="/settings" element={<h1>Página de ajustes</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("UserLayout", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      isAdmin: false,
      logout: vi.fn().mockResolvedValue(undefined),
    });
  });

  it("mounts the mobile navigation next to the routed content", () => {
    renderLayout();

    expect(
      screen.getByRole("navigation", { name: "Navegación móvil" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Página de tareas" }),
    ).toBeInTheDocument();
  });

  it("keeps the hamburger button and the sidebar (Settings, admin and logout live there)", () => {
    renderLayout();

    expect(screen.getByRole("button", { name: "Abrir menú" })).toBeInTheDocument();

    const sidebarNav = screen.getAllByRole("navigation").find(
      (nav) => !nav.getAttribute("aria-label"),
    );

    expect(
      within(sidebarNav).getByRole("link", { name: "Configuración" }),
    ).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
  });

  it("highlights the bar item of the current route and follows navigation", async () => {
    const user = userEvent.setup();

    renderLayout("/tasks");

    const bar = screen.getByRole("navigation", { name: "Navegación móvil" });

    expect(within(bar).getByRole("link", { name: "Tareas" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(within(bar).getByRole("link", { name: "Perfil" }));

    expect(
      screen.getByRole("heading", { name: "Página de perfil" }),
    ).toBeInTheDocument();
    expect(within(bar).getByRole("link", { name: "Perfil" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
