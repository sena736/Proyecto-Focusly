import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

import PublicHeader from "./PublicHeader";
import useAuth from "../../../hooks/useAuth";

vi.mock("../../../hooks/useAuth");

const asGuest = () =>
  useAuth.mockReturnValue({ user: null, loading: false, isAuthenticated: false });

const asUser = (user = { name: "Ana Perez", role: "USER" }) =>
  useAuth.mockReturnValue({ user, loading: false, isAuthenticated: true });

const asLoading = () =>
  useAuth.mockReturnValue({ user: null, loading: true, isAuthenticated: false });

const renderHeader = () =>
  render(
    <MemoryRouter>
      <PublicHeader />
    </MemoryRouter>,
  );

describe("PublicHeader", () => {
  beforeEach(() => {
    asGuest();
  });

  it("renders the brand linking to the landing page", () => {
    renderHeader();

    expect(screen.getByText("FOCUSLY")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /focusly/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders the navigation links pointing to landing sections", () => {
    renderHeader();

    const expected = {
      Inicio: "/#inicio",
      Características: "/#caracteristicas",
      Beneficios: "/#beneficios",
      Nosotros: "/#nosotros",
    };

    Object.entries(expected).forEach(([name, href]) => {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    });
  });

  it("renders the login and register links", () => {
    renderHeader();

    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Registrarse" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("renders no heading, so each page keeps a single h1 of its own", () => {
    renderHeader();

    expect(screen.queryAllByRole("heading")).toHaveLength(0);
  });

  it("labels its navigation landmark to tell it apart from the footer one", () => {
    renderHeader();

    expect(
      screen.getByRole("navigation", { name: "Navegación principal" }),
    ).toBeInTheDocument();
  });

  it("contains no unresolved merge conflict markers in its markup", () => {
    const { container } = renderHeader();

    expect(container.textContent).not.toMatch(/<<<<<<<|>>>>>>>/);
  });

  describe("as a guest", () => {
    it("offers no way to the dashboard or the profile", () => {
      renderHeader();

      expect(screen.queryByRole("link", { name: "Ir al dashboard" })).toBeNull();
      expect(screen.queryByRole("button", { name: /Perfil/ })).toBeNull();
    });
  });

  describe("with a session", () => {
    it("shows the connected user name and role", () => {
      asUser();
      renderHeader();

      const profile = screen.getByRole("button", { name: "Perfil de Ana Perez" });
      expect(profile).toHaveTextContent("Ana Perez");
      expect(profile).toHaveTextContent("Estudiante");
    });

    it("labels admins as Administrador", () => {
      asUser({ name: "Ana Perez", role: "ADMIN" });
      renderHeader();

      expect(
        screen.getByRole("button", { name: "Perfil de Ana Perez" }),
      ).toHaveTextContent("Administrador");
    });

    it("links back to the dashboard", () => {
      asUser();
      renderHeader();

      expect(screen.getByRole("link", { name: "Ir al dashboard" })).toHaveAttribute(
        "href",
        "/dashboard",
      );
    });

    it("replaces the guest buttons", () => {
      asUser();
      renderHeader();

      expect(screen.queryByRole("link", { name: "Iniciar sesión" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Registrarse" })).toBeNull();
    });

    it("keeps the landing navigation", () => {
      asUser();
      renderHeader();

      expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute(
        "href",
        "/#inicio",
      );
    });

    it("navigates to /profile when the user area is clicked", async () => {
      asUser();
      const Probe = () => <span data-testid="path">{useLocation().pathname}</span>;
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={["/"]}>
          <PublicHeader />
          <Routes>
            <Route path="*" element={<Probe />} />
          </Routes>
        </MemoryRouter>,
      );

      await user.click(screen.getByRole("button", { name: "Perfil de Ana Perez" }));

      expect(screen.getByTestId("path")).toHaveTextContent("/profile");
    });
  });

  describe("while the session is being resolved", () => {
    it("renders neither guest buttons nor user actions (no flash)", () => {
      asLoading();
      renderHeader();

      expect(screen.queryByRole("link", { name: "Iniciar sesión" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Registrarse" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Ir al dashboard" })).toBeNull();
      expect(screen.queryByRole("button", { name: /Perfil/ })).toBeNull();
    });

    it("keeps the navigation and reserves the actions slot", () => {
      asLoading();
      const { container } = renderHeader();

      expect(
        screen.getByRole("navigation", { name: "Navegación principal" }),
      ).toBeInTheDocument();
      expect(
        container.querySelector(".public-header-actions--pending"),
      ).not.toBeNull();
    });

    it("keeps a stale user hidden while loading (no guest buttons either)", () => {
      useAuth.mockReturnValue({
        user: { name: "Ana Perez", role: "USER" },
        loading: true,
        isAuthenticated: true,
      });
      const { container } = renderHeader();

      expect(screen.queryByRole("button", { name: /Perfil/ })).toBeNull();
      expect(screen.queryByText("Ana Perez")).toBeNull();
      expect(screen.queryByRole("link", { name: "Ir al dashboard" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Iniciar sesión" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Registrarse" })).toBeNull();
      expect(
        container.querySelector(".public-header-actions--pending"),
      ).not.toBeNull();
    });
  });
});
