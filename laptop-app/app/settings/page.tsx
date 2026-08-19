import { SETTING_KEYS, getSettings, maskSecret, getEbayToken } from "@/app/lib/settings";
import { saveSettings, disconnectEbay } from "@/app/lib/actions";

export const dynamic = "force-dynamic";

const inputClass = "input-navy w-full px-3 py-2 text-sm";

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
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="mt-1 text-navy-400">
          API credentials for the eBay listings menu and the AI pricing agent. Stored locally in this
          app&rsquo;s database — nothing is sent anywhere except eBay and Anthropic&rsquo;s APIs.
        </p>
      </div>

      {ebay_error && (
        <div className="panel-3d panel-3d-static border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {ebay_error}
        </div>
      )}

      <form action={saveSettings} className="flex flex-col gap-6">
        <div className="panel-3d panel-3d-static p-6">
          <h2 className="mb-1 text-lg font-bold text-navy-900">AI Pricing Agent</h2>
          <p className="mb-4 text-sm text-navy-400">
            An Anthropic API key, used by the Pricing page to search the web for comparable eBay sold
            listings.
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor="anthropicApiKey" className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
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
            <p className="text-xs text-navy-400">Leave blank to keep the current key.</p>
          </div>
        </div>

        <div className="panel-3d panel-3d-static p-6">
          <h2 className="mb-1 text-lg font-bold text-navy-900">eBay API</h2>
          <p className="mb-4 text-sm text-navy-400">
            From your{" "}
            <span className="font-medium">eBay Developer Program</span> application: the App ID (Client
            ID), Cert ID (Client Secret), optional Dev ID, and the RuName (redirect URL name) you
            registered pointing at{" "}
            <code className="rounded bg-navy-50 px-1 py-0.5">/api/ebay/callback</code> on this app&rsquo;s
            URL.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="ebayAppId" className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
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
              <label htmlFor="ebayCertId" className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
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
              <label htmlFor="ebayDevId" className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
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
              <label htmlFor="ebayRuName" className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
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
              <label htmlFor="ebayEnvironment" className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
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

          <div className="mt-4 flex items-center gap-3 border-t border-navy-100 pt-4">
            <span className="text-sm text-navy-500">
              eBay account: {ebayToken ? <span className="font-semibold text-emerald-600">connected</span> : <span className="font-semibold text-navy-400">not connected</span>}
            </span>
            {ebayToken && (
              <form action={disconnectEbay}>
                <button type="submit" className="btn-outline-navy px-3 py-1.5 text-xs font-semibold">
                  Disconnect
                </button>
              </form>
            )}
          </div>
        </div>

        <button type="submit" className="btn-navy self-start px-6 py-2.5 text-sm font-semibold">
          Save Settings
        </button>
      </form>
    </div>
  );
}
