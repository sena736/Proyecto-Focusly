import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Input from "./Input";

const setup = (props = {}) =>
  render(<Input label="Correo" name="email" value="" onChange={() => {}} {...props} />);

describe("Input", () => {
  it("associates the label with the control through the name", () => {
    setup();

    expect(screen.getByLabelText("Correo")).toHaveAttribute("name", "email");
  });

  it("lets the caller pick an id different from the name", () => {
    setup({ id: "task-title", name: "title", label: "Título" });

    expect(screen.getByLabelText("Título")).toHaveAttribute("id", "task-title");
  });

  it("forwards native attributes (autoComplete, inputMode, maxLength) to the control", () => {
    setup({ autoComplete: "email", inputMode: "email", maxLength: 50 });

    const control = screen.getByLabelText("Correo");

    expect(control).toHaveAttribute("autocomplete", "email");
    expect(control).toHaveAttribute("inputmode", "email");
    expect(control).toHaveAttribute("maxlength", "50");
  });

  it("keeps the requested type", () => {
    setup({ type: "password", label: "Clave", name: "password" });

    expect(screen.getByLabelText("Clave")).toHaveAttribute("type", "password");
  });

  it("calls onChange while typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    setup({ onChange });

    await user.type(screen.getByLabelText("Correo"), "a");

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("sets the native required attribute WITHOUT showing an asterisk by default", () => {
    const { container } = setup({ required: true });

    expect(screen.getByLabelText("Correo")).toBeRequired();
    expect(container.querySelector(".input-required")).toBeNull();
  });

  it("shows a decorative asterisk only when showRequiredMark is set", () => {
    const { container } = setup({ showRequiredMark: true });

    const mark = container.querySelector(".input-required");

    expect(mark).toHaveTextContent("*");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    // The mark alone must not make the control natively required.
    expect(screen.getByLabelText(/correo/i)).not.toHaveAttribute("required");
  });

  it("announces a marked field as required to assistive tech via aria-required", () => {
    setup({ showRequiredMark: true });

    expect(screen.getByLabelText(/correo/i)).toHaveAttribute("aria-required", "true");
  });

  it("does not add aria-required when the field is not marked, nor when it is natively required", () => {
    const { unmount } = setup();
    expect(screen.getByLabelText("Correo")).not.toHaveAttribute("aria-required");
    unmount();

    setup({ required: true, showRequiredMark: true });
    const control = screen.getByLabelText(/correo/i);
    expect(control).toHaveAttribute("required");
    expect(control).not.toHaveAttribute("aria-required");
  });

  it("generates a unique error id when neither id nor name is given", () => {
    render(
      <>
        <Input label="Uno" value="" onChange={() => {}} error="Mal uno" />
        <Input label="Dos" value="" onChange={() => {}} error="Mal dos" />
      </>,
    );

    const one = screen.getByText("Mal uno");
    const two = screen.getByText("Mal dos");

    expect(one.id).not.toMatch(/undefined/);
    expect(one.id).not.toBe(two.id);
    expect(screen.getByLabelText("Uno")).toHaveAttribute("aria-describedby", one.id);
  });

  it("does not let a caller override the accessibility attributes it controls", () => {
    setup({ error: "Mal", "aria-invalid": "false", "aria-describedby": "otro" });

    const control = screen.getByLabelText("Correo");

    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAttribute("aria-describedby", screen.getByText("Mal").id);
  });

  it("renders the error message and links it to the control", () => {
    setup({ error: "Correo inválido" });

    const control = screen.getByLabelText("Correo");
    const message = screen.getByText("Correo inválido");

    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAttribute("aria-describedby", message.id);
    expect(message.id).not.toBe("");
  });

  it("is not marked invalid and has no description when there is no error", () => {
    setup();

    const control = screen.getByLabelText("Correo");

    expect(control).not.toHaveAttribute("aria-invalid");
    expect(control).not.toHaveAttribute("aria-describedby");
  });

  it("renders the leading icon and the trailing adornment inside the wrapper", () => {
    const { container } = setup({
      icon: <svg data-testid="lead" />,
      endAdornment: <button type="button">ojo</button>,
    });

    const wrapper = container.querySelector(".input-wrapper");

    expect(wrapper.querySelector(".input-icon [data-testid='lead']")).not.toBeNull();
    expect(wrapper.querySelector(".input-end button")).toHaveTextContent("ojo");
  });

  it("renders the label action next to the label, outside of it", () => {
    const { container } = setup({ labelAction: <a href="/x">Ayuda</a> });

    const row = container.querySelector(".input-label-row");

    expect(row.querySelector("label")).toHaveTextContent("Correo");
    expect(row.querySelector("a")).toHaveTextContent("Ayuda");
    // The accessible name of the control stays the plain label.
    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
  });

  it("disables the control and flags the wrapper", () => {
    const { container } = setup({ disabled: true });

    expect(screen.getByLabelText("Correo")).toBeDisabled();
    expect(container.querySelector(".input-wrapper")).toHaveClass("input-disabled");
  });

  it("accepts a custom class on the outer field so the caller owns the layout", () => {
    const { container } = setup({ className: "mi-campo" });

    expect(container.firstChild).toHaveClass("input-field", "mi-campo");
  });
});
