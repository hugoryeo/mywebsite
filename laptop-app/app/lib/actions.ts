"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { STATUS_STAGES, type StatusKey } from "./laptop";
import { SETTING_KEYS, setSetting, deleteSetting } from "./settings";
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

  // Reference codes are random, so a collision is possible in principle. The
  // unique index is what actually guarantees it — retry on the constraint
  // rather than checking first, which would leave a race between the check
  // and the insert.
  let laptop = null;
  for (let attempt = 0; attempt < 5 && !laptop; attempt++) {
    try {
      laptop = await prisma.laptop.create({
        data: { ...data, refCode: generateRefCode() },
      });
    } catch (err) {
      const isDuplicateRefCode =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!isDuplicateRefCode) throw err;
    }
  }
  if (!laptop) {
    throw new Error("Could not allocate a unique reference code. Please try again.");
  }

  revalidateEverywhere(laptop.id);
  redirect("/stock");
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
  const fields: [keyof typeof SETTING_KEYS, string][] = [
    ["anthropicApiKey", "anthropicApiKey"],
    ["ebayAppId", "ebayAppId"],
    ["ebayCertId", "ebayCertId"],
    ["ebayDevId", "ebayDevId"],
    ["ebayRuName", "ebayRuName"],
  ];
  for (const [settingKey, fieldName] of fields) {
    const value = str(formData, fieldName);
    // Blank input = "leave unchanged" (fields display masked, not real values).
    if (value !== null) await setSetting(SETTING_KEYS[settingKey], value);
  }
  const env = str(formData, "ebayEnvironment");
  if (env === "sandbox" || env === "production") {
    await setSetting(SETTING_KEYS.ebayEnvironment, env);
  }
  revalidatePath("/settings");
  revalidatePath("/ebay");
  revalidatePath("/pricing");
}

export async function disconnectEbay(): Promise<void> {
  await deleteSetting(SETTING_KEYS.ebayOAuthToken);
  revalidatePath("/settings");
  revalidatePath("/ebay");
}
