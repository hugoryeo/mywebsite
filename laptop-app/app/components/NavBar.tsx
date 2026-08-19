"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import GlitchText from "./GlitchText";

const LINKS = [
  { href: "/", label: "Launch" },
  { href: "/stock", label: "Stock" },
  { href: "/pricing", label: "Pricing" },
  { href: "/ebay", label: "eBay Listings" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="relative z-20 border-b border-[color:var(--corp-edge)] bg-corp-950/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
        <Link href="/" className="flex items-baseline gap-3">
          <GlitchText
            text="LAPTOP SALES TRACKER"
            speed={1}
            className="font-brand text-[13px] tracking-[0.04em] text-white"
          />
          <span className="hidden border border-corp-700 px-1.5 py-0.5 text-[9.5px] tracking-[0.1em] text-corp-500 sm:inline">
            INTERNAL TERMINAL
          </span>
        </Link>

        <nav className="flex flex-wrap">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 font-display text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
                  active ? "text-white" : "text-corp-400 hover:text-corp-100"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-3.5 bottom-0.5 h-0.5 bg-corp-red shadow-[0_0_10px_var(--color-corp-red)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
