import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskCard from "./TaskCard";

describe("TaskCard", () => {
  const baseTask = {
    id: 1,
    title: "Estudiar matemáticas",
    description: "Repasar funciones y ecuaciones",
    dueDate: "2026-09-25",
    completed: false,
  };

  const renderTaskCard = (overrides = {}) => {
    const props = {
      task: { ...baseTask, ...overrides },
      onToggle: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    };

    render(<TaskCard {...props} />);

    return props;
  };

  test("muestra título, descripción, fecha y estado pendiente correctamente", () => {
    renderTaskCard();

    expect(screen.getByText("Estudiar matemáticas")).toBeInTheDocument();
    expect(
      screen.getByText("Repasar funciones y ecuaciones")
    ).toBeInTheDocument();

    expect(screen.getByText(/25\/09\/2026|2026-09-25/)).toBeInTheDocument();

    expect(
      screen.getByText(/pendiente/i)
    ).toBeInTheDocument();
  });

  test("muestra correctamente el estado de tarea completada", () => {
    renderTaskCard({
      completed: true,
    });

    expect(
      screen.getByText(/completada/i)
    ).toBeInTheDocument();
  });

  test("el checkbox dispara onToggle", async () => {
    const user = userEvent.setup();
    const props = renderTaskCard();

    const checkbox = screen.getByRole("checkbox");

    await user.click(checkbox);

    expect(props.onToggle).toHaveBeenCalledTimes(1);
  });

  test("el botón de editar dispara onEdit", async () => {
    const user = userEvent.setup();
    const props = renderTaskCard();

    const editButton = screen.getByRole("button", {
      name: /editar/i,
    });

    await user.click(editButton);

    expect(props.onEdit).toHaveBeenCalledTimes(1);
  });

  test("el botón de eliminar dispara onDelete", async () => {
    const user = userEvent.setup();
    const props = renderTaskCard();

    const deleteButton = screen.getByRole("button", {
      name: /eliminar/i,
    });

    await user.click(deleteButton);

    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });
});
