import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import MobileNavigation from "./MobileNavigation";

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <MobileNavigation />
      <Routes>
        <Route path="*" element={<div>contenido</div>} />
      </Routes>
    </MemoryRouter>,
  );

const EXPECTED_LINKS = {
  Inicio: "/dashboard",
  Tareas: "/tasks",
  Pomodoro: "/pomodoro",
  Motivación: "/motivation",
  Perfil: "/profile",
};

describe("MobileNavigation", () => {
  it("is a labelled navigation landmark (distinct from the sidebar nav)", () => {
    renderAt("/dashboard");

    expect(
      screen.getByRole("navigation", { name: "Navegación móvil" }),
    ).toBeInTheDocument();
  });

  it("links to exactly the five real routes", () => {
    renderAt("/dashboard");

    const nav = screen.getByRole("navigation", { name: "Navegación móvil" });
    const links = within(nav).getAllByRole("link");

    expect(links).toHaveLength(5);

    Object.entries(EXPECTED_LINKS).forEach(([name, href]) => {
      expect(within(nav).getByRole("link", { name })).toHaveAttribute(
        "href",
        href,
      );
    });
  });

  it("does not offer the removed Estadísticas item", () => {
    renderAt("/dashboard");

    expect(screen.queryByText("Estadísticas")).toBeNull();
    expect(screen.queryByRole("link", { name: /estad/i })).toBeNull();
  });

  it("does not render buttons: navigation is done with links", () => {
    renderAt("/dashboard");

    expect(screen.queryByRole("button")).toBeNull();
  });

  it.each(Object.entries(EXPECTED_LINKS))(
    "marks %s as the current page only at %s",
    (name, href) => {
      renderAt(href);

      const nav = screen.getByRole("navigation", { name: "Navegación móvil" });
      const current = within(nav)
        .getAllByRole("link")
        .filter((link) => link.getAttribute("aria-current") === "page");

      expect(current).toHaveLength(1);
      expect(current[0]).toHaveAccessibleName(name);
      expect(current[0]).toHaveClass("mobile-navigation__item--active");
    },
  );

  it("has no current item on a route that is not in the bar (e.g. /settings)", () => {
    renderAt("/settings");

    const nav = screen.getByRole("navigation", { name: "Navegación móvil" });

    within(nav)
      .getAllByRole("link")
      .forEach((link) => {
        expect(link).not.toHaveAttribute("aria-current");
        expect(link).not.toHaveClass("mobile-navigation__item--active");
      });
  });

  it("derives the active item from the route, moving it when the user navigates", async () => {
    const user = userEvent.setup();

    renderAt("/dashboard");

    const nav = screen.getByRole("navigation", { name: "Navegación móvil" });

    expect(within(nav).getByRole("link", { name: "Inicio" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(within(nav).getByRole("link", { name: "Pomodoro" }));

    expect(within(nav).getByRole("link", { name: "Pomodoro" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: "Inicio" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps the section highlighted on nested routes (/tasks/123)", () => {
    renderAt("/tasks/123");

    expect(screen.getByRole("link", { name: "Tareas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("hides the decorative icons from assistive technology", () => {
    renderAt("/dashboard");

    const nav = screen.getByRole("navigation", { name: "Navegación móvil" });

    nav.querySelectorAll("svg").forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
    expect(nav.querySelectorAll("svg")).toHaveLength(5);
  });
});
