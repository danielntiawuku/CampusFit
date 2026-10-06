# APPENDICES

## APPENDIX A: COMPARATIVE MATRIX AND REQUIREMENTS TRACEABILITY

### Table A.1 — Comparison of existing systems against five dimensions

- **Key:** ✓ full, ◐ partial, ✗ absent.

| System | Activity tracking | Campus context | Competition | Auditable rewards | Institutional admin |
| --- | --- | --- | --- | --- | --- |
| Generalist trackers (Strava, Nike Run Club) | ✓ | ✗ | ✓ | ✗ | ✗ |
| Story-driven games (Zombies Run, Habitica) | ✓ | ✗ | ◐ | ✗ | ✗ |
| Location-based games (Pokémon Go class) | ◐ | ✗ | ✓ | ✗ | ✗ |
| Orientation QR scavenger hunts | ✗ | ✓ | ◐ | ✗ | ✗ |
| **CampusFit (this study)** | ✓ | ✓ | ✓ | ✓ | ✓ |

### Table A.2 — Traceability from objectives to evidence

| Objective | Requirement | Implementation | Evidence |
| --- | --- | --- | --- |
| 1 | FR/NFR elicitation | Section 3.3 | Chapter Three |
| 2 | Usable interface | 20 specification + 9 operational screens | Route suite (29/29), fidelity 0.910 |
| 3 | Secure auth | Supabase auth, OTP, roles | End-to-end sign-in check |
| 4 | QR validation | `scan_checkpoint()` with cooldown | 9/9 transaction checks |
| 5 | Points algorithm | Multipliers + square-root levels | Simulation (Section 5.5) |
| 6 | Leaderboard | SQL ranking view, bounded window | Leaderboard render check |
| 7 | Badges | `award_eligible_badges()`, 13 definitions | Badge shelf render check |
| 8 | Admin dashboard | `/admin` analytics surface | Route suite |
| 9 | Usability/performance | Type gate, latency, heuristic inspection | Sections 5.2–5.8 |
| 10 | Engagement pilot | SUS protocol (Appendix D) | Pending pilot |

## APPENDIX B: SCREEN INVENTORY AND DESIGN TOKENS

### Table B.1 — Implemented routes

Specification screens (from the design tool export): splash, log in, create account, student verification, OTP verification, onboarding interests, student dashboard, FitClips inspiration, FitClips vertical feed, FitTrip explorer list, FitTrip explorer map, FitTrip explorer search, activity statistics, student profile, club dashboard, settings, help and FAQ, report a problem, submission success, logo mark.

Operational extensions (built from the same tokens): scanner, leaderboard, badge shelf, administration dashboard, notifications, edit profile, privacy, forgot password, record FitClip.

Screenshots of every route are produced by the verification suite into `verify/shots/` (29 PNG files) with a machine-readable summary in `verify/report.json`.

### Table B.2 — Extracted design tokens

- Background `#FAF5EE`; surface `#F7FAF6`; card `#FFFFFF`
- Primary `#006C47`; primary container / brand mint `#1ECC8B`; secondary amber `#F5A623` (container `#FEAE2C`); tertiary purple `#7E3CBB` (container `#D09EFF`, accent `#C07EFF`)
- Outline `#6C7B70`; outline variant `#BBBABF`; error `#BA1A1A`
- Type: Outfit — display 48/56/700, headline 32/40/600, headline-mobile 28/36/600, title 20/28/600, body 16/24/400, body-lg 18/28, label 14/20/500, label-sm 12/16/600
- Spacing: 8 / 12 / 16 / 24 / 32, container padding 20; card radius 20 px

## APPENDIX C: REQUIREMENT QUESTIONNAIRE AND CONSENT

### Consent statement

You are invited to take part in a study supporting research on campus fitness technology. Participation is voluntary; you may skip any question or withdraw at any time without consequence. Responses are recorded anonymously and used only for academic analysis. The study involves no health or biometric measurement. By continuing you confirm you are at least 18 years old and consent to participate.

### Questionnaire items

