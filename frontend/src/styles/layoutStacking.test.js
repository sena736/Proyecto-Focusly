import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Static guard for the mobile chrome of the authenticated layout.
 *
 * jsdom cannot lay anything out, so the stacking order and the "bar never
 * covers content" contract are asserted on the stylesheets themselves:
 *
 *   mobile bar  <  hamburger (998)  <  backdrop (999)  <  sidebar (1000)  <  modals (9999)
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..");

const read = (relative) =>
  fs
    .readFileSync(path.join(src, relative), "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Bodies of every block whose selector list ends with `selector`. */
const bodies = (css, selector) =>
  [...css.matchAll(new RegExp(`(?:^|[}\\s,])${escapeRe(selector)}\\s*\\{([^}]*)\\}`, "g"))].map(
    (match) => match[1],
  );

const declaration = (body, property) =>
  body.match(new RegExp(`(?:^|[;\\s])${escapeRe(property)}\\s*:\\s*([^;]+)`))?.[1].trim();

const zIndex = (file, selector) => {
  const values = bodies(read(file), selector)
    .map((body) => declaration(body, "z-index"))
    .filter(Boolean)
    .map(Number);
  expect(values.length, `z-index of ${selector} in ${file}`).toBeGreaterThan(0);
  return Math.max(...values);
};

const BAR_CSS = "components/layout/MobileNavigation/MobileNavigation.css";
const LAYOUT_CSS = "layouts/UserLayout/UserLayout.css";

describe("declaration helpers (mutation checks)", () => {
  it("reads a property from the last matching selector, ignoring similar names", () => {
    const css = ".a-b { z-index: 1; }\n.b { color: red; z-index: 7; }";
    expect(bodies(css, ".b").map((body) => declaration(body, "z-index"))).toEqual(["7"]);
  });

  it("does not confuse max-z-index-like properties", () => {
    expect(declaration("my-z-index: 3;", "z-index")).toBeUndefined();
  });
});

describe("mobile navigation stacking", () => {
  const bar = zIndex(BAR_CSS, ".mobile-navigation");
  const hamburger = zIndex(LAYOUT_CSS, ".user-layout__menu-button");
  const backdrop = zIndex(LAYOUT_CSS, ".user-layout__backdrop");
  const sidebar = zIndex("components/layout/Sidebar/Sidebar.css", ".sidebar");
  const modal = zIndex("components/ui/Modal/Modal.css", ".focusly-modal-overlay");
  const confirmModal = zIndex(
    "components/ui/ConfirmModal/ConfirmModal.css",
    ".confirm-modal-overlay",
  );

  it("sits above the page content but under the hamburger, backdrop and sidebar", () => {
    expect(bar).toBeGreaterThan(0);
    expect(bar).toBeLessThan(hamburger);
    expect(hamburger).toBeLessThan(backdrop);
    expect(backdrop).toBeLessThan(sidebar);
  });

  it("never covers Modal or ConfirmModal", () => {
    expect(bar).toBeLessThan(modal);
    expect(bar).toBeLessThan(confirmModal);
    expect(sidebar).toBeLessThan(modal);
  });
});

describe("mobile navigation visibility and spacing", () => {
  it("is hidden by default and only shown at 768px and below", () => {
    const css = read(BAR_CSS);
    const [base] = bodies(css.slice(0, css.indexOf("@media")), ".mobile-navigation");

    expect(declaration(base, "display")).toBe("none");

    const media = css.slice(css.indexOf("@media (max-width: 768px)"));
    const shown = bodies(media, ".mobile-navigation").map((body) =>
      declaration(body, "display"),
    );

    expect(shown).toContain("block");
  });

  it("respects the bottom safe-area inset", () => {
    expect(read(BAR_CSS)).toMatch(/env\(safe-area-inset-bottom/);
  });

  it("reserves room for the bar under the routed content on mobile", () => {
    const css = read(LAYOUT_CSS);
    const media = css.slice(css.indexOf("@media (max-width: 768px)"));
    const content = bodies(media, ".user-layout__content")
      .map((body) => declaration(body, "padding-bottom"))
      .find(Boolean);

    expect(content).toBeDefined();
    expect(content).toContain("var(--mobile-nav-height)");
    expect(content).toContain("env(safe-area-inset-bottom");
  });

  it("uses the same bar height token in the bar and in global.css", () => {
    expect(read(BAR_CSS)).toContain("var(--mobile-nav-height)");
    expect(read("styles/global.css")).toMatch(/--mobile-nav-height:\s*72px/);
  });

  it("keeps the bar tall enough on tiny screens and sizes the bar through the token", () => {
    const MIN_BAR_HEIGHT = 56;
    const global = read("styles/global.css");
    const media = global.slice(global.indexOf("@media (max-width: 380px)"));
    const override = bodies(media, ":root")
      .map((body) => declaration(body, "--mobile-nav-height"))
      .find(Boolean);

    expect(override, "--mobile-nav-height override in the <=380px block").toBeDefined();
    expect(parseInt(override, 10)).toBeGreaterThanOrEqual(MIN_BAR_HEIGHT);

    const barHeights = bodies(read(BAR_CSS), ".mobile-navigation")
      .map((body) => declaration(body, "height"))
      .filter(Boolean);

    expect(barHeights.length).toBeGreaterThan(0);
    barHeights.forEach((height) => expect(height).toContain("var(--mobile-nav-height)"));
  });
});
