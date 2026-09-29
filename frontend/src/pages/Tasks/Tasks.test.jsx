import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Tasks from "./Tasks";
import useTask from "../../hooks/useTask";

vi.mock("../../hooks/useTask");
vi.mock("../../services/token.services", () => ({
  getToken: () => "fake-token",
}));

describe("Tasks", () => {
  const baseTask = {
    id: 1,
    title: "Repasar fundamentos de React",
    description: "Desarrollo web",
    dueDate: "2026-09-30T00:00:00.000Z",
    status: "PENDING",
    priority: "MEDIUM",
  };

  let createTaskAsync;
  let updateTaskAsync;
  let deleteTaskAsync;

  beforeEach(() => {
    createTaskAsync = vi.fn().mockResolvedValue({});
    updateTaskAsync = vi.fn().mockResolvedValue({});
    deleteTaskAsync = vi.fn().mockResolvedValue({});

    useTask.mockReturnValue({
      tasks: [baseTask],
      isLoading: false,
      isError: false,
      error: null,
      createTaskAsync,
      updateTaskAsync,
      deleteTaskAsync,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    });
  });

  // Regresión: Tasks.jsx debe llamar a las variantes *Async que expone
  // useTask (mutateAsync), no a las variantes síncronas .mutate. Antes
  // de este fix, createTaskAsync/updateTaskAsync/deleteTaskAsync no
  // existían en el hook y esto rompía con un TypeError en runtime.

  it("crea una tarea nueva llamando a createTaskAsync con los datos del formulario", async () => {
    const user = userEvent.setup();

    render(<Tasks />);

    await user.click(screen.getByRole("button", { name: "+ Nueva tarea" }));

    await user.type(
      screen.getByLabelText(/título de la tarea/i),
      "Nueva tarea de prueba",
    );

    await user.type(
      screen.getByLabelText(/fecha de entrega/i),
      "2026-10-15",
    );

    await user.click(screen.getByRole("button", { name: "Crear tarea" }));

    await waitFor(() => {
      expect(createTaskAsync).toHaveBeenCalledTimes(1);
    });

    expect(createTaskAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Nueva tarea de prueba",
        priority: "MEDIUM",
        status: "PENDING",
      }),
    );

    // El formulario se cierra tras un submit exitoso
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "Crear tarea" }),
      ).not.toBeInTheDocument();
    });
  });

  it("marca una tarea como completada llamando a updateTaskAsync con el nuevo status", async () => {
    const user = userEvent.setup();

    render(<Tasks />);

    await user.click(
      screen.getByRole("button", {
        name: `Marcar ${baseTask.title} como completada`,
      }),
    );

    await waitFor(() => {
      expect(updateTaskAsync).toHaveBeenCalledWith({
        id: baseTask.id,
        data: { status: "COMPLETED" },
      });
    });
  });

  it("elimina una tarea llamando a deleteTaskAsync tras confirmar", async () => {
    const user = userEvent.setup();

    render(<Tasks />);

    await user.click(
      screen.getByRole("button", { name: `Eliminar ${baseTask.title}` }),
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(deleteTaskAsync).toHaveBeenCalledWith(baseTask.id);
    });
  });
});
