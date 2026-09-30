import { describe, it, expect, afterEach, vi } from "vitest";

const FALLBACK_URL = "http://localhost:3000/api/v1";

const loadConfig = async () => {
  vi.resetModules();
  return import("./config");
};

describe("config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses VITE_API_URL when it is defined", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.focusly.test/api/v1");

    const { API_BASE_URL } = await loadConfig();

    expect(API_BASE_URL).toBe("https://api.focusly.test/api/v1");
  });

  it("strips trailing slashes from VITE_API_URL", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.focusly.test/api/v1//");

    const { API_BASE_URL } = await loadConfig();

    expect(API_BASE_URL).toBe("https://api.focusly.test/api/v1");
  });

  it("falls back to localhost when VITE_API_URL is an empty string", async () => {
    vi.stubEnv("VITE_API_URL", "");

    const { API_BASE_URL } = await loadConfig();

    expect(API_BASE_URL).toBe(FALLBACK_URL);
  });

  it("falls back to localhost when VITE_API_URL is undefined", async () => {
    vi.stubEnv("VITE_API_URL", undefined);

    const { API_BASE_URL } = await loadConfig();

    expect(API_BASE_URL).toBe(FALLBACK_URL);
  });
});
