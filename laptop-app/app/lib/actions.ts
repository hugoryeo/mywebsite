"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { STATUS_STAGES, type StatusKey } from "./laptop";
import { SETTING_KEYS, setSetting } from "./settings";
import { Prisma, type BrandOs } from "@/app/generated/prisma/client";
import { lookupAppleModel, normaliseModelNumber } from "./appleModels";
import { generateRefCode } from "./refCode";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}
function num(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function int(formData: FormData, key: string): number | null {
  const n = num(formData, key);
  return n === null ? null : Math.round(n);
}

function revalidateEverywhere(id?: string) {
  revalidatePath("/");
  revalidatePath("/stock");
  revalidatePath("/analytics");
  revalidatePath("/pricing");
  if (id) revalidatePath(`/stock/${id}`);
}

/**
 * Spec fields shared by create and update. For Apple we re-resolve the model
 * number against the reference data server-side rather than trusting the
 * hidden inputs, so the stored chassis details always match the A-number.
 */
function specData(formData: FormData, brandOs: BrandOs) {
  const isApple = brandOs === "apple";
  const rawModel = str(formData, "modelNumber");
  const modelNumber = isApple && rawModel ? normaliseModelNumber(rawModel) : rawModel;
  const appleModel = isApple ? lookupAppleModel(modelNumber) : null;

  return {
    year: int(formData, "year"),
    processor: str(formData, "processor"),
    ram: str(formData, "ram"),
    storage: str(formData, "storage"),
    resolution: isApple ? null : str(formData, "resolution"),
    cycleCount: int(formData, "cycleCount"),
    batteryHealth: isApple ? int(formData, "batteryHealth") : null,
    modelNumber,
    hasCharger: formData.get("hasCharger") === "on",
    notes: str(formData, "notes"),
    source: str(formData, "source"),
    cost: num(formData, "cost"),
    price: num(formData, "price"),
    serialNumber: str(formData, "serialNumber"),
    colour: str(formData, "colour"),
    condition: str(formData, "condition"),
    chargerWattage: str(formData, "chargerWattage"),
    cpuCores: int(formData, "cpuCores"),
    gpuCores: int(formData, "gpuCores"),
    screenSize: appleModel?.screenSize ?? str(formData, "screenSize"),
    macType: appleModel?.family ?? (isApple ? str(formData, "macType") : null),
  };
}

export async function createLaptop(formData: FormData): Promise<void> {
  const brandOs = (str(formData, "brandOs") ?? "windows") as BrandOs;
  if (brandOs !== "apple" && brandOs !== "windows") {
    throw new Error("Invalid brand OS");
  }

  const data = {
    brandOs,
    brand: brandOs === "windows" ? str(formData, "brand") : null,
    ...specData(formData, brandOs),
  };

  const laptop = await createWithFreshRefCode(data);

  revalidateEverywhere(laptop.id);
  redirect("/stock");
}

/**
 * Inserts a laptop under a newly generated reference code.
 *
 * Reference codes are random, so a collision is possible in principle. The
 * unique index is what actually guarantees uniqueness — retry on the
 * constraint rather than checking first, which would leave a race between the
 * check and the insert.
 */
async function createWithFreshRefCode(
  data: Omit<Prisma.LaptopUncheckedCreateInput, "refCode">
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.laptop.create({
        data: { ...data, refCode: generateRefCode() },
      });
    } catch (err) {
      const isDuplicateRefCode =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!isDuplicateRefCode) throw err;
    }
  }
  throw new Error("Could not allocate a unique reference code. Please try again.");
}

/**
 * Copies a laptop's specs onto a new record with its own reference code, and
 * opens it for editing.
 *
 * This is for the case the shop actually hits: several of the same machine
 * bought together. Everything that describes the *model* carries over;
 * everything that describes the *individual unit* does not, because a
 * duplicate is a different physical laptop.
 */
export async function duplicateLaptop(id: string): Promise<void> {
  const source = await prisma.laptop.findUnique({ where: { id } });
  if (!source) throw new Error("Laptop not found");

  const {
    // Prisma assigns these.
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    // The whole point: the copy is its own laptop, so it gets its own code.
    refCode: _refCode,
    // Identifies one physical machine. Two records sharing a serial would be
    // straightforwardly false.
    serialNumber: _serialNumber,
    // Measured per unit, and the cycle count is printed verbatim into the
    // listing description — carrying one over would publish a wrong spec.
    cycleCount: _cycleCount,
    batteryHealth: _batteryHealth,
    // A copy is unsold stock that hasn't been through prep yet.
    statusReset: _statusReset,
    statusCleaned: _statusCleaned,
    statusPrepared: _statusPrepared,
    statusListed: _statusListed,
    sold: _sold,
    soldPrice: _soldPrice,
    shipping: _shipping,
    fees: _fees,
    soldAt: _soldAt,
    // Spread rather than list the rest, so a spec field added to the schema
    // later is carried over without anyone having to remember to add it here.
    ...specs
  } = source;

  const copy = await createWithFreshRefCode(specs);

  revalidateEverywhere(copy.id);
  redirect(`/stock/${copy.id}`);
}

export async function updateLaptop(id: string, formData: FormData): Promise<void> {
  const existing = await prisma.laptop.findUniqueOrThrow({ where: { id } });
  const brandOs = existing.brandOs;

  await prisma.laptop.update({
    where: { id },
    data: {
      brand: brandOs === "windows" ? str(formData, "brand") : null,
      ...specData(formData, brandOs),
    },
  });

  revalidateEverywhere(id);
  redirect(`/stock/${id}`);
}

export async function toggleStatus(id: string, key: StatusKey): Promise<void> {
  if (!STATUS_STAGES.some((s) => s.key === key)) throw new Error("Invalid status key");
  const laptop = await prisma.laptop.findUniqueOrThrow({ where: { id } });
  await prisma.laptop.update({
    where: { id },
    data: { [key]: !laptop[key] },
  });
  revalidateEverywhere(id);
}

export async function markSold(id: string, formData: FormData): Promise<void> {
  const soldPrice = num(formData, "soldPrice");
  if (soldPrice === null || soldPrice < 0) {
    throw new Error("A valid sale price is required");
  }
  await prisma.laptop.update({
    where: { id },
    data: {
      sold: true,
      soldPrice,
      shipping: num(formData, "shipping") ?? 0,
      fees: num(formData, "fees") ?? 0,
      soldAt: new Date(),
    },
  });
  revalidateEverywhere(id);
  redirect("/stock");
}

export async function markUnsold(id: string): Promise<void> {
  await prisma.laptop.update({
    where: { id },
    data: { sold: false, soldPrice: null, shipping: null, fees: null, soldAt: null },
  });
  revalidateEverywhere(id);
}

export async function deleteLaptop(id: string): Promise<void> {
  await prisma.laptop.delete({ where: { id } });
  revalidateEverywhere();
  redirect("/stock");
}

export async function saveSettings(formData: FormData): Promise<void> {
  const value = str(formData, "anthropicApiKey");
  // Blank input = "leave unchanged" (the field displays masked, not the real value).
  if (value !== null) await setSetting(SETTING_KEYS.anthropicApiKey, value);

  revalidatePath("/settings");
  revalidatePath("/pricing");
}
