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

// e.g. the backend's 204 on DELETE /tasks/:id.
const emptyResponse = ({ ok = true, status = 204 } = {}) => ({
  ok,
  status,
  text: vi.fn().mockResolvedValue(""),
});

const loadModule = async () => {
  vi.resetModules();
  return import("./task.api");
};

describe("task.api", () => {
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
      fetchMock.mockResolvedValue(jsonResponse([]));
      const { getTasks } = await loadModule();

      await getTasks("tok");

      expect(fetchMock.mock.calls[0][0]).toBe(`${ENV_URL}/tasks`);
    });

    it("falls back to the localhost URL when VITE_API_URL is not set", async () => {
      vi.stubEnv("VITE_API_URL", "");
      fetchMock.mockResolvedValue(jsonResponse([]));
      const { getTasks } = await loadModule();

      await getTasks("tok");

      expect(fetchMock.mock.calls[0][0]).toBe(`${FALLBACK_URL}/tasks`);
    });
  });

  describe("getTasks", () => {
    it("sends an authenticated GET and returns the parsed body", async () => {
      const payload = { data: [{ id: 1 }] };
      fetchMock.mockResolvedValue(jsonResponse(payload));
      const { getTasks } = await loadModule();

      const result = await getTasks("tok");

      expect(fetchMock).toHaveBeenCalledWith(`${ENV_URL}/tasks`, {
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
      const { getTasks } = await loadModule();

      await expect(getTasks("tok")).rejects.toThrow("Token inválido");
    });

    it("throws a clean fallback error when the body is not JSON", async () => {
      fetchMock.mockResolvedValue(htmlResponse());
      const { getTasks } = await loadModule();

      const error = await getTasks("tok").catch((e) => e);

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Error al obtener las tareas");
    });

    it("throws a clean Error when a 200 answers with an HTML body", async () => {
      fetchMock.mockResolvedValue(htmlResponse({ ok: true, status: 200 }));
      const { getTasks } = await loadModule();

      const error = await getTasks("tok").catch((e) => e);

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error.message).toBe("Error al obtener las tareas");
    });

    it("attaches the HTTP status to the thrown error", async () => {
      const { getTasks } = await loadModule();

      fetchMock.mockResolvedValue(htmlResponse({ status: 502 }));
      expect((await getTasks("tok").catch((e) => e)).status).toBe(502);

      fetchMock.mockResolvedValue(
        jsonResponse({ message: "No existe" }, { ok: false, status: 404 }),
      );
      expect((await getTasks("tok").catch((e) => e)).status).toBe(404);
    });
  });

  describe("createTask", () => {
    it("POSTs the JSON body with the auth header", async () => {
      const taskData = { title: "Nueva", priority: "HIGH" };
      fetchMock.mockResolvedValue(jsonResponse({ data: { id: 9 } }));
      const { createTask } = await loadModule();

      const result = await createTask(taskData, "tok");

      expect(fetchMock).toHaveBeenCalledWith(`${ENV_URL}/tasks`, {
        method: "POST",
        headers: {
          Authorization: "Bearer tok",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      expect(result).toEqual({ data: { id: 9 } });
    });

    it("throws the server message on failure", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ message: "Título requerido" }, { ok: false, status: 400 }),
      );
      const { createTask } = await loadModule();

      await expect(createTask({}, "tok")).rejects.toThrow("Título requerido");
    });

    it("throws the fallback message when the failure has no message", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}, { ok: false, status: 500 }));
      const { createTask } = await loadModule();

      await expect(createTask({}, "tok")).rejects.toThrow(
        "Error al crear la tarea",
      );
    });

    it("throws a clean fallback error when the body is not JSON", async () => {
      fetchMock.mockResolvedValue(htmlResponse());
      const { createTask } = await loadModule();

      const error = await createTask({}, "tok").catch((e) => e);

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error.message).toBe("Error al crear la tarea");
    });
  });

  describe("updateTask", () => {
    it("PATCHes /:id with the JSON body and auth header", async () => {
      const taskData = { status: "COMPLETED" };
      fetchMock.mockResolvedValue(jsonResponse({ data: { id: 3 } }));
      const { updateTask } = await loadModule();

      const result = await updateTask(3, taskData, "tok");

      expect(fetchMock).toHaveBeenCalledWith(`${ENV_URL}/tasks/3`, {
        method: "PATCH",
        headers: {
          Authorization: "Bearer tok",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      expect(result).toEqual({ data: { id: 3 } });
    });

    it("throws the server message on failure", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ message: "No existe" }, { ok: false, status: 404 }),
      );
      const { updateTask } = await loadModule();

      await expect(updateTask(3, {}, "tok")).rejects.toThrow("No existe");
    });

    it("throws a clean fallback error when the body is not JSON", async () => {
      fetchMock.mockResolvedValue(htmlResponse());
      const { updateTask } = await loadModule();

      const error = await updateTask(3, {}, "tok").catch((e) => e);

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error.message).toBe("Error al actualizar la tarea");
    });
  });

  describe("deleteTask", () => {
    it("DELETEs /:id with the auth header", async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true }));
      const { deleteTask } = await loadModule();

      const result = await deleteTask(3, "tok");

      expect(fetchMock).toHaveBeenCalledWith(`${ENV_URL}/tasks/3`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer tok",
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual({ success: true });
    });

    it("resolves on a 204 with an empty body (backend's real answer)", async () => {
      fetchMock.mockResolvedValue(emptyResponse({ status: 204 }));
      const { deleteTask } = await loadModule();

      await expect(deleteTask(3, "tok")).resolves.toBeNull();
    });

    it("resolves on a 200 with an empty body", async () => {
      fetchMock.mockResolvedValue(emptyResponse({ status: 200 }));
      const { deleteTask } = await loadModule();

      await expect(deleteTask(3, "tok")).resolves.toBeNull();
    });

    it("throws the server message on a 404 with a JSON body", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ message: "Tarea no encontrada" }, { ok: false, status: 404 }),
      );
      const { deleteTask } = await loadModule();

      const error = await deleteTask(3, "tok").catch((e) => e);

      expect(error.message).toBe("Tarea no encontrada");
      expect(error.status).toBe(404);
    });

    it("throws the fallback with the status on a 502 HTML answer", async () => {
      fetchMock.mockResolvedValue(htmlResponse({ status: 502 }));
      const { deleteTask } = await loadModule();

      const error = await deleteTask(3, "tok").catch((e) => e);

      expect(error.message).toBe("Error al eliminar la tarea");
      expect(error.status).toBe(502);
    });

    it("throws the server message on failure", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ message: "Prohibido" }, { ok: false, status: 403 }),
      );
      const { deleteTask } = await loadModule();

      await expect(deleteTask(3, "tok")).rejects.toThrow("Prohibido");
    });

    it("throws a clean fallback error when the body is not JSON", async () => {
      fetchMock.mockResolvedValue(htmlResponse());
      const { deleteTask } = await loadModule();

      const error = await deleteTask(3, "tok").catch((e) => e);

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error.message).toBe("Error al eliminar la tarea");
    });
  });
});
