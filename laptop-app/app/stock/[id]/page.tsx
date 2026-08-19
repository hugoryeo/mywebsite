import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { money, displayTitle, profitOf } from "@/app/lib/laptop";
import LaptopForm from "@/app/components/LaptopForm";
import StatusChecklist from "@/app/components/StatusChecklist";
import { updateLaptop, markSold, markUnsold, deleteLaptop } from "@/app/lib/actions";

export const dynamic = "force-dynamic";

export default async function LaptopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const laptop = await prisma.laptop.findUnique({
    where: { id },
    include: { priceEstimates: { orderBy: { createdAt: "desc" }, take: 3 } },
  });
  if (!laptop) notFound();

  async function boundUpdate(formData: FormData) {
    "use server";
    await updateLaptop(id, formData);
  }
  async function boundSell(formData: FormData) {
    "use server";
    await markSold(id, formData);
  }
  async function boundUnsell() {
    "use server";
    await markUnsold(id);
  }
  async function boundDelete() {
    "use server";
    await deleteLaptop(id);
  }

  const profit = profitOf(laptop);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{displayTitle(laptop)}</h1>
          <p className="mt-1 text-navy-400">Added {laptop.createdAt.toLocaleDateString()}</p>
        </div>
        <form action={boundDelete}>
          <button
            type="submit"
            className="btn-outline-navy border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            Delete Laptop
          </button>
        </form>
      </div>

      <div className="panel-3d panel-3d-static p-6">
        <h2 className="mb-4 text-lg font-bold text-navy-900">Prep Status</h2>
        <StatusChecklist laptop={laptop} />
      </div>

      {laptop.priceEstimates.length > 0 && (
        <div className="panel-3d panel-3d-static p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">AI Price Estimates</h2>
            <Link href="/pricing" className="text-sm font-semibold text-navy-500 hover:underline">
              Run another check →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {laptop.priceEstimates.map((e) => (
              <div key={e.id} className="rounded-lg border border-navy-100 bg-navy-50 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xl font-bold text-navy-900">{money(e.averagePrice)}</span>
                  <span className="text-xs text-navy-400">{e.createdAt.toLocaleString()}</span>
                </div>
                {(e.lowPrice != null || e.highPrice != null) && (
                  <div className="text-sm text-navy-400">
                    range {money(e.lowPrice)} – {money(e.highPrice)}
                    {e.sampleSize ? ` · ${e.sampleSize} sold listings` : ""}
                  </div>
                )}
                <p className="mt-2 text-sm text-navy-700">{e.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel-3d panel-3d-static p-6">
        <h2 className="mb-4 text-lg font-bold text-navy-900">Sale</h2>
        {laptop.sold ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="text-xs font-semibold tracking-wide text-navy-500 uppercase">Sold For</div>
                <div className="text-lg font-bold text-navy-900">{money(laptop.soldPrice)}</div>
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wide text-navy-500 uppercase">Shipping</div>
                <div className="text-lg font-bold text-navy-900">{money(laptop.shipping)}</div>
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wide text-navy-500 uppercase">Fees</div>
                <div className="text-lg font-bold text-navy-900">{money(laptop.fees)}</div>
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wide text-navy-500 uppercase">Profit</div>
                <div className={`text-lg font-bold ${(profit ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {money(profit)}
                </div>
              </div>
            </div>
            <form action={boundUnsell}>
              <button type="submit" className="btn-outline-navy px-4 py-2 text-sm font-semibold">
                Undo Sale
              </button>
            </form>
          </div>
        ) : (
          <form action={boundSell} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-navy-500 uppercase">Sale Price (£)</label>
              <input name="soldPrice" type="number" min="0" step="0.01" required className="input-navy px-3 py-2 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-navy-500 uppercase">Shipping (£)</label>
              <input name="shipping" type="number" min="0" step="0.01" className="input-navy px-3 py-2 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-navy-500 uppercase">Fees (£)</label>
              <input name="fees" type="number" min="0" step="0.01" className="input-navy px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="btn-navy self-end px-5 py-2.5 text-sm font-semibold sm:col-span-3 sm:w-fit">
              Mark as Sold
            </button>
          </form>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-navy-900">Edit Details</h2>
        <LaptopForm action={boundUpdate} initial={laptop} submitLabel="Save Changes" />
      </div>
    </div>
  );
}
