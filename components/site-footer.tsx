"use client";

import { useEffect, useState } from "react";

// SiteFooter — Kelo's footer, matching sinhaankur.com's structure + craft:
// an identity row + a link set with the underline-on-hover animation, a hairline
// divider, then a quiet legal + place/time/updated meta line, over a faint field
// of deterministic star specks. Blue palette (Kelo), same editorial calm.
//
// House rule kept: deterministic speck positions (index-derived, no Math.random
// in render) so server HTML and client hydration agree.

const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();

const LINKS: Array<{ label: string; href: string; external?: boolean }> = [
  { label: "Today", href: "/today" },
  { label: "Movements", href: "/movements" },
  { label: "Breathe", href: "/breathe" },
  { label: "Progress", href: "/calendar" },
  { label: "Features", href: "/features" },
  { label: "Portfolio", href: "https://www.sinhaankur.com", external: true },
  { label: "GitHub", href: "https://github.com/sinhaankur/crossfit", external: true },
];

const SPECK_COUNT = 20;

function FooterSky() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 text-[var(--accent)]">
      <div className="absolute inset-0 opacity-50">
        {Array.from({ length: SPECK_COUNT }, (_, i) => {
          const x = (i * 47 + 11) % 100;
          const y = (i * 29 + 13) % 97;
          const s = 1 + ((i * 7) % 3) * 0.5;
          const dur = 2.6 + ((i * 13) % 5) * 0.8;
          const delay = ((i * 17) % 40) / 10;
          return (
            <span key={i} className="absolute rounded-full bg-current"
              style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, opacity: 0.16,
                       animation: `kelo-twinkle ${dur}s ease-in-out ${delay}s infinite` }} />
          );
        })}
      </div>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes kelo-twinkle { 0%,100% { opacity: 0.06 } 50% { opacity: 0.34 } }
        }
      `}</style>
    </div>
  );
}

function ClearCacheButton() {
  const [clearing, setClearing] = useState(false);
  async function clear() {
    setClearing(true);
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
    try { if (typeof caches !== "undefined") { const k = await caches.keys(); await Promise.all(k.map((n) => caches.delete(n))); } } catch {}
    try { if (navigator.serviceWorker) { const r = await navigator.serviceWorker.getRegistrations(); await Promise.all(r.map((x) => x.unregister())); } } catch {}
    const u = new URL(window.location.href); u.searchParams.set("fresh", Date.now().toString(36));
    window.location.replace(u.toString());
  }
  return (
    <button type="button" onClick={clear} disabled={clearing}
      aria-label="Clear cache and reload the latest version"
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] transition-colors hover:text-[var(--fg)] hover:border-white/25 disabled:opacity-60">
      <svg aria-hidden viewBox="0 0 24 24" className={`h-3 w-3 ${clearing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
      </svg>
      {clearing ? "Clearing…" : "Clear Cache"}
    </button>
  );
}

export function SiteFooter() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const up = () => {
      const n = new Date();
      setTime(`${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`);
    };
    up();
    const t = setInterval(up, 30_000);
    return () => clearInterval(t);
  }, []);

  const linkCls = `
    relative inline-flex min-h-11 items-center font-mono text-xs tracking-widest
    text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300
    after:absolute after:bottom-2 after:left-0 after:h-px after:w-full
    after:origin-left after:scale-x-0 after:bg-[var(--accent)]
    after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 rounded`;

  return (
    <footer className="relative overflow-hidden border-t border-[var(--line)] px-5 pt-10 pb-10 sm:px-8">
      <FooterSky />
      <div className="relative mx-auto w-full max-w-5xl">
        {/* Row 1 — identity + links */}
        <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-[var(--fg)]">KELO · CROSSFIT</p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-[var(--muted)]">Exercise for all · train longer, live longer</p>
          </div>
          <ul className="flex flex-wrap gap-x-7 gap-y-3">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} className={linkCls}
                  {...(l.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                  aria-label={l.external ? `${l.label} — opens in a new tab` : l.label}>
                  {l.label.toUpperCase()}
                </a>
              </li>
            ))}
            <li><ClearCacheButton /></li>
          </ul>
        </div>

        {/* Row 2 — legal + place/time/updated */}
        <div className="mt-8 flex flex-col gap-2.5 border-t border-[var(--line)] pt-6 font-mono text-[11px] tracking-[0.16em] text-[var(--muted)] md:flex-row md:items-baseline md:justify-between">
          <p>© {new Date(BUILD_TIME).getUTCFullYear()} Ankur Sinha · Free · private · on your device</p>
          <p className="flex flex-wrap items-center gap-x-2 tabular-nums">
            Toronto · <time aria-live="off">{time}</time> local · Updated{" "}
            <time dateTime={BUILD_TIME}>
              {new Date(BUILD_TIME).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })}
            </time>
          </p>
        </div>
      </div>
    </footer>
  );
}
