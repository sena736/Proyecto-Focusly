import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Home from "./Home";
import PublicHeader from "../../components/layout/PublicHeader/PublicHeader";

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );

describe("Home (landing)", () => {
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
});
