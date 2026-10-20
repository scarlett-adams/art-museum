"use client";

import { useState, useSyncExternalStore } from "react";
import { centuryLabel, centuryYears } from "@/lib/century";
import { puzzleEndsAt } from "@/lib/dates";
import { STATS_KEY, currentStreak, shareText, type GuessResult, type Stats } from "@/lib/game";
import { MAX_GUESSES, type Answer, type PublicPuzzle } from "@/lib/puzzle";
import { useStored } from "@/lib/storage";

type Props = {
  puzzle: PublicPuzzle;
  guesses: GuessResult[];
  answer: Answer;
};

export default function Result({ puzzle, guesses, answer }: Props) {
  const stats = useStored<Stats>(STATS_KEY);
  const [shareStatus, setShareStatus] = useState<"copied" | "failed" | null>(null);
  const won = guesses.at(-1)?.feedback === "correct";

  async function share() {
    try {
      await navigator.clipboard.writeText(
        shareText(puzzle.number, guesses, window.location.origin),
      );
      setShareStatus("copied");
    } catch {
      setShareStatus("failed");
    }
    setTimeout(() => setShareStatus(null), 2500);
  }

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
        {centuryLabel(answer.century)}
      </h2>
      <p className="text-sm text-muted">{centuryYears(answer.century)}</p>

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

      <dl className="mt-4 grid grid-cols-4 border-t border-line pt-4 text-center">
        <Stat label="Played" value={stats?.played ?? 0} />
        <Stat
          label="Win %"
          value={stats?.played ? Math.round((stats.wins / stats.played) * 100) : 0}
        />
        <Stat label="Streak" value={currentStreak(stats, puzzle.number)} />
        <Stat label="Best" value={stats?.maxStreak ?? 0} />
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={share}
          className="h-11 rounded bg-foreground px-5 font-medium text-background hover:opacity-90"
        >
          {shareStatus === "copied"
            ? "Copied to clipboard"
            : shareStatus === "failed"
              ? "Couldn't copy"
              : "Share result"}
        </button>
        <Countdown endsAt={puzzleEndsAt(puzzle.date).getTime()} />
      </div>
    </section>
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
