import { connection } from "next/server";
import { Suspense } from "react";
import Game from "@/components/Game";
import Shell, { GameSkeleton, Unavailable } from "@/components/Shell";
import { puzzleDate } from "@/lib/dates";
import { getDailyPuzzle } from "@/lib/harvard";
import { toPublicPuzzle, type PublicPuzzle } from "@/lib/puzzle";

export default function Home() {
  return (
    <Shell mode="daily">
      <Suspense fallback={<GameSkeleton />}>
        <TodaysGame />
      </Suspense>
    </Shell>
  );
}

async function TodaysGame() {
  // The puzzle depends on today's date, so render it per request.
  await connection();

  let puzzle: PublicPuzzle | null = null;
  try {
    puzzle = toPublicPuzzle(await getDailyPuzzle(puzzleDate(new Date())));
  } catch (error) {
    console.error(error);
  }

  if (!puzzle) {
    return (
      <Unavailable>
        Today&apos;s artwork couldn&apos;t be loaded. Please try again in a few minutes.
      </Unavailable>
    );
  }
  return <Game puzzle={puzzle} />;
}
