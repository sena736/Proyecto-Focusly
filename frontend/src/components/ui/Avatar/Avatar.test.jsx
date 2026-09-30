import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Avatar from "./Avatar";

describe("Avatar", () => {
  it("shows the initials of the first two words of the name", () => {
    render(<Avatar name="ana maria perez" />);

    expect(screen.getByText("AM")).toBeInTheDocument();
  });

  it("shows a single initial for a one-word name", () => {
    render(<Avatar name="Ana" />);

    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders name and role when provided and exposes an accessible label", () => {
    render(<Avatar name="Ana Perez" role="Estudiante" />);

    expect(screen.getByText("Ana Perez")).toBeInTheDocument();
    expect(screen.getByText("Estudiante")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Perfil de Ana Perez" }),
    ).toBeInTheDocument();
  });

  it("never invents a name or a role when none is given", () => {
    render(<Avatar />);

    expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
    expect(screen.queryByText("Estudiante")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Perfil" })).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("");
  });

  it("treats a whitespace-only name as no name", () => {
    render(<Avatar name="   " />);

    const button = screen.getByRole("button", { name: "Perfil" });

    // No empty info block and no initials: the button has no text at all
    expect(button).toHaveTextContent("");
    expect(button.querySelector("strong")).toBeNull();
  });

  it("trims the name for the label, the info and the initials", () => {
    render(<Avatar name="  Ana Perez  " />);

    expect(
      screen.getByRole("button", { name: "Perfil de Ana Perez" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ana Perez")).toBeInTheDocument();
    expect(screen.getByText("AP")).toBeInTheDocument();
  });

  it("omits the role line when only a name is given", () => {
    render(<Avatar name="Ana Perez" />);

    // Only initials and the name: no third text node for a role
    expect(screen.getByRole("button")).toHaveTextContent(/^APAna Perez$/);
  });

  it("hides info and arrow on demand", () => {
    render(<Avatar name="Ana Perez" showInfo={false} showArrow={false} />);

    const button = screen.getByRole("button", { name: "Perfil de Ana Perez" });

    expect(screen.queryByText("Ana Perez")).not.toBeInTheDocument();
    expect(button.querySelector("svg")).toBeNull();
  });

  it("renders the image instead of initials when provided", () => {
    render(<Avatar name="Ana Perez" image="/ana.png" />);

    // alt="" makes the image presentational, so query it through its role
    expect(screen.getByRole("presentation")).toHaveAttribute(
      "src",
      "/ana.png",
    );
    expect(screen.queryByText("AP")).not.toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Avatar name="Ana Perez" onClick={onClick} />);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
