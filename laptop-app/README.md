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
- **Stock → Add / Edit** — the spec form branches on Apple vs. Windows. With **Apple** selected, entering the model number (A-number) looks it up in `app/lib/appleModels.ts` and turns Processor, GPU cores, RAM, Storage, Colour and Charger Wattage into dropdowns limited to the configurations Apple shipped for that model — picking a different chip narrows the rest (an A2442 offers M1 Pro 8c/10c and M1 Max 10c; choosing M1 Max switches GPU cores to 24/32 and RAM to 32/64GB). An unrecognised A-number falls back to free-text fields. Windows gets Manufacturer + Resolution; both share Year/Cycle Count/Serial Number/Condition/Charger/Source/Notes/Pricing.
- **Listing copy** — each laptop's page generates an eBay title and description from its details, each with a copy button:
  - Title: `MacBook Pro 14" M1 Max 64GB 1TB Space Grey 10c CPU 32c GPU A2442`
  - Description: `A2442 MacBook Pro M1 Max w/ 96W Charger.` then `Cycle count: 112, Excellent condition`
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

SQLite via Prisma, stored at `dev.db` in this directory (gitignored). Schema lives in `prisma/schema.prisma`; run `npx prisma migrate dev` after changing it. `npx prisma studio` is a handy way to browse the data directly.
