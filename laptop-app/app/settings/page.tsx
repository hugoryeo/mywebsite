import { SETTING_KEYS, getSettings, maskSecret } from "@/app/lib/settings";
import { saveSettings } from "@/app/lib/actions";
import GlitchText from "@/app/components/GlitchText";

export const dynamic = "force-dynamic";

const inputClass = "input-corp w-full px-3 py-2 text-sm";

export default async function SettingsPage() {
  const values = await getSettings([SETTING_KEYS.anthropicApiKey]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <GlitchText text="Settings" as="h1" className="corp-heading text-[38px] leading-none" />
        <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-corp-400">
          Credentials for the AI pricing agent. Stored locally in this app&rsquo;s database — the key
          is sent nowhere except Anthropic&rsquo;s API.
        </p>
      </div>

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

        <button type="submit" className="btn-corp self-start px-6 py-2.5 text-xs">
          Save Settings
        </button>
      </form>
    </div>
  );
}
