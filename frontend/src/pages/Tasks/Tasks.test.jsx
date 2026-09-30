import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
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
  let hookState;

  beforeEach(() => {
    createTaskAsync = vi.fn().mockResolvedValue({});
    updateTaskAsync = vi.fn().mockResolvedValue({});
    deleteTaskAsync = vi.fn().mockResolvedValue({});

    hookState = {
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
    };

    useTask.mockReturnValue(hookState);
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

  describe("formulario en Modal", () => {
    it("muestra el formulario de creación dentro de un diálogo titulado", async () => {
      const user = userEvent.setup();

      render(<Tasks />);

      await user.click(screen.getByRole("button", { name: "+ Nueva tarea" }));

      expect(
        screen.getByRole("dialog", { name: "Nueva tarea" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Crear tarea" }),
      ).toBeInTheDocument();
    });

    it("muestra el formulario de edición precargado", async () => {
      const user = userEvent.setup();

      render(<Tasks />);

      await user.click(
        screen.getByRole("button", { name: `Editar ${baseTask.title}` }),
      );

      expect(
        screen.getByRole("dialog", { name: "Editar tarea" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/título de la tarea/i)).toHaveValue(
        baseTask.title,
      );
      expect(
        screen.getByRole("button", { name: "Guardar cambios" }),
      ).toBeInTheDocument();
    });

    it("se cierra con Escape", async () => {
      const user = userEvent.setup();

      render(<Tasks />);

      await user.click(screen.getByRole("button", { name: "+ Nueva tarea" }));
      await user.keyboard("{Escape}");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("se cierra al hacer click en el overlay pero no dentro del diálogo", async () => {
      const user = userEvent.setup();

      render(<Tasks />);

      await user.click(screen.getByRole("button", { name: "+ Nueva tarea" }));

      const dialog = screen.getByRole("dialog");

      await user.click(dialog);
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(dialog.parentElement);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("se cierra con el botón Cancelar del formulario", async () => {
      const user = userEvent.setup();

      render(<Tasks />);

      await user.click(screen.getByRole("button", { name: "+ Nueva tarea" }));
      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("confirmación de eliminación", () => {
    const openDeleteDialog = async (user) => {
      await user.click(
        screen.getByRole("button", { name: `Eliminar ${baseTask.title}` }),
      );
    };

    it("muestra el nombre de la tarea entre comillas y la advertencia", async () => {
      const user = userEvent.setup();

      render(<Tasks />);
      await openDeleteDialog(user);

      const dialog = screen.getByRole("dialog", { name: "¿Eliminar tarea?" });

      expect(dialog).toHaveTextContent(`"${baseTask.title}"`);
      expect(dialog).toHaveTextContent("Esta acción no se puede deshacer.");
    });

    it("cancelar cierra el diálogo sin eliminar", async () => {
      const user = userEvent.setup();

      render(<Tasks />);
      await openDeleteDialog(user);
      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(deleteTaskAsync).not.toHaveBeenCalled();
    });

    it("muestra Eliminando... y bloquea los botones mientras elimina", async () => {
      const user = userEvent.setup();

      const { rerender } = render(<Tasks />);
      await openDeleteDialog(user);

      useTask.mockReturnValue({ ...hookState, isDeleting: true });
      rerender(<Tasks />);

      expect(
        screen.getByRole("button", { name: "Eliminando..." }),
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    });
  });

  describe("filtros", () => {
    const pendingHigh = {
      ...baseTask,
      id: 10,
      title: "Pendiente urgente",
      status: "PENDING",
      priority: "HIGH",
    };
    const pendingLow = {
      ...baseTask,
      id: 11,
      title: "Pendiente tranquila",
      status: "PENDING",
      priority: "LOW",
    };
    const completedHigh = {
      ...baseTask,
      id: 12,
      title: "Completada urgente",
      status: "COMPLETED",
      priority: "HIGH",
    };
    const completedMedium = {
      ...baseTask,
      id: 13,
      title: "Completada normal",
      status: "COMPLETED",
      priority: "MEDIUM",
    };

    const mockTasks = (tasks) => {
      useTask.mockReturnValue({
        ...hookState,
        tasks,
      });
    };

    beforeEach(() => {
      mockTasks([pendingHigh, pendingLow, completedHigh, completedMedium]);
    });

    it("muestra todas las tareas por defecto", () => {
      render(<Tasks />);

      expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getAllByRole("article")).toHaveLength(4);
    });

    it("filtra solo las tareas pendientes", async () => {
      const user = userEvent.setup();

      render(<Tasks />);

      await user.click(screen.getByRole("button", { name: "Pendientes" }));

      expect(screen.getByText("Pendiente urgente")).toBeInTheDocument();
      expect(screen.getByText("Pendiente tranquila")).toBeInTheDocument();
      expect(screen.queryByText("Completada urgente")).not.toBeInTheDocument();
      expect(screen.queryByText("Completada normal")).not.toBeInTheDocument();
    });

    it("filtra solo las tareas completadas", async () => {
      const user = userEvent.setup();

      render(<Tasks />);

      await user.click(screen.getByRole("button", { name: "Completadas" }));

      expect(screen.getByText("Completada urgente")).toBeInTheDocument();
      expect(screen.getByText("Completada normal")).toBeInTheDocument();
      expect(screen.queryByText("Pendiente urgente")).not.toBeInTheDocument();
      expect(screen.queryByText("Pendiente tranquila")).not.toBeInTheDocument();
    });

    it("el filtro de prioridad muestra solo las tareas de prioridad alta", async () => {
      const user = userEvent.setup();

      render(<Tasks />);

      await user.click(screen.getByRole("button", { name: "Prioridad" }));

      expect(screen.getByText("Pendiente urgente")).toBeInTheDocument();
      expect(screen.getByText("Completada urgente")).toBeInTheDocument();
      expect(screen.queryByText("Pendiente tranquila")).not.toBeInTheDocument();
      expect(screen.queryByText("Completada normal")).not.toBeInTheDocument();
    });

    it("muestra un estado vacío del filtro y permite volver a ver todas", async () => {
      const user = userEvent.setup();

      mockTasks([pendingLow]);

      render(<Tasks />);

      await user.click(screen.getByRole("button", { name: "Completadas" }));

      expect(screen.queryByRole("article")).not.toBeInTheDocument();
      expect(
        screen.getByText("No hay tareas para este filtro"),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: "Ver todas las tareas" }),
      );

      expect(screen.getByText("Pendiente tranquila")).toBeInTheDocument();
    });

    it("vuelve al filtro Todas tras crear una tarea que no coincide con el filtro activo", async () => {
      const user = userEvent.setup();

      mockTasks([pendingLow]);

      render(<Tasks />);

      await user.click(screen.getByRole("button", { name: "Completadas" }));
      expect(
        screen.getByText("No hay tareas para este filtro"),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "+ Nueva tarea" }));
      await user.type(
        screen.getByLabelText(/título de la tarea/i),
        "Nueva pendiente",
      );
      await user.type(
        screen.getByLabelText(/fecha de entrega/i),
        "2026-10-15",
      );
      await user.click(screen.getByRole("button", { name: "Crear tarea" }));

      await waitFor(() => {
        expect(createTaskAsync).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute(
          "aria-pressed",
          "true",
        );
      });
      expect(screen.getByText("Pendiente tranquila")).toBeInTheDocument();
    });

    it("no cambia el filtro activo al editar una tarea", async () => {
      const user = userEvent.setup();

      render(<Tasks />);

      await user.click(screen.getByRole("button", { name: "Completadas" }));
      await user.click(
        screen.getByRole("button", { name: "Editar Completada urgente" }),
      );
      await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

      await waitFor(() => {
        expect(updateTaskAsync).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByRole("button", { name: "Completadas" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("restablece el filtro a Todas cuando la lista queda vacía", async () => {
      const user = userEvent.setup();

      const { rerender } = render(<Tasks />);

      await user.click(screen.getByRole("button", { name: "Completadas" }));

      // Every task is deleted: TaskFilters unmounts with "completed" active
      mockTasks([]);
      rerender(<Tasks />);
      expect(
        screen.getByText("No tienes tareas todavía"),
      ).toBeInTheDocument();

      // A new (pending) task arrives: it must not be hidden by the old filter
      mockTasks([pendingLow]);
      rerender(<Tasks />);

      expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByText("Pendiente tranquila")).toBeInTheDocument();
    });
  });

  describe("encabezado", () => {
    it("renders title, subtitle and the create action through PageHeader", () => {
      const { container } = render(<Tasks />);

      const header = container.querySelector("header.focusly-page-header");

      expect(header).not.toBeNull();
      expect(
        within(header).getByRole("heading", { level: 1, name: "Mis tareas" }),
      ).toBeInTheDocument();
      expect(
        within(header).getByText(
          "Organiza tus tareas y mantén al día tus actividades.",
        ),
      ).toBeInTheDocument();

      const action = header.querySelector(".focusly-page-header__action");

      expect(
        within(action).getByRole("button", { name: "+ Nueva tarea" }),
      ).toBeInTheDocument();
    });

    it("renders exactly one h1", () => {
      render(<Tasks />);

      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    });
  });

  describe("estados de la página", () => {
    it("muestra el Loader mientras se cargan las tareas", () => {
      useTask.mockReturnValue({
        ...hookState,
        tasks: [],
        isLoading: true,
      });

      render(<Tasks />);

      expect(screen.getByText("Cargando tareas...")).toBeInTheDocument();
      expect(
        document.querySelector(".loader-container"),
      ).toBeInTheDocument();
    });

    it("muestra el EmptyState con la acción de crear cuando no hay tareas", async () => {
      const user = userEvent.setup();

      useTask.mockReturnValue({
        ...hookState,
        tasks: [],
      });

      render(<Tasks />);

      expect(
        screen.getByText("No tienes tareas todavía"),
      ).toBeInTheDocument();
      // Sin tareas no tiene sentido ofrecer filtros
      expect(
        screen.queryByRole("button", { name: "Pendientes" }),
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: "Crear primera tarea" }),
      );

      expect(
        screen.getByRole("button", { name: "Crear tarea" }),
      ).toBeInTheDocument();
    });

    it("muestra un Alert de error cuando falla una acción y permite cerrarlo", async () => {
      const user = userEvent.setup();

      updateTaskAsync.mockRejectedValue(new Error("Fallo del servidor"));

      render(<Tasks />);

      await user.click(
        screen.getByRole("button", {
          name: `Marcar ${baseTask.title} como completada`,
        }),
      );

      const alert = await screen.findByRole("alert");

      expect(alert).toHaveTextContent("Fallo del servidor");
      expect(alert).toHaveClass("alert-error");

      await user.click(screen.getByRole("button", { name: "Cerrar alerta" }));

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
