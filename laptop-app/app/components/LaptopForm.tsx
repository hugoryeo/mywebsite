"use client";

import { useMemo, useState } from "react";
import type { Laptop } from "@/app/generated/prisma/client";
import {
  APPLE_MODEL_NUMBERS,
  CONDITIONS,
  chipKey,
  findChip,
  lookupAppleModel,
} from "@/app/lib/appleModels";

const WINDOWS_BRANDS = [
  "Dell",
  "HP",
  "Lenovo",
  "Asus",
  "Acer",
  "Microsoft",
  "Toshiba",
  "Samsung",
  "MSI",
  "Other",
];

function Field({
  label,
  htmlFor,
  children,
  span,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  span?: boolean;
  hint?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${span ? "sm:col-span-2" : ""}`}>
      <label htmlFor={htmlFor} className="corp-label">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-corp-500">{hint}</p>}
    </div>
  );
}

const inputClass = "input-corp w-full px-3 py-2 text-sm";

export default function LaptopForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  initial?: Laptop;
  submitLabel: string;
}) {
  const [brandOs, setBrandOs] = useState<"apple" | "windows">(initial?.brandOs ?? "windows");
  const [modelNumber, setModelNumber] = useState(initial?.modelNumber ?? "");

  // Resolved MacBook reference data for the model number typed above.
  const appleModel = useMemo(
    () => (brandOs === "apple" ? lookupAppleModel(modelNumber) : null),
    [brandOs, modelNumber],
  );

  // Chip selection drives which RAM / storage / GPU-core options exist.
  const initialChipKey =
    initial?.processor && initial?.cpuCores
      ? `${initial.processor} · ${initial.cpuCores}c CPU`
      : (initial?.processor ?? "");
  const [chipSel, setChipSel] = useState(initialChipKey);

  const chip = appleModel ? findChip(appleModel, chipSel) ?? appleModel.chips[0] : null;
  const activeChipKey = chip ? chipKey(chip) : "";

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="corp-panel p-6">
        <h2 className="corp-heading mb-4 text-lg">Operating System</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Brand" htmlFor="brandOs">
            <select
              id="brandOs"
              name="brandOs"
              className={inputClass}
              value={brandOs}
              onChange={(e) => setBrandOs(e.target.value as "apple" | "windows")}
            >
              <option value="windows">Windows</option>
              <option value="apple">Apple</option>
            </select>
          </Field>
          {brandOs === "windows" && (
            <Field label="Manufacturer" htmlFor="brand">
              <input
                id="brand"
                name="brand"
                list="windows-brands"
                defaultValue={initial?.brand ?? ""}
                className={inputClass}
                placeholder="e.g. Dell"
              />
              <datalist id="windows-brands">
                {WINDOWS_BRANDS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </Field>
          )}
        </div>
      </div>

      {/* ---------------- APPLE: model number drives everything ---------------- */}
      {brandOs === "apple" && (
        <div className="corp-panel p-6">
          <h2 className="corp-heading mb-1.5 text-lg">Model Number</h2>
          <p className="mb-5 text-[12px] leading-relaxed text-corp-400">
            The A-number on the underside of the case. Enter it and the spec fields below become
            dropdowns limited to the configurations Apple shipped for that model.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Model Number" htmlFor="modelNumber">
              <input
                id="modelNumber"
                name="modelNumber"
                list="apple-model-numbers"
                value={modelNumber}
                onChange={(e) => {
                  setModelNumber(e.target.value);
                  setChipSel("");
                }}
                className={inputClass}
                placeholder="e.g. A2338"
                autoComplete="off"
              />
              <datalist id="apple-model-numbers">
                {APPLE_MODEL_NUMBERS.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </Field>
            <div className="flex items-end pb-1">
              {appleModel ? (
                <p className="text-[12px] text-corp-300">
                  <span className="text-corp-accent-bright">✓ Recognised</span> — MacBook{" "}
                  {appleModel.family} {appleModel.screenSize} ({appleModel.year})
                </p>
              ) : modelNumber.trim() ? (
                <p className="text-[12px] text-corp-500">
                  Not in the reference data — fill the spec fields in by hand below.
                </p>
              ) : null}
            </div>
          </div>

          {/* carry the resolved chassis details through to the server action */}
          {appleModel && (
            <>
              <input type="hidden" name="macType" value={appleModel.family} />
              <input type="hidden" name="screenSize" value={appleModel.screenSize} />
            </>
          )}
        </div>
      )}

      <div className="corp-panel p-6">
        <h2 className="corp-heading mb-4 text-lg">Specifications</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Year" htmlFor="year">
            <input
              id="year"
              name="year"
              type="number"
              min="1990"
              max="2100"
              defaultValue={initial?.year ?? ""}
              className={inputClass}
              placeholder={appleModel ? appleModel.year : "e.g. 2021"}
            />
          </Field>

          {/* Processor: dropdown when the model is known, free text otherwise */}
          {appleModel ? (
            <Field label="Processor" htmlFor="chipSel">
              <select
                id="chipSel"
                className={inputClass}
                value={activeChipKey}
                onChange={(e) => setChipSel(e.target.value)}
              >
                {appleModel.chips.map((c) => (
                  <option key={chipKey(c)} value={chipKey(c)}>
                    {chipKey(c)}
                  </option>
                ))}
              </select>
              {/* the plain chip name is what lands in the listing title */}
              <input type="hidden" name="processor" value={chip?.name ?? ""} />
              {chip?.cpuCores && (
                <input type="hidden" name="cpuCores" value={chip.cpuCores} />
              )}
            </Field>
          ) : (
            <Field label="Processor" htmlFor="processor">
              <input
                id="processor"
                name="processor"
                defaultValue={initial?.processor ?? ""}
                className={inputClass}
                placeholder="e.g. Apple M1 / i5-1135G7"
              />
            </Field>
          )}

          {/* GPU cores — only meaningful on Apple silicon */}
          {chip?.gpuCores && chip.gpuCores.length > 0 && (
            <Field label="GPU Cores" htmlFor="gpuCores">
              <select
                id="gpuCores"
                name="gpuCores"
                className={inputClass}
                defaultValue={initial?.gpuCores ?? chip.gpuCores[0]}
              >
                {chip.gpuCores.map((g) => (
                  <option key={g} value={g}>
                    {g}-core GPU
                  </option>
                ))}
              </select>
            </Field>
          )}

          {appleModel && chip ? (
            <Field label="RAM" htmlFor="ram">
              <select
                id="ram"
                name="ram"
                className={inputClass}
                defaultValue={initial?.ram ?? chip.ram[0]}
              >
                {chip.ram.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="RAM" htmlFor="ram">
              <input
                id="ram"
                name="ram"
                defaultValue={initial?.ram ?? ""}
                className={inputClass}
                placeholder="e.g. 16GB"
              />
            </Field>
          )}

          {appleModel && chip ? (
            <Field label="Storage" htmlFor="storage">
              <select
                id="storage"
                name="storage"
                className={inputClass}
                defaultValue={initial?.storage ?? chip.storage[0]}
              >
                {chip.storage.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Storage" htmlFor="storage">
              <input
                id="storage"
                name="storage"
                defaultValue={initial?.storage ?? ""}
                className={inputClass}
                placeholder="e.g. 512GB SSD"
              />
            </Field>
          )}

          {appleModel ? (
            <Field label="Colour" htmlFor="colour">
              <select
                id="colour"
                name="colour"
                className={inputClass}
                defaultValue={initial?.colour ?? appleModel.colours[0]}
              >
                {appleModel.colours.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Colour" htmlFor="colour">
              <input
                id="colour"
                name="colour"
                defaultValue={initial?.colour ?? ""}
                className={inputClass}
                placeholder="e.g. Space Grey"
              />
            </Field>
          )}

          {brandOs === "windows" && (
            <Field label="Resolution" htmlFor="resolution">
              <input
                id="resolution"
                name="resolution"
                defaultValue={initial?.resolution ?? ""}
                className={inputClass}
                placeholder="e.g. 1920x1080"
              />
            </Field>
          )}

          <Field label="Cycle Count" htmlFor="cycleCount">
            <input
              id="cycleCount"
              name="cycleCount"
              type="number"
              min="0"
              defaultValue={initial?.cycleCount ?? ""}
              className={inputClass}
              placeholder="e.g. 120"
            />
          </Field>

          {brandOs === "apple" && (
            <Field label="Battery Health (%)" htmlFor="batteryHealth">
              <input
                id="batteryHealth"
                name="batteryHealth"
                type="number"
                min="0"
                max="100"
                defaultValue={initial?.batteryHealth ?? ""}
                className={inputClass}
                placeholder="e.g. 92"
              />
            </Field>
          )}

          {/* Windows keeps a plain model-number box; Apple's lives above */}
          {brandOs === "windows" && (
            <Field label="Model Number" htmlFor="modelNumberWin">
              <input
                id="modelNumberWin"
                name="modelNumber"
                defaultValue={initial?.modelNumber ?? ""}
                className={inputClass}
                placeholder="e.g. Latitude 7420"
              />
            </Field>
          )}

          <Field label="Serial Number" htmlFor="serialNumber">
            <input
              id="serialNumber"
              name="serialNumber"
              defaultValue={initial?.serialNumber ?? ""}
              className={inputClass}
              placeholder="e.g. C02XY1234ABC"
              autoComplete="off"
            />
          </Field>

          <Field label="Condition" htmlFor="condition">
            <select
              id="condition"
              name="condition"
              className={inputClass}
              defaultValue={initial?.condition ?? "Good"}
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Charger Included" htmlFor="hasCharger">
            <label className="input-corp flex h-[38px] cursor-pointer items-center gap-2 px-3 text-sm">
              <input
                id="hasCharger"
                name="hasCharger"
                type="checkbox"
                defaultChecked={initial?.hasCharger ?? false}
                className="h-4 w-4 accent-[color:var(--color-corp-accent)]"
              />
              Included
            </label>
          </Field>

          {appleModel ? (
            <Field label="Charger Wattage" htmlFor="chargerWattage">
              <select
                id="chargerWattage"
                name="chargerWattage"
                className={inputClass}
                defaultValue={initial?.chargerWattage ?? appleModel.chargers[0]}
              >
                {appleModel.chargers.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Charger Wattage" htmlFor="chargerWattage">
              <input
                id="chargerWattage"
                name="chargerWattage"
                defaultValue={initial?.chargerWattage ?? ""}
                className={inputClass}
                placeholder="e.g. 67W"
              />
            </Field>
          )}
        </div>
      </div>

      <div className="corp-panel p-6">
        <h2 className="corp-heading mb-4 text-lg">Origin &amp; Notes</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Where did this laptop come from?" htmlFor="source" span>
            <input
              id="source"
              name="source"
              defaultValue={initial?.source ?? ""}
              className={inputClass}
              placeholder="e.g. Trade-in, auction lot #4, supplier name"
            />
          </Field>
          <Field label="Additional Notes" htmlFor="notes" span>
            <textarea
              id="notes"
              name="notes"
              defaultValue={initial?.notes ?? ""}
              className={`${inputClass} min-h-20`}
              placeholder="Cosmetic condition, missing keys, anything else worth flagging"
            />
          </Field>
        </div>
      </div>

      <div className="corp-panel p-6">
        <h2 className="corp-heading mb-4 text-lg">Pricing</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cost (£)" htmlFor="cost">
            <input
              id="cost"
              name="cost"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initial?.cost ?? ""}
              className={inputClass}
              placeholder="0.00"
            />
          </Field>
          <Field label="Asking Price (£)" htmlFor="price">
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initial?.price ?? ""}
              className={inputClass}
              placeholder="0.00"
            />
          </Field>
        </div>
      </div>

      <button type="submit" className="btn-corp self-start px-6 py-2.5 text-xs">
        {submitLabel}
      </button>
    </form>
  );
}
