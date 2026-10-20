import { connection } from "next/server";
import { Suspense } from "react";
import Game from "@/components/Game";
import { puzzleDate } from "@/lib/dates";
import { getPuzzle } from "@/lib/harvard";
import { toPublicPuzzle, type PublicPuzzle } from "@/lib/puzzle";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">
      <header className="py-6 text-center sm:py-8">
        <h1 className="font-serif text-5xl font-semibold tracking-tight sm:text-6xl">
          Artle
        </h1>
        <p className="mt-2 text-muted">One artwork a day. Guess the country it was made in.</p>
      </header>

      <main className="flex-1">
        <Suspense fallback={<GameSkeleton />}>
          <TodaysGame />
        </Suspense>
      </main>

      <footer className="mt-12 border-t border-line py-6 text-center text-xs text-muted">
        Artworks and data from the{" "}
        <a
          className="underline underline-offset-2 hover:text-foreground"
          href="https://harvardartmuseums.org/collections/api"
        >
          Harvard Art Museums API
        </a>
        . Artle is a fan project and isn&apos;t affiliated with the Harvard Art Museums.
      </footer>
    </div>
  );
}

async function TodaysGame() {
  // The puzzle depends on today's date, so render it per request.
  await connection();

  let puzzle: PublicPuzzle | null = null;
  try {
    puzzle = toPublicPuzzle(await getPuzzle(puzzleDate(new Date())));
  } catch (error) {
    console.error(error);
  }

  if (!puzzle) {
    return (
      <div className="mx-auto max-w-md rounded border border-line bg-surface p-6 text-center">
        <h2 className="font-serif text-2xl">The gallery is closed</h2>
        <p className="mt-2 text-muted">
          Today&apos;s artwork couldn&apos;t be loaded. Please try again in a few minutes.
        </p>
      </div>
    );
  }
  return <Game puzzle={puzzle} />;
}

function GameSkeleton() {
  return (
    <div
      aria-label="Loading today's artwork"
      className="grid animate-pulse gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
    >
      <div className="h-80 rounded-sm bg-surface ring-1 ring-line md:h-[32rem]" />
      <div className="h-80 rounded bg-surface ring-1 ring-line" />
    </div>
  );
}
