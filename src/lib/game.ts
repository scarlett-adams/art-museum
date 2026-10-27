import type { Compass, Comparison, Feedback } from "./geo";
import { MAX_GUESSES, type Answer, type PublicPuzzle, type PuzzleKind } from "./puzzle";

/** Where the current daily puzzle and the current unlimited round are saved. */
export const GAME_KEYS: Record<PuzzleKind, string> = {
  daily: "artle:daily-game",
  round: "artle:round-game",
};
/** Stats only count daily puzzles. */
export const STATS_KEY = "artle:stats";
export const HELP_KEY = "artle:seen-help";

export type GuessResult = Comparison & { country: string };

/** The player's progress on one puzzle. `answer` is set once it's over. */
export type SavedGame = {
  id: string;
  guesses: GuessResult[];
  answer?: Answer;
};

export type Stats = {
  played: number;
  wins: number;
  streak: number;
  maxStreak: number;
  lastPlayed: number | null;
  lastWin: number | null;
};

const NO_STATS: Stats = {
  played: 0,
  wins: 0,
  streak: 0,
  maxStreak: 0,
  lastPlayed: null,
  lastWin: null,
};

export function recordResult(stats: Stats | null, puzzle: number, won: boolean): Stats {
  const current = stats ?? NO_STATS;
  if (current.lastPlayed === puzzle) return current;
  const streak = won ? (current.lastWin === puzzle - 1 ? current.streak : 0) + 1 : 0;
  return {
    played: current.played + 1,
    wins: current.wins + (won ? 1 : 0),
    streak,
    maxStreak: Math.max(current.maxStreak, streak),
    lastPlayed: puzzle,
    lastWin: won ? puzzle : current.lastWin,
  };
}

/** The streak as of `puzzle`, which is broken if the player skipped a day. */
export function currentStreak(stats: Stats | null, puzzle: number): number {
  return stats?.lastWin != null && stats.lastWin >= puzzle - 1 ? stats.streak : 0;
}

const SQUARES: Record<Feedback, string> = { correct: "🟩", close: "🟨", far: "⬜" };

const ARROW_EMOJI: Record<Compass, string> = {
  N: "⬆️",
  NE: "↗️",
  E: "➡️",
  SE: "↘️",
  S: "⬇️",
  SW: "↙️",
  W: "⬅️",
  NW: "↖️",
};

/**
 * A spoiler-free summary: a colored square and an arrow per guess. Rounds
 * link to the same artwork, so a friend can try it.
 */
export function shareText(puzzle: PublicPuzzle, guesses: GuessResult[], origin: string): string {
  const won = guesses.at(-1)?.feedback === "correct";
  const score = `${won ? guesses.length : "X"}/${MAX_GUESSES}`;
  const marks = guesses
    .map((guess) => SQUARES[guess.feedback] + (guess.direction ? ARROW_EMOJI[guess.direction] : ""))
    .join(" ");
  return puzzle.kind === "daily"
    ? `Artle #${puzzle.number} ${score}\n${marks}\n${origin}`
    : `Artle Unlimited ${score}\n${marks}\nCan you guess where this was made? ${roundUrl(puzzle, origin)}`;
}

export function roundUrl(puzzle: PublicPuzzle, origin: string): string {
  return `${origin}/unlimited/${puzzle.id}`;
}
