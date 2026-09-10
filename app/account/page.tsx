"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";

// /account — guest-first. Everything works with no account (data lives on your
// device). Signing in with an email code is OPTIONAL — it's only for syncing your
// history across devices and backing it up. Honest about what's stored where.
//
// The OTP flow UI is here; the verifying backend (a small Worker + email) lands
// with the sync feature. Until then this explains the model and offers the
// on-device data controls that DO work today (export / wipe).

const LS_KEYS = ["crossfit-wodlog-v1", "crossfit-1rm-v1", "crossfit-body-v1", "crossfit-goals-v1"];

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [dataFound, setDataFound] = useState(0);

  useEffect(() => {
    let n = 0;
    for (const k of LS_KEYS) if (localStorage.getItem(k)) n++;
    // plan attendance keys
    for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i)?.startsWith("crossfit-done:")) { n++; break; }
    setDataFound(n);
  }, []);

  function exportAll() {
    const dump: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("crossfit-")) { try { dump[k] = JSON.parse(localStorage.getItem(k) || "null"); } catch { dump[k] = localStorage.getItem(k); } }
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "kelo-data.json"; a.click();
    URL.revokeObjectURL(a.href);
  }
  function wipe() {
    if (!confirm("Erase all Kelo data on this device? This can't be undone (export first if you want a backup).")) return;
    const del: string[] = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith("crossfit-")) del.push(k); }
    del.forEach((k) => localStorage.removeItem(k));
    setDataFound(0);
    alert("Done — this device is wiped.");
  }

  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-xl px-5 py-10">
        <p className="font-mono-eyebrow text-[var(--muted)]">yours, private</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Account</h1>
        <p className="mt-3 text-[var(--fg)]/75 leading-relaxed">
          You don&rsquo;t need an account. Everything you do here is saved <span className="text-[var(--fg)]">on this device</span>,
          for free, with no sign-up. An account is optional — it only <span className="text-[var(--fg)]">syncs your history across your devices</span> and backs it up.
        </p>

        {/* Guest status */}
        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-lg">👤</span>
            <div>
              <p className="font-semibold">You&rsquo;re a guest</p>
              <p className="text-sm text-[var(--muted)]">{dataFound > 0 ? "Your data is saved on this device." : "Nothing saved yet — start training."}</p>
            </div>
          </div>
        </div>

        {/* Optional email sign-in (OTP) */}
        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">Sync across devices (optional)</p>
          {!sent ? (
            <>
              <p className="mt-1.5 text-sm text-[var(--fg)]/70">Enter your email and we&rsquo;ll send a 6-digit code. No passwords.</p>
              <div className="mt-3 flex gap-2">
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" placeholder="you@email.com"
                  className="flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none" />
                <button onClick={() => email.includes("@") && setSent(true)}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40" disabled={!email.includes("@")}>
                  Send code
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">
              Sync sign-in is coming soon — the email code system is being built. For now, use <b>Export</b> below to move your data between devices; import lands with sync.
              <button onClick={() => setSent(false)} className="mt-2 block text-xs underline">Back</button>
            </div>
          )}
        </div>

        {/* On-device data controls (these work today) */}
        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">Your data</p>
          <p className="mt-1.5 text-sm text-[var(--fg)]/70">It never leaves your device unless you export it. You&rsquo;re in control.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={exportAll} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:border-white/40">Export all (JSON)</button>
            <button onClick={wipe} className="rounded-full border border-rose-500/40 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/10">Erase this device</button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--muted)]">Private by design · on-device · free forever. Same data model as the Kelo app.</p>
      </div>
    </main>
  );
}
