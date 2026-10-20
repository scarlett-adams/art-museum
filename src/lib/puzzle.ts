import { findCountry, type Country } from "./countries";
import { puzzleNumber } from "./dates";

export const MAX_GUESSES = 6;

/** The fields Artle requests from the Harvard Art Museums object endpoint. */
export type HarvardObject = {
  id: number;
  title?: string | null;
  dated?: string | null;
  century?: string | null;
  classification?: string | null;
  medium?: string | null;
  culture?: string | null;
  period?: string | null;
  people?: { name?: string | null; role?: string | null }[] | null;
  places?: { displayname?: string | null; type?: string | null }[] | null;
  primaryimageurl?: string | null;
  url?: string | null;
};

export type Hint = { label: string; value: string };

/** What the player sees while guessing. Must not reveal the answer. */
export type PublicPuzzle = {
  date: string;
  number: number;
  imageUrl: string;
  hints: Hint[];
};

/** Revealed once the game is over. */
export type Answer = {
  country: string;
  place: string;
  title: string;
  dated: string | null;
  artist: string | null;
  culture: string | null;
  url: string | null;
};

export type Puzzle = PublicPuzzle & { answer: Answer };

const UNKNOWN = /unknown|unidentified|anonymous/i;

function clean(value: string | null | undefined): string | null {
  const text = value?.trim();
  return text && !UNKNOWN.test(text) ? text : null;
}

function artistOf(object: HarvardObject): string | null {
  for (const person of object.people ?? []) {
    const name = clean(person.name);
    if (person.role === "Artist" && name) return name;
  }
  return null;
}

/**
 * The country a Harvard place name is in. Place names list the hierarchy
 * from the top down, like "Europe, France, Paris", so the first part that's
 * a known country wins. Returns the place reworded as "Paris, France".
 */
export function countryOfPlace(displayname: string): { country: Country; place: string } | null {
  const parts = displayname.split(",").map((part) => part.trim()).filter(Boolean);
  for (let i = 0; i < parts.length; i++) {
    const country = findCountry(parts[i]);
    if (country) return { country, place: parts.slice(i).reverse().join(", ") };
  }
  return null;
}

/** Where the object was made, or null if that isn't a known country. */
export function creationPlace(object: HarvardObject): { country: Country; place: string } | null {
  for (const place of object.places ?? []) {
    if (place.type !== "Creation Place" || !place.displayname) continue;
    const found = countryOfPlace(place.displayname);
    if (found) return found;
  }
  return null;
}

/** Clues revealed one at a time after each wrong guess, weakest first. */
export function buildHints(object: HarvardObject): Hint[] {
  const candidates: [string, string | null][] = [
    ["Type", clean(object.classification)],
    ["Medium", clean(object.medium)],
    ["Date", clean(object.dated) ?? clean(object.century)],
    ["Artist", artistOf(object)],
    ["Culture", clean(object.culture)],
    ["Period", clean(object.period)],
  ];
  return candidates
    .filter((c): c is [string, string] => c[1] !== null)
    .map(([label, value]) => ({ label, value }))
    .slice(0, MAX_GUESSES - 1);
}

function hash(n: number): number {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return (x ^ (x >>> 16)) >>> 0;
}

/**
 * Picks the day's artwork from a random sample of the collection.
 *
 * Most of the collection was made in the United States and western Europe,
 * so a purely random pick would almost always be from one of a few
 * countries. Instead, a country is picked evenly from those in the sample,
 * then the first artwork made there.
 */
export function buildPuzzle(
  date: string,
  objects: HarvardObject[],
  seed: number,
): Puzzle | null {
  const byCountry = new Map<string, { object: HarvardObject; place: string }>();
  for (const object of objects) {
    if (!object.primaryimageurl || !clean(object.title)) continue;
    const made = creationPlace(object);
    if (made && !byCountry.has(made.country.code)) {
      byCountry.set(made.country.code, { object, place: made.place });
    }
  }
  const codes = [...byCountry.keys()].sort();
  if (codes.length === 0) return null;

  const country = codes[hash(seed) % codes.length];
  const { object, place } = byCountry.get(country)!;
  const imageUrl = new URL(object.primaryimageurl!);
  imageUrl.searchParams.set("width", "1200");
  imageUrl.searchParams.set("height", "1200");

  return {
    date,
    number: puzzleNumber(date),
    imageUrl: imageUrl.toString(),
    hints: buildHints(object),
    answer: {
      country,
      place,
      title: clean(object.title)!,
      dated: clean(object.dated),
      artist: artistOf(object),
      culture: clean(object.culture),
      url: object.url ?? null,
    },
  };
}

export function toPublicPuzzle({ date, number, imageUrl, hints }: Puzzle): PublicPuzzle {
  return { date, number, imageUrl, hints };
}
