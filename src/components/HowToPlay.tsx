"use client";

import { useEffect, useRef } from "react";
import { MAX_GUESSES } from "@/lib/puzzle";

export default function HowToPlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="how-to-play-heading"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded bg-surface text-foreground shadow-2xl"
    >
      <div className="p-6">
        <h2 id="how-to-play-heading" className="font-serif text-3xl font-medium">
          How to play
        </h2>
        <ul className="mt-4 flex list-disc flex-col gap-3 pl-5 text-sm leading-relaxed">
          <li>
            Each day Artle shows one artwork from the Harvard Art Museums. Guess the century it was
            made in.
          </li>
          <li>
            You get {MAX_GUESSES} guesses. After each one you&apos;ll learn whether the artwork is
            earlier or later.
          </li>
          <li>
            <Swatch className="bg-correct" label="Green" /> is correct,{" "}
            <Swatch className="bg-close" label="Yellow" /> is one century off, and{" "}
            <Swatch className="bg-far" label="Gray" /> is further away.
          </li>
          <li>Every wrong guess reveals a clue, like the medium or the culture it came from.</li>
          <li>A new artwork appears every day at midnight Eastern Time.</li>
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-11 w-full rounded bg-foreground font-medium text-background hover:opacity-90"
        >
          Start playing
        </button>
      </div>
    </dialog>
  );
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <>
      <span aria-hidden className={`inline-block size-3 rounded-sm align-middle ${className}`} />
      <span className="sr-only">{label}</span>
    </>
  );
}
