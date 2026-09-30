import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Footer from "./Footer";
import Home from "../../../pages/Home/Home";

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
});
