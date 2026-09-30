import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import PageHeader from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title as the page h1 with its subtitle", () => {
    render(<PageHeader title="Mis tareas" subtitle="Organiza tu día" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Mis tareas" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Organiza tu día")).toBeInTheDocument();
  });

  it("renders no heading when there is no title", () => {
    render(<PageHeader subtitle="Solo subtítulo" />);

    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("renders the optional icon, action and breadcrumb in their slots", () => {
    const { container } = render(
      <PageHeader
        title="Perfil"
        icon={<svg data-testid="icon" />}
        action={<button type="button">Acción</button>}
        breadcrumb={<span>CUENTA</span>}
      />,
    );

    expect(
      container.querySelector(".focusly-page-header__icon [data-testid='icon']"),
    ).not.toBeNull();
    expect(
      container.querySelector(".focusly-page-header__action button"),
    ).toHaveTextContent("Acción");
    expect(
      container.querySelector(".focusly-page-header__breadcrumb"),
    ).toHaveTextContent("CUENTA");
  });

  it("omits empty slots", () => {
    const { container } = render(<PageHeader title="Solo título" />);

    expect(container.querySelector(".focusly-page-header__icon")).toBeNull();
    expect(container.querySelector(".focusly-page-header__action")).toBeNull();
    expect(container.querySelector(".focusly-page-header__breadcrumb")).toBeNull();
    expect(container.querySelector(".focusly-page-header__subtitle")).toBeNull();
  });

  it("builds a clean class list with the alignment modifier and custom class", () => {
    const { container } = render(
      <PageHeader title="Centrado" align="center" className="mi-clase" />,
    );

    const header = container.querySelector("header");

    expect(header.className).toBe(
      "focusly-page-header focusly-page-header--center mi-clase",
    );
  });

  it("does not leave trailing whitespace in the class list without a custom class", () => {
    const { container } = render(<PageHeader title="Izquierda" />);

    expect(container.querySelector("header").className).toBe(
      "focusly-page-header focusly-page-header--left",
    );
  });
});
