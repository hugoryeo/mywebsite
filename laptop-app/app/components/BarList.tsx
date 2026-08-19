export function BarList({
  rows,
}: {
  rows: { label: string; value: number; display: string }[];
}) {
  const max = Math.max(...rows.map((r) => Math.abs(r.value)), 1);
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <div
            className="w-32 shrink-0 truncate text-right text-[12px] text-corp-400"
            title={r.label}
          >
            {r.label}
          </div>
          <div className="h-5 flex-1 border border-[color:var(--corp-edge-soft)] bg-corp-900">
            <div
              className="h-full bg-gradient-to-r from-corp-accent-dim to-corp-accent"
              style={{ width: `${(Math.abs(r.value) / max) * 100}%` }}
            />
          </div>
          <div className="w-28 shrink-0 font-display text-[13px] font-semibold text-white tabular-nums">
            {r.display}
          </div>
        </div>
      ))}
    </div>
  );
}
