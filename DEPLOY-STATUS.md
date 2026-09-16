# ⚠️ Deploy is stale — action needed (Cloudflare Pages)

**Symptom (2026-09-15):** crossfit.sinhaankur.com is serving an OLD build.
- `/movements` shows the procedural mannequin, not the real MPFB human.
- `/models/*.glb` all return **404** (the whole folder is missing from the deploy).
- `/features` still shows old copy ("Tell us what…" / "Built by"), no footer.

**This is NOT a code bug.** Everything is committed + pushed to
`github.com/sinhaankur/crossfit` (HEAD `12fc594`), and a clean local
`pnpm build` produces a correct `out/` (108 files, 16 MB, all 17 GLBs in
`out/models/`, nothing over any Pages limit). The GitHub → Cloudflare Pages
auto-deploy simply hasn't run for the recent pushes.

## Fix (in the Cloudflare dashboard — needs your login)

1. **Pages → your `crossfit` project → Deployments.** Check the latest
   deployment's commit hash. If it's older than `12fc594`, the GitHub
   integration isn't firing.
2. **Retry / create a deployment:** click **Retry deployment**, or **Create
   deployment** from the `main` branch. Confirm build settings:
   - Build command: `pnpm build` (or `npm run build`)
   - Build output directory: **`out`**  ← must be `out`, not `.next`
   - Framework preset: Next.js (**Static HTML Export**), or None.
3. If deploys still don't trigger on push: **Settings → Builds & deployments →
   check the GitHub connection** (reconnect the repo if the integration was
   revoked). Ensure "Automatic deployments" is ON for `main`.
4. After a successful deploy, verify:
   ```
   curl -I https://crossfit.sinhaankur.com/models/squat.glb   # expect 200
   ```

## Meanwhile, the app still works

`Human3D` degrades gracefully: when a `/models/*.glb` 404s it shows the
procedural 3D `Mannequin3D` (not a broken state), so users still see a moving
figure — just not the photoreal MPFB human. All other features (adaptive
variants, muscle names, voice, mood check-in, breathe) are code/CSS and will
appear the moment the deploy runs.
