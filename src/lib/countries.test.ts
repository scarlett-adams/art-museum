import { describe, expect, it } from "vitest";
import { COUNTRIES, countryByCode, findCountry, flag, normalize, searchCountries } from "./countries";

describe("COUNTRIES", () => {
  it("has unique codes and names", () => {
    expect(new Set(COUNTRIES.map((c) => c.code)).size).toBe(COUNTRIES.length);
    const names = COUNTRIES.flatMap((c) => [c.name, ...c.aliases].map(normalize));
    expect(new Set(names).size).toBe(names.length);
  });

  it("has valid coordinates", () => {
    for (const country of COUNTRIES) {
      expect(Math.abs(country.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(country.lon)).toBeLessThanOrEqual(180);
    }
  });
});

describe("findCountry", () => {
  it("matches names and aliases, ignoring case and accents", () => {
    expect(findCountry("France")?.code).toBe("FR");
    expect(findCountry("  the netherlands ")?.code).toBe("NL");
    expect(findCountry("Holland")?.code).toBe("NL");
    expect(findCountry("cote d'ivoire")?.code).toBe("CI");
    expect(findCountry("United States of America")?.code).toBe("US");
    expect(findCountry("Fran")).toBeUndefined();
  });
});

describe("searchCountries", () => {
  it("puts names that start with the query first", () => {
    expect(searchCountries("ger").map((c) => c.name)).toEqual(["Germany"]);
    expect(searchCountries("korea").map((c) => c.code).sort()).toEqual(["KP", "KR"]);
    expect(searchCountries("in")[0].name).toBe("India");
  });

  it("finds countries by alias", () => {
    expect(searchCountries("engl").map((c) => c.code)).toEqual(["GB"]);
  });

  it("returns nothing for an empty query", () => {
    expect(searchCountries("  ")).toEqual([]);
  });
});

describe("countryByCode", () => {
  it("looks up codes", () => {
    expect(countryByCode("JP")?.name).toBe("Japan");
    expect(countryByCode("ZZ")).toBeUndefined();
    expect(countryByCode(42)).toBeUndefined();
  });
});

describe("flag", () => {
  it("builds flag emoji", () => {
    expect(flag("FR")).toBe("🇫🇷");
  });
});
