"use client";

import { useEffect, useRef } from "react";
import { CLOSE_KM } from "@/lib/geo";
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
            Each day Artle shows one artwork from the Harvard Art Museums. Guess the country it was
            made in.
          </li>
          <li>
            You get {MAX_GUESSES} guesses. After each one you&apos;ll see how far away the right
            country is and which direction to go, like &ldquo;1,200 km ↗ NE&rdquo;.
          </li>
          <li>
            <Swatch className="bg-correct" label="Green" /> is correct,{" "}
            <Swatch className="bg-close" label="Yellow" /> is within{" "}
            {CLOSE_KM.toLocaleString("en-US")} km, and <Swatch className="bg-far" label="Gray" /> is
            further away.
          </li>
          <li>
            The artwork starts zoomed in and in black and white. Each wrong guess reveals more: it
            zooms out, then shows the color, then the date and the medium.
          </li>
          <li>Countries use today&apos;s borders. Distances are measured between their centers.</li>
          <li>
            A new daily artwork appears at midnight Eastern Time. Want more? Play unlimited rounds,
            and send a friend the link to try the same artwork.
          </li>
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
