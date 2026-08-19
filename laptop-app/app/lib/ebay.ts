import { XMLParser } from "fast-xml-parser";
import {
  SETTING_KEYS,
  getSetting,
  getSettings,
  setEbayToken,
  getEbayToken,
  type EbayOAuthToken,
} from "./settings";

/**
 * eBay integration.
 *
 * This is written against eBay's documented OAuth (Authorization Code Grant)
 * and Trading API shapes, but has not been exercised against a live eBay
 * developer account — verify endpoints/scopes against the current eBay
 * developer docs once real credentials are added in Settings.
 */

export type EbayEnv = "sandbox" | "production";

const SCOPES = [
  "https://api.ebay.com/oauth/api_scope",
  "https://api.ebay.com/oauth/api_scope/sell.inventory",
  "https://api.ebay.com/oauth/api_scope/sell.account",
].join(" ");

function authBase(env: EbayEnv) {
  return env === "sandbox" ? "https://auth.sandbox.ebay.com" : "https://auth.ebay.com";
}
function apiBase(env: EbayEnv) {
  return env === "sandbox" ? "https://api.sandbox.ebay.com" : "https://api.ebay.com";
}

export class EbayNotConfiguredError extends Error {}
export class EbayNotConnectedError extends Error {}

export interface EbayCredentials {
  appId: string;
  certId: string;
  ruName: string;
  env: EbayEnv;
}

export async function getEbayCredentials(): Promise<EbayCredentials | null> {
  const values = await getSettings([
    SETTING_KEYS.ebayAppId,
    SETTING_KEYS.ebayCertId,
    SETTING_KEYS.ebayRuName,
    SETTING_KEYS.ebayEnvironment,
  ]);
  const appId = values[SETTING_KEYS.ebayAppId];
  const certId = values[SETTING_KEYS.ebayCertId];
  const ruName = values[SETTING_KEYS.ebayRuName];
  if (!appId || !certId || !ruName) return null;
  const env = (values[SETTING_KEYS.ebayEnvironment] as EbayEnv) || "production";
  return { appId, certId, ruName, env };
}

export function buildAuthorizeUrl(creds: EbayCredentials, state: string): string {
  const url = new URL(`${authBase(creds.env)}/oauth2/authorize`);
  url.searchParams.set("client_id", creds.appId);
  url.searchParams.set("redirect_uri", creds.ruName);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  return url.toString();
}

async function tokenRequest(
  creds: EbayCredentials,
  params: Record<string, string>,
): Promise<EbayOAuthToken> {
  const basic = Buffer.from(`${creds.appId}:${creds.certId}`).toString("base64");
  const res = await fetch(`${apiBase(creds.env)}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams(params).toString(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error_description || data?.error || `eBay token request failed (${res.status})`);
  }
  const now = Date.now();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? "",
    expiresAt: now + (data.expires_in ?? 7200) * 1000,
  };
}

export async function exchangeCodeForToken(code: string): Promise<void> {
  const creds = await getEbayCredentials();
  if (!creds) throw new EbayNotConfiguredError("eBay credentials are not configured.");
  const existing = await getEbayToken();
  const token = await tokenRequest(creds, {
    grant_type: "authorization_code",
    code,
    redirect_uri: creds.ruName,
  });
  // Authorization-code exchanges don't always return a fresh refresh_token;
  // keep the previous one if eBay omitted it.
  if (!token.refreshToken && existing?.refreshToken) token.refreshToken = existing.refreshToken;
  await setEbayToken(token);
}

async function refreshAccessToken(creds: EbayCredentials, refreshToken: string): Promise<EbayOAuthToken> {
  const token = await tokenRequest(creds, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: SCOPES,
  });
  token.refreshToken = token.refreshToken || refreshToken;
  await setEbayToken(token);
  return token;
}

export async function getValidAccessToken(): Promise<string> {
  const creds = await getEbayCredentials();
  if (!creds) throw new EbayNotConfiguredError("eBay credentials are not configured.");
  const stored = await getEbayToken();
  if (!stored) throw new EbayNotConnectedError("eBay account is not connected yet.");
  if (stored.expiresAt - 60_000 > Date.now()) return stored.accessToken;
  const refreshed = await refreshAccessToken(creds, stored.refreshToken);
  return refreshed.accessToken;
}

export interface EbayListing {
  itemId: string;
  title: string;
  price: number | null;
  currency: string | null;
  quantity: number | null;
  viewUrl: string | null;
}

/** Fetches the seller's active listings via the Trading API (GetMyeBaySelling). */
export async function getMyActiveListings(): Promise<EbayListing[]> {
  const creds = await getEbayCredentials();
  if (!creds) throw new EbayNotConfiguredError("eBay credentials are not configured.");
  const accessToken = await getValidAccessToken();

  const devId = (await getSetting(SETTING_KEYS.ebayDevId)) || "";
  const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<GetMyeBaySellingRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <ActiveList>
    <Include>true</Include>
    <Pagination>
      <EntriesPerPage>100</EntriesPerPage>
      <PageNumber>1</PageNumber>
    </Pagination>
  </ActiveList>
</GetMyeBaySellingRequest>`;

  const res = await fetch(`${apiBase(creds.env)}/ws/api.dll`, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      "X-EBAY-API-SITEID": "3", // UK
      "X-EBAY-API-COMPATIBILITY-LEVEL": "1247",
      "X-EBAY-API-CALL-NAME": "GetMyeBaySelling",
      "X-EBAY-API-APP-NAME": creds.appId,
      "X-EBAY-API-DEV-NAME": devId,
      "X-EBAY-API-CERT-NAME": creds.certId,
      "X-EBAY-API-IAF-TOKEN": accessToken,
    },
    body: xmlBody,
  });

  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const root = parsed?.GetMyeBaySellingResponse;
  if (!root) throw new Error("Unexpected response from eBay Trading API.");
  if (root.Ack === "Failure") {
    const msg = root.Errors?.LongMessage || root.Errors?.ShortMessage || "eBay Trading API call failed.";
    throw new Error(String(msg));
  }

  let items = root.ActiveList?.ItemArray?.Item ?? [];
  if (!Array.isArray(items)) items = [items];

  return items.map((item: Record<string, unknown>): EbayListing => {
    const priceNode = (item.SellingStatus as Record<string, unknown> | undefined)?.CurrentPrice as
      | { "#text"?: string; "@_currencyID"?: string }
      | undefined;
    return {
      itemId: String(item.ItemID ?? ""),
      title: String(item.Title ?? ""),
      price: priceNode?.["#text"] ? Number(priceNode["#text"]) : null,
      currency: priceNode?.["@_currencyID"] ?? null,
      quantity: item.Quantity ? Number(item.Quantity) : null,
      viewUrl: (item.ListingDetails as Record<string, unknown> | undefined)?.ViewItemURL as string | null ?? null,
    };
  });
}
