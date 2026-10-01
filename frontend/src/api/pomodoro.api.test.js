import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import api from "./api";
import {
  createPomodoroSession,
  getPomodoroSessions,
  getMyPomodoroSessions,
} from "./pomodoro.api";

describe("pomodoro.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPomodoroSession", () => {
    it("posts the session and returns the response body", async () => {
      api.post.mockResolvedValue({ data: { data: { id: 1 } } });

      const result = await createPomodoroSession({ duration: 25 });

      expect(api.post).toHaveBeenCalledWith("/pomodoro-sessions", { duration: 25 });
      expect(result).toEqual({ data: { id: 1 } });
    });
  });

  describe("getMyPomodoroSessions (own history)", () => {
    it("requests GET /pomodoro-sessions/my through the shared client and unwraps { data }", async () => {
      const sessions = [{ id: 1 }, { id: 2 }];
      api.get.mockResolvedValue({ data: { data: sessions } });

      await expect(getMyPomodoroSessions()).resolves.toEqual(sessions);
      expect(api.get).toHaveBeenCalledWith("/pomodoro-sessions/my");
    });

    it("returns an empty list when the user has no sessions yet", async () => {
      api.get.mockResolvedValue({ data: { data: [] } });

      await expect(getMyPomodoroSessions()).resolves.toEqual([]);
    });

    it.each([
      ["no body", { data: undefined }],
      ["a body without data", { data: {} }],
      ["a non-array payload", { data: { data: "oops" } }],
    ])("rejects instead of returning a fake empty list when the response has %s", async (_label, response) => {
      api.get.mockResolvedValue(response);

      await expect(getMyPomodoroSessions()).rejects.toThrow(/sesiones pomodoro/i);
    });

    it("propagates network / auth errors untouched", async () => {
      const failure = Object.assign(new Error("Request failed with status code 401"), {
        response: { status: 401 },
      });
      api.get.mockRejectedValue(failure);

      await expect(getMyPomodoroSessions()).rejects.toBe(failure);
    });
  });

  describe("getPomodoroSessions (admin list)", () => {
    it("requests GET /pomodoro-sessions through the shared client and unwraps { data }", async () => {
      const sessions = [{ id: 1 }, { id: 2 }];
      api.get.mockResolvedValue({ data: { data: sessions } });

      await expect(getPomodoroSessions()).resolves.toEqual(sessions);
      expect(api.get).toHaveBeenCalledWith("/pomodoro-sessions");
    });

    it("returns an empty list (a real zero) when the backend has no sessions", async () => {
      api.get.mockResolvedValue({ data: { data: [] } });

      await expect(getPomodoroSessions()).resolves.toEqual([]);
    });

    it.each([
      ["no body", { data: undefined }],
      ["a body without data", { data: {} }],
      ["a non-array payload", { data: { data: "oops" } }],
    ])("rejects instead of inventing a count when the response has %s", async (_label, response) => {
      api.get.mockResolvedValue(response);

      await expect(getPomodoroSessions()).rejects.toThrow(/sesiones pomodoro/i);
    });

    it("propagates network / permission errors", async () => {
      const failure = Object.assign(new Error("Request failed with status code 403"), {
        response: { status: 403 },
      });
      api.get.mockRejectedValue(failure);

      await expect(getPomodoroSessions()).rejects.toBe(failure);
    });
  });
});
