import type { Laptop } from "@/app/generated/prisma/client";

type ListingSource = Pick<
  Laptop,
  | "macType"
  | "screenSize"
  | "processor"
  | "ram"
  | "storage"
  | "colour"
  | "cpuCores"
  | "gpuCores"
  | "modelNumber"
  | "hasCharger"
  | "chargerWattage"
  | "cycleCount"
  | "condition"
>;

/**
 * Listing title:
 *   <MacBook Type> <Screen Size> <Processor> <RAM> <Storage> <Colour>
 *   <CPU Cores> <GPU Cores> <Model Number>
 *
 * e.g. MacBook Pro 14" M1 Pro 16GB 512GB Space Grey 10c CPU 16c GPU A2442
 *
 * Any part we don't have is dropped rather than left as a gap, so a
 * part-filled record still yields a usable title.
 */
export function buildListingTitle(l: ListingSource): string {
  return [
    l.macType ? `MacBook ${l.macType}` : null,
    l.screenSize,
    l.processor,
    l.ram,
    l.storage,
    l.colour,
    l.cpuCores ? `${l.cpuCores}c CPU` : null,
    l.gpuCores ? `${l.gpuCores}c GPU` : null,
    l.modelNumber,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Listing description:
 *   <Model Number> <MacBook Type> <Processor> w/ <Charger Wattage> Charger.
 *
 *   Cycle count: <N>, <Condition> condition
 *
 * The charger clause is dropped when no charger is included.
 */
export function buildListingDescription(l: ListingSource): string {
  const head = [
    l.modelNumber,
    l.macType ? `MacBook ${l.macType}` : null,
    l.processor,
  ]
    .filter(Boolean)
    .join(" ");

  const charger =
    l.hasCharger && l.chargerWattage ? ` w/ ${l.chargerWattage} Charger` : "";

  const firstLine = head ? `${head}${charger}.` : "";

  const second = [
    l.cycleCount != null ? `Cycle count: ${l.cycleCount}` : null,
    l.condition ? `${l.condition} condition` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return [firstLine, second].filter(Boolean).join("\n\n");
}
