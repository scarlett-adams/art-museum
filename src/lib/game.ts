import type { Direction, Feedback } from "./century";
import { MAX_GUESSES, type Answer } from "./puzzle";

export const GAME_KEY = "artle:game";
export const STATS_KEY = "artle:stats";
export const HELP_KEY = "artle:seen-help";

export type GuessResult = {
  century: number;
  feedback: Feedback;
  direction: Direction;
};

/** The player's progress on one day's puzzle. `answer` is set once it's over. */
export type SavedGame = {
  date: string;
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

export function shareText(puzzle: number, guesses: GuessResult[], url: string): string {
  const won = guesses.at(-1)?.feedback === "correct";
  const score = won ? guesses.length : "X";
  const squares = guesses.map((guess) => SQUARES[guess.feedback]).join("");
  return `Artle #${puzzle} ${score}/${MAX_GUESSES}\n${squares}\n${url}`;
}
