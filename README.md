# crossfit.sinhaankur.com

A safe, private, keyless **CrossFit plan generator + log**. Answer a few honest
questions (body type · goal · diet · experience · equipment) and get a
step-by-step, **progressive** plan — every movement with real form cues, a
safety note, and an easier scale, so you build strength without getting hurt.
Consistency over extremes.

- **/** — build & follow a personalised plan (attendance marker + workout timer).
- **/log** — log WODs (For Time / AMRAP / Load / Reps), track PRs, log calories
  burned, export as JSON (imports into the Kelo app).
- **/movements** — the movement library: steps, safety, and an easier scale for each.
- **/benchmarks** — The Girls + Hero WODs with safe scales + the timer.

Everything runs **on your device** — no account, no server, no API key. Diet &
macro guidance is public; DNA-personalised training stays private in the
companion **Kelo** iOS app.

## Develop
```bash
pnpm install
pnpm dev
```
Static export (`next.config.mjs` → `output: "export"`) → Cloudflare Pages.

© Ankur Sinha.
