import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import TaskForm from "./TaskForm";

describe("TaskForm", () => {
  test("no llama a onSubmit y muestra un error de validación si title está vacío", () => {
    const onSubmit = vi.fn();

    render(
      <TaskForm
        onSubmit={onSubmit}
      />
    );

    const submitButton = screen.getByRole("button", {
      name: /guardar|crear|enviar/i,
    });

    fireEvent.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();

    expect(
      screen.getByText(/el título de la tarea es obligatorio/i)
    ).toBeInTheDocument();
  });

  test("precarga los campos cuando recibe una tarea por prop", () => {
    const onSubmit = vi.fn();

    const task = {
      id: 1,
      title: "Estudiar React",
      description: "Repasar componentes y hooks",
      priority: "alta",
    };

    render(
      <TaskForm
        initialData={task}
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
      screen.getByDisplayValue("Alta")
    ).toBeInTheDocument();
  });

  test("onSubmit recibe los datos correctos del formulario", () => {
    const onSubmit = vi.fn();

    render(
      <TaskForm
        onSubmit={onSubmit}
      />
    );

    const titleInput = screen.getByLabelText(/título/i);

    const descriptionInput = screen.getByLabelText(
      /descripción/i
    );

    const dueDateInput = screen.getByLabelText(/fecha de entrega/i);

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

    fireEvent.change(dueDateInput, {
      target: {
        value: "2026-12-31",
      },
    });

    const submitButton = screen.getByRole("button", {
      name: /guardar|crear|enviar/i,
    });

    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Completar proyecto",
        description: "Terminar la implementación de Focusly",
        dueDate: "2026-12-31",
      })
    );
  });
});
