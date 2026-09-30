import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import IconButton from "./IconButton";

describe("IconButton", () => {
  it("is named by its label and uses it as tooltip by default", () => {
    render(<IconButton icon={<svg />} label="Editar tarea" />);

    const button = screen.getByRole("button", { name: "Editar tarea" });

    expect(button).toHaveAttribute("title", "Editar tarea");
    expect(button).toHaveAttribute("type", "button");
  });

  it("allows a tooltip different from the accessible name", () => {
    render(<IconButton icon={<svg />} label="Editar tarea X" title="Editar" />);

    const button = screen.getByRole("button", { name: "Editar tarea X" });

    expect(button).toHaveAttribute("title", "Editar");
  });

  it("calls onClick and respects disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    const { rerender } = render(
      <IconButton icon={<svg />} label="Borrar" onClick={onClick} />,
    );

    await user.click(screen.getByRole("button", { name: "Borrar" }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<IconButton icon={<svg />} label="Borrar" onClick={onClick} disabled />);
    await user.click(screen.getByRole("button", { name: "Borrar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("builds a clean class list with variant, size, active and custom class", () => {
    render(
      <IconButton
        icon={<svg />}
        label="Ok"
        variant="ghost-danger"
        size="small"
        active
        className="extra"
      />,
    );

    expect(screen.getByRole("button").className).toBe(
      "icon-button icon-button-ghost-danger icon-button-small icon-button-active extra",
    );
  });

  it("forwards extra aria attributes", () => {
    render(<IconButton icon={<svg />} label="Mostrar" aria-pressed="false" />);

    expect(screen.getByRole("button", { name: "Mostrar" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("hides the decorative icon wrapper from assistive tech", () => {
    const { container } = render(<IconButton icon={<svg />} label="Ok" />);

    expect(container.querySelector(".icon-button-icon")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
