import "server-only";
import { cacheLife } from "next/cache";
import { buildPuzzle, type HarvardObject, type Puzzle } from "./puzzle";

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
  "classification",
  "medium",
  "culture",
  "period",
  "people",
  "places",
  "primaryimageurl",
  "url",
];

/**
 * Loads the puzzle for a date (YYYY-MM-DD).
 *
 * The API key only lives on the server, and each date's puzzle is cached in
 * a cache shared by every server instance, so the API is called about once a
 * day no matter how many people play. That keeps Artle well under the API's
 * limit of 2,500 requests a day.
 */
export async function getPuzzle(date: string): Promise<Puzzle> {
  "use cache: remote";
  cacheLife("max");

  const apiKey = process.env.HARVARD_API_KEY;
  if (!apiKey) {
    throw new Error("HARVARD_API_KEY is not set. See README.md.");
  }

  // Seeding the API's random sort with the date gives everyone the same
  // "random" sample, and so the same artwork, on a given day.
  const seed = Number(date.replaceAll("-", ""));
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

  const puzzle = buildPuzzle(date, data.records ?? [], seed);
  if (!puzzle) throw new Error(`No playable artwork found for ${date}`);
  return puzzle;
}
