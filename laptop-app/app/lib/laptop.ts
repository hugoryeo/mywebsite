import type { Laptop } from "@/app/generated/prisma/client";

export function money(n: number | null | undefined): string {
  const v = n ?? 0;
  return (v < 0 ? "-£" : "£") + Math.abs(v).toFixed(2);
}

/** Realized profit for a sold laptop; null while still in stock. */
export function profitOf(l: Pick<Laptop, "sold" | "soldPrice" | "cost" | "shipping" | "fees">): number | null {
  if (!l.sold || l.soldPrice == null) return null;
  return l.soldPrice - (l.cost ?? 0) - (l.shipping ?? 0) - (l.fees ?? 0);
}

export const STATUS_STAGES = [
  { key: "statusReset", label: "Reset" },
  { key: "statusCleaned", label: "Cleaned" },
  { key: "statusPrepared", label: "Prepared" },
  { key: "statusListed", label: "Listed" },
] as const;

export type StatusKey = (typeof STATUS_STAGES)[number]["key"];

export function specSummary(
  l: Pick<Laptop, "brandOs" | "brand" | "processor" | "ram" | "storage" | "colour" | "gpuCores">,
): string {
  const parts = [
    l.brandOs === "apple" ? "Apple" : l.brand || "Windows",
    l.processor,
    l.gpuCores ? `${l.gpuCores}c GPU` : null,
    l.ram,
    l.storage,
    l.colour,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function displayTitle(
  l: Pick<Laptop, "brandOs" | "brand" | "modelNumber" | "year" | "macType" | "screenSize">,
): string {
  // A recognised MacBook reads better as "MacBook Pro 14"" than "Apple A2442".
  if (l.brandOs === "apple" && l.macType) {
    return [`MacBook ${l.macType}`, l.screenSize, l.year ? String(l.year) : null, l.modelNumber]
      .filter(Boolean)
      .join(" ");
  }
  const brand = l.brandOs === "apple" ? "Apple" : l.brand || "Windows";
  const bits = [brand, l.year ? String(l.year) : null, l.modelNumber].filter(Boolean);
  return bits.join(" ") || "Untitled laptop";
}
