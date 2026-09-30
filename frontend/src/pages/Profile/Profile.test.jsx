import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import Profile from "./Profile";
import useProfile from "../../hooks/useProfile";

vi.mock("../../hooks/useProfile");

describe("Profile", () => {
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

    render(<Profile />);

    expect(
      screen.queryByText(/no hay información del perfil/i)
    ).not.toBeInTheDocument();

    expect(screen.getByText("Usuario de prueba")).toBeInTheDocument();
    expect(screen.getByText("usuario@test.com")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
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

    render(<Profile />);

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

    render(<Profile />);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("alert-error");
    expect(alert).toHaveTextContent("No se pudo cargar el perfil");
    expect(alert).toHaveTextContent("Sin conexión");
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

    render(<Profile />);

    expect(
      screen.getByText(/no hay información del perfil/i)
    ).toBeInTheDocument();
  });
});
