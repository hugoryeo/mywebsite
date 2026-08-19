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
          <div className="w-32 shrink-0 truncate text-right text-sm text-navy-400" title={r.label}>
            {r.label}
          </div>
          <div className="h-5 flex-1 overflow-hidden rounded-full bg-navy-50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-navy-400 to-navy-700"
              style={{ width: `${(Math.abs(r.value) / max) * 100}%` }}
            />
          </div>
          <div className="w-28 shrink-0 text-sm font-semibold text-navy-900">{r.display}</div>
        </div>
      ))}
    </div>
  );
}
