import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { money, specSummary, displayTitle } from "@/app/lib/laptop";
import { getSetting, SETTING_KEYS } from "@/app/lib/settings";
import PriceCheckButton from "@/app/components/PriceCheckButton";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [prepared, apiKey] = await Promise.all([
    prisma.laptop.findMany({
      where: { statusPrepared: true, sold: false },
      orderBy: { createdAt: "desc" },
      include: { priceEstimates: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    getSetting(SETTING_KEYS.anthropicApiKey),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Pricing</h1>
        <p className="mt-1 text-navy-400">
          An AI agent searches the web for eBay sold listings matching each laptop&rsquo;s specs and
          condition, and returns an average price. Only laptops marked <strong>Prepared</strong> show up
          here.
        </p>
      </div>

      {!apiKey && (
        <div className="panel-3d panel-3d-static border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No Anthropic API key configured yet.{" "}
          <Link href="/settings" className="font-semibold underline">
            Add one in Settings
          </Link>{" "}
          to enable AI price checks.
        </div>
      )}

      {prepared.length === 0 ? (
        <div className="panel-3d panel-3d-static p-8 text-center text-navy-400">
          No laptops are in the Prepared stage yet. Tick &ldquo;Prepared&rdquo; on a stock item to see it
          here.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {prepared.map((l) => {
            const latest = l.priceEstimates[0];
            return (
              <div key={l.id} className="panel-3d p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link href={`/stock/${l.id}`} className="font-bold text-navy-900 hover:underline">
                      {displayTitle(l)}
                    </Link>
                    <div className="mt-1 text-sm text-navy-400">{specSummary(l)}</div>
                    <div className="mt-1 text-sm text-navy-400">Asking price: {money(l.price)}</div>
                  </div>
                  {latest && (
                    <div className="text-right">
                      <div className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                        Last AI Estimate
                      </div>
                      <div className="text-lg font-bold text-navy-900">{money(latest.averagePrice)}</div>
                      <div className="text-xs text-navy-400">{latest.createdAt.toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
                <div className="mt-4 border-t border-navy-100 pt-4">
                  <PriceCheckButton laptopId={l.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
