"use client";

import { useState, useSyncExternalStore } from "react";
import { countryByCode, flag } from "@/lib/countries";
import {
  GAME_KEYS,
  HELP_KEY,
  STATS_KEY,
  recordResult,
  roundUrl,
  type GuessResult,
  type SavedGame,
  type Stats,
} from "@/lib/game";
import { ARROWS, COMPASS_NAMES, type Comparison } from "@/lib/geo";
import { MAX_GUESSES, type Answer, type Clues, type PublicPuzzle } from "@/lib/puzzle";
import { readStored, useStored, writeStored } from "@/lib/storage";
import CountryPicker from "./CountryPicker";
import { FEEDBACK_COLOR } from "./feedback";
import HowToPlay from "./HowToPlay";
import Result from "./Result";
import { useCopy } from "./useCopy";

const subscribeNothing = () => () => {};

// The artwork starts zoomed in and in black and white. Wrong guesses zoom
// out, then add color, then reveal the date and the medium.
const ZOOMS = [3, 1.8];
const COLOR_AFTER = 3;
const CLUE_COUNT = MAX_GUESSES - 1;

export default function Game({ puzzle }: { puzzle: PublicPuzzle }) {
  const saved = useStored<SavedGame>(GAME_KEYS[puzzle.kind]);
  const seenHelp = useStored<boolean>(HELP_KEY);
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [linkStatus, copyLink] = useCopy();

  const game: SavedGame = saved?.id === puzzle.id ? saved : { id: puzzle.id, guesses: [] };
  const { guesses, answer } = game;
  // Each wrong guess reveals another clue, and everything shows at the end.
  const revealed = answer ? CLUE_COUNT : guesses.filter((g) => g.feedback !== "correct").length;
  const showHelp = helpOpen || (hydrated && !seenHelp && guesses.length === 0);

  function closeHelp() {
    setHelpOpen(false);
    writeStored(HELP_KEY, true);
  }

  async function submitGuess(country: string): Promise<boolean> {
    if (pending || answer) return false;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: puzzle.kind,
          id: puzzle.id,
          guess: country,
          attempt: guesses.length + 1,
        }),
      });
      if (!response.ok) throw new Error(`Guess failed with ${response.status}`);
      const { answer: revealedAnswer, ...result } = (await response.json()) as Comparison & {
        answer?: Answer;
      };

      writeStored(GAME_KEYS[puzzle.kind], {
        id: puzzle.id,
        guesses: [...guesses, { ...result, country }],
        answer: revealedAnswer,
      } satisfies SavedGame);
      if (revealedAnswer && puzzle.kind === "daily") {
        const won = result.feedback === "correct";
        writeStored(STATS_KEY, recordResult(readStored<Stats>(STATS_KEY), puzzle.number!, won));
      }
      return true;
    } catch {
      setError("Couldn't check that guess. Please try again.");
      return false;
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-2 border-y border-line py-2 text-sm text-muted">
        <span>
          {puzzle.kind === "daily"
            ? `No. ${puzzle.number} · ${formatDate(puzzle.id)}`
            : "Unlimited round"}
        </span>
        <div className="flex items-center">
          {puzzle.kind === "round" && (
            <button
              type="button"
              onClick={() => copyLink(roundUrl(puzzle, window.location.origin))}
              className="rounded px-2 py-1 hover:bg-surface hover:text-foreground"
            >
              {linkStatus === "copied"
                ? "Link copied"
                : linkStatus === "failed"
                  ? "Couldn't copy"
                  : "Share artwork"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="rounded px-2 py-1 hover:bg-surface hover:text-foreground"
          >
            How to play
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start">
        <Artwork puzzle={puzzle} revealed={revealed} />

        <div className="flex flex-col gap-6">
          <ClueList clues={puzzle.clues} revealed={revealed} />
          {answer ? (
            <Result puzzle={puzzle} guesses={guesses} answer={answer} />
          ) : (
            <CountryPicker
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

function Artwork({ puzzle, revealed }: { puzzle: PublicPuzzle; revealed: number }) {
  const zoom = ZOOMS[revealed] ?? 1;
  const gray = revealed < COLOR_AFTER;
  const caption =
    zoom > 1 && gray ? "Zoomed in, in black and white" : gray ? "In black and white" : null;

  return (
    <figure className="rounded-sm bg-surface p-3 shadow-[0_1px_2px_rgb(0_0_0/0.06),0_12px_32px_rgb(0_0_0/0.08)] ring-1 ring-line sm:p-5 md:sticky md:top-6">
      <div className="mx-auto w-fit max-w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- the museum's image server already resizes it */}
        <img
          src={puzzle.imageUrl}
          alt={
            puzzle.kind === "daily"
              ? `Artle No. ${puzzle.number}: today's mystery artwork`
              : "The mystery artwork"
          }
          className="block max-h-[60vh] w-auto max-w-full transition-[transform,filter] duration-700 ease-out"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: `${puzzle.focus.x}% ${puzzle.focus.y}%`,
            filter: gray ? "grayscale(1)" : undefined,
          }}
        />
      </div>
      {caption && <figcaption className="mt-3 text-center text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}

function ClueList({ clues, revealed }: { clues: Clues; revealed: number }) {
  // The image clues have no text: they show up in the picture itself.
  const rows: [label: string, value: string | null][] = [
    ["Zoom out", null],
    ["Whole artwork", null],
    ["Color", null],
    ["Date", clues.date ?? "Not recorded"],
    ["Medium", clues.medium ?? "Not recorded"],
  ];
  return (
    <section aria-labelledby="clues-heading">
      <h2 id="clues-heading" className="eyebrow">
        Clues
      </h2>
      <ul className="mt-2 divide-y divide-line border-y border-line">
        {rows.map(([label, value], i) => (
          <li key={label} className="flex gap-3 py-2 text-sm">
            <span className="w-28 shrink-0 text-muted">{label}</span>
            {i >= revealed ? (
              <span className="text-muted italic">After guess {i + 1}</span>
            ) : value ? (
              <span>{value}</span>
            ) : (
              <span className="text-correct">
                ✓<span className="sr-only">Shown</span>
              </span>
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
              className="flex h-11 items-center gap-2 rounded border border-line bg-surface px-3 text-sm"
            >
              <span aria-hidden className={`size-3 shrink-0 rounded-sm ${FEEDBACK_COLOR[guess.feedback]}`} />
              <span aria-hidden className="shrink-0">{flag(guess.country)}</span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {countryByCode(guess.country)?.name ?? guess.country}
              </span>
              {guess.direction ? (
                <>
                  <span className="shrink-0 tabular-nums">
                    {guess.distanceKm.toLocaleString("en-US")} km
                  </span>
                  <span className="w-11 shrink-0 text-right">
                    <span aria-hidden>
                      {ARROWS[guess.direction]} {guess.direction}
                    </span>
                    <span className="sr-only">away, to the {COMPASS_NAMES[guess.direction]}</span>
                  </span>
                </>
              ) : (
                <span className="shrink-0 font-medium text-correct">Correct!</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
