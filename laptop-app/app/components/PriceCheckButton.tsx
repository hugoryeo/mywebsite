"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/app/lib/laptop";

interface EstimateResult {
  averagePrice: number;
  lowPrice: number | null;
  highPrice: number | null;
  sampleSize: number | null;
  summary: string;
}

export default function PriceCheckButton({ laptopId }: { laptopId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EstimateResult | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/pricing/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ laptopId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data.estimate);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="btn-navy self-start px-4 py-2 text-sm font-semibold"
      >
        {loading ? "Searching eBay sold listings…" : "🔎 Run AI Price Check"}
      </button>
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
      {result && (
        <div className="rounded-lg border border-navy-100 bg-navy-50 p-4">
          <div className="text-xl font-bold text-navy-900">{money(result.averagePrice)}</div>
          {(result.lowPrice != null || result.highPrice != null) && (
            <div className="text-sm text-navy-400">
              range {money(result.lowPrice)} – {money(result.highPrice)}
              {result.sampleSize ? ` · ${result.sampleSize} sold listings` : ""}
            </div>
          )}
          <p className="mt-2 text-sm text-navy-700">{result.summary}</p>
        </div>
      )}
    </div>
  );
}
