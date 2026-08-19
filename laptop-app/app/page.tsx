import { prisma } from "./lib/prisma";
import { money, profitOf } from "./lib/laptop";
import { LinkTile, StaticTile, Icon } from "./components/Tile";
import GlitchText from "./components/GlitchText";

export const dynamic = "force-dynamic";

export default async function LaunchPage() {
  const laptops = await prisma.laptop.findMany();

  const inStock = laptops.filter((l) => !l.sold);
  const sold = laptops.filter((l) => l.sold);
  const prepared = laptops.filter((l) => l.statusPrepared && !l.sold);

  const totalProfit = sold.reduce((sum, l) => sum + (profitOf(l) ?? 0), 0);
  const stockValue = inStock.reduce((sum, l) => sum + (l.cost ?? 0), 0);

  const modelTotals = new Map<string, { count: number; profit: number }>();
  for (const l of sold) {
    const key =
      [l.brandOs === "apple" ? "Apple" : l.brand, l.processor].filter(Boolean).join(" ") ||
      "Unknown";
    const entry = modelTotals.get(key) ?? { count: 0, profit: 0 };
    entry.count += 1;
    entry.profit += profitOf(l) ?? 0;
    modelTotals.set(key, entry);
  }
  const topSeller = [...modelTotals.entries()].sort((a, b) => b[1].profit - a[1].profit)[0];

  return (
    <div className="flex flex-col">
      <div className="mb-3.5 flex items-center gap-2">
        <span className="h-[7px] w-[7px] rounded-full bg-corp-accent shadow-[0_0_8px_var(--color-corp-accent)] [animation:corp-pulse_2.4s_ease-in-out_infinite]" />
        <span className="text-[10.5px] tracking-[0.12em] text-corp-500 uppercase">
          Uplink Stable — Clearance Level 2
        </span>
      </div>

      <GlitchText
        text="Launch"
        as="h1"
        className="corp-heading mb-3 text-[44px] leading-none"
      />
      <p className="mb-9 max-w-[62ch] text-[13px] leading-relaxed text-corp-400">
        A general view of your laptop business — stock, pricing, listings, and what sells.
      </p>

      {/* Bento: Profit anchors 2x2, Analytics runs the full width */}
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[152px]">
        <StaticTile
          label="Total Profit"
          value={money(totalProfit)}
          sign={totalProfit}
          flag="No Access"
          hero
          sub={`${sold.length} laptop${sold.length === 1 ? "" : "s"} sold · lifetime margin across all closed sales`}
          className="sm:col-span-2 lg:row-span-2"
        />

        <LinkTile
          href="/stock"
          label="Laptop Stock"
          value={String(inStock.length)}
          sub={`worth ${money(stockValue)} at cost`}
          icon="laptop"
          sig="e"
          className="sm:col-span-2"
        />

        <LinkTile
          href="/pricing"
          label="Pricing"
          value={String(prepared.length)}
          sub="ready for AI price check"
          icon="tag"
          sig="b"
        />

        <LinkTile
          href="/ebay"
          label="eBay Listings"
          value="Menu"
          sub="live listings"
          icon="cart"
          sig="c"
        />

        <a
          href="/analytics"
          className="corp-panel corp-tile corp-sig-d flex flex-col gap-5 p-5 sm:col-span-2 lg:col-span-4 lg:flex-row lg:items-center lg:gap-7"
        >
          <span className="corp-bracket corp-bracket-tl" aria-hidden="true" />
          <span className="corp-bracket corp-bracket-br" aria-hidden="true" />
          <div className="flex min-w-[240px] flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="corp-label">Analytics</span>
              <Icon name="chart" className="text-corp-accent" />
            </div>
            <GlitchText
              text={topSeller ? topSeller[0] : "No sales yet"}
              mode="hover"
              className="font-display text-[21px] font-bold leading-none text-white"
            />
            <div className="text-[11px] text-corp-500">
              {topSeller
                ? `top seller · ${money(topSeller[1].profit)} profit`
                : "sell something to see trends"}
            </div>
          </div>
          <div className="relative flex h-16 flex-1 items-center justify-center border-b border-l border-dashed border-corp-accent/35 border-l-corp-accent/20 after:absolute after:inset-x-0 after:-bottom-1 after:h-[7px] after:bg-[repeating-linear-gradient(90deg,rgba(111,141,179,0.35)_0_1px,transparent_1px_44px)]">
            <span className="text-[10px] tracking-[0.16em] text-corp-600 uppercase">
              {sold.length
                ? `${sold.length} closed sale${sold.length === 1 ? "" : "s"} on record`
                : "Awaiting sales data"}
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
