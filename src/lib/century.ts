// A century is a nonzero integer: 17 is the 17th century CE (the 1600s),
// -5 is the 5th century BCE (the 400s BCE). There is no century 0.

export const MIN_CENTURY = -30;
export const MAX_CENTURY = 21;

export function centuryOfYear(year: number): number {
  return year >= 0
    ? Math.floor(year / 100) + 1
    : -(Math.floor(-year / 100) + 1);
}

// Museums write "17th century" as either 1600–1699 or 1601–1700, so a year
// is trimmed off each end of a range before checking it fits in one century.
export function centuryOfRange(begin: number, end: number): number | null {
  if (end < begin) return null;
  const [b, e] = end - begin >= 2 ? [begin + 1, end - 1] : [begin, end];
  const century = centuryOfYear(b);
  return century === centuryOfYear(e) ? century : null;
}

// Position on a gapless number line, so the 1st century BCE (-1) sits right
// next to the 1st century CE (0).
export function centuryIndex(century: number): number {
  return century > 0 ? century - 1 : century;
}

export function centuryFromIndex(index: number): number {
  return index >= 0 ? index + 1 : index;
}

export function isValidCentury(value: unknown): value is number {
  return (
    Number.isInteger(value) &&
    value !== 0 &&
    (value as number) >= MIN_CENTURY &&
    (value as number) <= MAX_CENTURY
  );
}

function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]);
}

export function centuryLabel(century: number): string {
  if (century < 0) return `${ordinal(-century)} century BCE`;
  return `${ordinal(century)} century${century < 10 ? " CE" : ""}`;
}

export function centuryYears(century: number): string {
  if (century === 1) return "1–99 CE";
  if (century === -1) return "99–1 BCE";
  return century > 0
    ? `${(century - 1) * 100}s`
    : `${(-century - 1) * 100}s BCE`;
}

export type Feedback = "correct" | "close" | "far";
export type Direction = "earlier" | "later" | null;

export function compareCenturies(
  guess: number,
  answer: number,
): { feedback: Feedback; direction: Direction } {
  const diff = centuryIndex(answer) - centuryIndex(guess);
  return {
    feedback: diff === 0 ? "correct" : Math.abs(diff) === 1 ? "close" : "far",
    direction: diff > 0 ? "later" : diff < 0 ? "earlier" : null,
  };
}
