import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import TaskForm from "./TaskForm";

describe("TaskForm", () => {
  test("el botón de enviar está deshabilitado si title está vacío", () => {
    const onSubmit = vi.fn();

    render(
      <TaskForm
        task={null}
        onSubmit={onSubmit}
      />
    );

    const submitButton = screen.getByRole("button", {
      name: /guardar|crear|enviar/i,
    });

    expect(submitButton).toBeDisabled();
  });

  test("precarga los campos cuando recibe una tarea por prop", () => {
    const onSubmit = vi.fn();

    const task = {
      id: 1,
      title: "Estudiar React",
      description: "Repasar componentes y hooks",
      priority: "high",
    };

    render(
      <TaskForm
        task={task}
        onSubmit={onSubmit}
      />
    );

    expect(
      screen.getByDisplayValue("Estudiar React")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Repasar componentes y hooks")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("high")
    ).toBeInTheDocument();
  });

  test("onSubmit recibe los datos correctos del formulario", () => {
    const onSubmit = vi.fn();

    render(
      <TaskForm
        task={null}
        onSubmit={onSubmit}
      />
    );

    const titleInput = screen.getByLabelText(/título/i);

    const descriptionInput = screen.getByLabelText(
      /descripción/i
    );

    fireEvent.change(titleInput, {
      target: {
        value: "Completar proyecto",
      },
    });

    fireEvent.change(descriptionInput, {
      target: {
        value: "Terminar la implementación de Focusly",
      },
    });

    const submitButton = screen.getByRole("button", {
      name: /guardar|crear|enviar/i,
    });

    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Completar proyecto",
        description: "Terminar la implementación de Focusly",
      })
    );
  });
});