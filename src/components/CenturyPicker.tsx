"use client";

import {
  MAX_CENTURY,
  MIN_CENTURY,
  centuryFromIndex,
  centuryIndex,
  centuryLabel,
  centuryYears,
} from "@/lib/century";
import type { GuessResult } from "@/lib/game";
import { MAX_GUESSES } from "@/lib/puzzle";
import { FEEDBACK_COLOR } from "./feedback";

const MIN_INDEX = centuryIndex(MIN_CENTURY);
const MAX_INDEX = centuryIndex(MAX_CENTURY);
// Matches the slider thumb width in globals.css.
const THUMB_PX = 22;

type Props = {
  value: number;
  onChange: (century: number) => void;
  guesses: GuessResult[];
  onSubmit: () => void;
  pending: boolean;
  error: string | null;
};

export default function CenturyPicker({ value, onChange, guesses, onSubmit, pending, error }: Props) {
  const index = centuryIndex(value);
  const alreadyGuessed = guesses.some((g) => g.century === value);
  const remaining = MAX_GUESSES - guesses.length;

  function step(delta: number) {
    const next = Math.min(MAX_INDEX, Math.max(MIN_INDEX, index + delta));
    onChange(centuryFromIndex(next));
  }

  return (
    <section
      aria-labelledby="picker-heading"
      className="rounded border border-line bg-surface p-4 sm:p-5"
    >
      <h2 id="picker-heading" className="eyebrow">
        Your guess
      </h2>
      <p className="mt-2 text-center font-serif text-3xl font-medium">{centuryLabel(value)}</p>
      <p className="text-center text-sm text-muted">{centuryYears(value)}</p>

      <div className="mt-3 flex items-center gap-2">
        <StepButton label="One century earlier" onClick={() => step(-1)} disabled={index <= MIN_INDEX}>
          −
        </StepButton>
        <div className="relative flex-1">
          {guesses.map((guess) => (
            <span
              key={guess.century}
              aria-hidden
              className={`pointer-events-none absolute top-1 size-2 -translate-x-1/2 rounded-full ${FEEDBACK_COLOR[guess.feedback]}`}
              style={{
                left: `calc(${THUMB_PX / 2}px + ${
                  (centuryIndex(guess.century) - MIN_INDEX) / (MAX_INDEX - MIN_INDEX)
                } * (100% - ${THUMB_PX}px))`,
              }}
            />
          ))}
          <input
            type="range"
            className="century-range block"
            min={MIN_INDEX}
            max={MAX_INDEX}
            step={1}
            value={index}
            onChange={(e) => onChange(centuryFromIndex(Number(e.target.value)))}
            aria-label="Century"
            aria-valuetext={`${centuryLabel(value)}, ${centuryYears(value)}`}
          />
        </div>
        <StepButton label="One century later" onClick={() => step(1)} disabled={index >= MAX_INDEX}>
          +
        </StepButton>
      </div>
      <div className="flex justify-between px-12 text-xs text-muted">
        <span>{centuryYears(MIN_CENTURY)}</span>
        <span>{centuryYears(MAX_CENTURY)}</span>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={pending || alreadyGuessed}
        className="mt-4 h-12 w-full rounded bg-foreground font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending
          ? "Checking…"
          : alreadyGuessed
            ? "Pick a different century"
            : `Guess (${remaining} ${remaining === 1 ? "try" : "tries"} left)`}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-accent">
          {error}
        </p>
      )}
    </section>
  );
}

function StepButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-xl hover:bg-background disabled:opacity-30"
    >
      {children}
    </button>
  );
}