1. How many days per week do you engage in at least 30 minutes of physical activity? (0–7)
2. Which of the following best describes your current activity level? (5-point scale from "very inactive" to "very active")
3. Rate how much each barrier affects you: time pressure, lack of motivation, cost, lack of company, not knowing where to go, safety concerns. (5-point scale each)
4. How motivating would each of the following be? points, badges, public ranking, club competition, personal streaks, campus exploration. (5-point scale each)
5. How often do you use a fitness application? (never / rarely / monthly / weekly / daily)
6. Open: What would make you keep using a fitness application after the first month?
7. Open: Which campus locations would you be willing to walk to for an activity reward?

## APPENDIX D: SYSTEM USABILITY SCALE INSTRUMENT AND TASK SCRIPT

### Tasks (administered in order, unaided)

1. Create an account and complete student verification.
2. Scan the checkpoint code `LIB-A1` and claim the points.
3. Open the leaderboard and identify your own rank.
4. Open the badge shelf and identify one badge you have earned and one you have not.
5. Submit a problem report about a checkpoint sign you could not read.

### SUS items (Brooke, 1996; score = (sum of adjusted items) × 2.5)

1. I think that I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think that I would need the support of a technical person to be able to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going with this system.

**Results template (to be populated by the pilot):** mean SUS, standard deviation, range, percentage of participants at or above the 68 benchmark (Bangor et al., 2008); per-task completion rate and median time-on-task; thematic codes from the two open questions.

## APPENDIX E: TEST EVIDENCE

### E.1 Static and build verification

- `tsc --noEmit` — 0 errors (gating step in `npm run build`).
- Production bundle (connected build): JavaScript 696.67 kB (195.70 kB gzip), CSS 58.25 kB (11.03 kB gzip), HTML 1.42 kB (0.67 kB gzip); service worker precache 11 entries / 743.06 KiB; total first-load ≈ 207 kB compressed.
- Production bundle (demo configuration, data client tree-shaken out): JavaScript 490.30 kB (143.91 kB gzip) — the 51.79 kB gzip difference is the Supabase client library.
- Full build command (`tsc --noEmit && vite build`): 25.5 s wall time on the evaluation machine.

### E.2 Route verification suite (29 routes)

- Routes rendered: 29/29
- Uncaught exceptions: 0; console errors: 0
- Design-token check (Outfit family, cream background, application frame present): 29/29
- Screenshots: 29 PNG files under `verify/shots/`
- Text similarity against specification (19 comparable screens): mean 0.910, median 0.896, min 0.822, max 1.000; 18/19 ≥ 0.85

### E.3 End-to-end transaction checks (9/9 passed)

| Check | Result |
| --- | --- |
| UI sign-in reaches `/home` | Pass |
| Dashboard renders database profile | Pass |
| Checkpoint board lists Postgres rows | Pass |
| Scan of `LIB-A1` awards +10 pts | Pass |
| Duplicate scan rejected by cooldown | Pass |
| `points_ledger` row written (`checkpoint:LIB-A1`, delta 10) | Pass |
| Profile rollup updated (points 10, level 1) | Pass |
| Leaderboard renders DB-computed ranks | Pass |
| Badge shelf loads definitions (13) and first award | Pass |

### E.4 Backend latency (n = 10 per endpoint)

| Endpoint | Median | Min | Max |
| --- | --- | --- | --- |
| Leaderboard view (limit 20) | 300.0 ms | 282.2 ms | 655.6 ms |
| Checkpoints (limit 50) | 299.5 ms | 288.7 ms | 311.4 ms |
| Badge definitions | 293.0 ms | 282.8 ms | 313.4 ms |

### E.5 Reward economy simulation

| Difficulty | Base | Multiplier | Award |
| --- | --- | --- | --- |
| Easy | 10 | 1.0 | 10 |
| Medium | 18 | 1.3 | 23 |
| Hard | 28 | 1.8 | 50 |
| Epic | 35 | 2.5 | 88 |

Level thresholds (points required): L2 100, L3 400, L4 900, L5 1,600, L6 2,500, L7 3,600, L8 4,900, L9 6,400, L10 8,100.

Progression profiles: casual (5 easy/week) → 600 points, level 3 after 12 weeks; regular (20 mixed/week ≈ 476 points) → 11,424 points, level 11 after 24 weeks; committed (4 mixed/day) → 22,848 points, level 16 after 12 weeks.
