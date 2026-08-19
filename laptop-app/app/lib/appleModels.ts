/**
 * MacBook reference data, keyed by Apple model number (the "A-number" printed
 * on the underside of the case), covering models sold from 2019 onward.
 *
 * Used by the Add Laptop form: type an A-number with Apple selected and the
 * spec fields turn into dropdowns limited to the configurations Apple actually
 * shipped for that model.
 *
 * Sourced from Apple's published tech specs and identification pages. Apple's
 * own site could not be fetched directly from this environment, so figures were
 * cross-checked against spec databases via search — treat RAM/storage ceilings
 * and charger wattages on the newest models as the most likely to need a tweak.
 * Correcting or extending this file is the only change needed to fix a model:
 * nothing else hard-codes these values.
 *
 * Intel models have no Apple-silicon core counts, so `cpuCores` / `gpuCores`
 * are omitted for them and drop out of the generated listing title.
 */

export type MacFamily = "Air" | "Pro";

export interface ChipOption {
  /** Marketing name, e.g. "M1 Pro" or "Core i7". Goes straight into the title. */
  name: string;
  /** Apple-silicon CPU core count. Omitted on Intel. */
  cpuCores?: number;
  /** GPU core counts Apple shipped for this chip in this model. Omitted on Intel. */
  gpuCores?: number[];
  ram: string[];
  storage: string[];
}

export interface AppleModel {
  modelNumber: string;
  family: MacFamily;
  /** As buyers search for it — 13", 14", 15", 16". */
  screenSize: string;
  year: string;
  colours: string[];
  /** Power adapters Apple shipped with this model. */
  chargers: string[];
  chips: ChipOption[];
}

const SILVER_GREY = ["Silver", "Space Grey"];
const SILVER_GREY_GOLD = ["Silver", "Space Grey", "Gold"];
const AIR_M2_COLOURS = ["Midnight", "Starlight", "Space Grey", "Silver"];
const AIR_M4_COLOURS = ["Sky Blue", "Silver", "Starlight", "Midnight"];
const PRO_BLACK = ["Space Black", "Silver"];

const STORAGE_256_2TB = ["256GB", "512GB", "1TB", "2TB"];
const STORAGE_512_8TB = ["512GB", "1TB", "2TB", "4TB", "8TB"];

