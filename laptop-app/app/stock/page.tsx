import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { money, specSummary, displayTitle } from "@/app/lib/laptop";
import StatusChecklist from "@/app/components/StatusChecklist";
import GlitchText from "@/app/components/GlitchText";
import { Panel } from "@/app/components/Tile";

export const dynamic = "force-dynamic";

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const showSold = view === "sold";

  const laptops = await prisma.laptop.findMany({
    where: { sold: showSold },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <GlitchText text="Stock" as="h1" className="corp-heading text-[38px] leading-none" />
          <p className="mt-2 text-[13px] text-corp-400">
            {showSold
              ? "Laptops already sold."
              : "Laptops currently in stock, with pricing and specs."}
          </p>
        </div>
        <Link href="/stock/new" className="btn-corp px-5 py-2.5 text-xs">
          + Add Laptop
        </Link>
      </div>

      <div className="flex gap-2">
        <Link
          href="/stock"
          className={!showSold ? "btn-corp px-4 py-2 text-[11px]" : "btn-corp-ghost px-4 py-2 text-[11px]"}
        >
          In Stock
        </Link>
        <Link
          href="/stock?view=sold"
          className={showSold ? "btn-corp px-4 py-2 text-[11px]" : "btn-corp-ghost px-4 py-2 text-[11px]"}
        >
          Sold
        </Link>
      </div>

      {laptops.length === 0 ? (
        <Panel className="text-center text-[13px] text-corp-500">
          {showSold
            ? "No laptops sold yet."
            : "No laptops in stock yet — add one to get started."}
        </Panel>
      ) : (
        <div className="flex flex-col gap-4">
          {laptops.map((l) => (
            <div key={l.id} className="corp-panel p-5">
              <span className="corp-bracket corp-bracket-tl" aria-hidden="true" />
              <span className="corp-bracket corp-bracket-br" aria-hidden="true" />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <Link href={`/stock/${l.id}`} className="min-w-[220px] flex-1 group">
                  <div className="font-display text-[17px] font-bold text-white group-hover:text-corp-red-bright">
                    {displayTitle(l)}
                  </div>
                  <div className="mt-1 text-[12px] text-corp-400">{specSummary(l)}</div>
                </Link>
                <div className="text-right">
                  <div className="corp-label">{showSold ? "Sold For" : "Asking Price"}</div>
                  <div className="font-display text-[22px] font-bold text-white">
                    {money(showSold ? l.soldPrice : l.price)}
                  </div>
                </div>
              </div>
              {!showSold && (
                <div className="mt-4 border-t border-[color:var(--corp-edge-soft)] pt-4">
                  <StatusChecklist laptop={l} compact />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
