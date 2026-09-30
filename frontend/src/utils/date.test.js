import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { formatDate, formatDueDate, formatDueDateForInput } from "./date";

// Force a timezone behind UTC so a regression to local-time formatting
// shifts the day back deterministically, whatever machine runs the suite.
const ORIGINAL_TZ = process.env.TZ;

beforeAll(() => {
  process.env.TZ = "America/Bogota";
});

afterAll(() => {
  if (ORIGINAL_TZ === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = ORIGINAL_TZ;
  }
});

// Due dates are stored as UTC midnight (TaskForm sends
// new Date("YYYY-MM-DD").toISOString()), so they must be read in UTC to
// avoid shifting a day back in timezones behind UTC.
describe("formatDueDate", () => {
  it("runs under a timezone behind UTC (guard for the tests below)", () => {
    // Local formatting of UTC midnight lands on the previous day in Bogota
    expect(formatDate("2026-09-30T00:00:00.000Z")).toContain("29");
  });

  it("keeps the calendar day of a UTC-midnight date", () => {
    expect(formatDueDate("2026-09-30T00:00:00.000Z")).toBe("30 de sept de 2026");
  });

  it("does not leak the raw ISO string", () => {
    expect(formatDueDate("2026-09-30T00:00:00.000Z")).not.toContain("T00:00");
  });

  it("returns an empty string for empty or invalid values", () => {
    expect(formatDueDate("")).toBe("");
    expect(formatDueDate(null)).toBe("");
    expect(formatDueDate("not-a-date")).toBe("");
  });
});

describe("formatDueDateForInput", () => {
  it("converts an ISO string to the yyyy-mm-dd an <input type=date> accepts", () => {
    expect(formatDueDateForInput("2026-09-30T00:00:00.000Z")).toBe(
      "2026-09-30"
    );
  });

  it("returns an empty string for empty or invalid values", () => {
    expect(formatDueDateForInput("")).toBe("");
    expect(formatDueDateForInput(undefined)).toBe("");
    expect(formatDueDateForInput("not-a-date")).toBe("");
  });
});
