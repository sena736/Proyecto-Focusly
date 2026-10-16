import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import useProfile from "./useProfile";
import { getProfile, updateProfile } from "../api/profile.api";

vi.mock("../api/profile.api", () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

const STORED = {
  id: 7,
  name: "Ana Gómez",
  email: "ana@test.com",
  role: "USER",
  password: "kept-from-get",
  extra: "only-in-get",
};

describe("useProfile", () => {
  let queryClient;

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    getProfile.mockResolvedValue(STORED);
  });

  test("on mutation success it writes the server response into the cache, keeping the fields the GET returned", async () => {
    // The refetch never resolves, so only the cache write can explain the data.
    const { result } = renderHook(() => useProfile(), { wrapper });
    await waitFor(() => expect(result.current.profile).toEqual(STORED));

    getProfile.mockReturnValue(new Promise(() => {}));
    updateProfile.mockResolvedValue({
      id: 7,
      name: "María López",
      email: "ana@test.com",
      role: "USER",
    });

    await act(async () => {
      await result.current.updateProfileAsync({ name: "María López" });
    });

    expect(queryClient.getQueryData(["profile"])).toEqual({
      ...STORED,
      name: "María López",
    });
    await waitFor(() => {
      expect(result.current.profile.name).toBe("María López");
    });
    expect(result.current.profile.extra).toBe("only-in-get");
  });

  test("it still invalidates the profile query after a successful mutation", async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    await waitFor(() => expect(result.current.profile).toEqual(STORED));

    updateProfile.mockResolvedValue({ ...STORED, name: "María López" });

    await act(async () => {
      await result.current.updateProfileAsync({ name: "María López" });
    });

    await waitFor(() => expect(getProfile).toHaveBeenCalledTimes(2));
  });
});
