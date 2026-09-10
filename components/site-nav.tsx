"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

// Primary nav (L1) + grouped secondary (L2) so the growing set of surfaces stays
// legible. Mobile-first: L1 collapses into a menu button; the account slot lives
// on the right. Guest-first — "Account" opens sign-in (OTP) when we ship it.
//
//  L1: Today · Plan · Train · Progress
//  L2 (under Train):    Movements · Routines · Benchmarks · Timer
//  L2 (under Progress): Log · Calendar · Build (body)
// App + Account sit on the right.

interface Item { href: string; label: string; }
interface Group { label: string; href: string; children?: Item[]; }

const NAV: Group[] = [
  { href: "/today", label: "Today" },
  { href: "/", label: "Plan" },
  {
    href: "/movements", label: "Train",
    children: [
      { href: "/movements", label: "Movements" },
      { href: "/routines", label: "Warm-up & mobility" },
      { href: "/benchmarks", label: "Benchmark WODs" },
    ],
  },
  {
    href: "/calendar", label: "Progress",
    children: [
      { href: "/body", label: "Build (lifts · body · BMI · goals)" },
      { href: "/log", label: "Workout log" },
      { href: "/calendar", label: "Consistency calendar" },
      { href: "/features", label: "Features & roadmap" },
    ],
  },
];

export function SiteNav() {
  const path = usePathname() || "/";
  const [openMobile, setOpenMobile] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const groupActive = (g: Group) => isActive(g.href) || (g.children?.some((c) => isActive(c.href)) ?? false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        {/* Brand */}
        <a href="/today" className="group flex items-center gap-2" aria-label="Kelo — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={28} height={28} className="h-7 w-7 rounded-lg shadow-sm shadow-rose-500/30 transition group-hover:scale-105" />
          <span className="flex items-baseline gap-1.5">
            <span className="text-[15px] font-bold tracking-tight text-[var(--fg)]">Kelo</span>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] sm:inline">CrossFit</span>
          </span>
        </a>

        {/* L1 — desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((g) => (
            <div key={g.label} className="relative"
              onMouseEnter={() => g.children && setOpenMenu(g.label)}
              onMouseLeave={() => setOpenMenu(null)}>
              <a href={g.href}
                aria-current={groupActive(g) ? "page" : undefined}
                className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${groupActive(g) ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--fg)]"}`}>
                {g.label}{g.children && <span className="text-[9px] opacity-60">▾</span>}
              </a>
              {/* L2 dropdown */}
              {g.children && openMenu === g.label && (
                <div className="absolute left-0 top-full pt-2">
                  <div className="min-w-[220px] rounded-2xl border border-[var(--line)] bg-[var(--card)] p-1.5 shadow-2xl shadow-black/50">
                    {g.children.map((c) => (
                      <a key={c.href} href={c.href}
                        className={`block rounded-xl px-3 py-2 text-sm transition ${isActive(c.href) ? "bg-[var(--accent)]/15 font-semibold text-[var(--fg)]" : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--fg)]"}`}>
                        {c.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right — App + Account (desktop) / menu button (mobile) */}
        <div className="flex items-center gap-2">
          <a href="/app" className="hidden items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--fg)] md:flex">
            App <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
          </a>
          <a href="/account" className={`hidden rounded-full border px-3.5 py-1.5 text-sm font-semibold transition md:block ${isActive("/account") ? "border-[var(--accent)] text-[var(--fg)]" : "border-white/15 text-[var(--fg)]/85 hover:border-white/40"}`}>
            Account
          </a>
          <button onClick={() => setOpenMobile((v) => !v)} aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-[var(--fg)] md:hidden">
            {openMobile ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {openMobile && (
        <div className="border-t border-[var(--line)] bg-[var(--bg)] px-4 pb-4 pt-2 md:hidden">
          {NAV.map((g) => (
            <div key={g.label} className="py-1">
              <a href={g.href} className={`block rounded-lg px-3 py-2 text-sm font-semibold ${groupActive(g) ? "text-[var(--accent)]" : "text-[var(--fg)]"}`}>{g.label}</a>
              {g.children && (
                <div className="ml-3 border-l border-white/10 pl-3">
                  {g.children.map((c) => (
                    <a key={c.href} href={c.href} className={`block rounded-lg px-3 py-1.5 text-sm ${isActive(c.href) ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>{c.label}</a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="mt-2 flex gap-2 border-t border-white/10 pt-3">
            <a href="/app" className="flex-1 rounded-full border border-white/15 py-2 text-center text-sm font-semibold text-[var(--fg)]/85">App (soon)</a>
            <a href="/account" className="flex-1 rounded-full bg-[var(--accent)] py-2 text-center text-sm font-bold text-white">Account</a>
          </div>
        </div>
      )}
    </header>
  );
}
