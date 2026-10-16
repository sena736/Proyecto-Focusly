import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProfileEditForm from "./ProfileEditForm";

describe("ProfileEditForm", () => {
  const setup = (props = {}) => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ProfileEditForm
        initialName="Ana Gómez"
        onSubmit={onSubmit}
        onCancel={onCancel}
        {...props}
      />,
    );

    return { user, onSubmit, onCancel };
  };

  const nameField = () => screen.getByLabelText(/nombre/i);

  const replaceName = async (user, value) => {
    await user.clear(nameField());

    if (value) {
      await user.type(nameField(), value);
    }
  };

  test("renders a single 'Nombre' field prefilled with the current name", () => {
    setup();

    expect(nameField()).toHaveValue("Ana Gómez");
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
  });

  test("focuses the name field when it opens", () => {
    setup();

    expect(nameField()).toHaveFocus();
  });

  test("submits { name } with the trimmed value", async () => {
    const { user, onSubmit } = setup();

    await replaceName(user, "   María López   ");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ name: "María López" });
  });

  test("submits with Enter", async () => {
    const { user, onSubmit } = setup();

    await replaceName(user, "Luz");
    await user.keyboard("{Enter}");

    expect(onSubmit).toHaveBeenCalledWith({ name: "Luz" });
  });

  test.each([
    ["empty", ""],
    ["whitespace only", "     "],
  ])("blocks the submit and shows an inline error when the name is %s", async (_label, value) => {
    const { user, onSubmit } = setup();

    await replaceName(user, value);
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(nameField()).toHaveAttribute("aria-invalid", "true");
  });

  test("blocks the submit when the trimmed name exceeds 100 characters", async () => {
    const { user, onSubmit } = setup();

    await user.clear(nameField());
    await user.click(nameField());
    await user.paste("a".repeat(101));
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("El nombre no puede superar 100 caracteres."),
    ).toBeInTheDocument();
  });

  test("accepts exactly 100 characters, even when padded with spaces", async () => {
    const { user, onSubmit } = setup();
    const name = "a".repeat(100);

    await user.clear(nameField());
    await user.click(nameField());
    await user.paste(`  ${name}  `);
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onSubmit).toHaveBeenCalledWith({ name });
  });

  const pasteName = async (user, value) => {
    await user.clear(nameField());
    await user.click(nameField());
    await user.paste(value);
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
  };

  test.each([
    ["only zero-width characters", "​​‍"],
    ["only a BOM and zero-width joiner", "﻿‍"],
  ])("rejects a name made of %s as required", async (_label, value) => {
    const { user, onSubmit } = setup();

    await pasteName(user, value);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
  });

  test.each([
    ["a NUL character", "Ana\u0000Gómez"],
    // Newlines never reach a single-line <input> (the browser strips them),
    // so another control character stands in for them here.
    ["a bell control character", "Ana\u0007Gómez"],
    ["a tab", "Ana\tGómez"],
  ])("rejects a name containing %s", async (_label, value) => {
    const { user, onSubmit } = setup();

    await pasteName(user, value);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("El nombre contiene caracteres no válidos."),
    ).toBeInTheDocument();
  });

  test.each([
    ["an accented name", "José Ñandú"],
    ["an emoji name", "Ana 🚀"],
  ])("still accepts %s", async (_label, value) => {
    const { user, onSubmit } = setup();

    await pasteName(user, value);

    expect(onSubmit).toHaveBeenCalledWith({ name: value });
  });

  test("counts code points: 100 emoji are accepted and 101 are rejected", async () => {
    const { user, onSubmit } = setup();

    await pasteName(user, "😀".repeat(100));
    expect(onSubmit).toHaveBeenCalledWith({ name: "😀".repeat(100) });

    onSubmit.mockClear();

    await pasteName(user, "😀".repeat(101));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("El nombre no puede superar 100 caracteres."),
    ).toBeInTheDocument();
  });

  test("clears the inline error as soon as the user edits the field", async () => {
    const { user } = setup();

    await replaceName(user, "");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();

    await user.type(nameField(), "A");

    expect(screen.queryByText("El nombre es obligatorio.")).not.toBeInTheDocument();
  });

  test("Cancelar is a type=button that calls onCancel and does not submit", async () => {
    const { user, onSubmit, onCancel } = setup();

    const cancel = screen.getByRole("button", { name: "Cancelar" });

    expect(cancel).toHaveAttribute("type", "button");

    await user.click(cancel);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("shows 'Guardando...' and locks the form while loading", () => {
    setup({ loading: true });

    expect(screen.getByRole("button", { name: /guardando/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(nameField()).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Guardar cambios" }),
    ).not.toBeInTheDocument();
  });

  test("shows the server error in an error Alert and keeps the typed value", async () => {
    const { user } = setup({ error: "El nombre no puede superar 100 caracteres." });

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("alert-error");
    expect(alert).toHaveTextContent("El nombre no puede superar 100 caracteres.");
    expect(nameField()).toHaveValue("Ana Gómez");

    await replaceName(user, "Otro");
    expect(nameField()).toHaveValue("Otro");
  });

  test("shows no Alert when there is no server error", () => {
    setup();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
