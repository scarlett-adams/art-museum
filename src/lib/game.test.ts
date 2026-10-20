import { describe, expect, it } from "vitest";
import { currentStreak, recordResult, shareText } from "./game";

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
  it("summarizes a win without giving away the answer", () => {
    expect(
      shareText(
        3,
        [
          { country: "BR", feedback: "far", distanceKm: 9000, direction: "NE" },
          { country: "DE", feedback: "close", distanceKm: 600, direction: "SW" },
          { country: "FR", feedback: "correct", distanceKm: 0, direction: null },
        ],
        "https://artle.example",
      ),
    ).toBe("Artle #3 3/6\n⬜↗️ 🟨↙️ 🟩\nhttps://artle.example");
  });

  it("marks a loss with an X", () => {
    const guesses = Array.from({ length: 6 }, () => ({
      country: "BR",
      feedback: "far" as const,
      distanceKm: 9000,
      direction: "E" as const,
    }));
    expect(shareText(3, guesses, "u")).toBe("Artle #3 X/6\n⬜➡️ ⬜➡️ ⬜➡️ ⬜➡️ ⬜➡️ ⬜➡️\nu");
  });
});
