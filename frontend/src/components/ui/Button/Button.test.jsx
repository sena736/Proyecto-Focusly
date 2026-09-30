import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Button from "./Button";

describe("Button", () => {
  it("renders a type=button button with the primary/medium classes by default", () => {
    render(<Button>Guardar</Button>);

    const button = screen.getByRole("button", { name: "Guardar" });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass(
      "focusly-button",
      "focusly-button--primary",
      "focusly-button--medium",
    );
  });

  it("builds a clean class list (no stray whitespace) with modifiers", () => {
    render(
      <Button variant="secondary" size="large" fullWidth className="extra">
        Ok
      </Button>,
    );

    expect(screen.getByRole("button").className).toBe(
      "focusly-button focusly-button--secondary focusly-button--large focusly-button--full extra",
    );
  });

  it("supports type=submit", () => {
    render(<Button type="submit">Enviar</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("calls onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Ir</Button>);
    await user.click(screen.getByRole("button", { name: "Ir" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards aria and data attributes to the button", () => {
    render(
      <Button aria-label="Cerrar sesión" data-testid="logout" aria-pressed="true">
        X
      </Button>,
    );

    const button = screen.getByTestId("logout");

    expect(button).toHaveAttribute("aria-label", "Cerrar sesión");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("renders the icon on the requested side", () => {
    const { rerender, container } = render(
      <Button icon={<svg data-testid="icon" />}>Nuevo</Button>,
    );

    const children = () => [...container.querySelector("button").children];

    expect(children()[0]).toHaveClass("focusly-button__icon");

    rerender(
      <Button icon={<svg data-testid="icon" />} iconPosition="right">
        Nuevo
      </Button>,
    );

    expect(children()[1]).toHaveClass("focusly-button__icon");
  });

  it("is disabled and shows the default loading text while loading", () => {
    render(<Button loading>Guardar</Button>);

    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Cargando...");
    expect(button).not.toHaveTextContent("Guardar");
  });

  it("lets the caller choose the loading text", () => {
    render(
      <Button loading loadingText="Guardando...">
        Guardar
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        No
      </Button>,
    );
    await user.click(screen.getByRole("button"));

    expect(onClick).not.toHaveBeenCalled();
  });
});
