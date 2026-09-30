import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";

const { entry } = vi.hoisted(() => ({ entry: { current: "/" } }));

// AppRoutes owns a BrowserRouter; swap it for a MemoryRouter so we can drive
// the URL while still exercising the real route tree. A probe exposes the
// final pathname so redirects can be detected.
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

// Auth pages are not under test here; they only need to be identifiable.
vi.mock("../pages/Login/Login", () => ({
  default: () => <h1>Login page stub</h1>,
}));
vi.mock("../pages/Register/Register", () => ({
  default: () => <h1>Register page stub</h1>,
}));

import AppRoutes from "./AppRoutes";
import useAuth from "../hooks/useAuth";

// The public tree reads the session (header/footer/landing CTAs).
vi.mock("../hooks/useAuth");

const renderAt = (path) => {
  entry.current = path;
  return render(<AppRoutes />);
};

describe("AppRoutes public routes", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn();
    useAuth.mockReturnValue({ user: null, loading: false, isAuthenticated: false });
  });

  it("renders the landing for a connected user with a dashboard link instead of guest buttons", () => {
    useAuth.mockReturnValue({
      user: { name: "Ana Perez", role: "ADMIN" },
      loading: false,
      isAuthenticated: true,
    });
    renderAt("/");

    const banner = screen.getByRole("banner");
    expect(
      within(banner).getByRole("link", { name: "Ir al dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
    expect(within(banner).getByText("Administrador")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Iniciar sesión" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Registrarse" })).toBeNull();
    expect(screen.queryByRole("link", { name: /crear cuenta/i })).toBeNull();
  });

  it("renders the landing inside the public layout at /", () => {
    renderAt("/");

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("main")).toContainElement(
      document.getElementById("inicio"),
    );
  });

  it("renders About inside the public layout at /about", () => {
    renderAt("/about");

    expect(screen.getByTestId("pathname").textContent).toBe("/about");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /¿Qué es Focusly\?/ }),
    ).toBeInTheDocument();
  });

  it.each(["/", "/about"])(
    "renders exactly one h1 on %s (the header brand is not a heading)",
    (path) => {
      renderAt(path);

      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    },
  );

  it.each([
    ["/login", "Login page stub"],
    ["/register", "Register page stub"],
  ])("renders %s without the public header and footer", (path, heading) => {
    renderAt(path);

    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    expect(screen.queryByRole("banner")).toBeNull();
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });

  it("redirects unknown routes to the landing", () => {
    renderAt("/does-not-exist");

    expect(screen.getByTestId("pathname").textContent).toBe("/");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(document.getElementById("inicio")).not.toBeNull();
  });

  it("resolves every header and footer link to a real route, not the fallback redirect", () => {
    const first = renderAt("/");

    const paths = new Set(
      [
        ...screen.getByRole("banner").querySelectorAll("a"),
        ...screen.getByRole("contentinfo").querySelectorAll("a"),
      ]
        .map((link) => link.getAttribute("href"))
        .map((href) => href.split("#")[0])
        .filter((path) => path !== "/"),
    );

    first.unmount();

    // Guard against the loop being vacuous.
    expect(paths).toContain("/about");
    expect(paths).toContain("/login");
    expect(paths).toContain("/register");

    paths.forEach((path) => {
      const { unmount } = renderAt(path);

      expect(screen.getByTestId("pathname").textContent).toBe(path);
      unmount();
    });
  });
});
