import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { estimateLaptopPrice, PricingAgentError } from "@/app/lib/pricingAgent";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  let laptopId: string | undefined;
  try {
    const body = await request.json();
    laptopId = body?.laptopId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!laptopId) {
    return NextResponse.json({ error: "laptopId is required" }, { status: 400 });
  }

  const laptop = await prisma.laptop.findUnique({ where: { id: laptopId } });
  if (!laptop) {
    return NextResponse.json({ error: "Laptop not found" }, { status: 404 });
  }

  try {
    const result = await estimateLaptopPrice(laptop);
    const estimate = await prisma.priceEstimate.create({
      data: {
        laptopId: laptop.id,
        averagePrice: result.averagePrice,
        lowPrice: result.lowPrice,
        highPrice: result.highPrice,
        sampleSize: result.sampleSize,
        summary: result.summary,
        sources: JSON.stringify(result.sources),
      },
    });
    revalidatePath("/pricing");
    revalidatePath(`/stock/${laptop.id}`);
    return NextResponse.json({ estimate });
  } catch (err) {
    if (err instanceof PricingAgentError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error("Pricing agent failed", err);
    return NextResponse.json(
      { error: "The pricing agent request failed. Check your Anthropic API key and try again." },
      { status: 502 },
    );
  }
}
