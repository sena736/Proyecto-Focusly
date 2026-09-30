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

  test("renderiza título y fecha con Input: marca visual de obligatorio sin required nativo", () => {
    const { container } = render(<TaskForm onSubmit={vi.fn()} />);

    const title = screen.getByLabelText(/título de la tarea/i);
    const dueDate = screen.getByLabelText(/fecha de entrega/i);

    expect(title).toHaveClass("input-control");
    expect(title).toHaveAttribute("id", "task-title");
    expect(title).toHaveAttribute("maxlength", "100");
    expect(dueDate).toHaveClass("input-control");
    expect(dueDate).toHaveAttribute("type", "date");
    expect(dueDate).toHaveAttribute("id", "task-due-date");

    // La validación es propia del formulario: no debe aparecer la de la plataforma.
    // (toBeRequired() also honours aria-required, so assert on the DOM attributes.)
    expect(title).not.toHaveAttribute("required");
    expect(dueDate).not.toHaveAttribute("required");
    // ...but assistive tech still hears that the fields are required.
    expect(title).toHaveAttribute("aria-required", "true");
    expect(dueDate).toHaveAttribute("aria-required", "true");
    expect(container.querySelectorAll(".input-required")).toHaveLength(2);
  });

  test("enlaza el mensaje de error con el campo y lo limpia al corregir", () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /crear/i }));

    const title = screen.getByLabelText(/título de la tarea/i);
    const message = screen.getByText(/el título de la tarea es obligatorio/i);

    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveAttribute("aria-describedby", message.id);
    expect(screen.getByText("Selecciona una fecha.")).toBeInTheDocument();

    fireEvent.change(title, { target: { value: "Algo" } });

    expect(title).not.toHaveAttribute("aria-invalid");
    expect(
      screen.queryByText(/el título de la tarea es obligatorio/i)
    ).not.toBeInTheDocument();
  });

  test("mientras guarda, el botón principal muestra Guardando... y ambos botones se bloquean", () => {
    render(<TaskForm onSubmit={vi.fn()} loading />);

    const submit = screen.getByRole("button", { name: "Guardando..." });

    expect(submit).toBeDisabled();
    expect(submit).toHaveAttribute("type", "submit");
    expect(submit).toHaveClass("focusly-button--primary");
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  test("Cancelar llama a onCancel", () => {
    const onCancel = vi.fn();

    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("precarga los campos cuando recibe una tarea por prop", () => {
    const onSubmit = vi.fn();

    const task = {
      id: 1,
      title: "Estudiar React",
      description: "Repasar componentes y hooks",
      priority: "HIGH",
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

  test("precarga la fecha de entrega ISO como yyyy-mm-dd en el input de fecha", () => {
    const task = {
      id: 1,
      title: "Estudiar React",
      dueDate: "2026-09-30T00:00:00.000Z",
    };

    render(<TaskForm initialData={task} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/fecha de entrega/i)).toHaveValue(
      "2026-09-30"
    );
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
        dueDate: "2026-12-31T00:00:00.000Z",
      })
    );
  });
});
