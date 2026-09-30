import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Footer from "./Footer";
import Home from "../../../pages/Home/Home";
import useAuth from "../../../hooks/useAuth";

vi.mock("../../../hooks/useAuth");

const asGuest = () =>
  useAuth.mockReturnValue({ user: null, loading: false, isAuthenticated: false });

// Anchor ids come from the real landing page. Route existence for footer
// links is verified against the real route tree in routes/AppRoutes.test.jsx.
const landingSectionIds = () => {
  const { container, unmount } = render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
  const ids = [...container.querySelectorAll("section[id]")].map(
    (section) => section.id,
  );
  unmount();
  return ids;
};

const renderFooter = (props = {}) =>
  render(
    <MemoryRouter>
      <Footer {...props} />
    </MemoryRouter>,
  );

describe("Footer", () => {
  beforeEach(() => {
    asGuest();
  });

  it("only links its anchors to sections that exist on the landing page", () => {
    const sectionIds = landingSectionIds();
    expect(sectionIds.length).toBeGreaterThan(0);

    renderFooter();

    const anchors = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))
      .filter((href) => href.startsWith("/#"));

    expect(anchors.length).toBeGreaterThan(0);
    anchors.forEach((href) => {
      expect(sectionIds).toContain(href.slice(2));
    });
  });

  it("links to the real register route and to /about", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: "Registrarse" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Sobre Focusly" })).toHaveAttribute(
      "href",
      "/about",
    );
  });

  it("does not link to routes that do not exist", () => {
    const { container } = renderFooter();

    ["/registro", "/privacidad", "/terminos"].forEach((href) => {
      expect(container.querySelector(`a[href="${href}"]`)).toBeNull();
    });
  });

  it("renders the copyright and the quote", () => {
    renderFooter();

    expect(
      screen.getByText(/Todos los derechos reservados/),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pequeños pasos cada día te llevan a grandes logros."),
    ).toBeInTheDocument();
  });

  it("hides navigation and copyright when asked", () => {
    renderFooter({ showNavigation: false, showCopyright: false });

    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryByText(/Todos los derechos reservados/)).toBeNull();
  });

  describe("Acceso column by session", () => {
    it("guests never see a link to the dashboard", () => {
      renderFooter();

      expect(screen.queryByRole("link", { name: "Ir al dashboard" })).toBeNull();
    });

    it("a connected user sees the dashboard link instead of login/register", () => {
      useAuth.mockReturnValue({
        user: { name: "Ana Perez", role: "USER" },
        loading: false,
        isAuthenticated: true,
      });
      renderFooter();

      expect(screen.getByRole("link", { name: "Ir al dashboard" })).toHaveAttribute(
        "href",
        "/dashboard",
      );
      expect(screen.queryByRole("link", { name: "Iniciar sesión" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Registrarse" })).toBeNull();
    });

    it("keeps the rest of the navigation for a connected user", () => {
      useAuth.mockReturnValue({
        user: { name: "Ana Perez", role: "USER" },
        loading: false,
        isAuthenticated: true,
      });
      renderFooter();

      expect(screen.getByRole("link", { name: "Sobre Focusly" })).toHaveAttribute(
        "href",
        "/about",
      );
    });

    it("renders no access links while the session is unresolved (no guest flash)", () => {
      useAuth.mockReturnValue({ user: null, loading: true, isAuthenticated: false });
      renderFooter();

      expect(screen.queryByRole("link", { name: "Iniciar sesión" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Registrarse" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Ir al dashboard" })).toBeNull();
      expect(screen.getByRole("heading", { name: "Acceso" })).toBeInTheDocument();
    });

    it("keeps a stale user's access links hidden while loading", () => {
      useAuth.mockReturnValue({
        user: { name: "Ana Perez", role: "USER" },
        loading: true,
        isAuthenticated: true,
      });
      renderFooter();

      expect(screen.queryByRole("link", { name: "Iniciar sesión" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Registrarse" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Ir al dashboard" })).toBeNull();
    });
  });
});
