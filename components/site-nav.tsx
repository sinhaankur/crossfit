"use client";

import { usePathname } from "next/navigation";

// The shared primary nav — Plan · Build · Log · Movements · Benchmarks.
// Sticky, mobile-first, with an active state. Keeps every surface one product.

const LINKS = [
  { href: "/", label: "Plan" },
  { href: "/body", label: "Build" },
  { href: "/log", label: "Log" },
  { href: "/movements", label: "Movements" },
  { href: "/benchmarks", label: "Benchmarks" },
];

export function SiteNav() {
  const path = usePathname() || "/";
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
        <a href="/" className="font-mono text-sm font-bold tracking-widest text-[var(--accent)]">CF·SINHA</a>
        <div className="flex items-center gap-1 overflow-x-auto">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                isActive(l.href) ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}>
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
