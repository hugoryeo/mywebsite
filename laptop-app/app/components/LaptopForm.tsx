"use client";

import { useState } from "react";
import type { Laptop } from "@/app/generated/prisma/client";

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
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 ${span ? "sm:col-span-2" : ""}`}>
      <label htmlFor={htmlFor} className="corp-label">
        {label}
      </label>
      {children}
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

      <div className="corp-panel p-6">
        <h2 className="corp-heading mb-4 text-lg">Specifications</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Year" htmlFor="year">
            <input id="year" name="year" type="number" min="1990" max="2100" defaultValue={initial?.year ?? ""} className={inputClass} placeholder="e.g. 2021" />
          </Field>
          <Field label="Processor" htmlFor="processor">
            <input id="processor" name="processor" defaultValue={initial?.processor ?? ""} className={inputClass} placeholder="e.g. Apple M1 / i5-1135G7" />
          </Field>
          <Field label="RAM" htmlFor="ram">
            <input id="ram" name="ram" defaultValue={initial?.ram ?? ""} className={inputClass} placeholder="e.g. 16GB" />
          </Field>
          <Field label="Storage" htmlFor="storage">
            <input id="storage" name="storage" defaultValue={initial?.storage ?? ""} className={inputClass} placeholder="e.g. 512GB SSD" />
          </Field>
          {brandOs === "windows" && (
            <Field label="Resolution" htmlFor="resolution">
              <input id="resolution" name="resolution" defaultValue={initial?.resolution ?? ""} className={inputClass} placeholder="e.g. 1920x1080" />
            </Field>
          )}
          <Field label="Cycle Count" htmlFor="cycleCount">
            <input id="cycleCount" name="cycleCount" type="number" min="0" defaultValue={initial?.cycleCount ?? ""} className={inputClass} placeholder="e.g. 120" />
          </Field>
          {brandOs === "apple" && (
            <Field label="Battery Health (%)" htmlFor="batteryHealth">
              <input id="batteryHealth" name="batteryHealth" type="number" min="0" max="100" defaultValue={initial?.batteryHealth ?? ""} className={inputClass} placeholder="e.g. 92" />
            </Field>
          )}
          <Field label="Model Number" htmlFor="modelNumber">
            <input id="modelNumber" name="modelNumber" defaultValue={initial?.modelNumber ?? ""} className={inputClass} placeholder="e.g. A2338" />
          </Field>
          <Field label="Charger Included" htmlFor="hasCharger">
            <label className="input-corp flex h-[38px] cursor-pointer items-center gap-2 px-3 text-sm">
              <input id="hasCharger" name="hasCharger" type="checkbox" defaultChecked={initial?.hasCharger ?? false} className="h-4 w-4 accent-[color:var(--color-corp-red)]" />
              Included
            </label>
          </Field>
        </div>
      </div>

      <div className="corp-panel p-6">
        <h2 className="corp-heading mb-4 text-lg">Origin &amp; Notes</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Where did this laptop come from?" htmlFor="source" span>
            <input id="source" name="source" defaultValue={initial?.source ?? ""} className={inputClass} placeholder="e.g. Trade-in, auction lot #4, supplier name" />
          </Field>
          <Field label="Additional Notes" htmlFor="notes" span>
            <textarea id="notes" name="notes" defaultValue={initial?.notes ?? ""} className={`${inputClass} min-h-20`} placeholder="Cosmetic condition, missing keys, anything else worth flagging" />
          </Field>
        </div>
      </div>

      <div className="corp-panel p-6">
        <h2 className="corp-heading mb-4 text-lg">Pricing</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cost (£)" htmlFor="cost">
            <input id="cost" name="cost" type="number" min="0" step="0.01" defaultValue={initial?.cost ?? ""} className={inputClass} placeholder="0.00" />
          </Field>
          <Field label="Asking Price (£)" htmlFor="price">
            <input id="price" name="price" type="number" min="0" step="0.01" defaultValue={initial?.price ?? ""} className={inputClass} placeholder="0.00" />
          </Field>
        </div>
      </div>

      <button type="submit" className="btn-corp self-start px-6 py-2.5 text-xs">
        {submitLabel}
      </button>
    </form>
  );
}
