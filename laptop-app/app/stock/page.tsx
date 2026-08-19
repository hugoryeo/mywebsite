import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { money, specSummary, displayTitle } from "@/app/lib/laptop";
import StatusChecklist from "@/app/components/StatusChecklist";

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Stock</h1>
          <p className="mt-1 text-navy-400">
            {showSold ? "Laptops already sold." : "Laptops currently in stock, with pricing and specs."}
          </p>
        </div>
        <Link href="/stock/new" className="btn-navy px-5 py-2.5 text-sm font-semibold">
          + Add Laptop
        </Link>
      </div>

      <div className="flex gap-2 text-sm font-medium">
        <Link
          href="/stock"
          className={`rounded-md px-3 py-1.5 ${!showSold ? "bg-navy-600 text-white" : "bg-white text-navy-500 border border-navy-200"}`}
        >
          In Stock
        </Link>
        <Link
          href="/stock?view=sold"
          className={`rounded-md px-3 py-1.5 ${showSold ? "bg-navy-600 text-white" : "bg-white text-navy-500 border border-navy-200"}`}
        >
          Sold
        </Link>
      </div>

      {laptops.length === 0 ? (
        <div className="panel-3d panel-3d-static p-8 text-center text-navy-400">
          {showSold ? "No laptops sold yet." : "No laptops in stock yet — add one to get started."}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {laptops.map((l) => (
            <div key={l.id} className="panel-3d p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <Link href={`/stock/${l.id}`} className="flex-1 min-w-[220px]">
                  <div className="font-bold text-navy-900 hover:underline">{displayTitle(l)}</div>
                  <div className="mt-1 text-sm text-navy-400">{specSummary(l)}</div>
                </Link>
                <div className="text-right">
                  <div className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
                    {showSold ? "Sold For" : "Asking Price"}
                  </div>
                  <div className="text-lg font-bold text-navy-900">
                    {money(showSold ? l.soldPrice : l.price)}
                  </div>
                </div>
              </div>
              {!showSold && (
                <div className="mt-4 border-t border-navy-100 pt-4">
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
