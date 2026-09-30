import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../api/pomodoro.api", () => ({
  getPomodoroSessions: vi.fn(),
}));

import { getPomodoroSessions } from "../api/pomodoro.api";
import useAdminPomodoroSessions from "./useAdminPomodoroSessions";

const wrapper = ({ children }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe("useAdminPomodoroSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes the sessions once loaded", async () => {
    getPomodoroSessions.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const { result } = renderHook(() => useAdminPomodoroSessions(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.sessions).toBeUndefined();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sessions).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.current.isError).toBe(false);
  });

  it("exposes the error and no sessions when the request fails", async () => {
    // 403: the hook's own `retry` never retries it, so the error surfaces at once.
    getPomodoroSessions.mockRejectedValue(
      Object.assign(new Error("403"), { response: { status: 403 } }),
    );

    const { result } = renderHook(() => useAdminPomodoroSessions(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error.message).toBe("403");
    expect(result.current.sessions).toBeUndefined();
    expect(getPomodoroSessions).toHaveBeenCalledTimes(1);
  });
});
