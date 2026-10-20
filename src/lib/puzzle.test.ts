import { describe, expect, it } from "vitest";
import { buildHints, buildPuzzle, playableCentury, toPublicPuzzle, type HarvardObject } from "./puzzle";

function object(overrides: Partial<HarvardObject> = {}): HarvardObject {
  return {
    id: 1,
    title: "Test Object",
    dated: "17th century",
    datebegin: 1600,
    dateend: 1699,
    classification: "Paintings",
    medium: "Oil on canvas",
    culture: "Dutch",
    period: null,
    people: [{ name: "Test Artist", role: "Artist" }],
    primaryimageurl: "https://nrs.harvard.edu/urn-3:HUAM:TEST1",
    url: "https://harvardartmuseums.org/collections/object/1",
    ...overrides,
  };
}

describe("playableCentury", () => {
  it("returns the century of a dated object with an image", () => {
    expect(playableCentury(object())).toBe(17);
  });

  it("skips objects without an image, title or usable dates", () => {
    expect(playableCentury(object({ primaryimageurl: null }))).toBeNull();
    expect(playableCentury(object({ title: " " }))).toBeNull();
    expect(playableCentury(object({ datebegin: 0, dateend: 0 }))).toBeNull();
    expect(playableCentury(object({ datebegin: null }))).toBeNull();
    expect(playableCentury(object({ datebegin: 1690, dateend: 1710 }))).toBeNull();
    expect(playableCentury(object({ datebegin: -5000, dateend: -4950 }))).toBeNull();
  });
});

describe("buildHints", () => {
  it("lists clues weakest first", () => {
    expect(buildHints(object())).toEqual([
      { label: "Type", value: "Paintings" },
      { label: "Medium", value: "Oil on canvas" },
      { label: "Culture", value: "Dutch" },
      { label: "Artist", value: "Test Artist" },
    ]);
  });

  it("drops clues that mention dates", () => {
    const hints = buildHints(
      object({ culture: "Unidentified culture", period: "Edo period, 1615-1868", people: [] }),
    );
    expect(hints.map((h) => h.label)).toEqual(["Type", "Medium"]);
  });

  it("skips unknown artists and fills in with the period", () => {
    const hints = buildHints(
      object({ people: [{ name: "Unknown Artist", role: "Artist" }], period: "Classical period, High" }),
    );
    expect(hints.at(-1)).toEqual({ label: "Period", value: "Classical period, High" });
  });

  it("gives at most one clue per wrong guess", () => {
    expect(buildHints(object({ period: "Baroque" }))).toHaveLength(4);
  });
});

describe("buildPuzzle", () => {
  const objects = [
    object({ id: 1, datebegin: 1600, dateend: 1699 }),
    object({ id: 2, datebegin: 1610, dateend: 1620 }),
    object({ id: 3, datebegin: -430, dateend: -400, title: "Test Vessel" }),
    object({ id: 4, datebegin: 1850, dateend: 1860, title: "Test Print" }),
    object({ id: 5, primaryimageurl: null, datebegin: 1200, dateend: 1250 }),
  ];

  it("is deterministic for a seed", () => {
    expect(buildPuzzle("2026-10-20", objects, 20261020)).toEqual(
      buildPuzzle("2026-10-20", objects, 20261020),
    );
  });

  it("picks among the centuries in the sample", () => {
    const centuries = new Set<number>();
    for (let seed = 20261020; seed < 20261060; seed++) {
      centuries.add(buildPuzzle("2026-10-20", objects, seed)!.answer.century);
    }
    expect([...centuries].sort((a, b) => a - b)).toEqual([-5, 17, 19]);
  });

  it("asks the museum's image server for a resized image", () => {
    const puzzle = buildPuzzle("2026-10-20", [objects[0]], 1)!;
    expect(puzzle.imageUrl).toBe(
      "https://nrs.harvard.edu/urn-3:HUAM:TEST1?width=1200&height=1200",
    );
    expect(puzzle.number).toBe(1);
  });

  it("returns null when nothing is playable", () => {
    expect(buildPuzzle("2026-10-20", [objects[4]], 1)).toBeNull();
  });

  it("keeps the answer out of the public puzzle", () => {
    const publicPuzzle = toPublicPuzzle(buildPuzzle("2026-10-20", objects, 1)!);
    expect(Object.keys(publicPuzzle).sort()).toEqual(["date", "hints", "imageUrl", "number"]);
  });
});
