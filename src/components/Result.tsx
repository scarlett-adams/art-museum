"use client";

import { useSyncExternalStore } from "react";
import { countryByCode, flag } from "@/lib/countries";
import { puzzleEndsAt } from "@/lib/dates";
import { STATS_KEY, currentStreak, shareText, type GuessResult, type Stats } from "@/lib/game";
import { MAX_GUESSES, type Answer, type PublicPuzzle } from "@/lib/puzzle";
import { useStored } from "@/lib/storage";
import NewRoundLink from "./NewRoundLink";
import { useCopy } from "./useCopy";

type Props = {
  puzzle: PublicPuzzle;
  guesses: GuessResult[];
  answer: Answer;
};

export default function Result({ puzzle, guesses, answer }: Props) {
  const [shareStatus, copy] = useCopy();
  const won = guesses.at(-1)?.feedback === "correct";
  const country = countryByCode(answer.country)?.name ?? answer.country;

  const details = [
    ["Artist", answer.artist],
    ["Date", answer.dated],
    ["Culture", answer.culture],
  ].filter((detail): detail is [string, string] => Boolean(detail[1]));

  return (
    <section aria-labelledby="result-heading" className="rounded border border-line bg-surface p-4 sm:p-5">
      <p className="eyebrow">
        {won ? `Solved in ${guesses.length} of ${MAX_GUESSES}` : "Out of guesses"}
      </p>
      <h2 id="result-heading" className="mt-2 font-serif text-3xl font-medium">
        <span aria-hidden>{flag(answer.country)} </span>
        {country}
      </h2>
      {answer.place !== country && <p className="text-sm text-muted">Made in {answer.place}</p>}

      <div className="mt-4 border-t border-line pt-4">
        <p className="font-serif text-xl italic">{answer.title}</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          {details.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {answer.url && (
          <a
            href={answer.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-accent underline underline-offset-2"
          >
            See it at the Harvard Art Museums ↗
          </a>
        )}
      </div>

      {puzzle.kind === "daily" && <DailyStats puzzle={puzzle.number!} />}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => copy(shareText(puzzle, guesses, window.location.origin))}
          className={puzzle.kind === "daily" ? PRIMARY : SECONDARY}
        >
          {shareStatus === "copied"
            ? "Copied to clipboard"
            : shareStatus === "failed"
              ? "Couldn't copy"
              : puzzle.kind === "daily"
                ? "Share result"
                : "Challenge a friend"}
        </button>
        {puzzle.kind === "daily" ? (
          <div className="ml-auto">
            <Countdown endsAt={puzzleEndsAt(puzzle.id).getTime()} />
          </div>
        ) : (
          <NewRoundLink className={`${PRIMARY} ml-auto`}>Next artwork →</NewRoundLink>
        )}
      </div>
      {puzzle.kind === "daily" && (
        <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
          Want more?{" "}
          <NewRoundLink className="text-accent underline underline-offset-2">
            Play unlimited rounds →
          </NewRoundLink>
        </p>
      )}
    </section>
  );
}

const PRIMARY =
  "inline-flex h-11 items-center rounded bg-foreground px-5 font-medium text-background hover:opacity-90";
const SECONDARY =
  "inline-flex h-11 items-center rounded border border-line px-5 font-medium hover:bg-background";

function DailyStats({ puzzle }: { puzzle: number }) {
  const stats = useStored<Stats>(STATS_KEY);
  return (
    <dl className="mt-4 grid grid-cols-4 border-t border-line pt-4 text-center">
      <Stat label="Played" value={stats?.played ?? 0} />
      <Stat
        label="Win %"
        value={stats?.played ? Math.round((stats.wins / stats.played) * 100) : 0}
      />
      <Stat label="Streak" value={currentStreak(stats, puzzle)} />
      <Stat label="Best" value={stats?.maxStreak ?? 0} />
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-serif text-2xl">{value}</dd>
    </div>
  );
}

function subscribeToClock(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

function Countdown({ endsAt }: { endsAt: number }) {
  const now = useSyncExternalStore(
    subscribeToClock,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => null,
  );
  if (now === null) return null;

  const seconds = Math.max(0, Math.ceil((endsAt - now) / 1000));
  if (seconds === 0) {
    return (
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="text-sm text-accent underline underline-offset-2"
      >
        A new Artle is ready
      </button>
    );
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <p className="text-sm text-muted">
      Next Artle in{" "}
      <span className="font-medium text-foreground tabular-nums">
        {pad(Math.floor(seconds / 3600))}:{pad(Math.floor((seconds % 3600) / 60))}:
        {pad(seconds % 60)}
      </span>
    </p>
  );
}
