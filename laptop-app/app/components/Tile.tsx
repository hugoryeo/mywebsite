import Link from "next/link";
import type { ReactNode } from "react";
import GlitchText from "./GlitchText";

/** Per-tile glitch signature: different burst pattern + different sustained clocks. */
export type Signature = "a" | "b" | "c" | "d" | "e";

const SIG_CLASS: Record<Signature, string> = {
  a: "",
  b: "corp-sig-b",
  c: "corp-sig-c",
  d: "corp-sig-d",
  e: "corp-sig-e",
};

export type IconName = "laptop" | "tag" | "cart" | "chart" | "coin";

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: `h-[18px] w-[18px] shrink-0 ${className}`,
    "aria-hidden": true,
  };
  switch (name) {
    case "laptop":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="1" />
          <path d="M2 19h20l-1.5-3h-17z" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <path d="M20.6 12.6 12.6 20.6a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1 0-2.8L11.4 3.4A2 2 0 0 1 12.8 3H19a2 2 0 0 1 2 2v6.2a2 2 0 0 1-.6 1.4z" />
          <circle cx="16" cy="8" r="1.3" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <circle cx="9" cy="20" r="1.2" />
          <circle cx="17" cy="20" r="1.2" />
          <path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 20V10M11 20V4M18 20v-7" />
        </svg>
      );
    case "coin":
      return (
        <svg {...common}>
          <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
  }
}

function Brackets() {
  return (
    <>
      <span className="corp-bracket corp-bracket-tl" aria-hidden="true" />
      <span className="corp-bracket corp-bracket-br" aria-hidden="true" />
    </>
  );
}

/** A clickable launch tile. `value` glitches while hovered. */
export function LinkTile({
  href,
  label,
  value,
  sub,
  icon,
  sig = "a",
  hero,
  className = "",
  children,
}: {
  href: string;
  label: string;
  value: string;
  sub?: ReactNode;
  icon?: IconName;
  sig?: Signature;
  hero?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`corp-panel corp-tile flex flex-col gap-2 p-5 ${SIG_CLASS[sig]} ${className}`}
    >
      <Brackets />
      <div className="flex items-center justify-between gap-3">
        <span className="corp-label">{label}</span>
        {icon && <Icon name={icon} className="text-corp-red" />}
      </div>
      <GlitchText
        text={value}
        mode="hover"
        className={`font-display font-bold leading-none text-white ${
          hero ? "text-[68px] font-extrabold tracking-tight" : "text-[27px]"
        }`}
      />
      {sub && <div className="text-[11px] text-corp-500">{sub}</div>}
      {children}
    </Link>
  );
}

/** A non-clickable tile — the Profit anchor leads nowhere. */
export function StaticTile({
  label,
  value,
  sub,
  flag,
  hero,
  className = "",
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  flag?: string;
  hero?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`corp-panel corp-panel-locked flex flex-col justify-between p-7 ${className}`}
    >
      <Brackets />
      <div className="flex items-center justify-between gap-3">
        <span className="corp-label">{label}</span>
        {flag && (
          <span className="border border-corp-red-dim px-1.5 py-0.5 text-[8.5px] tracking-[0.08em] whitespace-nowrap text-corp-red uppercase">
            {flag}
          </span>
        )}
      </div>
      <GlitchText
        text={value}
        speed={3}
        className={`font-display font-bold leading-none text-corp-red-bright ${
          hero ? "text-[68px] font-extrabold tracking-tight" : "text-[27px]"
        }`}
      />
      {sub && <div className="text-[11px] text-corp-500">{sub}</div>}
    </div>
  );
}

/** A plain content panel (no hover glitch) for the inner pages. */
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`corp-panel p-6 ${className}`}>
      <Brackets />
      {children}
    </div>
  );
}
