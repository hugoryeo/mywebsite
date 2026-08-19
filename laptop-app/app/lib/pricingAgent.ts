import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Laptop } from "@/app/generated/prisma/client";
import { getSetting, SETTING_KEYS } from "./settings";

const PriceEstimateSchema = z.object({
  averagePrice: z.number().describe("Average sold price in GBP for comparable listings"),
  lowPrice: z.number().nullable().describe("Lowest comparable sold price found, GBP"),
  highPrice: z.number().nullable().describe("Highest comparable sold price found, GBP"),
  sampleSize: z.number().int().describe("How many comparable sold listings were used"),
  summary: z
    .string()
    .describe(
      "2-4 sentence explanation of the estimate: what was compared, how condition/specs affected price, and any caveats",
    ),
  sources: z
    .array(
      z.object({
        title: z.string(),
        price: z.number().nullable(),
        url: z.string(),
      }),
    )
    .describe("The sold listings used to compute the estimate"),
});

export type PriceEstimateResult = z.infer<typeof PriceEstimateSchema>;

function laptopSpecText(l: Laptop): string {
  const brand = l.brandOs === "apple" ? "Apple" : l.brand || "Windows";
  const lines = [
    `Brand: ${brand}`,
    l.year ? `Year: ${l.year}` : null,
    l.processor ? `Processor: ${l.processor}` : null,
    l.ram ? `RAM: ${l.ram}` : null,
    l.storage ? `Storage: ${l.storage}` : null,
    l.brandOs === "windows" && l.resolution ? `Screen resolution: ${l.resolution}` : null,
    l.modelNumber ? `Model number: ${l.modelNumber}` : null,
    l.cycleCount != null ? `Battery cycle count: ${l.cycleCount}` : null,
    l.brandOs === "apple" && l.batteryHealth != null ? `Battery health: ${l.batteryHealth}%` : null,
    `Charger included: ${l.hasCharger ? "yes" : "no"}`,
    l.notes ? `Condition notes: ${l.notes}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export class PricingAgentError extends Error {}

export async function estimateLaptopPrice(laptop: Laptop): Promise<PriceEstimateResult> {
  const apiKey = await getSetting(SETTING_KEYS.anthropicApiKey);
  if (!apiKey) {
    throw new PricingAgentError(
      "No Anthropic API key configured. Add one on the Settings page to enable AI price checks.",
    );
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.parse(
    {
      model: "claude-opus-5",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: zodOutputFormat(PriceEstimateSchema) },
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
      system:
        "You are a pricing analyst for a used-laptop resale business. Given a laptop's specs and condition, " +
        "search the web for eBay UK SOLD / COMPLETED listings (site:ebay.co.uk, filtered to sold & completed items) " +
        "for directly comparable laptops — same or very similar processor, RAM, storage, and condition. " +
        "Prefer recent sales. Convert any non-GBP prices to GBP. Weigh condition factors (battery health, cycle count, " +
        "cosmetic notes, charger included) when judging comparability. If you cannot find enough sold listings, use the " +
        "closest available data and say so plainly in the summary, lowering sampleSize accordingly.",
      messages: [
        {
          role: "user",
          content: `Estimate the current resale value of this laptop based on real eBay sold listings:\n\n${laptopSpecText(laptop)}`,
        },
      ],
    },
    { timeout: 180_000 },
  );

  if (!response.parsed_output) {
    throw new PricingAgentError("The pricing agent did not return a usable estimate. Try again.");
  }

  return response.parsed_output;
}
