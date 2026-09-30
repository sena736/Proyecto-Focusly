import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Login from "./Login";
import { AuthContext } from "../../context/AuthContext";
import { emailLogin } from "../../api/auth.api";

vi.mock("../../api/auth.api", () => ({
  emailLogin: vi.fn(),
  googleLogin: vi.fn(),
}));

describe("Login", () => {
  let establishSession;

  const setup = () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ establishSession }}>
          <Login />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    return user;
  };

  const fill = async (user, email, password) => {
    await user.type(screen.getByLabelText("Correo electrónico"), email);
    await user.type(screen.getByLabelText("Contraseña"), password);
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    establishSession = vi.fn().mockResolvedValue({ id: 1 });
    emailLogin.mockResolvedValue({ token: "jwt" });
  });

  it("blocks the request and shows an error for an invalid email", async () => {
    const user = setup();

    // Passes the browser's type=email check but has no domain dot
    await fill(user, "ana@localhost", "secret1");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ingresa un correo electrónico válido.",
    );
    expect(emailLogin).not.toHaveBeenCalled();
  });

  it("clears the validation error when the user edits a field", async () => {
    const user = setup();

    await fill(user, "ana@localhost", "secret1");
    await screen.findByRole("alert");

    await user.type(screen.getByLabelText("Correo electrónico"), "x");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not impose a minimum password length on login", async () => {
    const user = setup();

    await fill(user, "ana@example.com", "abc");

    await waitFor(() => {
      expect(emailLogin).toHaveBeenCalledWith({
        email: "ana@example.com",
        password: "abc",
      });
    });
  });

  it("sends the credentials for a valid form", async () => {
    const user = setup();

    await fill(user, "ana@example.com", "secret1");

    await waitFor(() => {
      expect(emailLogin).toHaveBeenCalledTimes(1);
    });
    expect(establishSession).toHaveBeenCalledWith("jwt");
  });

  it("sends the trimmed email when the input has surrounding spaces", async () => {
    const user = setup();

    await fill(user, "  ana@example.com  ", "secret1");

    await waitFor(() => {
      expect(emailLogin).toHaveBeenCalledWith({
        email: "ana@example.com",
        password: "secret1",
      });
    });
  });

  it("shows the server error message when the login fails", async () => {
    emailLogin.mockRejectedValue(new Error("Credenciales inválidas"));
    const user = setup();

    await fill(user, "ana@example.com", "secret1");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciales inválidas",
    );
  });
});
