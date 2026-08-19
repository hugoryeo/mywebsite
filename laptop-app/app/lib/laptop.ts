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

export function specSummary(l: Pick<Laptop, "brandOs" | "brand" | "processor" | "ram" | "storage">): string {
  const parts = [
    l.brandOs === "apple" ? "Apple" : l.brand || "Windows",
    l.processor,
    l.ram,
    l.storage,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function displayTitle(l: Pick<Laptop, "brandOs" | "brand" | "modelNumber" | "year">): string {
  const brand = l.brandOs === "apple" ? "Apple" : l.brand || "Windows";
  const bits = [brand, l.year ? String(l.year) : null, l.modelNumber].filter(Boolean);
  return bits.join(" ") || "Untitled laptop";
}