export const APPLE_MODELS: AppleModel[] = [
  /* ---------------- MacBook Air — Intel ---------------- */
  {
    modelNumber: "A1932",
    family: "Air",
    screenSize: '13"',
    year: "2018–2019",
    colours: SILVER_GREY_GOLD,
    chargers: ["30W"],
    chips: [
      {
        name: "Core i5",
        ram: ["8GB", "16GB"],
        storage: ["128GB", "256GB", "512GB", "1TB", "1.5TB"],
      },
    ],
  },
  {
    modelNumber: "A2179",
    family: "Air",
    screenSize: '13"',
    year: "2020",
    colours: SILVER_GREY_GOLD,
    chargers: ["30W"],
    chips: [
      { name: "Core i3", ram: ["8GB", "16GB"], storage: STORAGE_256_2TB },
      { name: "Core i5", ram: ["8GB", "16GB"], storage: STORAGE_256_2TB },
      { name: "Core i7", ram: ["8GB", "16GB"], storage: STORAGE_256_2TB },
    ],
  },

  /* ---------------- MacBook Air — Apple silicon ---------------- */
  {
    modelNumber: "A2337",
    family: "Air",
    screenSize: '13"',
    year: "2020",
    colours: SILVER_GREY_GOLD,
    chargers: ["30W"],
    chips: [
      {
        name: "M1",
        cpuCores: 8,
        gpuCores: [7, 8],
        ram: ["8GB", "16GB"],
        storage: STORAGE_256_2TB,
      },
    ],
  },
  {
    modelNumber: "A2681",
    family: "Air",
    screenSize: '13"',
    year: "2022",
    colours: AIR_M2_COLOURS,
    chargers: ["30W", "35W Dual", "67W"],
    chips: [
      {
        name: "M2",
        cpuCores: 8,
        gpuCores: [8, 10],
        ram: ["8GB", "16GB", "24GB"],
        storage: STORAGE_256_2TB,
      },
    ],
  },
  {
    modelNumber: "A2941",
    family: "Air",
    screenSize: '15"',
    year: "2023",
    colours: AIR_M2_COLOURS,
    chargers: ["35W Dual", "70W"],
    chips: [
      {
        name: "M2",
        cpuCores: 8,
        gpuCores: [10],
        ram: ["8GB", "16GB", "24GB"],
        storage: STORAGE_256_2TB,
      },
    ],
  },
  {
    modelNumber: "A3113",
    family: "Air",
    screenSize: '13"',
    year: "2024",
    colours: AIR_M2_COLOURS,
    chargers: ["30W", "35W Dual", "70W"],
    chips: [
      {
        name: "M3",
        cpuCores: 8,
        gpuCores: [8, 10],
        ram: ["8GB", "16GB", "24GB"],
        storage: STORAGE_256_2TB,
      },
    ],
  },
  {
    modelNumber: "A3114",
    family: "Air",
    screenSize: '15"',
    year: "2024",
    colours: AIR_M2_COLOURS,
    chargers: ["35W Dual", "70W"],
    chips: [
      {
        name: "M3",
        cpuCores: 8,
        gpuCores: [10],
        ram: ["8GB", "16GB", "24GB"],
        storage: STORAGE_256_2TB,
      },
    ],
  },
  {
    modelNumber: "A3240",
    family: "Air",
    screenSize: '13"',
    year: "2025",
    colours: AIR_M4_COLOURS,
    chargers: ["30W", "35W Dual", "70W"],
    chips: [
      {
        name: "M4",
        cpuCores: 10,
        gpuCores: [8, 10],
        ram: ["16GB", "24GB", "32GB"],
        storage: STORAGE_256_2TB,
      },
    ],
  },
  {
    modelNumber: "A3241",
    family: "Air",
    screenSize: '15"',
    year: "2025",
    colours: AIR_M4_COLOURS,
    chargers: ["35W Dual", "70W"],
    chips: [
      {
        name: "M4",
        cpuCores: 10,
        gpuCores: [10],
        ram: ["16GB", "24GB", "32GB"],
        storage: STORAGE_256_2TB,
      },
    ],
  },
  {
    modelNumber: "A3449",
    family: "Air",
    screenSize: '13"',
    year: "2026",
    colours: AIR_M4_COLOURS,
    chargers: ["30W", "35W Dual", "70W"],
    chips: [
      {
        name: "M5",
        cpuCores: 10,
        gpuCores: [8, 10],
        ram: ["16GB", "24GB", "32GB"],
        storage: STORAGE_256_2TB,
      },
    ],
  },
  {
    modelNumber: "A3448",
    family: "Air",
    screenSize: '15"',
    year: "2026",
    colours: AIR_M4_COLOURS,
    chargers: ["35W Dual", "70W"],
    chips: [
      {
        name: "M5",
        cpuCores: 10,
        gpuCores: [10],
        ram: ["16GB", "24GB", "32GB"],
        storage: STORAGE_256_2TB,
      },
    ],
  },

  /* ---------------- MacBook Pro — Intel ---------------- */
  {
    modelNumber: "A1989",
    family: "Pro",
    screenSize: '13"',
    year: "2018–2019",
    colours: SILVER_GREY,
    chargers: ["61W"],
    chips: [
      { name: "Core i5", ram: ["8GB", "16GB"], storage: STORAGE_256_2TB },
      { name: "Core i7", ram: ["8GB", "16GB"], storage: STORAGE_256_2TB },
    ],
  },
  {
    modelNumber: "A2159",
    family: "Pro",
    screenSize: '13"',
    year: "2019",
    colours: SILVER_GREY,
    chargers: ["61W"],
    chips: [
      { name: "Core i5", ram: ["8GB", "16GB"], storage: ["128GB", "256GB", "512GB", "1TB"] },
      { name: "Core i7", ram: ["8GB", "16GB"], storage: ["128GB", "256GB", "512GB", "1TB"] },
    ],
  },
  {
    modelNumber: "A2289",
    family: "Pro",
    screenSize: '13"',
    year: "2020",
    colours: SILVER_GREY,
    chargers: ["61W"],
    chips: [
      { name: "Core i5", ram: ["8GB", "16GB"], storage: STORAGE_256_2TB },
      { name: "Core i7", ram: ["8GB", "16GB"], storage: STORAGE_256_2TB },
    ],
  },
  {
    modelNumber: "A2251",
    family: "Pro",
    screenSize: '13"',
    year: "2020",
    colours: SILVER_GREY,
    chargers: ["61W"],
    chips: [
      { name: "Core i5", ram: ["16GB", "32GB"], storage: ["512GB", "1TB", "2TB", "4TB"] },
      { name: "Core i7", ram: ["16GB", "32GB"], storage: ["512GB", "1TB", "2TB", "4TB"] },
    ],
  },
  {
    modelNumber: "A1990",
    family: "Pro",
    screenSize: '15"',
    year: "2018–2019",
    colours: SILVER_GREY,
    chargers: ["87W"],
    chips: [
      { name: "Core i7", ram: ["16GB", "32GB"], storage: ["256GB", "512GB", "1TB", "2TB", "4TB"] },
      { name: "Core i9", ram: ["16GB", "32GB"], storage: ["256GB", "512GB", "1TB", "2TB", "4TB"] },
    ],
  },
  {
    modelNumber: "A2141",
    family: "Pro",
    screenSize: '16"',
    year: "2019",
    colours: SILVER_GREY,
    chargers: ["96W"],
    chips: [
      { name: "Core i7", ram: ["16GB", "32GB", "64GB"], storage: STORAGE_512_8TB },
      { name: "Core i9", ram: ["16GB", "32GB", "64GB"], storage: STORAGE_512_8TB },
    ],
  },

  /* ---------------- MacBook Pro — Apple silicon ---------------- */
  {
    // Apple reused this A-number across the M1 and M2 13" Pro.
    modelNumber: "A2338",
    family: "Pro",
    screenSize: '13"',
    year: "2020 / 2022",
    colours: SILVER_GREY,
    chargers: ["61W", "67W"],
    chips: [
      {
        name: "M1",
        cpuCores: 8,
        gpuCores: [8],
        ram: ["8GB", "16GB"],
        storage: STORAGE_256_2TB,
      },
      {
        name: "M2",
        cpuCores: 8,
        gpuCores: [10],
        ram: ["8GB", "16GB", "24GB"],
        storage: STORAGE_256_2TB,
      },
    ],
  },
  {
    modelNumber: "A2442",
    family: "Pro",
    screenSize: '14"',
    year: "2021",
    colours: SILVER_GREY,
    chargers: ["67W", "96W"],
    chips: [
      {
        name: "M1 Pro",
        cpuCores: 8,
        gpuCores: [14],
        ram: ["16GB", "32GB"],
        storage: STORAGE_512_8TB,
      },
      {
        name: "M1 Pro",
        cpuCores: 10,
        gpuCores: [14, 16],
        ram: ["16GB", "32GB"],
        storage: STORAGE_512_8TB,
      },
      {
        name: "M1 Max",
        cpuCores: 10,
        gpuCores: [24, 32],
        ram: ["32GB", "64GB"],
        storage: STORAGE_512_8TB,
      },
    ],
  },
  {
    modelNumber: "A2485",
    family: "Pro",
    screenSize: '16"',
    year: "2021",
    colours: SILVER_GREY,
    chargers: ["140W"],
    chips: [
      {
        name: "M1 Pro",
        cpuCores: 10,
        gpuCores: [16],
        ram: ["16GB", "32GB"],
        storage: STORAGE_512_8TB,
      },
      {
        name: "M1 Max",
        cpuCores: 10,
        gpuCores: [24, 32],
        ram: ["32GB", "64GB"],
        storage: STORAGE_512_8TB,
      },
    ],
  },
  {
    modelNumber: "A2779",
    family: "Pro",
    screenSize: '14"',
    year: "2023",
    colours: SILVER_GREY,
    chargers: ["67W", "96W"],
    chips: [
      {
        name: "M2 Pro",
        cpuCores: 10,
        gpuCores: [16],
        ram: ["16GB", "32GB"],
        storage: STORAGE_512_8TB,
      },
      {
        name: "M2 Pro",
        cpuCores: 12,
        gpuCores: [19],
        ram: ["16GB", "32GB"],
        storage: STORAGE_512_8TB,
      },
      {
        name: "M2 Max",
        cpuCores: 12,
        gpuCores: [30, 38],
        ram: ["32GB", "64GB", "96GB"],
        storage: STORAGE_512_8TB,
      },
    ],
  },
  {
    modelNumber: "A2780",
    family: "Pro",
    screenSize: '16"',
    year: "2023",
    colours: SILVER_GREY,
    chargers: ["140W"],
    chips: [
      {
        name: "M2 Pro",
        cpuCores: 12,
        gpuCores: [19],
        ram: ["16GB", "32GB"],
        storage: STORAGE_512_8TB,
      },
      {
        name: "M2 Max",
        cpuCores: 12,
        gpuCores: [30, 38],
        ram: ["32GB", "64GB", "96GB"],
        storage: STORAGE_512_8TB,
      },
    ],
  },
  {
    modelNumber: "A2918",
    family: "Pro",
    screenSize: '14"',
    year: "2023",
    colours: SILVER_GREY,
    chargers: ["70W", "96W"],
    chips: [
      {
        name: "M3",
        cpuCores: 8,
        gpuCores: [10],
        ram: ["8GB", "16GB", "24GB"],
        storage: ["512GB", "1TB", "2TB"],
      },
    ],
  },
  {
    modelNumber: "A2992",
    family: "Pro",
    screenSize: '14"',
    year: "2023",
    colours: PRO_BLACK,
    chargers: ["96W", "140W"],
    chips: [
      {
        name: "M3 Pro",
        cpuCores: 11,
        gpuCores: [14],
        ram: ["18GB", "36GB"],
        storage: ["512GB", "1TB", "2TB", "4TB"],
      },
      {
        name: "M3 Pro",
        cpuCores: 12,
        gpuCores: [18],
        ram: ["18GB", "36GB"],
        storage: ["512GB", "1TB", "2TB", "4TB"],
      },
      {
        name: "M3 Max",
        cpuCores: 14,
        gpuCores: [30],
        ram: ["36GB", "96GB"],
        storage: STORAGE_512_8TB,
      },
      {
        name: "M3 Max",
        cpuCores: 16,
        gpuCores: [40],
        ram: ["48GB", "64GB", "128GB"],
        storage: STORAGE_512_8TB,
      },
    ],
  },
  {
    modelNumber: "A2991",
    family: "Pro",
    screenSize: '16"',
    year: "2023",
    colours: PRO_BLACK,
    chargers: ["140W"],
    chips: [
      {
        name: "M3 Pro",
        cpuCores: 12,
        gpuCores: [18],
        ram: ["18GB", "36GB"],
        storage: ["512GB", "1TB", "2TB", "4TB"],
      },
      {
        name: "M3 Max",
        cpuCores: 14,
        gpuCores: [30],
        ram: ["36GB", "96GB"],
        storage: STORAGE_512_8TB,
      },
      {
        name: "M3 Max",
        cpuCores: 16,
        gpuCores: [40],
        ram: ["48GB", "64GB", "128GB"],
        storage: STORAGE_512_8TB,
      },
    ],
  },
  {
    modelNumber: "A3112",
    family: "Pro",
    screenSize: '14"',
    year: "2024",
    colours: PRO_BLACK,
    chargers: ["70W", "96W"],
    chips: [
      {
        name: "M4",
        cpuCores: 10,
        gpuCores: [10],
        ram: ["16GB", "24GB", "32GB"],
        storage: ["512GB", "1TB", "2TB"],
      },
    ],
  },
  {
    modelNumber: "A3401",
    family: "Pro",
    screenSize: '14"',
    year: "2024",
    colours: PRO_BLACK,
    chargers: ["96W"],
    chips: [
      {
        name: "M4 Pro",
        cpuCores: 12,
        gpuCores: [16],
        ram: ["24GB", "48GB"],
        storage: ["512GB", "1TB", "2TB", "4TB"],
      },
      {
        name: "M4 Pro",
        cpuCores: 14,
        gpuCores: [20],
        ram: ["24GB", "48GB"],
        storage: ["512GB", "1TB", "2TB", "4TB"],
      },
    ],
  },
  {
    modelNumber: "A3185",
    family: "Pro",
    screenSize: '14"',
    year: "2024",
    colours: PRO_BLACK,
    chargers: ["96W", "140W"],
    chips: [
      {
        name: "M4 Max",
        cpuCores: 14,
        gpuCores: [32],
        ram: ["36GB", "96GB"],
        storage: STORAGE_512_8TB,
      },
      {
        name: "M4 Max",
        cpuCores: 16,
        gpuCores: [40],
        ram: ["48GB", "64GB", "128GB"],
        storage: STORAGE_512_8TB,
      },
    ],
  },
  {
    modelNumber: "A3403",
    family: "Pro",
    screenSize: '16"',
    year: "2024",
    colours: PRO_BLACK,
    chargers: ["140W"],
    chips: [
      {
        name: "M4 Pro",
        cpuCores: 14,
        gpuCores: [20],
        ram: ["24GB", "48GB"],
        storage: ["512GB", "1TB", "2TB", "4TB"],
      },
    ],
  },
  {
    modelNumber: "A3186",
    family: "Pro",
    screenSize: '16"',
    year: "2024",
    colours: PRO_BLACK,
    chargers: ["140W"],
    chips: [
      {
        name: "M4 Max",
        cpuCores: 14,
        gpuCores: [32],
        ram: ["36GB", "96GB"],
        storage: STORAGE_512_8TB,
      },
      {
        name: "M4 Max",
        cpuCores: 16,
        gpuCores: [40],
        ram: ["48GB", "64GB", "128GB"],
        storage: STORAGE_512_8TB,
      },
    ],
  },
  {
    modelNumber: "A3434",
    family: "Pro",
    screenSize: '14"',
    year: "2025",
    colours: PRO_BLACK,
    chargers: ["70W", "96W"],
    chips: [
      {
        name: "M5",
        cpuCores: 10,
        gpuCores: [10],
        ram: ["16GB", "24GB", "32GB"],
        storage: ["512GB", "1TB", "2TB", "4TB"],
      },
    ],
  },
  {
    modelNumber: "A3426",
    family: "Pro",
    screenSize: '14"',
    year: "2026",
    colours: PRO_BLACK,
    chargers: ["96W"],
    chips: [
      {
        name: "M5 Pro",
        cpuCores: 18,
        gpuCores: [20],
        ram: ["24GB", "48GB"],
        storage: ["512GB", "1TB", "2TB", "4TB"],
      },
    ],
  },
  {
    modelNumber: "A3427",
    family: "Pro",
    screenSize: '14"',
    year: "2026",
    colours: PRO_BLACK,
    chargers: ["96W", "140W"],
    chips: [
      {
        name: "M5 Max",
        cpuCores: 18,
        gpuCores: [32, 40],
        ram: ["48GB", "64GB", "128GB"],
        storage: STORAGE_512_8TB,
      },
    ],
  },
  {
    modelNumber: "A3428",
    family: "Pro",
    screenSize: '16"',
    year: "2026",
    colours: PRO_BLACK,
    chargers: ["140W"],
    chips: [
      {
        name: "M5 Pro",
        cpuCores: 18,
        gpuCores: [20],
        ram: ["24GB", "48GB"],
        storage: ["512GB", "1TB", "2TB", "4TB"],
      },
    ],
  },
  {
    modelNumber: "A3429",
    family: "Pro",
    screenSize: '16"',
    year: "2026",
    colours: PRO_BLACK,
    chargers: ["140W"],
    chips: [
      {
        name: "M5 Max",
        cpuCores: 18,
        gpuCores: [32, 40],
        ram: ["48GB", "64GB", "128GB"],
        storage: STORAGE_512_8TB,
      },
    ],
  },
];

