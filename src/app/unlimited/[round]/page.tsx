import type { Metadata } from "next";
import { Suspense } from "react";
import Game from "@/components/Game";
import NewRoundLink from "@/components/NewRoundLink";
import Shell, { GameSkeleton, Unavailable } from "@/components/Shell";
import { getRound } from "@/lib/harvard";
import { toPublicPuzzle, type PublicPuzzle } from "@/lib/puzzle";

export const metadata: Metadata = {
  title: "Artle Unlimited: where was this artwork made?",
};

export default function RoundPage({ params }: PageProps<"/unlimited/[round]">) {
  return (
    <Shell mode="unlimited">
      <Suspense fallback={<GameSkeleton />}>
        <RoundGame params={params} />
      </Suspense>
    </Shell>
  );
}

async function RoundGame({ params }: { params: Promise<{ round: string }> }) {
  const { round } = await params;

  let puzzle: PublicPuzzle | null = null;
  try {
    const found = await getRound(round);
    if (found) puzzle = toPublicPuzzle(found);
  } catch (error) {
    console.error(error);
  }

  if (!puzzle) {
    return (
      <Unavailable>
        This artwork couldn&apos;t be loaded.{" "}
        <NewRoundLink className="text-accent underline underline-offset-2">
          Try another one
        </NewRoundLink>
        .
      </Unavailable>
    );
  }
  return <Game puzzle={puzzle} />;
}
