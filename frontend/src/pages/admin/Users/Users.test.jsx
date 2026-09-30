import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import Users from "./Users";
import useUsers from "../../../hooks/useUsers";

vi.mock("../../../hooks/useUsers");

const baseState = {
  users: [],
  isLoading: false,
  isError: false,
  error: null,
  updateUserRole: vi.fn(),
  isUpdatingRole: false,
};

describe("Users", () => {
  it("muestra el Loader mientras se cargan los usuarios", () => {
    useUsers.mockReturnValue({ ...baseState, isLoading: true });

    render(<Users />);

    expect(screen.getByText("Cargando usuarios...")).toBeInTheDocument();
    expect(document.querySelector(".loader-container")).toBeInTheDocument();
  });

  it("muestra un Alert de error cuando falla la carga", () => {
    useUsers.mockReturnValue({
      ...baseState,
      isError: true,
      error: new Error("Sin conexión"),
    });

    render(<Users />);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveTextContent("Sin conexión");
    expect(alert).toHaveClass("alert-error");
  });

  it("usa un mensaje por defecto en el Alert cuando el error no trae mensaje", () => {
    useUsers.mockReturnValue({ ...baseState, isError: true, error: null });

    render(<Users />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No fue posible cargar los usuarios.",
    );
  });

  it("muestra el EmptyState cuando no hay usuarios registrados", () => {
    useUsers.mockReturnValue({ ...baseState, users: [] });

    render(<Users />);

    expect(screen.getByText("No hay usuarios")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renderiza el encabezado con PageHeader y el contador en la zona de acción", () => {
    useUsers.mockReturnValue({
      ...baseState,
      users: [
        { id: 1, name: "Ana", email: "ana@test.com", role: "USER" },
        { id: 2, name: "Bea", email: "bea@test.com", role: "ADMIN" },
      ],
    });

    const { container } = render(<Users />);

    const header = container.querySelector("header.focusly-page-header");

    expect(header).not.toBeNull();
    expect(
      within(header).getByRole("heading", { level: 1, name: "Usuarios" }),
    ).toBeInTheDocument();
    expect(
      within(header).getByText(/administra los usuarios registrados/i),
    ).toBeInTheDocument();
    expect(
      header.querySelector(".focusly-page-header__action"),
    ).toHaveTextContent("2 usuarios");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("muestra la tabla cuando hay usuarios", () => {
    useUsers.mockReturnValue({
      ...baseState,
      users: [
        { id: 1, name: "Ana", email: "ana@test.com", role: "USER" },
      ],
    });

    render(<Users />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("ana@test.com")).toBeInTheDocument();
    expect(screen.queryByText("No hay usuarios")).not.toBeInTheDocument();
  });
});
