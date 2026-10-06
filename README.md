# CampusFit

Gamified, checkpoint-based campus fitness app for university students — built with
**React + Vite + TypeScript + Tailwind + PWA + Supabase**.

The UI is ported **1:1 from the 20 Google Stitch screens** (Outfit type, Material 3
tokens, mint `#1ECC8B`, amber `#F5A623`, purple `#C07EFF`, cream `#FAF5EE`, 20px
cards) and extended with the thesis gamification system: QR checkpoints, a dynamic
points algorithm, streaks/levels, badges, leaderboards, and an admin dashboard.

## Quick start

```bash
npm install          # already done in this checkout
npm run dev          # http://127.0.0.1:5173
npm run build        # typecheck (tsc --noEmit) + production bundle + service worker
npm run preview      # serve the production build
```

With no Supabase credentials the app runs in **demo mode**: any email/password
signs you in and all data (points, leaderboard, badges, trips) comes from
`src/lib/demo.ts`, while scans are simulated locally.

## Connecting Supabase

1. `cp .env.example .env` and set:
   - `VITE_SUPABASE_URL=https://<project-ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=<anon key>`
2. Apply the schema and seed:
   ```bash
   npx supabase login          # needs a personal access token
   npx supabase link --project-ref <project-ref>
   npx supabase db push        # runs supabase/migrations/0001_init.sql
   psql ... -f supabase/seed.sql   # or paste seed.sql into the SQL editor
   ```
3. Restart `npm run dev` — `usingDemoData` in `src/lib/api.ts` flips to `false`
   and every call now hits Postgres (RLS enforced, `scan_checkpoint()` RPC for
   awarding points).

## Architecture

```
src/
  App.tsx                    routes + auth guard + shared bottom nav
  components/                ui.tsx (Icon/Avatar/ScreenHeader/ProgressRing/...), BottomNav
  context/AuthContext.tsx    session restore, sign in/up, OTP, demo-mode fallback
  lib/
    supabase.ts              lazy client, configured/demo detection
    api.ts                   data layer with demo fallback for every call
    types.ts                 domain types mirroring the SQL schema
    demo.ts                  demo dataset + points/level maths
  screens/
    01..20_*.tsx             the Stitch screens, ported verbatim then wired
    gamification/            ScanCheckpoint, Leaderboard, BadgeShelf, AdminDashboard
    Notifications/ForgotPassword/EditProfile/RecordClip/Privacy  (new, same tokens)
scripts/
  convert_stitch.py          re-ports the Stitch HTML exports into TSX
  make_icons.py              generates the PWA icons (stdlib-only PNG writer)
  verify_ui.py               headless-Chrome verification of every route
verify/                      screenshots + report.json from the last verification run
supabase/
  migrations/0001_init.sql   enums, tables, RLS, scan_checkpoint(), badges, leaderboard view
  seed.sql                   badges, checkpoints, FitTrips, clubs
```

## Thesis objectives → where they live

| Objective | Implementation |
| --- | --- |
| Secure student auth (obj 3) | `AuthContext` + Supabase email/OTP, `/signup → /verify → /otp → /onboarding` |
| QR/NFC checkpoint validation (obj 4) | `scan_checkpoint()` RPC (cooldown + anti-double-scan), `/scan` screen |
| Dynamic points algorithm (obj 5) | difficulty multipliers (easy 1.0 → epic 2.5), level = `floor(sqrt(points/100))+1` |
| Leaderboard (obj 6) | `leaderboard` SQL view, `/leaderboard` podium + table |
| Badges (obj 7) | `award_eligible_badges()` over scans/points/streak/distance, `/badges` |
| Admin dashboard (obj 8) | `is_admin()` policies, `/admin` analytics |
| Usability (obj 9) | design fidelity verified by `scripts/verify_ui.py` against the Stitch screens |

## Verification

```bash
npm run dev &               # dev server must be running
python scripts/verify_ui.py # 29 routes: screenshots, console errors, token checks,
                            # and text diff against the original Stitch HTML
```
