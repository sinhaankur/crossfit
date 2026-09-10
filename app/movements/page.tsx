"use client";

import { MOVEMENTS, type Pattern } from "@/lib/movements";
import { SiteNav } from "@/components/site-nav";
import { CloserLook } from "@/components/closer-look";

// One representative movement per pattern for the single-screen trainer, so the
// 3D human covers every movement family.
const FEATURED = (() => {
  const seen = new Set<Pattern>();
  return MOVEMENTS.filter((m) => (seen.has(m.pattern) ? false : (seen.add(m.pattern), true)));
})();

export default function MovementsPage() {
  return (
    <main className="h-dvh overflow-hidden">
      <SiteNav />
      {/* Single-screen, gamified movement trainer (no long scroll). */}
      <CloserLook movements={FEATURED} />
    </main>
  );
}
