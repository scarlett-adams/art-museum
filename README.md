# Artle

A daily art guessing game. Each day Artle shows one artwork from the
[Harvard Art Museums](https://harvardartmuseums.org) collection, and you get
five tries to guess the century it was made in. After each guess you learn
whether to go earlier or later, and each wrong guess reveals a clue.

Built with Next.js and the [Harvard Art Museums API](https://github.com/harvardartmuseums/api-docs).

## How it works

- **Picking the artwork.** The server asks the API for 100 random artworks,
  seeded with the date (`sort=random:20261020`), so everyone gets the same
  artwork on the same day. Artworks without an image or a date that falls in
  a single century are skipped. A century is then picked evenly from those
  in the sample, since a purely random pick would almost always land on a
  19th- or 20th-century print. See `src/lib/puzzle.ts`.
- **Keeping the key and the answer secret.** The API key is only read on
  the server (`src/lib/harvard.ts`). The browser gets the image and the clues,
  but not the answer: guesses are checked by `src/app/api/guess/route.ts`,
  which only reveals the artwork once the game is over.
- **Staying under the rate limit.** API keys allow 2,500 requests a day.
  Each day's puzzle is cached with `"use cache: remote"`, so the API is called
  about once a day however many people play.
- **Saving progress.** Your current game and stats (streak, win rate) are
  kept in your browser's `localStorage`.

A new puzzle starts every day at midnight Eastern Time.

## Running it locally

1. Request a free API key at <https://harvardartmuseums.org/collections/api>.
2. Copy `.env.example` to `.env.local` and paste your key after `HARVARD_API_KEY=`.
   `.env.local` is ignored by git, so the key won't be committed.
3. Install and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

4. Open <http://localhost:3000>.

Other commands:

```bash
npm test        # unit tests for the game logic
npm run lint
npm run build   # production build
```

## Deploying to Vercel

1. Sign in at <https://vercel.com> with your GitHub account.
2. Choose **Add New… → Project** and import this repository. Vercel detects
   Next.js automatically, so the default build settings are fine.
3. Under **Environment Variables**, add `HARVARD_API_KEY` with your key as the
   value. Don't prefix it with `NEXT_PUBLIC_`: that would expose it to every
   visitor's browser.
4. Click **Deploy**.

After that, every push to the production branch redeploys the site, and every
other branch gets its own preview URL. If you add or change an environment
variable later, redeploy (**Deployments → ⋯ → Redeploy**) for it to take
effect.

If the site shows "The gallery is closed", today's artwork couldn't be
loaded. The reason will be in the project's **Logs** tab on Vercel.

## Project layout

```
src/
  app/
    page.tsx              the page; loads today's puzzle on the server
    api/guess/route.ts    checks a guess and reveals the answer at the end
  components/             the game UI (client components)
  lib/
    harvard.ts            Harvard Art Museums API client (server only)
    puzzle.ts             picks the day's artwork and builds the clues
    century.ts            century math and labels
    dates.ts              puzzle dates and numbering (Eastern Time)
    game.ts               saved games, stats and the share text
```

Artle is a fan project and isn't affiliated with the Harvard Art Museums.
