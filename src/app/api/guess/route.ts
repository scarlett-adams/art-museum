import { NextResponse } from "next/server";
import { countryByCode } from "@/lib/countries";
import { isPlayableDate, puzzleDate } from "@/lib/dates";
import { compareCountries } from "@/lib/geo";
import { getPuzzle } from "@/lib/harvard";
import { MAX_GUESSES, type Puzzle } from "@/lib/puzzle";

// Guesses are checked here, on the server, so the answer never ships to the
// browser until the game is over.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { date, guess, attempt } = body ?? {};
  const guessed = countryByCode(guess);

  if (
    !isPlayableDate(date, puzzleDate(new Date())) ||
    !guessed ||
    !Number.isInteger(attempt) ||
    attempt < 1 ||
    attempt > MAX_GUESSES
  ) {
    return NextResponse.json({ error: "Invalid guess" }, { status: 400 });
  }

  let puzzle: Puzzle;
  try {
    puzzle = await getPuzzle(date);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Couldn't load the puzzle" },
      { status: 502 },
    );
  }

  const result = compareCountries(guessed, countryByCode(puzzle.answer.country)!);
  const finished = result.feedback === "correct" || attempt === MAX_GUESSES;
  return NextResponse.json({
    ...result,
    answer: finished ? puzzle.answer : undefined,
  });
}
