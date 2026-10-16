import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProfileCard from "./ProfileCard";

describe("ProfileCard", () => {
  test("renders name, email and role", () => {
    render(<ProfileCard name="Ana Gómez" email="ana@test.com" role="USER" />);

    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
    expect(screen.getByText("ana@test.com")).toBeInTheDocument();
    expect(screen.getByText("USER")).toBeInTheDocument();
  });

  test("calls onEdit when the edit button is clicked", async () => {
    const onEdit = vi.fn();

    render(<ProfileCard name="Ana" onEdit={onEdit} />);

    await userEvent.click(screen.getByRole("button", { name: "Editar perfil" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  test("the edit button is enabled by default", () => {
    render(<ProfileCard name="Ana" onEdit={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Editar perfil" })).toBeEnabled();
  });

  test("disables the edit button while loading and does not fire onEdit", async () => {
    const onEdit = vi.fn();

    render(<ProfileCard name="Ana" onEdit={onEdit} loading />);

    const button = screen.getByRole("button", { name: "Editar perfil" });

    expect(button).toBeDisabled();

    await userEvent.click(button);

    expect(onEdit).not.toHaveBeenCalled();
  });
});
