import { MAX_CENTURY, MIN_CENTURY, centuryOfRange } from "./century";
import { puzzleNumber } from "./dates";

export const MAX_GUESSES = 5;

/** The fields Artle requests from the Harvard Art Museums object endpoint. */
export type HarvardObject = {
  id: number;
  title?: string | null;
  dated?: string | null;
  datebegin?: number | null;
  dateend?: number | null;
  classification?: string | null;
  medium?: string | null;
  culture?: string | null;
  period?: string | null;
  people?: { name?: string | null; role?: string | null }[] | null;
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
  century: number;
  title: string;
  dated: string | null;
  artist: string | null;
  culture: string | null;
  url: string | null;
};

export type Puzzle = PublicPuzzle & { answer: Answer };

const UNKNOWN = /unknown|unidentified|anonymous/i;
// Hints that mention a date or century would give the answer away.
const DATE_WORDS = /\d|centur|millenni|\b(BCE?|CE|AD|B\.C\.|A\.D\.)\b/i;

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

/** Clues revealed one at a time after each wrong guess, weakest first. */
export function buildHints(object: HarvardObject): Hint[] {
  const candidates: [string, string | null][] = [
    ["Type", clean(object.classification)],
    ["Medium", clean(object.medium)],
    ["Culture", clean(object.culture)],
    ["Artist", artistOf(object)],
    ["Period", clean(object.period)],
  ];
  return candidates
    .filter((c): c is [string, string] => c[1] !== null && !DATE_WORDS.test(c[1]))
    .map(([label, value]) => ({ label, value }))
    .slice(0, MAX_GUESSES - 1);
}

/** The object's century, or null if it can't be used as a puzzle. */
export function playableCentury(object: HarvardObject): number | null {
  const { datebegin, dateend } = object;
  if (!object.primaryimageurl || !clean(object.title)) return null;
  if (typeof datebegin !== "number" || typeof dateend !== "number") return null;
  if (datebegin === 0 && dateend === 0) return null; // undated
  const century = centuryOfRange(datebegin, dateend);
  if (century === null || century < MIN_CENTURY || century > MAX_CENTURY) {
    return null;
  }
  return century;
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
 * The collection is mostly 19th- and 20th-century prints and photographs, so
 * a purely random pick would almost always be one of those. Instead, a
 * century is picked evenly from those in the sample, then the first artwork
 * from that century.
 */
export function buildPuzzle(
  date: string,
  objects: HarvardObject[],
  seed: number,
): Puzzle | null {
  const byCentury = new Map<number, HarvardObject>();
  for (const object of objects) {
    const century = playableCentury(object);
    if (century !== null && !byCentury.has(century)) {
      byCentury.set(century, object);
    }
  }
  const centuries = [...byCentury.keys()].sort((a, b) => a - b);
  if (centuries.length === 0) return null;

  const century = centuries[hash(seed) % centuries.length];
  const object = byCentury.get(century)!;
  const imageUrl = new URL(object.primaryimageurl!);
  imageUrl.searchParams.set("width", "1200");
  imageUrl.searchParams.set("height", "1200");

  return {
    date,
    number: puzzleNumber(date),
    imageUrl: imageUrl.toString(),
    hints: buildHints(object),
    answer: {
      century,
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
