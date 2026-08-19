import Link from "next/link";
import type { ReactNode } from "react";

function TileBody({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-2 p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-navy-500 uppercase">
          {label}
        </span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-navy-900">{value}</div>
      {sub && <div className="text-sm text-navy-400">{sub}</div>}
    </div>
  );
}

/** A clickable launch-page tile that navigates to another page. */
export function LinkTile({
  href,
  label,
  value,
  sub,
  icon,
}: {
  href: string;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="panel-3d panel-3d-interactive block focus:outline-none"
    >
      <TileBody label={label} value={value} sub={sub} icon={icon} />
    </Link>
  );
}

/** A non-clickable launch-page tile (the Profit tile leads nowhere). */
export function StaticTile({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="panel-3d panel-3d-static">
      <TileBody label={label} value={value} sub={sub} icon={icon} />
    </div>
  );
}
