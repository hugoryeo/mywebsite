import Link from "next/link";
import { getEbayCredentials, getMyActiveListings } from "@/app/lib/ebay";
import { getEbayToken } from "@/app/lib/settings";
import { money } from "@/app/lib/laptop";
import GlitchText from "@/app/components/GlitchText";
import { Panel } from "@/app/components/Tile";

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
    <div className="flex flex-col gap-7">
      <div>
        <GlitchText
          text="eBay Listings"
          as="h1"
          className="corp-heading text-[38px] leading-none"
        />
        <p className="mt-2 text-[13px] text-corp-400">
          Your live active eBay listings, pulled directly from eBay.
        </p>
      </div>

      {ebay_connected && (
        <div className="corp-panel border-corp-red/50 p-4 text-[13px] text-corp-300">
          eBay account connected successfully.
        </div>
      )}
      {ebay_error && (
        <div className="corp-panel border-corp-red p-4 text-[13px] text-corp-red-bright">
          {ebay_error}
        </div>
      )}

      {!creds ? (
        <Panel className="text-center text-[13px] text-corp-500">
          eBay isn&rsquo;t configured yet.{" "}
          <Link
            href="/settings"
            className="font-semibold text-corp-red underline hover:text-corp-red-bright"
          >
            Add your eBay App ID, Cert ID, and RuName in Settings
          </Link>{" "}
          to get started.
        </Panel>
      ) : !token ? (
        <Panel className="flex flex-col items-center gap-5 py-8 text-center text-[13px] text-corp-500">
          <p>Your eBay app credentials are set, but no eBay account is connected yet.</p>
          <a href="/api/ebay/authorize" className="btn-corp px-5 py-2.5 text-xs">
            Connect eBay Account
          </a>
        </Panel>
      ) : fetchError ? (
        <div className="corp-panel border-corp-red p-6 text-[13px]">
          <p className="corp-heading text-base text-corp-red-bright">
            Couldn&rsquo;t load your listings
          </p>
          <p className="mt-2 text-corp-300">{fetchError}</p>
        </div>
      ) : listings.length === 0 ? (
        <Panel className="text-center text-[13px] text-corp-500">
          No active eBay listings found.
        </Panel>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((item, i) => (
            <a
              key={item.itemId}
              href={item.viewUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`corp-panel corp-tile flex items-center justify-between gap-4 p-4 ${
                ["", "corp-sig-b", "corp-sig-c", "corp-sig-d", "corp-sig-e"][i % 5]
              }`}
            >
              <span className="corp-bracket corp-bracket-tl" aria-hidden="true" />
              <span className="corp-bracket corp-bracket-br" aria-hidden="true" />
              <div>
                <div className="font-display text-[15px] font-semibold text-white">
                  {item.title}
                </div>
                <div className="text-[11px] text-corp-500">Item #{item.itemId}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-[18px] font-bold text-white tabular-nums">
                  {money(item.price)}
                </div>
                {item.quantity != null && (
                  <div className="text-[11px] text-corp-500">qty {item.quantity}</div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
