import { NextResponse } from "next/server";
import { countryByCode } from "@/lib/countries";
import { isPlayableDate, puzzleDate } from "@/lib/dates";
import { compareCountries } from "@/lib/geo";
import { getDailyPuzzle, getRound } from "@/lib/harvard";
import { MAX_GUESSES, parseRoundId, type Puzzle } from "@/lib/puzzle";

const invalid = () => NextResponse.json({ error: "Invalid guess" }, { status: 400 });

// Guesses are checked here, on the server, so the answer never ships to the
// browser until the game is over.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { kind, id, guess, attempt } = body ?? {};
  const guessed = countryByCode(guess);

  const isDaily = kind === "daily" && isPlayableDate(id, puzzleDate(new Date()));
  const isRound = kind === "round" && parseRoundId(id) !== null;
  if (
    (!isDaily && !isRound) ||
    !guessed ||
    !Number.isInteger(attempt) ||
    attempt < 1 ||
    attempt > MAX_GUESSES
  ) {
    return invalid();
  }

  let puzzle: Puzzle | null;
  try {
    puzzle = isDaily ? await getDailyPuzzle(id) : await getRound(id);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Couldn't load the puzzle" },
      { status: 502 },
    );
  }
  if (!puzzle) return invalid();

  const result = compareCountries(guessed, countryByCode(puzzle.answer.country)!);
  const finished = result.feedback === "correct" || attempt === MAX_GUESSES;
  return NextResponse.json({
    ...result,
    answer: finished ? puzzle.answer : undefined,
  });
}
