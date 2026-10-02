import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../api/pomodoro.api", () => ({
  getMyPomodoroSessions: vi.fn(),
}));

import { getMyPomodoroSessions } from "../api/pomodoro.api";
import { setToken, removeToken } from "../services/token.services";
import { QUERY_KEYS } from "../utils/constants";
import useMyPomodoroSessions from "./useMyPomodoroSessions";

let client;

const wrapper = ({ children }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe("useMyPomodoroSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient();
    setToken("token-123");
  });

  afterEach(() => {
    removeToken();
  });

  it("exposes the user's sessions once loaded", async () => {
    getMyPomodoroSessions.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const { result } = renderHook(() => useMyPomodoroSessions(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.sessions).toBeUndefined();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sessions).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.current.isError).toBe(false);
  });

  it("uses a key under QUERY_KEYS.POMODORO_SESSIONS so the timer hook can invalidate it", async () => {
    getMyPomodoroSessions.mockResolvedValue([]);

    const { result } = renderHook(() => useMyPomodoroSessions(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const keys = client.getQueryCache().getAll().map((query) => query.queryKey);
    expect(keys).toEqual([[...QUERY_KEYS.POMODORO_SESSIONS, "my"]]);

    // Invalidating the shared prefix refetches the history.
    await client.invalidateQueries({ queryKey: QUERY_KEYS.POMODORO_SESSIONS });
    await waitFor(() => expect(getMyPomodoroSessions).toHaveBeenCalledTimes(2));
  });

  it("does not fire the request without a token", () => {
    removeToken();

    const { result } = renderHook(() => useMyPomodoroSessions(), { wrapper });

    expect(getMyPomodoroSessions).not.toHaveBeenCalled();
    expect(result.current.sessions).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it.each([401, 403])("never retries a %s", async (status) => {
    getMyPomodoroSessions.mockRejectedValue(
      Object.assign(new Error(String(status)), { response: { status } }),
    );

    const { result } = renderHook(() => useMyPomodoroSessions(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error.message).toBe(String(status));
    expect(result.current.sessions).toBeUndefined();
    expect(getMyPomodoroSessions).toHaveBeenCalledTimes(1);
  });
});
