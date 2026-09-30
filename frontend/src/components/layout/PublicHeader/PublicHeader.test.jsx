import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import PublicHeader from "./PublicHeader";

const renderHeader = () =>
  render(
    <MemoryRouter>
      <PublicHeader />
    </MemoryRouter>,
  );

describe("PublicHeader", () => {
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
});
