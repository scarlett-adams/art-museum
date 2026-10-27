import { describe, expect, it } from "vitest";
import {
  ROUND_POOLS,
  countryOfPlace,
  creationPlace,
  dailyArtwork,
  mediumClue,
  parseRoundId,
  pickArtwork,
  playableArtworks,
  roundId,
  toPublicPuzzle,
  type HarvardObject,
} from "./puzzle";

function object(overrides: Partial<HarvardObject> = {}): HarvardObject {
  return {
    id: 1,
    title: "Test Object",
    dated: "1650s",
    century: "17th century",
    medium: "Oil on canvas",
    culture: "Dutch",
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

describe("mediumClue", () => {
  it("drops ware names and where it was made", () => {
    expect(
      mediumClue(
        "Yue ware: light gray stoneware with celadon glaze over incised decoration. From the Yue kilns at Shanglinhu, Zhejiang province.",
      ),
    ).toBe("light gray stoneware with celadon glaze over incised decoration");
  });

  it("leaves plain materials alone", () => {
    expect(mediumClue("Oil on canvas")).toBe("Oil on canvas");
    expect(mediumClue("Gelatin silver print.")).toBe("Gelatin silver print");
    expect(mediumClue(" ")).toBeNull();
    expect(mediumClue(null)).toBeNull();
  });
});

describe("playableArtworks", () => {
  it("builds clues and the answer", () => {
    const [artwork] = playableArtworks([object()]);
    expect(artwork.clues).toEqual({ date: "1650s", medium: "Oil on canvas" });
    expect(artwork.answer).toEqual({
      country: "NL",
      place: "Amsterdam, Netherlands",
      title: "Test Object",
      dated: "1650s",
      artist: "Test Artist",
      culture: "Dutch",
      url: "https://harvardartmuseums.org/collections/object/1",
    });
  });

  it("asks the museum's image server for a resized image", () => {
    expect(playableArtworks([object()])[0].imageUrl).toBe(
      "https://nrs.harvard.edu/urn-3:HUAM:TEST1?width=1200&height=1200",
    );
  });

  it("zooms in somewhere near the middle", () => {
    for (let id = 1; id < 50; id++) {
      const { focus } = playableArtworks([object({ id })])[0];
      for (const value of [focus.x, focus.y]) {
        expect(value).toBeGreaterThanOrEqual(30);
        expect(value).toBeLessThanOrEqual(70);
      }
    }
  });

  it("falls back to the century for the date", () => {
    expect(playableArtworks([object({ dated: null })])[0].clues.date).toBe("17th century");
  });

  it("skips objects without an image, title or known country", () => {
    expect(
      playableArtworks([
        object({ primaryimageurl: null }),
        object({ title: " " }),
        object({ places: [{ displayname: "Ancient & Byzantine World, Europe, Chalke", type: "Creation Place" }] }),
        object({ people: [{ name: "Unknown Artist", role: "Artist" }] }),
      ]).map((a) => a.answer.artist),
    ).toEqual([null]);
  });
});

describe("picking artworks", () => {
  const artworks = playableArtworks([
    object({ id: 1 }),
    object({ id: 2, title: "Another Dutch Test" }),
    object({ id: 3, places: [{ displayname: "Asia, Japan, Kyoto", type: "Creation Place" }] }),
    object({ id: 4, places: [{ displayname: "Europe, France, Paris", type: "Creation Place" }] }),
  ]);

  it("picks countries evenly, then an artwork from that country", () => {
    const countries = new Set<string>();
    for (let seed = 0; seed < 30; seed++) {
      countries.add(artworks[pickArtwork(artworks, seed, seed)].answer.country);
    }
    expect([...countries].sort()).toEqual(["FR", "JP", "NL"]);
    // Both Dutch artworks can come up.
    expect(pickArtwork(artworks, 2, 0)).toBe(0);
    expect(pickArtwork(artworks, 2, 1)).toBe(1);
  });

  it("gives the same daily artwork for the same seed", () => {
    expect(dailyArtwork(artworks, 20261027)).toBe(dailyArtwork(artworks, 20261027));
  });
});

describe("round ids", () => {
  it("round-trips", () => {
    for (const [pool, index] of [[1, 0], [42, 7], [ROUND_POOLS, 99]]) {
      expect(parseRoundId(roundId(pool, index))).toEqual({ pool, index });
    }
    expect(roundId(2, 34)).toMatch(/^[0-9a-z]+$/);
  });

  it("rejects ids that aren't rounds", () => {
    for (const id of ["", "unavailable", "ABC", "1-2", roundId(ROUND_POOLS + 1, 0), "0", 42, null]) {
      expect(parseRoundId(id)).toBeNull();
    }
  });
});

describe("toPublicPuzzle", () => {
  it("keeps the answer out", () => {
    const [artwork] = playableArtworks([object()]);
    const publicPuzzle = toPublicPuzzle({ kind: "round", id: "abc", number: null, ...artwork });
    expect(Object.keys(publicPuzzle).sort()).toEqual(
      ["clues", "focus", "id", "imageUrl", "kind", "number"],
    );
  });
});
