import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Modal from "./Modal";

describe("Modal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = "";
  });

  const renderModal = (props = {}) =>
    render(
      <Modal isOpen onClose={vi.fn()} title="Nueva tarea" {...props}>
        <p>Contenido</p>
      </Modal>,
    );

  it("renders title and children only when open", () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="Nueva tarea">
        <p>Contenido</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();

    rerender(
      <Modal isOpen onClose={vi.fn()} title="Nueva tarea">
        <p>Contenido</p>
      </Modal>,
    );

    expect(
      screen.getByRole("dialog", { name: "Nueva tarea" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("only reserves footer spacing on the body when a footer is rendered", () => {
    const { unmount } = renderModal({ showCancel: false, showConfirm: false });

    expect(screen.getByText("Contenido").parentElement).not.toHaveClass(
      "focusly-modal-body--with-footer",
    );
    unmount();

    renderModal();

    expect(screen.getByText("Contenido").parentElement).toHaveClass(
      "focusly-modal-body--with-footer",
    );
  });

  it("calls onClose on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal({ onClose });
    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking the overlay but not the dialog", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal({ onClose });
    const dialog = screen.getByRole("dialog");

    await user.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    await user.click(dialog.parentElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores Escape when closeOnEscape is false", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal({ onClose, closeOnEscape: false });
    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
  });

  describe("while loading", () => {
    it("does not close on Escape", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderModal({ onClose, loading: true });
      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });

    it("does not close on overlay click", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderModal({ onClose, loading: true });
      await user.click(screen.getByRole("dialog").parentElement);

      expect(onClose).not.toHaveBeenCalled();
    });

    it("disables the close button", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderModal({ onClose, loading: true });
      const closeButton = screen.getByRole("button", {
        name: "Cerrar ventana",
      });

      await user.click(closeButton);

      expect(closeButton).toBeDisabled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it("blocks Escape when loading flips to true after opening", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const { rerender } = render(
        <Modal isOpen onClose={onClose} title="Nueva tarea" />,
      );
      rerender(<Modal isOpen onClose={onClose} title="Nueva tarea" loading />);

      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("side effects", () => {
    it("locks body scroll while open and restores it on unmount", () => {
      document.body.style.overflow = "auto";

      const { unmount } = renderModal();
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("auto");
    });

    it("restores body scroll and removes the listener when closed", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const { rerender } = render(
        <Modal isOpen onClose={onClose} title="Nueva tarea" />,
      );
      rerender(<Modal isOpen={false} onClose={onClose} title="Nueva tarea" />);

      expect(document.body.style.overflow).toBe("");

      await user.keyboard("{Escape}");
      expect(onClose).not.toHaveBeenCalled();
    });

    it("removes the Escape listener on unmount", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const { unmount } = renderModal({ onClose });
      unmount();

      await user.keyboard("{Escape}");
      expect(onClose).not.toHaveBeenCalled();
    });

    it("does not re-subscribe when onClose changes identity between renders", async () => {
      const user = userEvent.setup();
      const addSpy = vi.spyOn(document, "addEventListener");
      const removeSpy = vi.spyOn(document, "removeEventListener");
      const keydownCalls = (spy) =>
        spy.mock.calls.filter(([type]) => type === "keydown").length;

      const first = vi.fn();
      const second = vi.fn();

      const { rerender } = render(
        <Modal isOpen onClose={first} title="Nueva tarea" />,
      );
      rerender(<Modal isOpen onClose={second} title="Nueva tarea" />);
      rerender(<Modal isOpen onClose={() => second()} title="Nueva tarea" />);

      expect(keydownCalls(addSpy)).toBe(1);
      expect(keydownCalls(removeSpy)).toBe(0);

      await user.keyboard("{Escape}");

      // Latest handler wins, stale one is never invoked, and only once
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });
  });
});
