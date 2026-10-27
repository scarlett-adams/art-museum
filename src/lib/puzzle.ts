import { findCountry, type Country } from "./countries";

export const MAX_GUESSES = 6;

/** The fields Artle requests from the Harvard Art Museums object endpoint. */
export type HarvardObject = {
  id: number;
  title?: string | null;
  dated?: string | null;
  century?: string | null;
  medium?: string | null;
  culture?: string | null;
  people?: { name?: string | null; role?: string | null }[] | null;
  places?: { displayname?: string | null; type?: string | null }[] | null;
  primaryimageurl?: string | null;
  url?: string | null;
};

/** Where the zoomed-in first view is centered, in percent of the image. */
export type Focus = { x: number; y: number };

/** Text clues, revealed after the image ones. */
export type Clues = { date: string | null; medium: string | null };

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

/** A playable artwork, before it's made into a daily puzzle or a round. */
export type Artwork = {
  imageUrl: string;
  focus: Focus;
  clues: Clues;
  answer: Answer;
};

export type PuzzleKind = "daily" | "round";

/** What the player sees while guessing. Must not reveal the answer. */
export type PublicPuzzle = {
  kind: PuzzleKind;
  /** A daily puzzle's date (YYYY-MM-DD), or an unlimited round's id. */
  id: string;
  /** Daily puzzles are numbered from launch day. Rounds aren't. */
  number: number | null;
  imageUrl: string;
  focus: Focus;
  clues: Clues;
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

function hash(n: number): number {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return (x ^ (x >>> 16)) >>> 0;
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

/**
 * Just the materials. Museums often lead with a ware name and follow with
 * where it was made, which would give the answer away:
 * "Yue ware: light gray stoneware… From the Yue kilns at Shanglinhu,
 * Zhejiang province." becomes "light gray stoneware…".
 */
export function mediumClue(medium: string | null | undefined): string | null {
  let text = clean(medium);
  if (!text) return null;
  const colon = text.indexOf(":");
  if (colon !== -1) text = text.slice(colon + 1);
  text = text.split(/\.\s/)[0].trim().replace(/\.$/, "");
  return text || null;
}

/** Artworks that can be played, in the order the API returned them. */
export function playableArtworks(objects: HarvardObject[]): Artwork[] {
  const artworks: Artwork[] = [];
  for (const object of objects) {
    const title = clean(object.title);
    const made = creationPlace(object);
    if (!object.primaryimageurl || !title || !made) continue;

    const imageUrl = new URL(object.primaryimageurl);
    imageUrl.searchParams.set("width", "1200");
    imageUrl.searchParams.set("height", "1200");
    const h = hash(object.id);

    artworks.push({
      imageUrl: imageUrl.toString(),
      // Somewhere near the middle, where the subject usually is.
      focus: { x: 30 + (h % 41), y: 30 + ((h >>> 8) % 41) },
      clues: {
        date: clean(object.dated) ?? clean(object.century),
        medium: mediumClue(object.medium),
      },
      answer: {
        country: made.country.code,
        place: made.place,
        title,
        dated: clean(object.dated),
        artist: artistOf(object),
        culture: clean(object.culture),
        url: object.url ?? null,
      },
    });
  }
  return artworks;
}

/**
 * Picks a country evenly from those in the sample, then one of its
 * artworks, and returns that artwork's index. Most of the collection was made
 * in the United States and western Europe, so picking an artwork directly
 * would almost always land on one of a few countries.
 */
export function pickArtwork(artworks: Artwork[], countrySeed: number, artworkSeed: number): number {
  const countries = [...new Set(artworks.map((a) => a.answer.country))].sort();
  const country = countries[countrySeed % countries.length];
  const matching = artworks.flatMap((a, i) => (a.answer.country === country ? [i] : []));
  return matching[artworkSeed % matching.length];
}

/** The index of a day's artwork, given the seed used to sample for that day. */
export function dailyArtwork(artworks: Artwork[], seed: number): number {
  return pickArtwork(artworks, hash(seed), 0);
}

/** Unlimited rounds are drawn from this many cached samples of the collection. */
export const ROUND_POOLS = 100;

/**
 * A round id packs the sample number and the artwork's index into a short
 * base-36 string, like "2bm", so it can be shared without revealing which
 * artwork it is.
 */
export function roundId(pool: number, index: number): string {
  return (pool * 1000 + index).toString(36);
}

export function parseRoundId(id: unknown): { pool: number; index: number } | null {
  if (typeof id !== "string" || !/^[0-9a-z]{1,5}$/.test(id)) return null;
  const n = parseInt(id, 36);
  const pool = Math.floor(n / 1000);
  return pool >= 1 && pool <= ROUND_POOLS ? { pool, index: n % 1000 } : null;
}

export function toPublicPuzzle({ kind, id, number, imageUrl, focus, clues }: Puzzle): PublicPuzzle {
  return { kind, id, number, imageUrl, focus, clues };
}
