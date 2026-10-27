import Link from "next/link";
import NewRoundLink from "./NewRoundLink";

type Mode = "daily" | "unlimited";

/** The page frame shared by the daily puzzle and unlimited rounds. */
export default function Shell({ mode, children }: { mode: Mode; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">
      <header className="py-6 text-center sm:py-8">
        <h1 className="font-serif text-5xl font-semibold tracking-tight sm:text-6xl">Artle</h1>
        <p className="mt-2 text-muted">Guess the country an artwork was made in.</p>
        <nav
          aria-label="Game mode"
          className="mt-4 inline-flex rounded-full border border-line bg-surface p-1 text-sm"
        >
          <Link href="/" aria-current={mode === "daily" ? "page" : undefined} className={tab(mode === "daily")}>
            Daily
          </Link>
          <NewRoundLink
            aria-current={mode === "unlimited" ? "page" : undefined}
            className={tab(mode === "unlimited")}
          >
            Unlimited
          </NewRoundLink>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

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

function tab(active: boolean): string {
  return `rounded-full px-4 py-1.5 ${
    active ? "bg-foreground text-background" : "text-muted hover:text-foreground"
  }`;
}

export function GameSkeleton() {
  return (
    <div
      aria-label="Loading the artwork"
      className="grid animate-pulse gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
    >
      <div className="h-80 rounded-sm bg-surface ring-1 ring-line md:h-[32rem]" />
      <div className="h-80 rounded bg-surface ring-1 ring-line" />
    </div>
  );
}

export function Unavailable({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded border border-line bg-surface p-6 text-center">
      <h2 className="font-serif text-2xl">The gallery is closed</h2>
      <div className="mt-2 text-muted">{children}</div>
    </div>
  );
}
