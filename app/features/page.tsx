"use client";

import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { FEATURES, STATUS_META, type Feature } from "@/lib/features";
import { Check, Hammer, Clock, Send } from "lucide-react";

// /features — the living list of what Kelo has + what's coming, plus a feedback
// box. We keep testing and fixing, so this is the honest single source of truth.

const AREAS = ["Plan", "Train", "Progress", "Body", "Account", "App"] as const;

export default function FeaturesPage() {
  const [note, setNote] = useState("");
  const live = FEATURES.filter((f) => f.status === "live").length;

  function sendFeedback() {
    const body = encodeURIComponent(note + "\n\n— sent from Kelo /features");
    window.location.href = `mailto:he66al@gmail.com?subject=${encodeURIComponent("Kelo feedback")}&body=${body}`;
  }

  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p className="font-mono-eyebrow text-[var(--muted)]">the plan · always improving</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">What Kelo does.</h1>
        <p className="mt-3 text-[var(--fg)]/75">
          {live} features live and more on the way. This is honest and current — we keep testing and fixing, and your feedback shapes what&rsquo;s next.
        </p>

        {/* status legend */}
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <Legend icon={<Check className="h-3.5 w-3.5" />} label="Live" cls={STATUS_META.live.className} />
          <Legend icon={<Hammer className="h-3.5 w-3.5" />} label="Building" cls={STATUS_META.building.className} />
          <Legend icon={<Clock className="h-3.5 w-3.5" />} label="Planned" cls={STATUS_META.planned.className} />
        </div>

        {AREAS.map((area) => {
          const items = FEATURES.filter((f) => f.area === area);
          if (!items.length) return null;
          return (
            <section key={area} className="mt-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">{area}</h2>
              <div className="mt-3 space-y-2">
                {items.map((f) => <Row key={f.title} f={f} />)}
              </div>
            </section>
          );
        })}

        {/* feedback */}
        <section className="mt-10 rounded-3xl border border-[var(--line)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-bold">Tell us what&rsquo;s missing</h2>
          <p className="mt-1 text-sm text-[var(--fg)]/70">A bug, a movement you want, an idea — we read everything and keep fixing.</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Your feedback…"
            className="mt-3 w-full resize-none rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none" />
          <button onClick={sendFeedback} disabled={!note.trim()}
            className="mt-3 flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-40">
            <Send className="h-4 w-4" /> Send feedback
          </button>
        </section>

        <p className="mt-8 text-center text-xs text-[var(--muted)]">Built by <a href="https://sinhaankur.com" className="underline">Ankur Sinha</a> · consistency over extremes.</p>
      </div>
    </main>
  );
}

function Legend({ icon, label, cls }: { icon: React.ReactNode; label: string; cls: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${cls}`}>{icon}{label}</span>;
}
function Row({ f }: { f: Feature }) {
  const meta = STATUS_META[f.status];
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-black/20 p-3">
      <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.className}`}>{meta.label}</span>
      <div>
        <p className="text-sm font-semibold">{f.title}</p>
        <p className="text-xs text-[var(--muted)]">{f.desc}</p>
      </div>
    </div>
  );
}
