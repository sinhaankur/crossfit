"use client";

import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Breathe } from "@/components/breathe";

// /breathe — a calm down-regulation space. The mental side of "health AND
// mental": when the day's stress is high, this is where Today points you.
export default function BreathePage() {
  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p className="font-mono-eyebrow text-[var(--muted)]">Mind · a quiet minute</p>
        <h1 className="mt-2 font-display text-3xl font-light tracking-[-0.01em] sm:text-4xl">Breathe</h1>
        <p className="mt-2 max-w-md text-sm text-[var(--fg)]/70">
          Strong bodies need steady minds. Take a minute — the ring will pace you.
        </p>
        <div className="mt-10">
          <Breathe />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
