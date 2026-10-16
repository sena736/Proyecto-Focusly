import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Profile from "./Profile";
import { AuthProvider, AuthContext } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../api/profile.api";
import api from "../../api/api";

// Only the network layer is mocked: hook, context, modal and form are real.
vi.mock("../../api/profile.api", () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("../../api/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock("../../services/token.services", () => ({
  getToken: () => "tok",
  setToken: vi.fn(),
  removeToken: vi.fn(),
}));

const SessionName = () => {
  const { user } = React.useContext(AuthContext);

  return <span data-testid="session-name">{user ? user.name : "sin sesión"}</span>;
};

const ANA = {
  id: 7,
  name: "Ana Gómez",
  email: "ana@test.com",
  role: "USER",
};

describe("Profile (integración: hook real + AuthContext real + API simulada)", () => {
  const renderPage = async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SessionName />
          <Profile />
        </AuthProvider>
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", { level: 2, name: "Ana Gómez" });
    await waitFor(() => {
      expect(screen.getByTestId("session-name")).toHaveTextContent("Ana Gómez");
    });

    return userEvent.setup();
  };

  const openModal = async (user) => {
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));
    return screen.getByRole("dialog");
  };

  beforeEach(() => {
    vi.clearAllMocks();

    getProfile.mockResolvedValue(ANA);
    api.get.mockResolvedValue({ data: { data: ANA } });
  });

  test("clicking Editar opens the modal and does not send any PATCH", async () => {
    const user = await renderPage();

    const dialog = await openModal(user);

    expect(within(dialog).getByLabelText(/nombre/i)).toHaveValue("Ana Gómez");
    expect(updateProfile).not.toHaveBeenCalled();
  });

  test("saving sends { name } trimmed, refreshes the profile and the session name, and closes the modal", async () => {
    updateProfile.mockResolvedValue({ ...ANA, name: "María López" });
    getProfile
      .mockResolvedValueOnce(ANA)
      .mockResolvedValue({ ...ANA, name: "María López" });

    const user = await renderPage();
    const dialog = await openModal(user);
    const field = within(dialog).getByLabelText(/nombre/i);

    await user.clear(field);
    await user.type(field, "   María López  ");
    await user.click(
      within(dialog).getByRole("button", { name: "Guardar cambios" }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(updateProfile).toHaveBeenCalledTimes(1);
    expect(updateProfile.mock.calls[0][0]).toEqual({ name: "María López" });

    // The profile query was invalidated and refetched.
    await waitFor(() => {
      expect(getProfile).toHaveBeenCalledTimes(2);
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "María López" }),
    ).toBeInTheDocument();

    // AuthContext (what the header/sidebar/dashboard read) has the new name.
    expect(screen.getByTestId("session-name")).toHaveTextContent("María López");

    expect(screen.getByRole("alert")).toHaveClass("alert-success");
  });

  test("a failing background refetch after a successful save keeps the card, the new name and the success alert", async () => {
    updateProfile.mockResolvedValue({ ...ANA, name: "María López" });
    getProfile
      .mockResolvedValueOnce(ANA)
      .mockRejectedValue(new Error("Sin conexión"));

    const user = await renderPage();
    const dialog = await openModal(user);
    const field = within(dialog).getByLabelText(/nombre/i);

    await user.clear(field);
    await user.type(field, "María López");
    await user.click(
      within(dialog).getByRole("button", { name: "Guardar cambios" }),
    );

    await waitFor(() => {
      expect(getProfile).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByRole("heading", { level: 2, name: "María López" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("No se pudo cargar el perfil")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("alert-success");
  });

  test("a server error keeps the modal open, shows the message and leaves the session name alone", async () => {
    updateProfile.mockRejectedValue(
      Object.assign(new Error("El nombre no puede superar 100 caracteres."), {
        status: 400,
      }),
    );

    const user = await renderPage();
    const dialog = await openModal(user);

    await user.type(within(dialog).getByLabelText(/nombre/i), " Jr");
    await user.click(
      within(dialog).getByRole("button", { name: "Guardar cambios" }),
    );

    const alert = await within(dialog).findByRole("alert");

    expect(alert).toHaveClass("alert-error");
    expect(alert).toHaveTextContent("El nombre no puede superar 100 caracteres.");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("session-name")).toHaveTextContent("Ana Gómez");
    expect(
      screen.getByRole("heading", { level: 2, name: "Ana Gómez" }),
    ).toBeInTheDocument();
  });

  test("while the request is pending the modal stays locked, then closes on success", async () => {
    let resolveUpdate;
    updateProfile.mockReturnValue(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      }),
    );

    const user = await renderPage();
    const dialog = await openModal(user);

    await user.click(
      within(dialog).getByRole("button", { name: "Guardar cambios" }),
    );

    expect(
      await within(dialog).findByRole("button", { name: /guardando/i }),
    ).toBeDisabled();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar perfil" })).toBeDisabled();

    resolveUpdate({ ...ANA, name: "Ana Gómez" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
