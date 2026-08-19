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
    <div className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-2.5"}`}>
      {STATUS_STAGES.map(({ key, label }) => {
        const checked = laptop[key];
        return (
          <label
            key={key}
            className={`corp-chip ${checked ? "corp-chip-on" : ""} ${
              isPending ? "opacity-60" : ""
            }`}
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
            {checked ? `✓ ${label}` : label}
          </label>
        );
      })}
    </div>
  );
}
