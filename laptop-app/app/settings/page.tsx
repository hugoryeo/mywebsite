import { SETTING_KEYS, getSettings, maskSecret, getEbayToken } from "@/app/lib/settings";
import { saveSettings, disconnectEbay } from "@/app/lib/actions";
import GlitchText from "@/app/components/GlitchText";

export const dynamic = "force-dynamic";

const inputClass = "input-corp w-full px-3 py-2 text-sm";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ebay_error?: string }>;
}) {
  const { ebay_error } = await searchParams;
  const values = await getSettings([
    SETTING_KEYS.anthropicApiKey,
    SETTING_KEYS.ebayAppId,
    SETTING_KEYS.ebayCertId,
    SETTING_KEYS.ebayDevId,
    SETTING_KEYS.ebayRuName,
    SETTING_KEYS.ebayEnvironment,
  ]);
  const ebayToken = await getEbayToken();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <GlitchText text="Settings" as="h1" className="corp-heading text-[38px] leading-none" />
        <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-corp-400">
          API credentials for the eBay listings menu and the AI pricing agent. Stored locally in this
          app&rsquo;s database — nothing is sent anywhere except eBay and Anthropic&rsquo;s APIs.
        </p>
      </div>

      {ebay_error && (
        <div className="corp-panel border-corp-accent p-4 text-[13px] text-corp-accent-bright">
          {ebay_error}
        </div>
      )}

      <form action={saveSettings} className="flex flex-col gap-6">
        <div className="corp-panel p-6">
          <h2 className="corp-heading mb-1.5 text-lg">AI Pricing Agent</h2>
          <p className="mb-5 text-[12px] leading-relaxed text-corp-400">
            An Anthropic API key, used by the Pricing page to search the web for comparable eBay sold
            listings.
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor="anthropicApiKey" className="corp-label">
              Anthropic API Key
            </label>
            <input
              id="anthropicApiKey"
              name="anthropicApiKey"
              type="password"
              autoComplete="off"
              placeholder={values[SETTING_KEYS.anthropicApiKey] ? maskSecret(values[SETTING_KEYS.anthropicApiKey]) : "sk-ant-…"}
              className={inputClass}
            />
            <p className="text-[11px] text-corp-500">Leave blank to keep the current key.</p>
          </div>
        </div>

        <div className="corp-panel p-6">
          <h2 className="corp-heading mb-1.5 text-lg">eBay API</h2>
          <p className="mb-5 text-[12px] leading-relaxed text-corp-400">
            From your{" "}
            <span className="font-medium">eBay Developer Program</span> application: the App ID (Client
            ID), Cert ID (Client Secret), optional Dev ID, and the RuName (redirect URL name) you
            registered pointing at{" "}
            <code className="bg-corp-900 px-1.5 py-0.5 text-corp-300">/api/ebay/callback</code> on this app&rsquo;s
            URL.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="ebayAppId" className="corp-label">
                App ID (Client ID)
              </label>
              <input
                id="ebayAppId"
                name="ebayAppId"
                autoComplete="off"
                placeholder={values[SETTING_KEYS.ebayAppId] ? maskSecret(values[SETTING_KEYS.ebayAppId]) : "yourapp-PRD-..."}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="ebayCertId" className="corp-label">
                Cert ID (Client Secret)
              </label>
              <input
                id="ebayCertId"
                name="ebayCertId"
                type="password"
                autoComplete="off"
                placeholder={values[SETTING_KEYS.ebayCertId] ? maskSecret(values[SETTING_KEYS.ebayCertId]) : "PRD-..."}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="ebayDevId" className="corp-label">
                Dev ID (optional)
              </label>
              <input
                id="ebayDevId"
                name="ebayDevId"
                autoComplete="off"
                placeholder={values[SETTING_KEYS.ebayDevId] ? maskSecret(values[SETTING_KEYS.ebayDevId]) : "..."}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="ebayRuName" className="corp-label">
                RuName (redirect URL name)
              </label>
              <input
                id="ebayRuName"
                name="ebayRuName"
                autoComplete="off"
                placeholder={values[SETTING_KEYS.ebayRuName] ? maskSecret(values[SETTING_KEYS.ebayRuName]) : "your_app-RuName"}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="ebayEnvironment" className="corp-label">
                Environment
              </label>
              <select
                id="ebayEnvironment"
                name="ebayEnvironment"
                defaultValue={values[SETTING_KEYS.ebayEnvironment] ?? "production"}
                className={inputClass}
              >
                <option value="production">Production</option>
                <option value="sandbox">Sandbox</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 border-t border-[color:var(--corp-edge-soft)] pt-4">
            <span className="text-[12px] text-corp-400">
              eBay account: {ebayToken ? <span className="font-semibold text-corp-accent-bright">connected</span> : <span className="font-semibold text-corp-500">not connected</span>}
            </span>
            {ebayToken && (
              <form action={disconnectEbay}>
                <button type="submit" className="btn-corp-ghost px-3 py-1.5 text-[11px]">
                  Disconnect
                </button>
              </form>
            )}
          </div>
        </div>

        <button type="submit" className="btn-corp self-start px-6 py-2.5 text-xs">
          Save Settings
        </button>
      </form>
    </div>
  );
}
