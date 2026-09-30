import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Settings from "./Settings";
import { ThemeProvider } from "../../context/ThemeContext";
import { STORAGE_KEYS } from "../../utils/constants";

const renderSettings = () =>
  render(
    <ThemeProvider>
      <Settings />
    </ThemeProvider>,
  );

describe("Settings", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renderiza el ToggleSwitch de modo oscuro apagado por defecto", () => {
    renderSettings();

    expect(screen.getByRole("switch", { name: /modo oscuro/i })).not.toBeChecked();
    expect(screen.getByText("El modo claro está activo.")).toBeInTheDocument();
  });

  it("refleja el tema guardado en el ToggleSwitch", () => {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify("dark"));

    renderSettings();

    expect(screen.getByRole("switch", { name: /modo oscuro/i })).toBeChecked();
    expect(screen.getByText("El modo oscuro está activo.")).toBeInTheDocument();
  });

  it("activa el modo oscuro desde la UI y lo aplica al documento", async () => {
    const user = userEvent.setup();

    renderSettings();

    await user.click(screen.getByRole("switch", { name: /modo oscuro/i }));

    expect(screen.getByRole("switch", { name: /modo oscuro/i })).toBeChecked();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.THEME))).toBe("dark");
  });

  it("vuelve al modo claro al apagar el ToggleSwitch", async () => {
    const user = userEvent.setup();

    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify("dark"));

    renderSettings();

    await user.click(screen.getByRole("switch", { name: /modo oscuro/i }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("llama a onSavePreference cuando se cambia el tema", async () => {
    const user = userEvent.setup();
    const calls = [];

    render(
      <ThemeProvider>
        <Settings onSavePreference={(preference) => calls.push(preference)} />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("switch", { name: /modo oscuro/i }));

    expect(calls).toEqual([{ modo_oscuro: true }]);
  });
});
