import { prisma } from "./lib/prisma";
import { money, profitOf } from "./lib/laptop";
import { LinkTile, StaticTile } from "./components/Tile";

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
    const key = [l.brandOs === "apple" ? "Apple" : l.brand, l.processor].filter(Boolean).join(" ") || "Unknown";
    const entry = modelTotals.get(key) ?? { count: 0, profit: 0 };
    entry.count += 1;
    entry.profit += profitOf(l) ?? 0;
    modelTotals.set(key, entry);
  }
  const topSeller = [...modelTotals.entries()].sort((a, b) => b[1].profit - a[1].profit)[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Launch</h1>
        <p className="mt-1 text-navy-400">
          A general view of your laptop business — stock, pricing, listings, and what sells.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StaticTile
          label="Total Profit"
          value={
            <span className={totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>
              {money(totalProfit)}
            </span>
          }
          sub={`${sold.length} laptop${sold.length === 1 ? "" : "s"} sold`}
          icon="💰"
        />

        <LinkTile
          href="/stock"
          label="Laptop Stock"
          value={inStock.length}
          sub={`worth ${money(stockValue)} at cost`}
          icon="💻"
        />

        <LinkTile
          href="/pricing"
          label="Pricing"
          value={prepared.length}
          sub="laptops ready for an AI price check"
          icon="🏷️"
        />

        <LinkTile
          href="/ebay"
          label="eBay Listings"
          value="Menu"
          sub="view your live eBay listings"
          icon="🛒"
        />

        <LinkTile
          href="/analytics"
          label="Analytics"
          value={topSeller ? topSeller[0] : "No sales yet"}
          sub={topSeller ? `top seller · ${money(topSeller[1].profit)} profit` : "sell something to see trends"}
          icon="📊"
        />
      </div>
    </div>
  );
}
