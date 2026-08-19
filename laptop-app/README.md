# Laptop Sales Tracker

A Next.js app for tracking laptop inventory, prep status, eBay listings, and AI-assisted pricing. It runs in a browser, or as a desktop app via Electron.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Actions)
- **Prisma 7 + SQLite** (`better-sqlite3` driver adapter) for the database
- **Tailwind CSS v4** for the "Megacorp" theme — greyish blue on black, corporate terminal
- **Anthropic API** (Claude, with the web search tool) powers the Pricing page's AI agent
- **eBay Trading API + OAuth** powers the eBay Listings page
- **Electron + electron-builder** wrap the whole thing as a desktop app

## Getting started

Requires **Node 22 LTS**. Node 24 has no prebuilt `better-sqlite3` binary, so
`npm install` tries to compile it and fails looking for Python.

```bash
npm install
npm run dev
```

`npm run dev` generates the Prisma client and applies any pending migrations
before starting, so there is no separate setup step — `dev.db` is created on
first run. Use `npx prisma migrate dev` only when you change the schema and
need a new migration authored.

Open [http://localhost:3000](http://localhost:3000).

No `.env` is needed — the database defaults to `dev.db` in this directory. Set
`DATABASE_URL` only if you want it somewhere else.

The Prisma client is generated into `app/generated/prisma`, which is gitignored.
`npm install`, `npm run dev` and `npm run build` all run `prisma generate` for
you, so a fresh clone needs no extra step; run `npx prisma generate` by hand
only if you ever need to force it.

## Desktop app

The app is a server app — Server Actions, server-side Prisma — so there is no
static bundle to point a window at. The Electron main process
(`electron/main.js`) starts the Next.js production server on localhost and loads
it in a `BrowserWindow`. From the user's side it is an app; underneath it is the
same code the browser version runs.

```bash
npm run desktop:dev     # against `next dev`, reloads on save
npm run desktop:build   # build the server bundle
npm run desktop         # run the built app, unpackaged
npm run desktop:dist    # build + package installers into dist-desktop/
```

`desktop:dist` produces a `.dmg` and `.zip` on macOS, an NSIS installer and a
portable `.exe` on Windows, and an AppImage on Linux — whichever platform you
run it on. **It can only build for the platform you run it on**: the app depends
on `better-sqlite3`, which is compiled C, and compiled C does not
cross-compile here.

### Where your data lives

In the OS's per-app data directory, not next to the app:

| | |
|---|---|
| macOS | `~/Library/Application Support/Laptop Sales Tracker/laptops.db` |
| Windows | `%APPDATA%\Laptop Sales Tracker\laptops.db` |
| Linux | `~/.config/Laptop Sales Tracker/laptops.db` |

On macOS the app bundle is read-only and on Windows the installer overwrites its
own directory, so a database kept beside the app would be unwritable in one case
and erased on update in the other. This location survives both. It is also
separate from the `dev.db` the browser version uses, so experimenting with
`npm run dev` cannot touch your real stock.

Migrations run automatically each time the app starts, so updating the app
updates the database. There is no Prisma CLI in the package to do that —
`electron/migrate.js` applies `prisma/migrations/*/migration.sql` directly,
recording them in the same `_prisma_migrations` table with the same checksums
the CLI would write. A database it has migrated is one `prisma migrate status`
still accepts.

### The port

The server binds `127.0.0.1:41827`, and only walks upwards if that is taken. A
fixed port is what lets eBay's OAuth redirect URI stay the same between
launches; an ephemeral one would need re-registering every time. Nothing outside
the machine can reach it.

### Native modules and ABI

`better-sqlite3` has to be compiled against the runtime that loads it, and the
packaged app loads it in Electron, whose ABI is not the system Node's. Rather
than switch your `node_modules` over — which would silently break `npm run dev`
until the next `npm install` — `scripts/build-desktop.mjs` rebuilds it for
Electron, copies just that one binary into the bundle, and rebuilds it for Node
again on the way out. If you ever do end up with `NODE_MODULE_VERSION` errors,
`npm rebuild better-sqlite3` puts things back.

### Packaging layout

The asar holds only `electron/main.js` — it needs nothing but Electron and Node
built-ins. Everything else ships as `resources/next`: the Next.js standalone
bundle, which carries only the dependencies the app actually reached for (~31MB
rather than the ~700MB install tree). The build script prunes `sharp` from it,
which Next traces in for `next/image` and this app never uses, and strips the
`.env` files Next copies in, which have no business in something you hand to
someone else.

The app icon is `build/icon.png`, an original mark drawn in the Megacorp
palette — a heavy symmetrical emblem, seams cut back to the background, framed
by the same corner brackets the panels use. `build/icon.svg` is the source it
was rendered from; re-render at 1024px and overwrite the PNG to change it.

## Pages

- **Launch** (`/`) — a bento grid: Profit is a static 2×2 anchor that leads nowhere, Stock is a wide tile, Pricing and eBay are small, and Analytics runs the full width. Every tile except Profit links to its page.
- **Stock** (`/stock`) — in-stock / sold laptop lists with a Reset → Cleaned → Prepared → Listed status checklist per laptop. Every laptop carries a short reference code (`LT-4F2A`) shown beside its name, which is what tells two otherwise-identical machines apart.
- **Stock → Add / Edit** — the spec form branches on Apple vs. Windows. With **Apple** selected, entering the model number (A-number) looks it up in `app/lib/appleModels.ts` and turns Processor, GPU cores, RAM, Storage, Colour and Charger Wattage into dropdowns limited to the configurations Apple shipped for that model — picking a different chip narrows the rest (an A2442 offers M1 Pro 8c/10c and M1 Max 10c; choosing M1 Max switches GPU cores to 24/32 and RAM to 32/64GB). An unrecognised A-number falls back to free-text fields. Windows gets Manufacturer + Resolution; both share Year/Cycle Count/Serial Number/Condition/Charger/Source/Notes/Pricing.
- **Listing copy** — each laptop's page generates an eBay title and description from its details, each with a copy button:
  - Title: `MacBook Pro 14" M1 Max 64GB 1TB Space Grey 10c CPU 32c GPU A2442`
  - Description: `A2442 MacBook Pro M1 Max w/ 96W Charger.` then `Cycle count: 112, Excellent condition`
- **Pricing** (`/pricing`) — lists laptops in the "Prepared" stage; "Run AI Price Check" calls Claude with the web search tool to find comparable eBay sold listings and stores the result.
- **Analytics** (`/analytics`) — revenue/profit, sell-through, and "what sells better" breakdowns by brand and processor.
- **eBay Listings** (`/ebay`) — your live active eBay listings, once eBay is connected.
- **Settings** (`/settings`) — Anthropic API key, and eBay App ID / Cert ID / Dev ID / RuName + environment.

## Theme

"Megacorp" — a greyish-blue-on-black corporate terminal look, defined entirely in `app/globals.css`. Every colour is a `--color-corp-*` token in one `:root` block, so re-theming means editing that block and nothing else:

- **Chrome**: a fixed noise/flicker overlay, a scanline that sweeps the viewport, and a hazard stripe under the nav.
- **Idle glitch**: page headings and the wordmark slice apart and throw cyan/red ghost copies on their own clocks (7.3s / 9.1s / 11.7s) so they never fire in sync. Driven by `<GlitchText>`, which feeds the ghosts through `data-text`.
- **Hover glitch**: each tile carries one of five burst signatures (`corp-sig-a` … `corp-sig-e`) that fires on hover-in. Underneath, three sustained layers — ghost drift, a tear band, and a brightness hum — run on free-running, co-prime clocks and are only *revealed* on hover, never restarted. That's why no two hovers land on the same frame.
- **Motion off**: everything is disabled under `prefers-reduced-motion: reduce`.
- **Semantic colour**: the accent is deliberately non-semantic, so profit figures carry the only non-blue hues in the app — `--color-corp-pos` (cool teal) for a gain, `--color-corp-neg` (muted rose) for a loss.

## Reference codes

Each laptop gets a permanent code like `LT-4F2A` on creation — short enough for a sticker, unambiguous to read back. The alphabet (`app/lib/refCode.ts`) is Crockford-style base32 with the transcription traps removed: no `0`/`O`, no `1`/`I`/`L`, no `U`. Four places over 31 symbols is ~923,000 codes.

Uniqueness is enforced by a unique index, and creation retries on a constraint violation rather than checking first, which would leave a race between the check and the insert. Codes are never reused, unlike the recycled 2-digit codes in the original Electron tracker.

`normaliseRefCode()` accepts what someone would actually type — `lt-4f2a`, `4F2A`, `LT4F2A` — and returns the canonical form.

## MacBook reference data

`app/lib/appleModels.ts` holds every MacBook Air and Pro sold from 2019 onward, keyed by A-number, with the chips, CPU/GPU core bins, RAM and storage options, colours and charger wattages Apple shipped for each. Apple's own site is not reachable from the build environment, so the figures were assembled from Apple's published specs cross-checked against spec databases — the RAM/storage ceilings and charger wattages on the newest models are the most likely to need a correction. Editing that one file is all it takes to fix or extend a model; nothing else hard-codes these values.

## Configuring the AI pricing agent

Add an Anthropic API key on the Settings page. No key = the Pricing page shows a "not configured" notice instead of a broken button.

## Configuring eBay

1. Create an app in the [eBay Developer Program](https://developer.ebay.com/) and note its **App ID (Client ID)** and **Cert ID (Client Secret)**.
2. Register a redirect ("RuName") pointing at `<your-app-url>/api/ebay/callback`.
3. Enter the App ID, Cert ID, optional Dev ID, and RuName on the Settings page, and pick Sandbox or Production.
4. Go to the **eBay Listings** page and click **Connect eBay Account** to run the OAuth flow.

The eBay integration (`app/lib/ebay.ts`) is written against eBay's documented OAuth and Trading API (`GetMyeBaySelling`) shapes but hasn't been exercised against a live eBay account — double check endpoints/scopes against eBay's current docs if something doesn't line up.

## Database

SQLite via Prisma. In the browser version it is `dev.db` in this directory
(gitignored); the desktop app uses the per-user location above. Schema lives in
`prisma/schema.prisma`; run `npx prisma migrate dev` after changing it. `npx
prisma studio` is a handy way to browse the data directly — point `DATABASE_URL`
at the desktop database to browse that one.
