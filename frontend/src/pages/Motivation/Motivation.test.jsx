import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import Motivation from "./Motivation";
import { usePhrase } from "../../hooks/usePhrase";

vi.mock("../../hooks/usePhrase");
vi.mock("../../components/motivation/MotivationCard/MotivationCard", () => ({
  default: () => <div data-testid="motivation-card" />,
}));

const baseState = {
  data: { text: "Sigue adelante", author: "Focusly" },
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  isRefetching: false,
};

describe("Motivation page", () => {
  it("renders its heading and subtitle through PageHeader", () => {
    usePhrase.mockReturnValue(baseState);

    const { container } = render(<Motivation />);

    const header = container.querySelector("header.focusly-page-header");

    expect(header).not.toBeNull();
    expect(
      within(header).getByRole("heading", { level: 1, name: "Motivación" }),
    ).toBeInTheDocument();
    expect(
      within(header).getByText(/encuentra inspiración/i),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByTestId("motivation-card")).toBeInTheDocument();
  });

  it("shows the empty message under the header when there is no phrase", () => {
    usePhrase.mockReturnValue({ ...baseState, data: undefined });

    render(<Motivation />);

    expect(
      screen.getByText("No hay frases motivacionales disponibles."),
    ).toBeInTheDocument();
  });
});
