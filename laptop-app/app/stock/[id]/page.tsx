import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { money, displayTitle, profitOf } from "@/app/lib/laptop";
import LaptopForm from "@/app/components/LaptopForm";
import StatusChecklist from "@/app/components/StatusChecklist";
import GlitchText from "@/app/components/GlitchText";
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
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <GlitchText
            text={displayTitle(laptop)}
            as="h1"
            className="corp-heading text-[32px] leading-tight"
          />
          <p className="mt-2 text-[12px] text-corp-500">
            Added {laptop.createdAt.toLocaleDateString()}
          </p>
        </div>
        <form action={boundDelete}>
          <button type="submit" className="btn-corp-danger px-4 py-2 text-[11px]">
            Delete Laptop
          </button>
        </form>
      </div>

      <div className="corp-panel p-6">
        <h2 className="corp-heading mb-4 text-lg">Prep Status</h2>
        <StatusChecklist laptop={laptop} />
      </div>

      {laptop.priceEstimates.length > 0 && (
        <div className="corp-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="corp-heading text-lg">AI Price Estimates</h2>
            <Link
              href="/pricing"
              className="font-display text-[11px] font-semibold tracking-[0.08em] text-corp-red uppercase hover:text-corp-red-bright"
            >
              Run another check →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {laptop.priceEstimates.map((e) => (
              <div
                key={e.id}
                className="border border-[color:var(--corp-edge-soft)] bg-corp-900/60 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-display text-[22px] font-bold text-white">
                    {money(e.averagePrice)}
                  </span>
                  <span className="text-[11px] text-corp-500">
                    {e.createdAt.toLocaleString()}
                  </span>
                </div>
                {(e.lowPrice != null || e.highPrice != null) && (
                  <div className="text-[12px] text-corp-400">
                    range {money(e.lowPrice)} – {money(e.highPrice)}
                    {e.sampleSize ? ` · ${e.sampleSize} sold listings` : ""}
                  </div>
                )}
                <p className="mt-2 text-[13px] leading-relaxed text-corp-300">{e.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="corp-panel p-6">
        <h2 className="corp-heading mb-4 text-lg">Sale</h2>
        {laptop.sold ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="corp-label">Sold For</div>
                <div className="font-display text-[20px] font-bold text-white">
                  {money(laptop.soldPrice)}
                </div>
              </div>
              <div>
                <div className="corp-label">Shipping</div>
                <div className="font-display text-[20px] font-bold text-white">
                  {money(laptop.shipping)}
                </div>
              </div>
              <div>
                <div className="corp-label">Fees</div>
                <div className="font-display text-[20px] font-bold text-white">
                  {money(laptop.fees)}
                </div>
              </div>
              <div>
                <div className="corp-label">Profit</div>
                <div
                  className={`font-display text-[20px] font-bold ${
                    (profit ?? 0) >= 0 ? "text-corp-red-bright" : "text-corp-red"
                  }`}
                >
                  {money(profit)}
                </div>
              </div>
            </div>
            <form action={boundUnsell}>
              <button type="submit" className="btn-corp-ghost px-4 py-2 text-[11px]">
                Undo Sale
              </button>
            </form>
          </div>
        ) : (
          <form action={boundSell} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="corp-label">Sale Price (£)</label>
              <input
                name="soldPrice"
                type="number"
                min="0"
                step="0.01"
                required
                className="input-corp px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="corp-label">Shipping (£)</label>
              <input
                name="shipping"
                type="number"
                min="0"
                step="0.01"
                className="input-corp px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="corp-label">Fees (£)</label>
              <input
                name="fees"
                type="number"
                min="0"
                step="0.01"
                className="input-corp px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className="btn-corp self-end px-5 py-2.5 text-xs sm:col-span-3 sm:w-fit">
              Mark as Sold
            </button>
          </form>
        )}
      </div>

      <div>
        <h2 className="corp-heading mb-4 text-lg">Edit Details</h2>
        <LaptopForm action={boundUpdate} initial={laptop} submitLabel="Save Changes" />
      </div>
    </div>
  );
}
