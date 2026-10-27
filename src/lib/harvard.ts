import "server-only";
import { cacheLife } from "next/cache";
import { puzzleNumber } from "./dates";
import {
  ROUND_POOLS,
  dailyArtwork,
  parseRoundId,
  pickArtwork,
  playableArtworks,
  roundId,
  type Artwork,
  type HarvardObject,
  type Puzzle,
} from "./puzzle";

const OBJECT_API = "https://api.harvardartmuseums.org/object";

// Kinds of artwork that make for a good guessing game. Skips coins, books,
// fragments, archival material and the like.
const CLASSIFICATIONS = [
  "Paintings",
  "Drawings",
  "Prints",
  "Photographs",
  "Sculpture",
  "Vessels",
];

const FIELDS = [
  "id",
  "title",
  "dated",
  "century",
  "medium",
  "culture",
  "people",
  "places",
  "primaryimageurl",
  "url",
];

/**
 * The playable artworks in a random sample of 100 from the collection. The
 * API's random sort is seeded, so a seed always gives the same sample.
 *
 * The API key only lives on the server, and samples are cached in a cache
 * shared by every server instance. There are only ever about 100 seeds in
 * use (one a day for the daily puzzle, plus the unlimited pools), which keeps
 * Artle well under the API's limit of 2,500 requests a day.
 */
async function getArtworks(seed: number): Promise<Artwork[]> {
  "use cache: remote";
  cacheLife("max");

  const apiKey = process.env.HARVARD_API_KEY;
  if (!apiKey) {
    throw new Error("HARVARD_API_KEY is not set. See README.md.");
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    hasimage: "1",
    place: "any",
    q: "imagepermissionlevel:0",
    classification: CLASSIFICATIONS.join("|"),
    sort: `random:${seed}`,
    size: "100",
    fields: FIELDS.join(","),
  });

  const response = await fetch(`${OBJECT_API}?${params}`);
  if (!response.ok) {
    throw new Error(`Harvard Art Museums API responded with ${response.status}`);
  }
  const data = (await response.json()) as { records?: HarvardObject[] };

  const artworks = playableArtworks(data.records ?? []);
  if (artworks.length === 0) throw new Error(`No playable artworks for seed ${seed}`);
  return artworks;
}

/** The puzzle for a date (YYYY-MM-DD). Everyone gets the same one. */
export async function getDailyPuzzle(date: string): Promise<Puzzle> {
  const seed = Number(date.replaceAll("-", ""));
  const artworks = await getArtworks(seed);
  const artwork = artworks[dailyArtwork(artworks, seed)];
  return { kind: "daily", id: date, number: puzzleNumber(date), ...artwork };
}

/** An unlimited round, or null if there's no such round. */
export async function getRound(id: string): Promise<Puzzle | null> {
  const parsed = parseRoundId(id);
  if (!parsed) return null;
  const artwork = (await getArtworks(parsed.pool))[parsed.index];
  return artwork ? { kind: "round", id, number: null, ...artwork } : null;
}

/** Picks a random artwork for a new unlimited round. */
export async function newRoundId(): Promise<string> {
  const random = () => Math.floor(Math.random() * 2 ** 31);
  const pool = 1 + (random() % ROUND_POOLS);
  const artworks = await getArtworks(pool);
  return roundId(pool, pickArtwork(artworks, random(), random()));
}
