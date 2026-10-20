"use client";

import { useState, useSyncExternalStore } from "react";
import { centuryLabel, centuryYears, type Direction, type Feedback } from "@/lib/century";
import {
  GAME_KEY,
  HELP_KEY,
  STATS_KEY,
  recordResult,
  type GuessResult,
  type SavedGame,
  type Stats,
} from "@/lib/game";
import { MAX_GUESSES, type Answer, type Hint, type PublicPuzzle } from "@/lib/puzzle";
import { readStored, useStored, writeStored } from "@/lib/storage";
import CenturyPicker from "./CenturyPicker";
import { FEEDBACK_COLOR } from "./feedback";
import HowToPlay from "./HowToPlay";
import Result from "./Result";

const subscribeNothing = () => () => {};

export default function Game({ puzzle }: { puzzle: PublicPuzzle }) {
  const saved = useStored<SavedGame>(GAME_KEY);
  const seenHelp = useStored<boolean>(HELP_KEY);
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [selected, setSelected] = useState(15);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const game: SavedGame =
    saved?.date === puzzle.date ? saved : { date: puzzle.date, guesses: [] };
  const { guesses, answer } = game;
  const wrongGuesses = guesses.filter((g) => g.feedback !== "correct").length;
  const showHelp = helpOpen || (hydrated && !seenHelp && guesses.length === 0);

  function closeHelp() {
    setHelpOpen(false);
    writeStored(HELP_KEY, true);
  }

  async function submitGuess() {
    if (pending || answer) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: puzzle.date,
          guess: selected,
          attempt: guesses.length + 1,
        }),
      });
      if (!response.ok) throw new Error(`Guess failed with ${response.status}`);
      const result = (await response.json()) as {
        feedback: Feedback;
        direction: Direction;
        answer?: Answer;
      };

      writeStored(GAME_KEY, {
        date: puzzle.date,
        guesses: [
          ...guesses,
          { century: selected, feedback: result.feedback, direction: result.direction },
        ],
        answer: result.answer,
      } satisfies SavedGame);
      if (result.answer) {
        const won = result.feedback === "correct";
        writeStored(STATS_KEY, recordResult(readStored<Stats>(STATS_KEY), puzzle.number, won));
      }
    } catch {
      setError("Couldn't check that guess. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between border-y border-line py-2 text-sm text-muted">
        <span>
          No. {puzzle.number} · {formatDate(puzzle.date)}
        </span>
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="rounded px-2 py-1 hover:bg-surface hover:text-foreground"
        >
          How to play
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start">
        <figure className="rounded-sm bg-surface p-3 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_12px_32px_rgb(0_0_0/0.08)] ring-1 ring-line sm:p-5 md:sticky md:top-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- the museum's image server already resizes it */}
          <img
            src={puzzle.imageUrl}
            alt={`Artle No. ${puzzle.number}: today's mystery artwork`}
            className="mx-auto max-h-[60vh] w-auto max-w-full object-contain"
          />
        </figure>

        <div className="flex flex-col gap-6">
          <Clues hints={puzzle.hints} revealed={answer ? puzzle.hints.length : wrongGuesses} />
          {answer ? (
            <Result puzzle={puzzle} guesses={guesses} answer={answer} />
          ) : (
            <CenturyPicker
              value={selected}
              onChange={setSelected}
              guesses={guesses}
              onSubmit={submitGuess}
              pending={pending}
              error={error}
            />
          )}
          <GuessList guesses={guesses} />
        </div>
      </div>

      <HowToPlay open={showHelp} onClose={closeHelp} />
    </>
  );
}

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function Clues({ hints, revealed }: { hints: Hint[]; revealed: number }) {
  if (hints.length === 0) return null;
  return (
    <section aria-labelledby="clues-heading">
      <h2 id="clues-heading" className="eyebrow">
        Clues
      </h2>
      <ul className="mt-2 divide-y divide-line border-y border-line">
        {hints.map((hint, i) => (
          <li key={hint.label} className="flex gap-3 py-2 text-sm">
            <span className="w-16 shrink-0 text-muted">{hint.label}</span>
            {i < revealed ? (
              <span>{hint.value}</span>
            ) : (
              <span className="text-muted italic">Revealed after guess {i + 1}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function GuessList({ guesses }: { guesses: GuessResult[] }) {
  return (
    <section aria-labelledby="guesses-heading">
      <h2 id="guesses-heading" className="eyebrow">
        Guesses
      </h2>
      <ol className="mt-2 flex flex-col gap-2">
        {Array.from({ length: MAX_GUESSES }, (_, i) => {
          const guess = guesses[i];
          if (!guess) {
            return (
              <li
                key={i}
                aria-label={`Guess ${i + 1}: not used yet`}
                className="h-11 rounded border border-dashed border-line"
              />
            );
          }
          return (
            <li
              key={i}
              className="flex h-11 items-center gap-3 rounded border border-line bg-surface px-3 text-sm"
            >
              <span aria-hidden className={`size-3 shrink-0 rounded-sm ${FEEDBACK_COLOR[guess.feedback]}`} />
              <span className="font-medium">{centuryLabel(guess.century)}</span>
              <span className="hidden text-muted sm:inline">{centuryYears(guess.century)}</span>
              <span className="ml-auto text-right">{feedbackText(guess)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function feedbackText({ feedback, direction }: GuessResult): string {
  if (feedback === "correct") return "Correct!";
  const hint = direction === "later" ? "Later →" : "← Earlier";
  return feedback === "close" ? `Close · ${hint}` : hint;
}
