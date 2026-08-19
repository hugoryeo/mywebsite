# Laptop Sales Tracker

A Next.js app for tracking laptop inventory, prep status, eBay listings, and AI-assisted pricing.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Actions)
- **Prisma 7 + SQLite** (`better-sqlite3` driver adapter) for the database
- **Tailwind CSS v4** for the "Megacorp" theme — red-on-black corporate terminal
- **Anthropic API** (Claude, with the web search tool) powers the Pricing page's AI agent
- **eBay Trading API + OAuth** powers the eBay Listings page

## Getting started

```bash
npm install
npx prisma migrate dev   # creates dev.db and applies the schema
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

- **Launch** (`/`) — a bento grid: Profit is a static 2×2 anchor that leads nowhere, Stock is a wide tile, Pricing and eBay are small, and Analytics runs the full width. Every tile except Profit links to its page.
- **Stock** (`/stock`) — in-stock / sold laptop lists with a Reset → Cleaned → Prepared → Listed status checklist per laptop.
- **Stock → Add / Edit** — the spec form branches on Apple vs. Windows: Apple gets Battery Health, Windows gets Manufacturer + Resolution; both share Year/Processor/RAM/Storage/Cycle Count/Model Number/Charger/Source/Notes/Pricing.
- **Pricing** (`/pricing`) — lists laptops in the "Prepared" stage; "Run AI Price Check" calls Claude with the web search tool to find comparable eBay sold listings and stores the result.
- **Analytics** (`/analytics`) — revenue/profit, sell-through, and "what sells better" breakdowns by brand and processor.
- **eBay Listings** (`/ebay`) — your live active eBay listings, once eBay is connected.
- **Settings** (`/settings`) — Anthropic API key, and eBay App ID / Cert ID / Dev ID / RuName + environment.

## Theme

"Megacorp" — a red-on-black corporate terminal look, defined entirely in `app/globals.css`:

- **Chrome**: a fixed noise/flicker overlay, a scanline that sweeps the viewport, and a hazard stripe under the nav.
- **Idle glitch**: page headings and the wordmark slice apart and throw cyan/red ghost copies on their own clocks (7.3s / 9.1s / 11.7s) so they never fire in sync. Driven by `<GlitchText>`, which feeds the ghosts through `data-text`.
- **Hover glitch**: each tile carries one of five burst signatures (`corp-sig-a` … `corp-sig-e`) that fires on hover-in. Underneath, three sustained layers — ghost drift, a tear band, and a brightness hum — run on free-running, co-prime clocks and are only *revealed* on hover, never restarted. That's why no two hovers land on the same frame.
- **Motion off**: everything is disabled under `prefers-reduced-motion: reduce`.

## Configuring the AI pricing agent

Add an Anthropic API key on the Settings page. No key = the Pricing page shows a "not configured" notice instead of a broken button.

## Configuring eBay

1. Create an app in the [eBay Developer Program](https://developer.ebay.com/) and note its **App ID (Client ID)** and **Cert ID (Client Secret)**.
2. Register a redirect ("RuName") pointing at `<your-app-url>/api/ebay/callback`.
3. Enter the App ID, Cert ID, optional Dev ID, and RuName on the Settings page, and pick Sandbox or Production.
4. Go to the **eBay Listings** page and click **Connect eBay Account** to run the OAuth flow.

The eBay integration (`app/lib/ebay.ts`) is written against eBay's documented OAuth and Trading API (`GetMyeBaySelling`) shapes but hasn't been exercised against a live eBay account — double check endpoints/scopes against eBay's current docs if something doesn't line up.

## Database

SQLite via Prisma, stored at `dev.db` in this directory (gitignored). Schema lives in `prisma/schema.prisma`; run `npx prisma migrate dev` after changing it. `npx prisma studio` is a handy way to browse the data directly.
