"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <header className="bg-navy-900 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          💻 Laptop Sales Tracker
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm font-medium">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-navy-600 text-white"
                    : "text-navy-200 hover:bg-navy-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
