import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../services/token.services", () => ({
  getToken: () => "tok",
}));

const ENV_URL = "https://api.focusly.test/api/v1";
const FALLBACK_URL = "http://localhost:3000/api/v1";

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  text: vi.fn().mockResolvedValue(JSON.stringify(body)),
});

// A 404/502 from a proxy or an old backend: the body is HTML, not JSON.
const htmlResponse = ({ ok = false, status = 404 } = {}) => ({
  ok,
  status,
  text: vi.fn().mockResolvedValue("<html>Not Found</html>"),
});

const loadModule = async () => {
  vi.resetModules();
  return import("./profile.api");
};

describe("profile.api", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VITE_API_URL", ENV_URL);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe("base URL", () => {
    it("uses VITE_API_URL when it is defined", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}));
      const { getProfile } = await loadModule();

      await getProfile();

      expect(fetchMock.mock.calls[0][0]).toBe(`${ENV_URL}/profile`);
    });

    it("falls back to the localhost URL when VITE_API_URL is not set", async () => {
      vi.stubEnv("VITE_API_URL", "");
      fetchMock.mockResolvedValue(jsonResponse({}));
      const { updateProfile } = await loadModule();

      await updateProfile({ name: "Ana" });

      expect(fetchMock.mock.calls[0][0]).toBe(`${FALLBACK_URL}/profile`);
    });
  });

  describe("getProfile", () => {
    it("sends an authenticated GET and returns the parsed body", async () => {
      const payload = { id: 1, name: "Ana", email: "ana@test.com" };
      fetchMock.mockResolvedValue(jsonResponse(payload));
      const { getProfile } = await loadModule();

      const result = await getProfile();

      expect(fetchMock).toHaveBeenCalledWith(`${ENV_URL}/profile`, {
        method: "GET",
        headers: {
          Authorization: "Bearer tok",
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(payload);
    });

    it("throws the server message when the request fails", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ message: "Token inválido" }, { ok: false, status: 401 }),
      );
      const { getProfile } = await loadModule();

      const error = await getProfile().catch((e) => e);

      expect(error.message).toBe("Token inválido");
      expect(error.status).toBe(401);
    });

    it("throws a clean fallback error (not a SyntaxError) on a non-JSON body", async () => {
      fetchMock.mockResolvedValue(htmlResponse({ status: 502 }));
      const { getProfile } = await loadModule();

      const error = await getProfile().catch((e) => e);

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error.message).toBe("Error al obtener el perfil");
      expect(error.status).toBe(502);
    });

    it("throws a clean Error when a 200 answers with an HTML body", async () => {
      fetchMock.mockResolvedValue(htmlResponse({ ok: true, status: 200 }));
      const { getProfile } = await loadModule();

      const error = await getProfile().catch((e) => e);

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error.message).toBe("Error al obtener el perfil");
    });
  });

  describe("updateProfile", () => {
    it("PATCHes the JSON body with the auth header and returns the parsed body", async () => {
      const payload = { id: 1, name: "María", email: "ana@test.com" };
      fetchMock.mockResolvedValue(jsonResponse(payload));
      const { updateProfile } = await loadModule();

      const result = await updateProfile({ name: "María" });

      expect(fetchMock).toHaveBeenCalledWith(`${ENV_URL}/profile`, {
        method: "PATCH",
        headers: {
          Authorization: "Bearer tok",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "María" }),
      });
      expect(result).toEqual(payload);
    });

    it("throws the server message on failure and attaches the status", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(
          { message: "El nombre es obligatorio." },
          { ok: false, status: 400 },
        ),
      );
      const { updateProfile } = await loadModule();

      const error = await updateProfile({ name: "" }).catch((e) => e);

      expect(error.message).toBe("El nombre es obligatorio.");
      expect(error.status).toBe(400);
    });

    it("throws the fallback message when the failure has no message", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}, { ok: false, status: 500 }));
      const { updateProfile } = await loadModule();

      await expect(updateProfile({ name: "Ana" })).rejects.toThrow(
        "Error al actualizar el perfil",
      );
    });

    it("throws a clean fallback error (not a SyntaxError) on a non-JSON 404", async () => {
      fetchMock.mockResolvedValue(htmlResponse({ status: 404 }));
      const { updateProfile } = await loadModule();

      const error = await updateProfile({ name: "Ana" }).catch((e) => e);

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Error al actualizar el perfil");
      expect(error.status).toBe(404);
    });
  });
});
