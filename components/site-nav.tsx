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
  { href: "/app", label: "App", soon: true },
];

export function SiteNav() {
  const path = usePathname() || "/";
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
        <a href="/" className="group flex items-center gap-2" aria-label="Kelo — home">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent-2)] to-[var(--accent)] text-[13px] font-black text-white shadow-sm shadow-rose-500/30 transition group-hover:scale-105">K</span>
          <span className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-bold tracking-tight text-[var(--fg)]">Kelo</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">CrossFit</span>
          </span>
        </a>
        <div className="flex items-center gap-1 overflow-x-auto">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                isActive(l.href) ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}>
              {l.label}
              {l.soon && <span title="Coming to the App Store" className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
