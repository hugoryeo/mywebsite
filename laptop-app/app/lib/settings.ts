import { prisma } from "./prisma";

export const SETTING_KEYS = {
  anthropicApiKey: "anthropic_api_key",
  ebayAppId: "ebay_app_id",
  ebayCertId: "ebay_cert_id",
  ebayDevId: "ebay_dev_id",
  ebayRuName: "ebay_ru_name",
  ebayEnvironment: "ebay_environment", // "sandbox" | "production"
  ebayOAuthToken: "ebay_oauth_token", // JSON: { accessToken, refreshToken, expiresAt }
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

export async function deleteSetting(key: SettingKey): Promise<void> {
  await prisma.setting.deleteMany({ where: { key } });
}

export interface EbayOAuthToken {
  accessToken: string;
  refreshToken: string;
  /** epoch ms */
  expiresAt: number;
}

export async function getEbayToken(): Promise<EbayOAuthToken | null> {
  const raw = await getSetting(SETTING_KEYS.ebayOAuthToken);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EbayOAuthToken;
  } catch {
    return null;
  }
}

export async function setEbayToken(token: EbayOAuthToken): Promise<void> {
  await setSetting(SETTING_KEYS.ebayOAuthToken, JSON.stringify(token));
}

/** Masks a secret for display, e.g. "sk-ant-...wXyz". */
export function maskSecret(value: string | null): string {
  if (!value) return "";
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 4)}${"•".repeat(6)}${value.slice(-4)}`;
}
