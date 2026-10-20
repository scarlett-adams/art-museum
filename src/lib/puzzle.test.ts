import { describe, expect, it } from "vitest";
import {
  buildHints,
  buildPuzzle,
  countryOfPlace,
  creationPlace,
  toPublicPuzzle,
  type HarvardObject,
} from "./puzzle";

function object(overrides: Partial<HarvardObject> = {}): HarvardObject {
  return {
    id: 1,
    title: "Test Object",
    dated: "1650s",
    century: "17th century",
    classification: "Paintings",
    medium: "Oil on canvas",
    culture: "Dutch",
    period: null,
    people: [{ name: "Test Artist", role: "Artist" }],
    places: [{ displayname: "Europe, Netherlands, Amsterdam", type: "Creation Place" }],
    primaryimageurl: "https://nrs.harvard.edu/urn-3:HUAM:TEST1",
    url: "https://harvardartmuseums.org/collections/object/1",
    ...overrides,
  };
}

describe("countryOfPlace", () => {
  it("finds the country in a place hierarchy", () => {
    expect(countryOfPlace("Europe, France, Paris")).toMatchObject({
      country: { code: "FR" },
      place: "Paris, France",
    });
    expect(countryOfPlace("Asia, Japan")).toMatchObject({ country: { code: "JP" }, place: "Japan" });
  });

  it("uses the first country, not a state with the same name", () => {
    expect(countryOfPlace("North America, United States, Georgia, Atlanta")?.country.code).toBe(
      "US",
    );
  });

  it("understands older names", () => {
    expect(countryOfPlace("Europe, England, London")?.country.code).toBe("GB");
    expect(countryOfPlace("Asia, Persia, Isfahan")?.country.code).toBe("IR");
    expect(countryOfPlace("Ancient & Byzantine World, Asia, Anatolia")?.country.code).toBe("TR");
  });

  it("returns null for places it can't pin to a country", () => {
    expect(countryOfPlace("Ancient & Byzantine World, Europe, Chalke")).toBeNull();
    expect(countryOfPlace("")).toBeNull();
  });
});

describe("creationPlace", () => {
  it("only uses where the object was made", () => {
    const found = object({
      places: [
        { displayname: "Europe, Italy, Rome", type: "Find Spot" },
        { displayname: "Europe, Greece, Athens", type: "Creation Place" },
      ],
    });
    expect(creationPlace(found)?.country.code).toBe("GR");
    expect(creationPlace(object({ places: [{ displayname: "Europe, Italy", type: "Find Spot" }] }))).toBeNull();
    expect(creationPlace(object({ places: null }))).toBeNull();
  });
});

describe("buildHints", () => {
  it("lists clues weakest first, one per wrong guess", () => {
    expect(buildHints(object({ period: "Dutch Golden Age" }))).toEqual([
      { label: "Type", value: "Paintings" },
      { label: "Medium", value: "Oil on canvas" },
      { label: "Date", value: "1650s" },
      { label: "Artist", value: "Test Artist" },
      { label: "Culture", value: "Dutch" },
    ]);
  });

  it("skips unknown values and falls back to the century", () => {
    const hints = buildHints(
      object({
        dated: null,
        culture: "Unidentified culture",
        people: [{ name: "Unknown Artist", role: "Artist" }],
        period: "Edo period",
      }),
    );
    expect(hints.map((h) => h.label)).toEqual(["Type", "Medium", "Date", "Period"]);
    expect(hints[2].value).toBe("17th century");
  });
});

describe("buildPuzzle", () => {
  const objects = [
    object({ id: 1 }),
    object({ id: 2, title: "Another Dutch Test" }),
    object({
      id: 3,
      title: "Test Vase",
      places: [{ displayname: "Asia, Japan, Kyoto", type: "Creation Place" }],
    }),
    object({
      id: 4,
      title: "Test Print",
      places: [{ displayname: "Europe, France, Paris", type: "Creation Place" }],
    }),
    object({ id: 5, primaryimageurl: null, places: [{ displayname: "Asia, China", type: "Creation Place" }] }),
    object({ id: 6, places: [{ displayname: "Ancient & Byzantine World, Europe, Chalke", type: "Creation Place" }] }),
  ];

  it("is deterministic for a seed", () => {
    expect(buildPuzzle("2026-10-20", objects, 20261020)).toEqual(
      buildPuzzle("2026-10-20", objects, 20261020),
    );
  });

  it("picks evenly among the countries in the sample", () => {
    const countries = new Set<string>();
    for (let seed = 20261020; seed < 20261060; seed++) {
      countries.add(buildPuzzle("2026-10-20", objects, seed)!.answer.country);
    }
    expect([...countries].sort()).toEqual(["FR", "JP", "NL"]);
  });

  it("describes the answer", () => {
    const puzzle = buildPuzzle("2026-10-20", [objects[0]], 1)!;
    expect(puzzle.answer).toEqual({
      country: "NL",
      place: "Amsterdam, Netherlands",
      title: "Test Object",
      dated: "1650s",
      artist: "Test Artist",
      culture: "Dutch",
      url: "https://harvardartmuseums.org/collections/object/1",
    });
    expect(puzzle.number).toBe(1);
  });

  it("asks the museum's image server for a resized image", () => {
    expect(buildPuzzle("2026-10-20", [objects[0]], 1)!.imageUrl).toBe(
      "https://nrs.harvard.edu/urn-3:HUAM:TEST1?width=1200&height=1200",
    );
  });

  it("returns null when nothing is playable", () => {
    expect(buildPuzzle("2026-10-20", objects.slice(4), 1)).toBeNull();
  });

  it("keeps the answer out of the public puzzle", () => {
    const publicPuzzle = toPublicPuzzle(buildPuzzle("2026-10-20", objects, 1)!);
    expect(Object.keys(publicPuzzle).sort()).toEqual(["date", "hints", "imageUrl", "number"]);
  });
});
