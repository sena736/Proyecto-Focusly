import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./ThemeContext";
import { useTheme } from "./useTheme";

const ThemeConsumer = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <span data-testid="theme">{theme}</span>

      <button type="button" onClick={toggleTheme}>
        Cambiar tema
      </button>
    </div>
  );
};

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
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
    localStorage.setItem("theme", "dark");

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
});