import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { entry } = vi.hoisted(() => ({ entry: { current: "/" } }));

// AppRoutes owns a BrowserRouter; drive the URL with a MemoryRouter instead and
// expose the final pathname so redirects can be asserted.
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  const LocationProbe = () => (
    <span data-testid="pathname">{actual.useLocation().pathname}</span>
  );

  return {
    ...actual,
    BrowserRouter: ({ children }) => (
      <actual.MemoryRouter initialEntries={[entry.current]}>
        {children}
        <LocationProbe />
      </actual.MemoryRouter>
    ),
  };
});

// Only routing and the admin page shell are under test here.
vi.mock("../pages/Login/Login", () => ({
  default: () => <h1>Login page stub</h1>,
}));
vi.mock("../pages/Dashboard/Dashboard", () => ({
  default: () => <h1>Dashboard page stub</h1>,
}));
vi.mock("../pages/Tasks/Tasks", () => ({
  default: () => <h1>Tasks page stub</h1>,
}));
vi.mock("../hooks/useAuth");
vi.mock("../hooks/useUsers");
vi.mock("../hooks/useAdminPomodoroSessions");

import AppRoutes from "./AppRoutes";
import useAuth from "../hooks/useAuth";
import useUsers from "../hooks/useUsers";
import useAdminPomodoroSessions from "../hooks/useAdminPomodoroSessions";

const signInAs = (role) =>
  useAuth.mockReturnValue({
    user: role ? { name: "Ana Perez", role } : null,
    loading: false,
    isAuthenticated: Boolean(role),
    isAdmin: role === "ADMIN",
    logout: vi.fn().mockResolvedValue(undefined),
  });

const renderAt = (path) => {
  entry.current = path;
  return render(<AppRoutes />);
};

describe("admin panel route (/admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn();
    useUsers.mockReturnValue({
      users: [{ id: 1 }, { id: 2 }],
      isLoading: false,
      isError: false,
      error: null,
    });
    useAdminPomodoroSessions.mockReturnValue({
      sessions: [{ id: 1 }],
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("renders the panel inside the user layout for an ADMIN", () => {
    signInAs("ADMIN");
    renderAt("/admin");

    expect(screen.getByTestId("pathname").textContent).toBe("/admin");
    expect(
      screen.getByRole("heading", { level: 1, name: "Panel de administración" }),
    ).toBeInTheDocument();
    // Same layout as the other authenticated pages: sidebar + mobile bar.
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Navegación móvil" }),
    ).toBeInTheDocument();
  });

  it("is not reachable for a regular user: redirects to /dashboard", () => {
    signInAs("USER");
    renderAt("/admin");

    expect(screen.getByTestId("pathname").textContent).toBe("/dashboard");
    expect(
      screen.queryByRole("heading", { name: "Panel de administración" }),
    ).toBeNull();
    expect(screen.getByRole("heading", { name: "Dashboard page stub" })).toBeInTheDocument();
  });

  it("is not reachable without a session: redirects to /login", () => {
    signInAs(null);
    renderAt("/admin");

    expect(screen.getByTestId("pathname").textContent).toBe("/login");
    expect(screen.getByRole("heading", { name: "Login page stub" })).toBeInTheDocument();
  });

  it("does not load any admin data for a regular user", () => {
    signInAs("USER");
    renderAt("/admin");

    expect(useUsers).not.toHaveBeenCalled();
    expect(useAdminPomodoroSessions).not.toHaveBeenCalled();
  });

  it("links the panel from the sidebar only for admins", () => {
    signInAs("ADMIN");
    const first = renderAt("/admin");

    expect(
      screen.getByRole("link", { name: "Panel de administración" }),
    ).toHaveAttribute("href", "/admin");

    first.unmount();
    signInAs("USER");
    renderAt("/tasks");

    expect(screen.queryByRole("link", { name: "Panel de administración" })).toBeNull();
  });
});
