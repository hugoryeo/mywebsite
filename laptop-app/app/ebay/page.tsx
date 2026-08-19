import Link from "next/link";
import { getEbayCredentials, getMyActiveListings } from "@/app/lib/ebay";
import { getEbayToken } from "@/app/lib/settings";
import { money } from "@/app/lib/laptop";

export const dynamic = "force-dynamic";

export default async function EbayPage({
  searchParams,
}: {
  searchParams: Promise<{ ebay_connected?: string; ebay_error?: string }>;
}) {
  const { ebay_connected, ebay_error } = await searchParams;
  const creds = await getEbayCredentials();
  const token = await getEbayToken();

  let listings: Awaited<ReturnType<typeof getMyActiveListings>> = [];
  let fetchError: string | null = null;
  if (creds && token) {
    try {
      listings = await getMyActiveListings();
    } catch (err) {
      fetchError = err instanceof Error ? err.message : "Failed to load eBay listings.";
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">eBay Listings</h1>
        <p className="mt-1 text-navy-400">Your live active eBay listings, pulled directly from eBay.</p>
      </div>

      {ebay_connected && (
        <div className="panel-3d panel-3d-static border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          eBay account connected successfully.
        </div>
      )}
      {ebay_error && (
        <div className="panel-3d panel-3d-static border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {ebay_error}
        </div>
      )}

      {!creds ? (
        <div className="panel-3d panel-3d-static p-8 text-center text-navy-400">
          eBay isn&rsquo;t configured yet.{" "}
          <Link href="/settings" className="font-semibold text-navy-600 underline">
            Add your eBay App ID, Cert ID, and RuName in Settings
          </Link>{" "}
          to get started.
        </div>
      ) : !token ? (
        <div className="panel-3d panel-3d-static flex flex-col items-center gap-4 p-8 text-center text-navy-400">
          <p>Your eBay app credentials are set, but no eBay account is connected yet.</p>
          <a href="/api/ebay/authorize" className="btn-navy px-5 py-2.5 text-sm font-semibold">
            Connect eBay Account
          </a>
        </div>
      ) : fetchError ? (
        <div className="panel-3d panel-3d-static border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          <p className="font-semibold">Couldn&rsquo;t load your listings.</p>
          <p className="mt-1">{fetchError}</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="panel-3d panel-3d-static p-8 text-center text-navy-400">
          No active eBay listings found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((item) => (
            <a
              key={item.itemId}
              href={item.viewUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="panel-3d panel-3d-interactive flex items-center justify-between gap-4 p-4"
            >
              <div>
                <div className="font-semibold text-navy-900">{item.title}</div>
                <div className="text-xs text-navy-400">Item #{item.itemId}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-navy-900">{money(item.price)}</div>
                {item.quantity != null && <div className="text-xs text-navy-400">qty {item.quantity}</div>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
