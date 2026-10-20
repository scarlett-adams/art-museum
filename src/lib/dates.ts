// A new puzzle starts at midnight in Cambridge, MA, where the museums are.
export const TIME_ZONE = "America/New_York";

// The date of Artle #1.
export const LAUNCH_DATE = "2026-10-20";

const DAY_MS = 24 * 60 * 60 * 1000;

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function zonedParts(instant: Date) {
  const parts: Record<string, number> = {};
  for (const { type, value } of formatter.formatToParts(instant)) {
    if (type !== "literal") parts[type] = Number(value);
  }
  return parts as Record<
    "year" | "month" | "day" | "hour" | "minute" | "second",
    number
  >;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Today's puzzle date (YYYY-MM-DD) as of `now`. */
export function puzzleDate(now: Date): string {
  const { year, month, day } = zonedParts(now);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function puzzleNumber(date: string): number {
  return Math.round((Date.parse(date) - Date.parse(LAUNCH_DATE)) / DAY_MS) + 1;
}

/** Whether `date` is a real puzzle day between launch and `today`. */
export function isPlayableDate(date: unknown, today: string): date is string {
  return (
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) &&
    date >= LAUNCH_DATE &&
    date <= today
  );
}

function utcOffsetAt(instant: number): number {
  const p = zonedParts(new Date(instant));
  const wallClock = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return wallClock - Math.floor(instant / 1000) * 1000;
}

/** The instant a puzzle day ends and the next puzzle unlocks. */
export function puzzleEndsAt(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const wallClockMidnight = Date.UTC(year, month - 1, day + 1);
  // Look up the zone's UTC offset twice, since daylight saving time can
  // change it.
  let instant = wallClockMidnight - utcOffsetAt(wallClockMidnight);
  instant = wallClockMidnight - utcOffsetAt(instant);
  return new Date(instant);
}
