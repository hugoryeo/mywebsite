import { prisma } from "@/app/lib/prisma";
import { money, profitOf } from "@/app/lib/laptop";
import { StaticTile } from "@/app/components/Tile";
import { BarList } from "@/app/components/BarList";

export const dynamic = "force-dynamic";

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[parseInt(m, 10) - 1]} ${y}`;
}

export default async function AnalyticsPage() {
  const laptops = await prisma.laptop.findMany();
  const sold = laptops.filter((l) => l.sold);
  const inStock = laptops.filter((l) => !l.sold);

  const revenue = sold.reduce((s, l) => s + (l.soldPrice ?? 0), 0);
  const profit = sold.reduce((s, l) => s + (profitOf(l) ?? 0), 0);
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const avgProfit = sold.length ? profit / sold.length : 0;
  const stockValue = inStock.reduce((s, l) => s + (l.cost ?? 0), 0);
  const sellThrough = laptops.length ? (sold.length / laptops.length) * 100 : 0;

  const daysToSell = sold
    .filter((l) => l.soldAt)
    .map((l) => (l.soldAt!.getTime() - l.createdAt.getTime()) / 86400000);
  const avgDays = daysToSell.length ? daysToSell.reduce((a, b) => a + b, 0) / daysToSell.length : null;

  // what sells better — grouped by brand/OS
  const byBrand = new Map<string, { count: number; profit: number }>();
  for (const l of sold) {
    const key = l.brandOs === "apple" ? "Apple" : l.brand || "Windows (other)";
    const entry = byBrand.get(key) ?? { count: 0, profit: 0 };
    entry.count += 1;
    entry.profit += profitOf(l) ?? 0;
    byBrand.set(key, entry);
  }
  const brandRows = [...byBrand.entries()].sort((a, b) => b[1].profit - a[1].profit);

  // what sells better — grouped by processor
  const byProcessor = new Map<string, { count: number; profit: number }>();
  for (const l of sold) {
    const key = l.processor || "Unspecified";
    const entry = byProcessor.get(key) ?? { count: 0, profit: 0 };
    entry.count += 1;
    entry.profit += profitOf(l) ?? 0;
    byProcessor.set(key, entry);
  }
  const processorRows = [...byProcessor.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);

  // profit by month
  const byMonth = new Map<string, { count: number; profit: number }>();
  for (const l of sold) {
    if (!l.soldAt) continue;
    const key = l.soldAt.toISOString().slice(0, 7);
    const entry = byMonth.get(key) ?? { count: 0, profit: 0 };
    entry.count += 1;
    entry.profit += profitOf(l) ?? 0;
    byMonth.set(key, entry);
  }
  const monthRows = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Analytics</h1>
        <p className="mt-1 text-navy-400">An overview of what sells, and how the business is performing.</p>
      </div>

      {laptops.length === 0 ? (
        <div className="panel-3d panel-3d-static p-8 text-center text-navy-400">
          No data yet — add laptops and record sales to see analytics.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StaticTile label="Total Revenue" value={money(revenue)} />
            <StaticTile
              label="Total Profit"
              value={<span className={profit >= 0 ? "text-emerald-600" : "text-rose-600"}>{money(profit)}</span>}
              sub={`${margin.toFixed(1)}% margin`}
            />
            <StaticTile label="Avg Profit / Sale" value={money(avgProfit)} />
            <StaticTile label="Sell-Through Rate" value={`${sellThrough.toFixed(0)}%`} sub={`${sold.length} of ${laptops.length} sold`} />
            <StaticTile label="In Stock" value={inStock.length} sub={`worth ${money(stockValue)} at cost`} />
            <StaticTile label="Avg Days to Sell" value={avgDays === null ? "—" : avgDays.toFixed(1)} />
          </div>

          {brandRows.length > 0 && (
            <div className="panel-3d panel-3d-static p-6">
              <h2 className="mb-4 text-lg font-bold text-navy-900">What Sells Better — by Brand</h2>
              <BarList
                rows={brandRows.map(([label, v]) => ({
                  label,
                  value: v.profit,
                  display: `${money(v.profit)} (${v.count} sold)`,
                }))}
              />
            </div>
          )}

          {processorRows.length > 0 && (
            <div className="panel-3d panel-3d-static p-6">
              <h2 className="mb-4 text-lg font-bold text-navy-900">What Sells Better — by Processor</h2>
              <BarList
                rows={processorRows.map(([label, v]) => ({
                  label,
                  value: v.count,
                  display: `${v.count} sold · ${money(v.profit)}`,
                }))}
              />
            </div>
          )}

          {monthRows.length > 0 && (
            <div className="panel-3d panel-3d-static p-6">
              <h2 className="mb-4 text-lg font-bold text-navy-900">Profit by Month</h2>
              <BarList
                rows={monthRows.map(([key, v]) => ({
                  label: monthLabel(key),
                  value: v.profit,
                  display: `${money(v.profit)} (${v.count})`,
                }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
