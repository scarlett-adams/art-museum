type Point = { lat: number; lon: number };

export const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
export type Compass = (typeof COMPASS)[number];

export const ARROWS: Record<Compass, string> = {
  N: "↑",
  NE: "↗",
  E: "→",
  SE: "↘",
  S: "↓",
  SW: "↙",
  W: "←",
  NW: "↖",
};

export const COMPASS_NAMES: Record<Compass, string> = {
  N: "north",
  NE: "northeast",
  E: "east",
  SE: "southeast",
  S: "south",
  SW: "southwest",
  W: "west",
  NW: "northwest",
};

const EARTH_RADIUS_KM = 6371;

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Shortest distance over the Earth's surface. */
export function distanceKm(a: Point, b: Point): number {
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * The direction to head from `a` to reach `b`, as it looks on a flat world
 * map (a constant compass bearing), going the short way around.
 */
export function compassDirection(a: Point, b: Point): Compass {
  let dLon = radians(b.lon - a.lon);
  if (Math.abs(dLon) > Math.PI) dLon -= Math.sign(dLon) * 2 * Math.PI;
  const mercatorY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + radians(lat) / 2));
  const bearing = (Math.atan2(dLon, mercatorY(b.lat) - mercatorY(a.lat)) * 180) / Math.PI;
  return COMPASS[Math.round(((bearing + 360) % 360) / 45) % 8];
}

/** Guesses closer than this are marked "close". */
export const CLOSE_KM = 1500;

export type Feedback = "correct" | "close" | "far";

export type Comparison = {
  feedback: Feedback;
  distanceKm: number;
  direction: Compass | null;
};

export function compareCountries(
  guess: Point & { code: string },
  answer: Point & { code: string },
): Comparison {
  if (guess.code === answer.code) {
    return { feedback: "correct", distanceKm: 0, direction: null };
  }
  const distance = Math.round(distanceKm(guess, answer));
  return {
    feedback: distance < CLOSE_KM ? "close" : "far",
    distanceKm: distance,
    direction: compassDirection(guess, answer),
  };
}
