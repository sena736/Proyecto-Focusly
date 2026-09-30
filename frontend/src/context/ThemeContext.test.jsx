import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./ThemeContext";
import useTheme from "../hooks/useTheme";
import { STORAGE_KEYS } from "../utils/constants";

const ThemeConsumer = () => {
  const { theme, toggleTheme, changeTheme } = useTheme();

  return (
    <div>
      <span data-testid="theme">{theme}</span>

      <button type="button" onClick={toggleTheme}>
        Cambiar tema
      </button>

      <button type="button" onClick={() => changeTheme("dark")}>
        Forzar oscuro
      </button>
    </div>
  );
};

const originalMatchMedia = window.matchMedia;

// Minimal controllable matchMedia mock. `legacy` exposes only addListener/removeListener.
const mockMatchMedia = ({ matches = false, legacy = false } = {}) => {
  const listeners = new Set();
  const mql = { matches, media: "(prefers-color-scheme: dark)" };

  if (legacy) {
    mql.addListener = vi.fn((listener) => listeners.add(listener));
    mql.removeListener = vi.fn((listener) => listeners.delete(listener));
  } else {
    mql.addEventListener = vi.fn((type, listener) => {
      if (type === "change") listeners.add(listener);
    });
    mql.removeEventListener = vi.fn((type, listener) => {
      if (type === "change") listeners.delete(listener);
    });
  }

  window.matchMedia = vi.fn(() => mql);

  return {
    mql,
    listeners,
    fire: (nextMatches) => {
      mql.matches = nextMatches;
      act(() => {
        [...listeners].forEach((listener) => listener({ matches: nextMatches }));
      });
    },
  };
};

const renderProvider = () =>
  render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  test("inicia con el tema claro cuando no existe una preferencia guardada", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  test("usa la preferencia de tema guardada", () => {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify("dark"));

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  test("toggleTheme cambia el valor del contexto", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");

    await user.click(screen.getByRole("button", {
      name: "Cambiar tema",
    }));

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");

    await user.click(screen.getByRole("button", {
      name: "Cambiar tema",
    }));

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  describe("follow the system until the user chooses", () => {
    test("initial theme follows a dark system when nothing is saved", () => {
      mockMatchMedia({ matches: true });

      renderProvider();

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    test("initial theme follows a light system when nothing is saved", () => {
      mockMatchMedia({ matches: false });

      renderProvider();

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    test("a saved choice wins over the system", () => {
      mockMatchMedia({ matches: true });
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify("light"));

      renderProvider();

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    test("nothing is written to localStorage on mount", () => {
      mockMatchMedia({ matches: true });

      renderProvider();

      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBeNull();
    });

    test("a system change updates the theme while there is no explicit choice", () => {
      const media = mockMatchMedia({ matches: false });

      renderProvider();
      media.fire(true);

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

      media.fire(false);

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBeNull();
    });

    test("falls back to addListener/removeListener on legacy browsers", () => {
      const media = mockMatchMedia({ matches: false, legacy: true });

      const { unmount } = renderProvider();
      media.fire(true);

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");

      unmount();

      expect(media.mql.removeListener).toHaveBeenCalledTimes(1);
      expect(media.listeners.size).toBe(0);
    });

    test("toggleTheme is an explicit choice: it is persisted and the system is ignored afterwards", async () => {
      const user = userEvent.setup();
      const media = mockMatchMedia({ matches: false });

      renderProvider();

      await user.click(screen.getByRole("button", { name: "Cambiar tema" }));

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe(JSON.stringify("dark"));
      expect(media.listeners.size).toBe(0);

      media.fire(false);

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    test("changeTheme is an explicit choice: it is persisted and the system is ignored afterwards", async () => {
      const user = userEvent.setup();
      const media = mockMatchMedia({ matches: false });

      renderProvider();

      await user.click(screen.getByRole("button", { name: "Forzar oscuro" }));

      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe(JSON.stringify("dark"));

      media.fire(false);

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    });

    test("toggleTheme persists the resolved next value on consecutive toggles", async () => {
      const user = userEvent.setup();
      mockMatchMedia({ matches: false });

      renderProvider();

      await user.click(screen.getByRole("button", { name: "Cambiar tema" }));
      await user.click(screen.getByRole("button", { name: "Cambiar tema" }));

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe(JSON.stringify("light"));
    });

    test("does not subscribe to system changes when a choice is already saved", () => {
      const media = mockMatchMedia({ matches: false });
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify("light"));

      renderProvider();
      media.fire(true);

      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(media.listeners.size).toBe(0);
    });

    test("removes the system listener on unmount", () => {
      const media = mockMatchMedia({ matches: false });

      const { unmount } = renderProvider();

      expect(media.listeners.size).toBe(1);

      unmount();

      expect(media.mql.removeEventListener).toHaveBeenCalledTimes(1);
      expect(media.listeners.size).toBe(0);
    });

    test("works when window.matchMedia is undefined", async () => {
      const user = userEvent.setup();
      window.matchMedia = undefined;

      expect(() => renderProvider()).not.toThrow();
      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBeNull();

      await user.click(screen.getByRole("button", { name: "Cambiar tema" }));

      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    });
  });
});
