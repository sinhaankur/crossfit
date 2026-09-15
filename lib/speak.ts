// speak — on-device text-to-speech via the Web Speech API. Hands-free coaching
// + accessibility (low-vision, reading difficulty) for "exercise for all". No
// cloud, no account, no model download: the voice is the OS's own, entirely
// on-device. Degrades to a silent no-op where the API is absent, so nothing
// ever breaks. Matches the tinyLLM/on-device-first rule — the app's logic is
// data; the voice just reads it.

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Speak `text` now, cancelling anything currently being said (so stepping
 *  forward interrupts the previous cue instead of queuing up). Calm, slightly
 *  slower rate for coaching clarity. Safe to call when unsupported. */
export function speak(text: string): void {
  if (!speechSupported() || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;   // a touch slower — clear coaching pace
    u.pitch = 1.0;
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  } catch {
    /* no-op — never let a speech failure break the trainer */
  }
}

/** Stop any current speech immediately. */
export function stopSpeaking(): void {
  if (!speechSupported()) return;
  try { window.speechSynthesis.cancel(); } catch { /* no-op */ }
}
