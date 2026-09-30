import { describe, it, expect } from "vitest";

import { shouldRetryAdminQuery } from "./queryRetry";

const httpError = (status) => ({ response: { status } });

describe("shouldRetryAdminQuery", () => {
  it.each([401, 403])("never retries a %i (retrying cannot fix permissions)", (status) => {
    expect(shouldRetryAdminQuery(0, httpError(status))).toBe(false);
    expect(shouldRetryAdminQuery(1, httpError(status))).toBe(false);
  });

  it("retries a server error once: first failure yes, second failure no", () => {
    expect(shouldRetryAdminQuery(0, httpError(500))).toBe(true);
    expect(shouldRetryAdminQuery(1, httpError(500))).toBe(false);
  });

  it("retries a network error (no response) at most once", () => {
    expect(shouldRetryAdminQuery(0, new Error("Network Error"))).toBe(true);
    expect(shouldRetryAdminQuery(1, new Error("Network Error"))).toBe(false);
  });

  it("does not crash on a missing error", () => {
    expect(shouldRetryAdminQuery(0, null)).toBe(true);
    expect(shouldRetryAdminQuery(1, undefined)).toBe(false);
  });
});
