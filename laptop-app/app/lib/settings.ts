import { prisma } from "./prisma";

export const SETTING_KEYS = {
  anthropicApiKey: "anthropic_api_key",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export async function getSetting(key: SettingKey): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getSettings(
  keys: SettingKey[],
): Promise<Record<string, string | null>> {
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const out: Record<string, string | null> = {};
  for (const key of keys) out[key] = map.get(key) ?? null;
  return out;
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}


/** Renders a stored credential for display without revealing it. */
export function maskSecret(value: string | null): string {
  if (!value) return "";
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 4)}${"•".repeat(6)}${value.slice(-4)}`;
}
