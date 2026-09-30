import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Home from "./Home";
import PublicHeader from "../../components/layout/PublicHeader/PublicHeader";
import useAuth from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth");

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );

describe("Home (landing)", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: null, loading: false, isAuthenticated: false });
  });

  it("renders every section used by the header anchors", () => {
    const { container } = render(
      <MemoryRouter>
        <PublicHeader />
        <Home />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Navegación principal" });
    const anchors = within(nav)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))
      .filter((href) => href.startsWith("/#"))
      .map((href) => href.slice(2));

    expect(anchors.length).toBeGreaterThan(0);
    anchors.forEach((id) => {
      expect(container.querySelector(`section#${id}`)).not.toBeNull();
    });
  });

  it("renders a hero with the main heading and CTAs to register and login", () => {
    renderHome();

    const hero = document.getElementById("inicio");
    expect(
      within(hero).getByRole("heading", { level: 1 }),
    ).toBeInTheDocument();
    expect(
      within(hero).getByRole("link", { name: /crear cuenta/i }),
    ).toHaveAttribute("href", "/register");
    expect(
      within(hero).getByRole("link", { name: /iniciar sesión/i }),
    ).toHaveAttribute("href", "/login");
  });

  it("describes the real features of the app", () => {
    renderHome();

    const features = document.getElementById("caracteristicas");
    [
      "Temporizador Pomodoro",
      "Gestor de tareas",
      "Frases motivacionales",
      "Modo oscuro",
    ].forEach((name) => {
      expect(
        within(features).getByRole("heading", { level: 3, name }),
      ).toBeInTheDocument();
    });
  });

  it("renders exactly one h1 on the page", () => {
    renderHome();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("lists every benefit with its title", () => {
    renderHome();

    const benefits = document.getElementById("beneficios");
    [
      "Mejora tu concentración",
      "Avanza con constancia",
      "Ten todo a la vista",
    ].forEach((name) => {
      expect(
        within(benefits).getByRole("heading", { level: 3, name }),
      ).toBeInTheDocument();
    });
  });

  it("links the about section to /about", () => {
    renderHome();

    const about = document.getElementById("nosotros");
    expect(
      within(about).getByRole("link", { name: /conoce más sobre focusly/i }),
    ).toHaveAttribute("href", "/about");
  });

  it("does not render the old fake dashboard content", () => {
    renderHome();

    expect(screen.queryByText(/Juan Pérez|Tarea 1/)).toBeNull();
  });

  describe("hero CTAs by session", () => {
    const hero = () => document.getElementById("inicio");

    it("guests never see a link to the dashboard", () => {
      renderHome();

      expect(
        within(hero()).queryByRole("link", { name: /ir al dashboard/i }),
      ).toBeNull();
    });

    it("a connected user gets a single primary CTA to the dashboard", () => {
      useAuth.mockReturnValue({
        user: { name: "Ana Perez", role: "USER" },
        loading: false,
        isAuthenticated: true,
      });
      renderHome();

      const links = within(hero()).getAllByRole("link");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAccessibleName(/ir al dashboard/i);
      expect(links[0]).toHaveAttribute("href", "/dashboard");
      expect(links[0]).toHaveClass("landing__btn--primary");
    });

    it("a connected user no longer sees register or login CTAs", () => {
      useAuth.mockReturnValue({
        user: { name: "Ana Perez", role: "USER" },
        loading: false,
        isAuthenticated: true,
      });
      renderHome();

      expect(
        within(hero()).queryByRole("link", { name: /crear cuenta/i }),
      ).toBeNull();
      expect(
        within(hero()).queryByRole("link", { name: /iniciar sesión/i }),
      ).toBeNull();
    });

    it("renders no CTA at all while the session is unresolved (no guest flash)", () => {
      useAuth.mockReturnValue({ user: null, loading: true, isAuthenticated: false });
      renderHome();

      expect(within(hero()).queryAllByRole("link")).toHaveLength(0);
      expect(hero().querySelector(".landing__actions--pending")).not.toBeNull();
    });

    it("keeps a stale user's CTA hidden while loading (no dashboard or guest links)", () => {
      useAuth.mockReturnValue({
        user: { name: "Ana Perez", role: "USER" },
        loading: true,
        isAuthenticated: true,
      });
      renderHome();

      expect(within(hero()).queryAllByRole("link")).toHaveLength(0);
      expect(hero().querySelector(".landing__actions--pending")).not.toBeNull();
    });

    it("still renders the heading and lead while loading", () => {
      useAuth.mockReturnValue({ user: null, loading: true, isAuthenticated: false });
      renderHome();

      expect(
        within(hero()).getByRole("heading", { level: 1 }),
      ).toBeInTheDocument();
    });
  });
});
