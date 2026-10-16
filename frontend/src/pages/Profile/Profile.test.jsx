import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Profile from "./Profile";
import useProfile from "../../hooks/useProfile";
import { AuthContext } from "../../context/AuthContext";

vi.mock("../../hooks/useProfile");

describe("Profile", () => {
  const updateUser = vi.fn();

  const renderProfile = () =>
    render(
      <AuthContext.Provider value={{ updateUser }}>
        <Profile />
      </AuthContext.Provider>,
    );

  beforeEach(() => {
    updateUser.mockClear();
  });

  test("renderiza la información del perfil cuando useProfile devuelve datos", () => {
    useProfile.mockReturnValue({
      profile: {
        name: "Usuario de prueba",
        email: "usuario@test.com",
        role: "Administrador",
      },
      isLoading: false,
      isError: false,
      error: null,
      updateProfile: vi.fn(),
      isUpdating: false,
    });

    renderProfile();

    expect(
      screen.queryByText(/no hay información del perfil/i)
    ).not.toBeInTheDocument();

    expect(screen.getByText("Usuario de prueba")).toBeInTheDocument();
    expect(screen.getByText("usuario@test.com")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });

  test("renderiza el encabezado con PageHeader (un solo h1 y la etiqueta CUENTA como breadcrumb)", () => {
    useProfile.mockReturnValue({
      profile: { name: "Usuario de prueba", email: "usuario@test.com", role: "USER" },
      isLoading: false,
      isError: false,
      error: null,
      updateProfile: vi.fn(),
      isUpdating: false,
    });

    const { container } = renderProfile();

    const header = container.querySelector("header.focusly-page-header");

    expect(header).not.toBeNull();
    expect(
      within(header).getByRole("heading", { level: 1, name: "Mi perfil" })
    ).toBeInTheDocument();
    expect(
      within(header).getByText(/consulta tu información personal/i)
    ).toBeInTheDocument();
    expect(
      header.querySelector(".focusly-page-header__breadcrumb")
    ).toHaveTextContent("CUENTA");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  test("muestra el estado de carga mientras isLoading es true", () => {
    useProfile.mockReturnValue({
      profile: undefined,
      isLoading: true,
      isError: false,
      error: null,
      updateProfile: vi.fn(),
      isUpdating: false,
    });

    renderProfile();

    expect(screen.getByText(/cargando perfil/i)).toBeInTheDocument();
    expect(document.querySelector(".loader-container")).toBeInTheDocument();
  });

  test("muestra un Alert de error cuando falla la carga del perfil", () => {
    useProfile.mockReturnValue({
      profile: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Sin conexión"),
      updateProfile: vi.fn(),
      isUpdating: false,
    });

    renderProfile();

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("alert-error");
    expect(alert).toHaveTextContent("No se pudo cargar el perfil");
    expect(alert).toHaveTextContent("Sin conexión");
  });

  test("un fallo de refetch en segundo plano (isError con datos) mantiene la tarjeta", () => {
    useProfile.mockReturnValue({
      profile: { name: "Ana Gómez", email: "ana@test.com", role: "USER" },
      isLoading: false,
      isError: true,
      error: new Error("Sin conexión"),
      updateProfile: vi.fn(),
      isUpdating: false,
    });

    renderProfile();

    expect(
      screen.getByRole("heading", { level: 2, name: "Ana Gómez" })
    ).toBeInTheDocument();
    expect(screen.queryByText("No se pudo cargar el perfil")).not.toBeInTheDocument();
  });

  test("muestra el estado vacío solo cuando realmente no hay perfil", () => {
    useProfile.mockReturnValue({
      profile: undefined,
      isLoading: false,
      isError: false,
      error: null,
      updateProfile: vi.fn(),
      isUpdating: false,
    });

    renderProfile();

    expect(
      screen.getByText(/no hay información del perfil/i)
    ).toBeInTheDocument();
  });

  describe("editar nombre", () => {
    const baseHook = (overrides = {}) => ({
      profile: { name: "Ana Gómez", email: "ana@test.com", role: "USER" },
      isLoading: false,
      isError: false,
      error: null,
      updateProfile: vi.fn(),
      updateProfileAsync: vi.fn().mockResolvedValue({ name: "María López" }),
      isUpdating: false,
      ...overrides,
    });

    const openModal = async (user) => {
      await user.click(screen.getByRole("button", { name: "Editar perfil" }));
      return screen.getByRole("dialog");
    };

    test("el botón Editar abre el modal y NO dispara la mutación", async () => {
      const hook = baseHook();
      useProfile.mockReturnValue(hook);
      const user = userEvent.setup();

      renderProfile();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      const dialog = await openModal(user);

      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByLabelText(/nombre/i)).toHaveValue("Ana Gómez");
      expect(hook.updateProfile).not.toHaveBeenCalled();
      expect(hook.updateProfileAsync).not.toHaveBeenCalled();
    });

    test("guardar envía { name } recortado con updateProfileAsync, actualiza AuthContext y cierra el modal", async () => {
      const hook = baseHook();
      useProfile.mockReturnValue(hook);
      const user = userEvent.setup();

      renderProfile();

      const dialog = await openModal(user);
      const field = within(dialog).getByLabelText(/nombre/i);

      await user.clear(field);
      await user.type(field, "  María López  ");
      await user.click(
        within(dialog).getByRole("button", { name: "Guardar cambios" }),
      );

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      expect(hook.updateProfileAsync).toHaveBeenCalledTimes(1);
      expect(hook.updateProfileAsync).toHaveBeenCalledWith({
        name: "María López",
      });
      expect(hook.updateProfile).not.toHaveBeenCalled();
      expect(updateUser).toHaveBeenCalledWith({ name: "María López" });
      expect(screen.getByRole("alert")).toHaveClass("alert-success");
    });

    test("propaga a AuthContext el nombre que devolvió el servidor", async () => {
      const hook = baseHook({
        updateProfileAsync: vi
          .fn()
          .mockResolvedValue({ name: "Nombre del servidor" }),
      });
      useProfile.mockReturnValue(hook);
      const user = userEvent.setup();

      renderProfile();

      const dialog = await openModal(user);
      await user.click(
        within(dialog).getByRole("button", { name: "Guardar cambios" }),
      );

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith({
          name: "Nombre del servidor",
        });
      });
    });

    test("un nombre inválido no llama a la API y muestra el error en línea", async () => {
      const hook = baseHook();
      useProfile.mockReturnValue(hook);
      const user = userEvent.setup();

      renderProfile();

      const dialog = await openModal(user);
      await user.clear(within(dialog).getByLabelText(/nombre/i));
      await user.click(
        within(dialog).getByRole("button", { name: "Guardar cambios" }),
      );

      expect(hook.updateProfileAsync).not.toHaveBeenCalled();
      expect(
        within(dialog).getByText("El nombre es obligatorio."),
      ).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    test("si la API falla mantiene el modal abierto y muestra el mensaje del servidor", async () => {
      const hook = baseHook({
        updateProfileAsync: vi
          .fn()
          .mockRejectedValue(
            new Error("El nombre no puede superar 100 caracteres."),
          ),
      });
      useProfile.mockReturnValue(hook);
      const user = userEvent.setup();

      renderProfile();

      const dialog = await openModal(user);
      await user.click(
        within(dialog).getByRole("button", { name: "Guardar cambios" }),
      );

      const alert = await within(dialog).findByRole("alert");

      expect(alert).toHaveClass("alert-error");
      expect(alert).toHaveTextContent(
        "El nombre no puede superar 100 caracteres.",
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(updateUser).not.toHaveBeenCalled();
    });

    test("un error sin mensaje usa un texto de respaldo en español", async () => {
      const hook = baseHook({
        updateProfileAsync: vi.fn().mockRejectedValue(new Error("")),
      });
      useProfile.mockReturnValue(hook);
      const user = userEvent.setup();

      renderProfile();

      const dialog = await openModal(user);
      await user.click(
        within(dialog).getByRole("button", { name: "Guardar cambios" }),
      );

      expect(await within(dialog).findByRole("alert")).toHaveTextContent(
        "No se pudo actualizar el perfil.",
      );
    });

    test("reabrir el modal borra el error anterior y restaura el nombre actual", async () => {
      const hook = baseHook({
        updateProfileAsync: vi.fn().mockRejectedValue(new Error("Falló")),
      });
      useProfile.mockReturnValue(hook);
      const user = userEvent.setup();

      renderProfile();

      let dialog = await openModal(user);
      await user.type(within(dialog).getByLabelText(/nombre/i), " extra");
      await user.click(
        within(dialog).getByRole("button", { name: "Guardar cambios" }),
      );
      await within(dialog).findByRole("alert");

      await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      dialog = await openModal(user);

      expect(within(dialog).queryByRole("alert")).not.toBeInTheDocument();
      expect(within(dialog).getByLabelText(/nombre/i)).toHaveValue("Ana Gómez");
    });

    test("Cancelar, Escape y el overlay cierran el modal cuando no se está guardando", async () => {
      useProfile.mockReturnValue(baseHook());
      const user = userEvent.setup();

      renderProfile();

      let dialog = await openModal(user);
      await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await openModal(user);
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      dialog = await openModal(user);
      await user.pointer({ keys: "[MouseLeft]", target: dialog.parentElement });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    test("el modal no se cierra mientras se guarda (Escape, overlay, cerrar, Cancelar)", async () => {
      const user = userEvent.setup();

      // Opens while idle, then the mutation goes pending.
      useProfile.mockReturnValue(baseHook());
      const { rerender } = renderProfile();
      await openModal(user);

      useProfile.mockReturnValue(baseHook({ isUpdating: true }));
      rerender(
        <AuthContext.Provider value={{ updateUser }}>
          <Profile />
        </AuthContext.Provider>,
      );

      const dialog = screen.getByRole("dialog");

      await user.keyboard("{Escape}");
      await user.pointer({ keys: "[MouseLeft]", target: dialog.parentElement });

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        within(dialog).getByRole("button", { name: "Cerrar ventana" }),
      ).toBeDisabled();
      expect(
        within(dialog).getByRole("button", { name: "Cancelar" }),
      ).toBeDisabled();
      expect(
        within(dialog).getByRole("button", { name: /guardando/i }),
      ).toBeDisabled();
    });

    test("el botón Editar de la tarjeta se deshabilita mientras se guarda", () => {
      useProfile.mockReturnValue(baseHook({ isUpdating: true }));

      renderProfile();

      expect(
        screen.getByRole("button", { name: "Editar perfil" }),
      ).toBeDisabled();
    });

    test("al cerrar el modal el foco vuelve al botón Editar", async () => {
      useProfile.mockReturnValue(baseHook());
      const user = userEvent.setup();

      renderProfile();

      const trigger = screen.getByRole("button", { name: "Editar perfil" });
      const dialog = await openModal(user);

      expect(within(dialog).getByLabelText(/nombre/i)).toHaveFocus();

      await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

      await waitFor(() => expect(trigger).toHaveFocus());
    });

    test("la alerta de éxito se puede descartar", async () => {
      useProfile.mockReturnValue(baseHook());
      const user = userEvent.setup();

      renderProfile();

      const dialog = await openModal(user);
      await user.click(
        within(dialog).getByRole("button", { name: "Guardar cambios" }),
      );

      const alert = await screen.findByRole("alert");
      await user.click(
        within(alert).getByRole("button", { name: "Cerrar alerta" }),
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
