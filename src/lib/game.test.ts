import { describe, expect, it } from "vitest";
import { currentStreak, recordResult, shareText, type GuessResult } from "./game";
import type { PublicPuzzle } from "./puzzle";

describe("recordResult", () => {
  it("counts wins and streaks", () => {
    let stats = recordResult(null, 1, true);
    stats = recordResult(stats, 2, true);
    expect(stats).toMatchObject({ played: 2, wins: 2, streak: 2, maxStreak: 2 });
  });

  it("resets the streak after a loss or a skipped day", () => {
    let stats = recordResult(null, 1, true);
    stats = recordResult(stats, 2, false);
    expect(stats).toMatchObject({ played: 2, wins: 1, streak: 0, maxStreak: 1 });

    stats = recordResult(stats, 3, true);
    stats = recordResult(stats, 5, true);
    expect(stats).toMatchObject({ streak: 1, maxStreak: 1 });
  });

  it("only counts each puzzle once", () => {
    const stats = recordResult(null, 1, true);
    expect(recordResult(stats, 1, true)).toBe(stats);
  });
});

describe("currentStreak", () => {
  it("is broken by a missed day", () => {
    const stats = recordResult(recordResult(null, 1, true), 2, true);
    expect(currentStreak(stats, 3)).toBe(2);
    expect(currentStreak(stats, 4)).toBe(0);
    expect(currentStreak(null, 4)).toBe(0);
  });
});

describe("shareText", () => {
  const daily: PublicPuzzle = {
    kind: "daily",
    id: "2026-10-22",
    number: 3,
    imageUrl: "",
    focus: { x: 50, y: 50 },
    clues: { date: null, medium: null },
  };
  const guesses: GuessResult[] = [
    { country: "BR", feedback: "far", distanceKm: 9000, direction: "NE" },
    { country: "DE", feedback: "close", distanceKm: 600, direction: "SW" },
    { country: "FR", feedback: "correct", distanceKm: 0, direction: null },
  ];

  it("summarizes a daily win without giving away the answer", () => {
    expect(shareText(daily, guesses, "https://artle.example")).toBe(
      "Artle #3 3/6\n⬜↗️ 🟨↙️ 🟩\nhttps://artle.example",
    );
  });

  it("marks a loss with an X", () => {
    const lost = Array.from({ length: 6 }, () => guesses[0]);
    expect(shareText(daily, lost, "u")).toBe("Artle #3 X/6\n⬜↗️ ⬜↗️ ⬜↗️ ⬜↗️ ⬜↗️ ⬜↗️\nu");
  });

  it("links to the same artwork for unlimited rounds", () => {
    const round: PublicPuzzle = { ...daily, kind: "round", id: "2bm", number: null };
    expect(shareText(round, guesses, "https://artle.example")).toBe(
      "Artle Unlimited 3/6\n⬜↗️ 🟨↙️ 🟩\nCan you guess where this was made? https://artle.example/unlimited/2bm",
    );
  });
});