const BY_NUMBER = new Map(APPLE_MODELS.map((m) => [m.modelNumber.toUpperCase(), m]));

/** Normalises "a2338", " A2338 ", "2338" → "A2338". */
export function normaliseModelNumber(raw: string): string {
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!trimmed) return "";
  return /^\d/.test(trimmed) ? `A${trimmed}` : trimmed;
}

export function lookupAppleModel(raw: string | null | undefined): AppleModel | null {
  if (!raw) return null;
  return BY_NUMBER.get(normaliseModelNumber(raw)) ?? null;
}

/** Every known A-number, for the model-number input's datalist. */
export const APPLE_MODEL_NUMBERS = APPLE_MODELS.map((m) => m.modelNumber);

/**
 * A chip is identified by name + CPU core count, since one model can ship the
 * same chip in two CPU bins (M1 Pro 8-core and 10-core in the A2442).
 */
export function chipKey(chip: ChipOption): string {
  return chip.cpuCores ? `${chip.name} · ${chip.cpuCores}c CPU` : chip.name;
}

export function findChip(model: AppleModel, key: string): ChipOption | null {
  return model.chips.find((c) => chipKey(c) === key) ?? null;
}

/** Condition grades, worst to best, as they read in a listing description. */
export const CONDITIONS = ["Excellent", "Very Good", "Good", "Fair", "Poor"] as const;
export type Condition = (typeof CONDITIONS)[number];
