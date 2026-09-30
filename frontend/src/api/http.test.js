import { describe, it, expect, vi } from "vitest";

import { parseBody, readApiBody } from "./http";

const makeResponse = (text, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  text: vi.fn().mockResolvedValue(text),
});

describe("http", () => {
  describe("parseBody", () => {
    it("parses a JSON body", async () => {
      const result = await parseBody(makeResponse('{"a":1}'));

      expect(result).toEqual({ data: { a: 1 }, empty: false });
    });

    it("reports an empty body as empty, not as unparseable", async () => {
      expect(await parseBody(makeResponse(""))).toEqual({
        data: null,
        empty: true,
      });
      expect(await parseBody(makeResponse("  \n"))).toEqual({
        data: null,
        empty: true,
      });
    });

    it("reports a non-JSON body as unparseable, not as empty", async () => {
      const result = await parseBody(makeResponse("<html>Bad Gateway</html>"));

      expect(result).toEqual({ data: null, empty: false });
    });

    it("treats an unreadable body as empty", async () => {
      const response = {
        ok: true,
        status: 200,
        text: vi.fn().mockRejectedValue(new Error("boom")),
      };

      expect(await parseBody(response)).toEqual({ data: null, empty: true });
    });
  });

  describe("readApiBody", () => {
    it("returns the parsed body on a 2xx JSON answer", async () => {
      const data = await readApiBody(makeResponse('{"ok":true}'), "fallback");

      expect(data).toEqual({ ok: true });
    });

    it("throws the server message with the status on failure", async () => {
      const error = await readApiBody(
        makeResponse('{"message":"No existe"}', { ok: false, status: 404 }),
        "fallback",
      ).catch((e) => e);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("No existe");
      expect(error.status).toBe(404);
    });

    it("throws the fallback with the status when the failure is HTML", async () => {
      const error = await readApiBody(
        makeResponse("<html></html>", { ok: false, status: 502 }),
        "fallback",
      ).catch((e) => e);

      expect(error).not.toBeInstanceOf(SyntaxError);
      expect(error.message).toBe("fallback");
      expect(error.status).toBe(502);
    });

    it("throws on a 2xx answer that is not JSON", async () => {
      const error = await readApiBody(
        makeResponse("<html></html>"),
        "fallback",
      ).catch((e) => e);

      expect(error.message).toBe("fallback");
      expect(error.status).toBe(200);
    });

    it("throws on a 2xx empty body unless allowEmpty is set", async () => {
      await expect(
        readApiBody(makeResponse("", { status: 204 }), "fallback"),
      ).rejects.toThrow("fallback");
    });

    it("resolves to null on a 2xx empty body when allowEmpty is set", async () => {
      const data = await readApiBody(
        makeResponse("", { status: 204 }),
        "fallback",
        { allowEmpty: true },
      );

      expect(data).toBeNull();
    });

    it("still throws on a 2xx HTML body when allowEmpty is set", async () => {
      await expect(
        readApiBody(makeResponse("<html></html>"), "fallback", {
          allowEmpty: true,
        }),
      ).rejects.toThrow("fallback");
    });

    it("still throws on an empty failure when allowEmpty is set", async () => {
      const error = await readApiBody(
        makeResponse("", { ok: false, status: 500 }),
        "fallback",
        { allowEmpty: true },
      ).catch((e) => e);

      expect(error.message).toBe("fallback");
      expect(error.status).toBe(500);
    });
  });
});
