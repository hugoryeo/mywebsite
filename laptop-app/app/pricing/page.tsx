import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { money, specSummary, displayTitle } from "@/app/lib/laptop";
import { getSetting, SETTING_KEYS } from "@/app/lib/settings";
import PriceCheckButton from "@/app/components/PriceCheckButton";
import GlitchText from "@/app/components/GlitchText";
import { Panel } from "@/app/components/Tile";

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
    <div className="flex flex-col gap-7">
      <div>
        <GlitchText text="Pricing" as="h1" className="corp-heading text-[38px] leading-none" />
        <p className="mt-2 max-w-[68ch] text-[13px] leading-relaxed text-corp-400">
          An AI agent searches the web for eBay sold listings matching each laptop&rsquo;s specs and
          condition, and returns an average price. Only laptops marked{" "}
          <strong className="text-corp-red">Prepared</strong> show up here.
        </p>
      </div>

      {!apiKey && (
        <div className="corp-panel border-corp-red/50 p-4 text-[13px] text-corp-300">
          <span className="corp-bracket corp-bracket-tl" aria-hidden="true" />
          No Anthropic API key configured yet.{" "}
          <Link href="/settings" className="font-semibold text-corp-red underline hover:text-corp-red-bright">
            Add one in Settings
          </Link>{" "}
          to enable AI price checks.
        </div>
      )}

      {prepared.length === 0 ? (
        <Panel className="text-center text-[13px] text-corp-500">
          No laptops are in the Prepared stage yet. Tick &ldquo;Prepared&rdquo; on a stock item to
          see it here.
        </Panel>
      ) : (
        <div className="flex flex-col gap-4">
          {prepared.map((l) => {
            const latest = l.priceEstimates[0];
            return (
              <div key={l.id} className="corp-panel p-5">
                <span className="corp-bracket corp-bracket-tl" aria-hidden="true" />
                <span className="corp-bracket corp-bracket-br" aria-hidden="true" />
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/stock/${l.id}`}
                      className="font-display text-[17px] font-bold text-white hover:text-corp-red-bright"
                    >
                      {displayTitle(l)}
                    </Link>
                    <div className="mt-1 text-[12px] text-corp-400">{specSummary(l)}</div>
                    <div className="mt-1 text-[12px] text-corp-500">
                      Asking price: {money(l.price)}
                    </div>
                  </div>
                  {latest && (
                    <div className="text-right">
                      <div className="corp-label">Last AI Estimate</div>
                      <div className="font-display text-[22px] font-bold text-white">
                        {money(latest.averagePrice)}
                      </div>
                      <div className="text-[11px] text-corp-500">
                        {latest.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 border-t border-[color:var(--corp-edge-soft)] pt-4">
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
