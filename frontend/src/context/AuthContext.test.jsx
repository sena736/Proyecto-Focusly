import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthProvider, AuthContext } from "./AuthContext";
import api from "../api/api";
import * as tokenService from "../services/token.services";

vi.mock("../api/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const TestConsumer = () => {
  const { user, loading, isAuthenticated, establishSession, logout } =
    React.useContext(AuthContext);

  return (
    <div>
      {" "}
      <span data-testid="loading">{loading ? "loading" : "ready"} </span>
      <span data-testid="authenticated">
        {isAuthenticated ? "authenticated" : "unauthenticated"}
      </span>
      <span data-testid="user">{user ? user.name : "null"}</span>
      <button type="button" onClick={() => establishSession("test-jwt-token")}>
        Login
      </button>
      <button type="button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  let localStorageSetItemSpy;
  let localStorageGetItemSpy;
  let localStorageRemoveItemSpy;
  let sessionStorageSetItemSpy;
  let sessionStorageGetItemSpy;
  let sessionStorageRemoveItemSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(tokenService, "getToken").mockReturnValue(null);
    vi.spyOn(tokenService, "setToken").mockImplementation(() => {});
    vi.spyOn(tokenService, "removeToken").mockImplementation(() => {});

    localStorageSetItemSpy = vi.spyOn(
      Storage.prototype,
      "setItem",
    );

    localStorageGetItemSpy = vi.spyOn(
      Storage.prototype,
      "getItem",
    );

    localStorageRemoveItemSpy = vi.spyOn(
      Storage.prototype,
      "removeItem",
    );

    sessionStorageSetItemSpy = vi.spyOn(
      sessionStorage,
      "setItem",
    );

    sessionStorageGetItemSpy = vi.spyOn(
      sessionStorage,
      "getItem",
    );

    sessionStorageRemoveItemSpy = vi.spyOn(
      sessionStorage,
      "removeItem",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderAuthContext = () => {
    return render(
      <AuthProvider>
        {" "}
        <TestConsumer />{" "}
      </AuthProvider>,
    );
  };

  it("expone el usuario después de establecer la sesión", async () => {
    const user = {
      id: 1,
      name: "Usuario de prueba",
      email: "usuario@test.com",
      avatarUrl: "https://example.com/avatar.jpg",
      role: "USER",
    };

    api.get.mockResolvedValueOnce({
      data: {
        user,
      },
    });

    const userEventInstance = userEvent.setup();

    renderAuthContext();

    await userEventInstance.click(
      screen.getByRole("button", {
        name: "Login",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent(
        "Usuario de prueba",
      );
    });

    expect(
      screen.getByTestId("authenticated"),
    ).toHaveTextContent("authenticated");

    expect(tokenService.setToken).toHaveBeenCalledWith(
      "test-jwt-token",
    );

    expect(api.get).toHaveBeenCalled();
  });

  it("limpia el usuario después de hacer logout", async () => {
    const user = {
      id: 1,
      name: "Usuario de prueba",
      email: "usuario@test.com",
      role: "USER",
    };

    api.get.mockResolvedValueOnce({
      data: {
        user,
      },
    });

    api.post.mockResolvedValueOnce({
      data: {},
    });

    const userEventInstance = userEvent.setup();

    renderAuthContext();

    await userEventInstance.click(
      screen.getByRole("button", {
        name: "Login",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent(
        "Usuario de prueba",
      );
    });

    await userEventInstance.click(
      screen.getByRole("button", {
        name: "Logout",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent(
        "null",
      );
    });

    expect(
      screen.getByTestId("authenticated"),
    ).toHaveTextContent("unauthenticated");

    expect(tokenService.removeToken).toHaveBeenCalled();
    expect(api.post).toHaveBeenCalled();
  });

  it("no utiliza localStorage ni sessionStorage para guardar el token", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        user: {
          id: 1,
          name: "Usuario de prueba",
          email: "usuario@test.com",
          role: "USER",
        },
      },
    });

    const userEventInstance = userEvent.setup();

    renderAuthContext();

    await userEventInstance.click(
      screen.getByRole("button", {
        name: "Login",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent(
        "Usuario de prueba",
      );
    });

    expect(
      localStorageSetItemSpy,
    ).not.toHaveBeenCalled();

    expect(
      sessionStorageSetItemSpy,
    ).not.toHaveBeenCalled();

    expect(
      localStorageGetItemSpy,
    ).not.toHaveBeenCalled();

    expect(
      sessionStorageGetItemSpy,
    ).not.toHaveBeenCalled();

    expect(
      localStorageRemoveItemSpy,
    ).not.toHaveBeenCalled();

    expect(
      sessionStorageRemoveItemSpy,
    ).not.toHaveBeenCalled();
  });
});
