import { prisma } from "@/app/lib/prisma";
import { money, profitOf } from "@/app/lib/laptop";
import { BarList } from "@/app/components/BarList";
import GlitchText from "@/app/components/GlitchText";
import { Panel } from "@/app/components/Tile";

export const dynamic = "force-dynamic";

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[parseInt(m, 10) - 1]} ${y}`;
}

function Metric({
  label,
  value,
  sub,
  sign,
}: {
  label: string;
  value: string;
  sub?: string;
  /** Colour the figure by whether it's a gain or a loss. */
  sign?: number;
}) {
  const tone =
    sign === undefined ? "text-white" : sign >= 0 ? "text-corp-pos" : "text-corp-neg";
  return (
    <div className="corp-panel p-5">
      <div className="corp-label">{label}</div>
      <div
        className={`mt-1.5 font-display text-[26px] font-bold leading-none tabular-nums ${tone}`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-corp-500">{sub}</div>}
    </div>
  );
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
  const avgDays = daysToSell.length
    ? daysToSell.reduce((a, b) => a + b, 0) / daysToSell.length
    : null;

  const byBrand = new Map<string, { count: number; profit: number }>();
  for (const l of sold) {
    const key = l.brandOs === "apple" ? "Apple" : l.brand || "Windows (other)";
    const entry = byBrand.get(key) ?? { count: 0, profit: 0 };
    entry.count += 1;
    entry.profit += profitOf(l) ?? 0;
    byBrand.set(key, entry);
  }
  const brandRows = [...byBrand.entries()].sort((a, b) => b[1].profit - a[1].profit);

  const byProcessor = new Map<string, { count: number; profit: number }>();
  for (const l of sold) {
    const key = l.processor || "Unspecified";
    const entry = byProcessor.get(key) ?? { count: 0, profit: 0 };
    entry.count += 1;
    entry.profit += profitOf(l) ?? 0;
    byProcessor.set(key, entry);
  }
  const processorRows = [...byProcessor.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);

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
        <GlitchText text="Analytics" as="h1" className="corp-heading text-[38px] leading-none" />
        <p className="mt-2 text-[13px] text-corp-400">
          An overview of what sells, and how the business is performing.
        </p>
      </div>

      {laptops.length === 0 ? (
        <Panel className="text-center text-[13px] text-corp-500">
          No data yet — add laptops and record sales to see analytics.
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Metric label="Total Revenue" value={money(revenue)} />
            <Metric
              label="Total Profit"
              value={money(profit)}
              sub={`${margin.toFixed(1)}% margin`}
              sign={profit}
            />
            <Metric label="Avg Profit / Sale" value={money(avgProfit)} sign={avgProfit} />
            <Metric
              label="Sell-Through Rate"
              value={`${sellThrough.toFixed(0)}%`}
              sub={`${sold.length} of ${laptops.length} sold`}
            />
            <Metric
              label="In Stock"
              value={String(inStock.length)}
              sub={`worth ${money(stockValue)} at cost`}
            />
            <Metric
              label="Avg Days to Sell"
              value={avgDays === null ? "—" : avgDays.toFixed(1)}
            />
          </div>

          {brandRows.length > 0 && (
            <div className="corp-panel p-6">
              <h2 className="corp-heading mb-5 text-lg">What Sells Better — by Brand</h2>
              <BarList
                rows={brandRows.map(([label, v]) => ({
                  label,
                  value: v.profit,
                  display: `${money(v.profit)} (${v.count})`,
                }))}
              />
            </div>
          )}

          {processorRows.length > 0 && (
            <div className="corp-panel p-6">
              <h2 className="corp-heading mb-5 text-lg">What Sells Better — by Processor</h2>
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
            <div className="corp-panel p-6">
              <h2 className="corp-heading mb-5 text-lg">Profit by Month</h2>
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
