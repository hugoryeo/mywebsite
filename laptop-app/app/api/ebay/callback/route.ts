import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForToken } from "@/app/lib/ebay";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  const url = new URL("/ebay", request.nextUrl.origin);

  if (error) {
    url.searchParams.set("ebay_error", error);
    return NextResponse.redirect(url);
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("ebay_oauth_state")?.value;
  cookieStore.delete("ebay_oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) {
    url.searchParams.set("ebay_error", "OAuth state mismatch — please try connecting again.");
    return NextResponse.redirect(url);
  }

  try {
    await exchangeCodeForToken(code);
    url.searchParams.set("ebay_connected", "1");
  } catch (err) {
    url.searchParams.set("ebay_error", err instanceof Error ? err.message : "Failed to connect eBay account.");
  }

  return NextResponse.redirect(url);
}
