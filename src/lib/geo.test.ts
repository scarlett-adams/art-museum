import { describe, expect, it } from "vitest";
import { countryByCode } from "./countries";
import { compareCountries, compassDirection, distanceKm } from "./geo";

const country = (code: string) => countryByCode(code)!;

describe("distanceKm", () => {
  it("measures along the Earth's surface", () => {
    expect(distanceKm({ lat: 0, lon: 0 }, { lat: 0, lon: 1 })).toBeCloseTo(111.19, 1);
    // London to New York is about 5,570 km.
    expect(
      distanceKm({ lat: 51.507, lon: -0.128 }, { lat: 40.713, lon: -74.006 }),
    ).toBeCloseTo(5570, -1);
  });
});

describe("compassDirection", () => {
  it("gives the eight compass points", () => {
    const origin = { lat: 0, lon: 0 };
    expect(compassDirection(origin, { lat: 10, lon: 0 })).toBe("N");
    expect(compassDirection(origin, { lat: 10, lon: 10 })).toBe("NE");
    expect(compassDirection(origin, { lat: 0, lon: 10 })).toBe("E");
    expect(compassDirection(origin, { lat: -10, lon: 10 })).toBe("SE");
    expect(compassDirection(origin, { lat: -10, lon: 0 })).toBe("S");
    expect(compassDirection(origin, { lat: -10, lon: -10 })).toBe("SW");
    expect(compassDirection(origin, { lat: 0, lon: -10 })).toBe("W");
    expect(compassDirection(origin, { lat: 10, lon: -10 })).toBe("NW");
  });

  it("matches what a world map shows", () => {
    expect(compassDirection(country("US"), country("JP"))).toBe("W");
    expect(compassDirection(country("JP"), country("US"))).toBe("E");
    expect(compassDirection(country("GB"), country("FR"))).toBe("S");
    expect(compassDirection(country("IT"), country("JP"))).toBe("E");
  });

  it("goes the short way across the date line", () => {
    expect(compassDirection({ lat: 0, lon: 170 }, { lat: 0, lon: -170 })).toBe("E");
  });
});

describe("compareCountries", () => {
  it("marks the right country correct", () => {
    expect(compareCountries(country("FR"), country("FR"))).toEqual({
      feedback: "correct",
      distanceKm: 0,
      direction: null,
    });
  });

  it("marks nearby countries close", () => {
    const result = compareCountries(country("DE"), country("FR"));
    expect(result.feedback).toBe("close");
    expect(result.direction).toBe("SW");
    expect(result.distanceKm).toBeGreaterThan(400);
    expect(result.distanceKm).toBeLessThan(800);
  });

  it("marks distant countries far", () => {
    const result = compareCountries(country("BR"), country("CN"));
    expect(result.feedback).toBe("far");
    expect(result.distanceKm).toBeGreaterThan(10000);
  });
});
