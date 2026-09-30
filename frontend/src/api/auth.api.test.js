import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const ENV_URL = "https://api.focusly.test/api/v1";
const FALLBACK_URL = "http://localhost:3000/api/v1";

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  text: vi.fn().mockResolvedValue(JSON.stringify(body)),
});

// A 502 from a proxy: the body is HTML, so it is not valid JSON.
const htmlResponse = ({ ok = false, status = 502 } = {}) => ({
  ok,
  status,
  text: vi.fn().mockResolvedValue("<html>Bad Gateway</html>"),
});

const loadModule = async () => {
  vi.resetModules();
  return import("./auth.api");
};

const JSON_HEADERS = { "Content-Type": "application/json" };

describe("auth.api", () => {
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
      fetchMock.mockResolvedValue(jsonResponse({ data: {} }));
      const { emailLogin } = await loadModule();

      await emailLogin({ email: "a@b.co", password: "secret123" });

      expect(fetchMock.mock.calls[0][0]).toBe(`${ENV_URL}/auth/login`);
    });

    it("falls back to the localhost URL when VITE_API_URL is not set", async () => {
      vi.stubEnv("VITE_API_URL", "");
      fetchMock.mockResolvedValue(jsonResponse({ data: {} }));
      const { emailLogin } = await loadModule();

      await emailLogin({ email: "a@b.co", password: "secret123" });

      expect(fetchMock.mock.calls[0][0]).toBe(`${FALLBACK_URL}/auth/login`);
    });
  });

  describe("emailLogin", () => {
    it("POSTs email and password to /auth/login and returns body.data", async () => {
      const data = { token: "jwt", user: { id: 1 } };
      fetchMock.mockResolvedValue(jsonResponse({ data }));
      const { emailLogin } = await loadModule();

      const result = await emailLogin({
        email: "a@b.co",
        password: "secret123",
        extra: "ignored",
      });

      expect(fetchMock).toHaveBeenCalledWith(`${ENV_URL}/auth/login`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ email: "a@b.co", password: "secret123" }),
      });
      expect(result).toEqual(data);
    });

    it("throws the server message on failure", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(
          { message: "Credenciales inválidas" },
          { ok: false, status: 401 },
        ),
      );
      const { emailLogin } = await loadModule();

      await expect(
        emailLogin({ email: "a@b.co", password: "x" }),
      ).rejects.toThrow("Credenciales inválidas");
    });

    it("throws a clean fallback error when the body is not JSON", async () => {
      fetchMock.mockResolvedValue(htmlResponse());
      const { emailLogin } = await loadModule();

      const error = await emailLogin({ email: "a@b.co", password: "x" }).catch(
        (e) => e,
      );

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error.message).toBe("No se pudo iniciar sesión.");
    });

    it("throws a clean Error when a 200 answers with an HTML body", async () => {
      fetchMock.mockResolvedValue(htmlResponse({ ok: true, status: 200 }));
      const { emailLogin } = await loadModule();

      const error = await emailLogin({ email: "a@b.co", password: "x" }).catch(
        (e) => e,
      );

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error.message).toBe("No se pudo iniciar sesión.");
    });

    it("attaches the HTTP status to the thrown error", async () => {
      const { emailLogin } = await loadModule();
      const credentials = { email: "a@b.co", password: "x" };

      fetchMock.mockResolvedValue(htmlResponse({ status: 502 }));
      expect((await emailLogin(credentials).catch((e) => e)).status).toBe(502);

      fetchMock.mockResolvedValue(
        jsonResponse({ message: "No existe" }, { ok: false, status: 404 }),
      );
      expect((await emailLogin(credentials).catch((e) => e)).status).toBe(404);
    });
  });

  describe("registerUser", () => {
    it("POSTs name, email and password to /auth/register and returns body.data", async () => {
      const data = { token: "jwt" };
      fetchMock.mockResolvedValue(jsonResponse({ data }));
      const { registerUser } = await loadModule();

      const result = await registerUser({
        name: "Ana",
        email: "a@b.co",
        password: "secret123",
      });

      expect(fetchMock).toHaveBeenCalledWith(`${ENV_URL}/auth/register`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          name: "Ana",
          email: "a@b.co",
          password: "secret123",
        }),
      });
      expect(result).toEqual(data);
    });

    it("throws the server message on failure", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ message: "Email en uso" }, { ok: false, status: 409 }),
      );
      const { registerUser } = await loadModule();

      await expect(
        registerUser({ name: "Ana", email: "a@b.co", password: "x" }),
      ).rejects.toThrow("Email en uso");
    });

    it("throws a clean fallback error when the body is not JSON", async () => {
      fetchMock.mockResolvedValue(htmlResponse());
      const { registerUser } = await loadModule();

      const error = await registerUser({
        name: "Ana",
        email: "a@b.co",
        password: "x",
      }).catch((e) => e);

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error.message).toBe("No se pudo crear la cuenta.");
    });
  });

  describe("googleLogin", () => {
    it("POSTs the id_token to /auth/google and returns body.data", async () => {
      const data = { token: "jwt" };
      fetchMock.mockResolvedValue(jsonResponse({ data }));
      const { googleLogin } = await loadModule();

      const result = await googleLogin("google-id-token");

      expect(fetchMock).toHaveBeenCalledWith(`${ENV_URL}/auth/google`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ id_token: "google-id-token" }),
      });
      expect(result).toEqual(data);
    });

    it("throws the server message on failure", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ message: "Token de Google inválido" }, { ok: false }),
      );
      const { googleLogin } = await loadModule();

      await expect(googleLogin("bad")).rejects.toThrow(
        "Token de Google inválido",
      );
    });

    it("throws a clean fallback error when the body is not JSON", async () => {
      fetchMock.mockResolvedValue(htmlResponse());
      const { googleLogin } = await loadModule();

      const error = await googleLogin("tok").catch((e) => e);

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error.message).toBe("No se pudo iniciar sesión con Google.");
    });
  });
});
