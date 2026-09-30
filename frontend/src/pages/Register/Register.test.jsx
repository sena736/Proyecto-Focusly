import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Register from "./Register";
import { AuthContext } from "../../context/AuthContext";
import { registerUser } from "../../api/auth.api";

vi.mock("../../api/auth.api", () => ({
  registerUser: vi.fn(),
}));

describe("Register", () => {
  let establishSession;

  const setup = () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ establishSession }}>
          <Register />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    return user;
  };

  const fill = async (
    user,
    { name = "Ana Perez", email, password, confirmPassword = password },
  ) => {
    await user.type(screen.getByLabelText("Nombre"), name);
    await user.type(screen.getByLabelText("Correo electrónico"), email);
    await user.type(screen.getByLabelText("Contraseña"), password);
    await user.type(
      screen.getByLabelText("Confirmar contraseña"),
      confirmPassword,
    );
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    establishSession = vi.fn().mockResolvedValue({ id: 1 });
    registerUser.mockResolvedValue({ token: "jwt" });
  });

  describe("form primitives", () => {
    it("renders the four fields through Input keeping type, autofill and required", () => {
      setup();

      const expectations = [
        ["Nombre", "text", "name"],
        ["Correo electrónico", "email", "email"],
        ["Contraseña", "password", "new-password"],
        ["Confirmar contraseña", "password", "new-password"],
      ];

      expectations.forEach(([label, type, autocomplete]) => {
        const control = screen.getByLabelText(label);

        expect(control).toHaveClass("input-control");
        expect(control).toHaveAttribute("type", type);
        expect(control).toHaveAttribute("autocomplete", autocomplete);
        expect(control).toBeRequired();
      });
    });

    it("submits with a primary full-width Button", () => {
      setup();

      const submit = screen.getByRole("button", { name: "Crear cuenta" });

      expect(submit).toHaveAttribute("type", "submit");
      expect(submit).toHaveClass(
        "focusly-button",
        "focusly-button--primary",
        "focusly-button--full",
      );
    });

    it("disables the button and shows the progress text while creating the account", async () => {
      registerUser.mockReturnValue(new Promise(() => {}));
      const user = setup();

      await fill(user, { email: "ana@example.com", password: "secret1" });

      const submit = await screen.findByRole("button", {
        name: "Creando cuenta...",
      });

      expect(submit).toBeDisabled();
    });
  });

  it("blocks the request and shows an error for an invalid email", async () => {
    const user = setup();

    // Passes the browser's type=email check but has no domain dot
    await fill(user, { email: "ana@localhost", password: "secret1" });

    expect(
      await screen.findByText("Ingresa un correo electrónico válido."),
    ).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("blocks the request and shows an error for a short password", async () => {
    const user = setup();

    await fill(user, { email: "ana@example.com", password: "12345" });

    expect(
      await screen.findByText(
        "La contraseña debe tener al menos 6 caracteres.",
      ),
    ).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("treats a whitespace-only password as too short", async () => {
    const user = setup();

    await fill(user, { email: "ana@example.com", password: "        " });

    expect(
      await screen.findByText(
        "La contraseña debe tener al menos 6 caracteres.",
      ),
    ).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("keeps the mismatch error when both passwords are valid but differ", async () => {
    const user = setup();

    await fill(user, {
      email: "ana@example.com",
      password: "secret1",
      confirmPassword: "secret2",
    });

    expect(
      await screen.findByText("Las contraseñas no coinciden."),
    ).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("sends the trimmed email when the input has surrounding spaces", async () => {
    const user = setup();

    await fill(user, { email: "  ana@example.com  ", password: "secret1" });

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        name: "Ana Perez",
        email: "ana@example.com",
        password: "secret1",
      });
    });
  });

  it("registers with valid data", async () => {
    const user = setup();

    await fill(user, { email: "ana@example.com", password: "secret1" });

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        name: "Ana Perez",
        email: "ana@example.com",
        password: "secret1",
      });
    });
    expect(establishSession).toHaveBeenCalledWith("jwt");
  });
});
