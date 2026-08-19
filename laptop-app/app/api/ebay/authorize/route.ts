import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { getEbayCredentials, buildAuthorizeUrl } from "@/app/lib/ebay";

export async function GET(request: NextRequest) {
  const creds = await getEbayCredentials();
  if (!creds) {
    const url = new URL("/settings", request.nextUrl.origin);
    url.searchParams.set("ebay_error", "Add your eBay App ID, Cert ID, and RuName first.");
    return NextResponse.redirect(url);
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("ebay_oauth_state", state, {
    httpOnly: true,
    maxAge: 600,
    sameSite: "lax",
    path: "/",
  });

  const authorizeUrl = buildAuthorizeUrl(creds, state);
  return NextResponse.redirect(authorizeUrl);
}
