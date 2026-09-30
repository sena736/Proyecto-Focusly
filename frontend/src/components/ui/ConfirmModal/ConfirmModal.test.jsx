import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConfirmModal from "./ConfirmModal";

describe("ConfirmModal", () => {
  const setup = (props = {}) => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmModal
        isOpen
        title="¿Eliminar tarea?"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      />,
    );

    return { onConfirm, onCancel };
  };

  it("renders nothing when closed", () => {
    render(<ConfirmModal isOpen={false} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders an accessible dialog with title, message and actions", () => {
    setup();

    expect(
      screen.getByRole("dialog", { name: "¿Eliminar tarea?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Esta acción no se puede deshacer."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Eliminar" })).toBeEnabled();
  });

  it("calls onConfirm and onCancel from their buttons", async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = setup();

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the overlay is clicked", async () => {
    const user = userEvent.setup();
    const { onCancel } = setup();

    await user.click(screen.getByRole("dialog").parentElement);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  describe("isLoading", () => {
    it("disables both buttons and the close button", () => {
      setup({ isLoading: true });

      expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cerrar" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Procesando..." }),
      ).toBeDisabled();
    });

    it("swaps the confirm label for a custom loadingText", () => {
      setup({ isLoading: true, loadingText: "Eliminando..." });

      expect(
        screen.getByRole("button", { name: "Eliminando..." }),
      ).toBeDisabled();
      expect(
        screen.queryByRole("button", { name: "Eliminar" }),
      ).not.toBeInTheDocument();
    });

    it("does not call onCancel when the overlay is clicked", async () => {
      const user = userEvent.setup();
      const { onCancel } = setup({ isLoading: true });

      await user.click(screen.getByRole("dialog").parentElement);

      expect(onCancel).not.toHaveBeenCalled();
    });
  });
});
