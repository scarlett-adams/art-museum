"use client";

import { useId, useMemo, useState } from "react";
import { findCountry, flag, searchCountries, type Country } from "@/lib/countries";
import type { GuessResult } from "@/lib/game";
import { MAX_GUESSES } from "@/lib/puzzle";

type Props = {
  guesses: GuessResult[];
  /** Resolves to whether the guess went through. */
  onSubmit: (code: string) => Promise<boolean>;
  pending: boolean;
  error: string | null;
};

/** A text box that suggests countries as you type. */
export default function CountryPicker({ guesses, onSubmit, pending, error }: Props) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const guessed = new Set(guesses.map((g) => g.country));
    return searchCountries(query).filter((c) => !guessed.has(c.code));
  }, [query, guesses]);
  const chosen = findCountry(query);
  const alreadyGuessed = chosen !== undefined && guesses.some((g) => g.country === chosen.code);
  const remaining = MAX_GUESSES - guesses.length;
  // No need for suggestions once a country has been typed out in full.
  const showList = open && matches.length > 0 && !(matches.length === 1 && matches[0] === chosen);

  function choose(country: Country) {
    setQuery(country.name);
    setOpen(false);
  }

  async function submit() {
    if (!chosen || alreadyGuessed || pending) return;
    if (await onSubmit(chosen.code)) setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showList) choose(matches[Math.min(active, matches.length - 1)]);
      else submit();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <section className="rounded border border-line bg-surface p-4 sm:p-5">
      <label htmlFor={`${id}-input`} className="eyebrow">
        Your guess
      </label>
      <div className="relative mt-2">
        <input
          id={`${id}-input`}
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${id}-option-${active}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          placeholder="Type a country…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="h-12 w-full rounded border border-line bg-background px-3 text-base outline-none placeholder:text-muted focus:border-foreground"
        />
        {showList && (
          <ul
            id={`${id}-list`}
            role="listbox"
            className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded border border-line bg-surface py-1 shadow-lg"
          >
            {matches.map((country, i) => (
              <li
                key={country.code}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(country)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 ${
                  i === active ? "bg-background" : ""
                }`}
              >
                <span aria-hidden>{flag(country.code)}</span>
                {country.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!chosen || alreadyGuessed || pending}
        className="mt-3 h-12 w-full rounded bg-foreground font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending
          ? "Checking…"
          : alreadyGuessed
            ? `You already guessed ${chosen.name}`
            : chosen
              ? `Guess ${chosen.name}`
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
