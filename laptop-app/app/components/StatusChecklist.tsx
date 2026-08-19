"use client";

import { useTransition } from "react";
import { toggleStatus } from "@/app/lib/actions";
import { STATUS_STAGES, type StatusKey } from "@/app/lib/laptop";
import type { Laptop } from "@/app/generated/prisma/client";

export default function StatusChecklist({
  laptop,
  compact,
}: {
  laptop: Pick<Laptop, "id" | "statusReset" | "statusCleaned" | "statusPrepared" | "statusListed">;
  compact?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`flex flex-wrap gap-${compact ? "1.5" : "3"}`}>
      {STATUS_STAGES.map(({ key, label }) => {
        const checked = laptop[key];
        return (
          <label
            key={key}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
              checked
                ? "border-navy-600 bg-navy-600 text-white"
                : "border-navy-200 bg-white text-navy-500 hover:border-navy-400"
            } ${isPending ? "opacity-60" : ""}`}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={isPending}
              className="sr-only"
              onChange={() => {
                startTransition(() => {
                  toggleStatus(laptop.id, key as StatusKey);
                });
              }}
            />
            {checked ? "✓ " : ""}
            {label}
          </label>
        );
      })}
    </div>
  );
}
