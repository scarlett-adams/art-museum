import { describe, expect, it } from "vitest";
import {
  centuryFromIndex,
  centuryIndex,
  centuryLabel,
  centuryOfRange,
  centuryOfYear,
  centuryYears,
  compareCenturies,
  isValidCentury,
} from "./century";

describe("centuryOfYear", () => {
  it.each([
    [1600, 17],
    [1699, 17],
    [1700, 18],
    [1, 1],
    [99, 1],
    [-1, -1],
    [-99, -1],
    [-100, -2],
    [-430, -5],
  ])("puts %i in century %i", (year, century) => {
    expect(centuryOfYear(year)).toBe(century);
  });
});

describe("centuryOfRange", () => {
  it("accepts both ways museums write a full century", () => {
    expect(centuryOfRange(1600, 1699)).toBe(17);
    expect(centuryOfRange(1601, 1700)).toBe(17);
    expect(centuryOfRange(-500, -401)).toBe(-5);
    expect(centuryOfRange(-499, -400)).toBe(-5);
  });

  it("handles single years and short ranges", () => {
    expect(centuryOfRange(1650, 1650)).toBe(17);
    expect(centuryOfRange(-430, -400)).toBe(-5);
  });

  it("rejects ranges that span two centuries", () => {
    expect(centuryOfRange(1690, 1710)).toBeNull();
    expect(centuryOfRange(1699, 1700)).toBeNull();
    expect(centuryOfRange(-50, 50)).toBeNull();
  });

  it("rejects backwards ranges", () => {
    expect(centuryOfRange(1700, 1600)).toBeNull();
  });
});

describe("centuryIndex", () => {
  it("has no gap between BCE and CE", () => {
    expect(centuryIndex(1) - centuryIndex(-1)).toBe(1);
  });

  it("round-trips", () => {
    for (let c = -30; c <= 21; c++) {
      if (c !== 0) expect(centuryFromIndex(centuryIndex(c))).toBe(c);
    }
  });
});

describe("labels", () => {
  it("names centuries", () => {
    expect(centuryLabel(17)).toBe("17th century");
    expect(centuryLabel(21)).toBe("21st century");
    expect(centuryLabel(12)).toBe("12th century");
    expect(centuryLabel(3)).toBe("3rd century CE");
    expect(centuryLabel(-2)).toBe("2nd century BCE");
  });

  it("names the years in a century", () => {
    expect(centuryYears(17)).toBe("1600s");
    expect(centuryYears(2)).toBe("100s");
    expect(centuryYears(1)).toBe("1–99 CE");
    expect(centuryYears(-1)).toBe("99–1 BCE");
    expect(centuryYears(-5)).toBe("400s BCE");
  });
});

describe("compareCenturies", () => {
  it("marks exact guesses correct", () => {
    expect(compareCenturies(17, 17)).toEqual({ feedback: "correct", direction: null });
  });

  it("marks guesses one century off as close", () => {
    expect(compareCenturies(16, 17)).toEqual({ feedback: "close", direction: "later" });
    expect(compareCenturies(18, 17)).toEqual({ feedback: "close", direction: "earlier" });
    expect(compareCenturies(-1, 1)).toEqual({ feedback: "close", direction: "later" });
  });

  it("marks everything else far", () => {
    expect(compareCenturies(-5, 17)).toEqual({ feedback: "far", direction: "later" });
  });
});

describe("isValidCentury", () => {
  it("accepts centuries in the playable range only", () => {
    expect(isValidCentury(17)).toBe(true);
    expect(isValidCentury(-30)).toBe(true);
    expect(isValidCentury(0)).toBe(false);
    expect(isValidCentury(22)).toBe(false);
    expect(isValidCentury(-31)).toBe(false);
    expect(isValidCentury(1.5)).toBe(false);
    expect(isValidCentury("17")).toBe(false);
  });
});
