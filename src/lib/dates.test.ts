import { describe, expect, it } from "vitest";
import { isPlayableDate, puzzleDate, puzzleEndsAt, puzzleNumber } from "./dates";

describe("puzzleDate", () => {
  it("uses Eastern time", () => {
    expect(puzzleDate(new Date("2026-10-21T03:59:59Z"))).toBe("2026-10-20");
    expect(puzzleDate(new Date("2026-10-21T04:00:00Z"))).toBe("2026-10-21");
    expect(puzzleDate(new Date("2026-12-01T04:59:59Z"))).toBe("2026-11-30");
  });
});

describe("puzzleNumber", () => {
  it("counts from launch day", () => {
    expect(puzzleNumber("2026-10-20")).toBe(1);
    expect(puzzleNumber("2026-10-21")).toBe(2);
    expect(puzzleNumber("2027-10-20")).toBe(366);
  });
});

describe("isPlayableDate", () => {
  it("allows launch day through today", () => {
    expect(isPlayableDate("2026-10-20", "2026-10-22")).toBe(true);
    expect(isPlayableDate("2026-10-22", "2026-10-22")).toBe(true);
  });

  it("rejects future, pre-launch and malformed dates", () => {
    expect(isPlayableDate("2026-10-23", "2026-10-22")).toBe(false);
    expect(isPlayableDate("2026-10-19", "2026-10-22")).toBe(false);
    expect(isPlayableDate("2026-13-01", "2027-10-22")).toBe(false);
    expect(isPlayableDate("20261021", "2026-10-22")).toBe(false);
    expect(isPlayableDate(20261021, "2026-10-22")).toBe(false);
  });
});

describe("puzzleEndsAt", () => {
  it("ends at midnight Eastern", () => {
    expect(puzzleEndsAt("2026-10-20").toISOString()).toBe("2026-10-21T04:00:00.000Z");
    expect(puzzleEndsAt("2026-12-31").toISOString()).toBe("2027-01-01T05:00:00.000Z");
  });

  it("handles daylight saving time changes", () => {
    // Clocks fall back at 2am on November 1, 2026.
    expect(puzzleEndsAt("2026-10-31").toISOString()).toBe("2026-11-01T04:00:00.000Z");
    expect(puzzleEndsAt("2026-11-01").toISOString()).toBe("2026-11-02T05:00:00.000Z");
    // Clocks spring forward at 2am on March 14, 2027.
    expect(puzzleEndsAt("2027-03-13").toISOString()).toBe("2027-03-14T05:00:00.000Z");
    expect(puzzleEndsAt("2027-03-14").toISOString()).toBe("2027-03-15T04:00:00.000Z");
  });
});
