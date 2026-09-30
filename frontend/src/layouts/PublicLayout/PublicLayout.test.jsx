import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import PublicLayout from "./PublicLayout";

const BackButton = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>Back</button>;
};

const renderLayout = (initialEntry = "/") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              <div>
                <p>Landing content</p>
                <section id="caracteristicas">Features</section>
                <section id="beneficios">Benefits</section>
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div>
                <p>About content</p>
                <Link to="/#caracteristicas">Go to features</Link>
                <Link to="/#beneficios">Go to benefits</Link>
                <Link to="/#missing">Go to missing</Link>
                <Link to="/#">Go to bare hash</Link>
                <Link to="/#%">Go to broken escape</Link>
                <Link to="/#%E0%A4%A">Go to truncated escape</Link>
                <BackButton />
              </div>
            }
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

const TOP = { top: 0, left: 0, behavior: "instant" };

describe("PublicLayout", () => {
  let scrolledIds;

  beforeEach(() => {
    scrolledIds = [];
    Element.prototype.scrollIntoView = vi.fn(function scrollIntoView() {
      scrolledIds.push(this.id);
    });
    window.scrollTo = vi.fn();
  });

  it("renders the header, the outlet content inside main, and the footer", () => {
    renderLayout("/");

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();

    const main = screen.getByRole("main");
    expect(main).toHaveTextContent("Landing content");
  });

  it("renders a different child route in the same layout", () => {
    renderLayout("/about");

    expect(screen.getByRole("main")).toHaveTextContent("About content");
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("does not touch the scroll position on the first mount without a hash", () => {
    renderLayout("/");

    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it("scrolls to the section matching the URL hash on first mount", () => {
    renderLayout("/#caracteristicas");

    expect(scrolledIds).toEqual(["caracteristicas"]);
  });

  it("scrolls to the section named by the link, not to any other", async () => {
    const user = userEvent.setup();
    renderLayout("/about");

    await user.click(screen.getByRole("link", { name: "Go to benefits" }));

    expect(screen.getByRole("main")).toHaveTextContent("Landing content");
    expect(scrolledIds).toEqual(["beneficios"]);
  });

  it("lets the browser/CSS decide whether the scroll is smooth", async () => {
    const user = userEvent.setup();
    renderLayout("/about");

    await user.click(screen.getByRole("link", { name: "Go to features" }));

    const [options] = Element.prototype.scrollIntoView.mock.calls[0];
    expect(options).not.toHaveProperty("behavior");
  });

  it("scrolls to the same section again when the same link is re-clicked", async () => {
    const user = userEvent.setup();
    renderLayout("/about");

    await user.click(screen.getByRole("link", { name: "Go to features" }));
    // Same hash target is now the current location; the header link repeats it.
    await user.click(
      within(screen.getByRole("banner")).getByRole("link", {
        name: "Características",
      }),
    );

    expect(scrolledIds).toEqual(["caracteristicas", "caracteristicas"]);
  });

  it("scrolls to the top instantly when pushing to another page", async () => {
    const user = userEvent.setup();
    renderLayout("/");

    await user.click(screen.getByRole("link", { name: "Sobre Focusly" }));

    expect(screen.getByRole("main")).toHaveTextContent("About content");
    expect(window.scrollTo).toHaveBeenCalledWith(TOP);
  });

  it("does not reset the scroll on back/forward (POP) without a hash", async () => {
    const user = userEvent.setup();
    renderLayout("/");

    await user.click(screen.getByRole("link", { name: "Sobre Focusly" }));
    window.scrollTo.mockClear();

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByRole("main")).toHaveTextContent("Landing content");
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("falls back to the top when the hash id does not exist", async () => {
    const user = userEvent.setup();
    renderLayout("/about");

    await user.click(screen.getByRole("link", { name: "Go to missing" }));

    expect(scrolledIds).toEqual([]);
    expect(window.scrollTo).toHaveBeenCalledWith(TOP);
  });

  it("falls back to the top for a bare '#' hash", async () => {
    const user = userEvent.setup();
    renderLayout("/about");

    await user.click(screen.getByRole("link", { name: "Go to bare hash" }));

    expect(scrolledIds).toEqual([]);
    expect(window.scrollTo).toHaveBeenCalledWith(TOP);
  });

  it.each(["/#%", "/#%E0%A4%A"])(
    "does not crash on a malformed percent-encoded hash (%s) on first mount",
    (entry) => {
      expect(() => renderLayout(entry)).not.toThrow();
      expect(screen.getByRole("main")).toHaveTextContent("Landing content");
    },
  );

  it.each(["Go to broken escape", "Go to truncated escape"])(
    "falls back to the top when following a malformed hash link (%s)",
    async (name) => {
      const user = userEvent.setup();
      renderLayout("/about");

      await user.click(screen.getByRole("link", { name }));

      expect(screen.getByRole("main")).toHaveTextContent("Landing content");
      expect(scrolledIds).toEqual([]);
      expect(window.scrollTo).toHaveBeenCalledWith(TOP);
    },
  );
});
