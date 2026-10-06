# CHAPTER FOUR: DESIGN AND IMPLEMENTATION (CONTRIBUTION)

## 4.1 Introduction and Statement of Contribution

This chapter presents the research contribution: the design and implementation of CampusFit. The contribution is not merely that an application exists, but that four elements are unified in one verifiable artefact — (a) a campus-anchored checkpoint model, (b) a reward allocation routine that executes exclusively inside the database transaction and writes an append-only audit trail, (c) a motivation layer whose mechanics are each mapped to a behaviour-change technique, and (d) an administration surface that supplies the continuing content the novelty-decay literature demands.

## 4.2 System Architecture

The system has three tiers.

**Client tier.** A React 19 application written in TypeScript, styled with Tailwind CSS against a tokenised Material 3 palette, bundled by Vite and delivered as an installable Progressive Web Application with a generated service worker. The client holds no authority over rewards: it renders state, collects the checkpoint code, and displays the server's decision.

**Backend tier.** Supabase provides three services: authentication (email and password with email verification and one-time-code confirmation), the Postgres database with row-level security, and the REST/data client generated from the schema. Business logic lives in two database functions rather than in an application server, so that a modified browser cannot bypass validation.

**Physical tier.** Printed checkpoint signs carry a QR encoding a short opaque code such as `LIB-A1`. The same string can be written to an NFC tag without any schema change.

The request path for a scan is: user submits code → client calls the `scan_checkpoint` database function → the function resolves the checkpoint, applies the cooldown, difficulty, and ledger rules in a single transaction → returns a structured result → the client renders the award and refreshes the profile rollup. Because the computation occurs server-side, the client's only remaining responsibility is presentation.

**Deployment topology.** The client is a static bundle — HTML, JavaScript, CSS, icons — hostable on any static file host or CDN, with no server-side rendering and no session state held by the host. Environment configuration is injected at build time, so the same source produces a demo artefact (no credentials; a local dataset and simulated scans) or a connected artefact (live project URL and anonymous key), which is how design verification proceeded before credentials existed. The backend is a managed service: authentication, Postgres with row-level security, and a REST layer generated directly from the schema. Migrations are versioned SQL applied through the command-line interface and seeds are plain scripts, so any environment — development, staging, evaluation — can be reconstructed from the repository rather than from a hand-maintained console state. There is no application server to operate, patch, or scale horizontally: the only stateful component is the database, and every other tier is disposable and reproducible.

## 4.3 User Interface Design

### 4.3.1 Deriving a Design System Rather Than Redrawing Screens

Interface design began from twenty specification screens produced in a design tool for this product (Appendix B). Rather than reinterpreting them, the implementation extracted the design system those screens share — colour tokens, the type scale, spacing, radii, and shadows — and reproduced those tokens exactly in the styling configuration, then ported the screen markup itself. This yielded a measurable fidelity property: every specification screen could be compared automatically against its implementation (Section 5.3).

The extracted tokens include a cream background (`#FAF5EE`), a mint primary (`#1ECC8B` with a deep variant `#006C47` for text on light surfaces), amber (`#F5A623`) and purple (`#C07EFF`) accents, an outline pair for borders, a 20-pixel card radius, and the Outfit type family with a display/headline/title/body/label scale.

### 4.3.2 Screen Inventory and Information Architecture

Twenty specification screens were implemented: splash, log in, create account, student verification, OTP verification, onboarding interests, student dashboard, FitClips inspiration, FitClips vertical feed, FitTrip explorer (list, map, and search), activity statistics, student profile, club dashboard, settings, help and FAQ, report a problem, submission success, and the logo mark.

Seven operational screens were added because a production system requires them and the specification did not cover them: **scanner**, **leaderboard**, **badge shelf**, **administration dashboard**, **notifications**, **edit profile**, and **privacy**; plus **forgot password** and **record FitClip**. Each was built from the same tokens, components, and type scale so that the extension is indistinguishable in provenance from the specification.

Navigation uses a floating pill bar with five positions — home, explore, scan (the elevated centre action), FitClips, and profile — with secondary screens presented as stacked views with back navigation. The scan action is deliberately the most prominent control in the product because scanning is the atomic behaviour the whole system exists to encourage.

### 4.3.3 Motion and Feedback

Motion is used to make state changes legible rather than decorative: the dashboard progress ring animates from empty to its true value on mount, chart bars grow from the baseline, cards fade up in sequence, badges pop when earned, the scanner sweep line runs continuously to indicate readiness, and toggles and buttons compress on press. All motion is suppressed under the operating system's reduced-motion preference, so the expressive layer never becomes an accessibility barrier.

### 4.3.4 Component Architecture and Accessibility

Cross-screen consistency was achieved structurally rather than by inspection. Interface behaviour is concentrated in a small component library — `ScreenHeader`, `ProgressRing`, `Avatar`, `Alert`, `EmptyState`, `DifficultyPill`, the `Icon` set, and the shared bottom navigation — so that the progress ring on the dashboard is literally the same implementation as the ring on the profile, and an error alert rendered after a failed scan is the same component that renders a failed sign-in. Screens compose these primitives; they do not reimplement them.

The design tokens have a single source of truth in the styling configuration: the cream background, mint primary and deep variant, amber and purple accents, the outline pair, the 20-pixel card radius, the type scale, and the motion durations are declared once and consumed by every route. A token change therefore propagates to all twenty-nine routes at once, and — more importantly for evaluation — a route that bypasses the tokens fails the token check in the verification suite rather than failing silently as a visual inconsistency.

Accessibility work is incremental but deliberate. Icon-only controls carry `aria-label` attributes, including the elevated centre scan action in the bottom navigation; interactive elements are native buttons and links rather than click-handled containers, so keyboard and assistive-technology semantics are preserved; and the reduced-motion handling described above is implemented at the system level. The application is not claimed to conform to a formal accessibility standard — that audit is recorded as future work in Section 6.8 — but the primitives required for one are in place.

## 4.4 Data Model

The relational schema comprises eleven tables and supporting objects.

- **profiles** — one row per user: display name, campus, avatar, interests, points, level, streak, distance and active-minute totals, verification status, and role (`student` or `admin`).
- **checkpoints** — code (unique), name, description, location, optional coordinates, difficulty, base points, active flag.
- **checkpoint_scans** — immutable record of each validated visit: user, checkpoint, points awarded, timestamp.
- **points_ledger** — append-only audit trail: user, signed delta, reason string, optional reference id, timestamp.
- **badges** — code, name, description, icon, tier, metric, requirement.
- **user_badges** — earned badges with timestamp.
- **fitclips**, **fitclip_likes** — social feed content and reactions.
- **fittrips** — named routes with distance, difficulty, and participation count.
- **clubs** and **club_members** — community grouping and membership.
- **problem_reports** — support submissions with status.

Five enumerations constrain values (verification status, role, difficulty, badge tier, badge metric), which prevents the classic drift of free-text categories.

Three database objects carry logic. The **`leaderboard` view** ranks students by points using a window function, so ranking is computed once per query and never trusted from the client. The **`award_eligible_badges` function** evaluates every badge definition against a user's aggregates and inserts newly satisfied awards idempotently. The **`scan_checkpoint` function** implements the points economy described next.

Row-level security is enabled on every table, with policies that follow one rule: a student reads their own rows and public reference data, writes only through the designated functions, and administrators read everything. The `is_admin()` helper reads the role from the profile rather than from a client-supplied claim.

### 4.4.1 Constraints, Indexes and Query Behaviour

The schema enforces several invariants that application code could otherwise forget. `checkpoints.code` and `badges.code` carry unique constraints, so a duplicated code cannot exist even if the administration surface is used incorrectly, and checkpoint resolution by code is served by a dedicated index (`checkpoints_code_idx`) rather than by a table scan. `checkpoint_scans` carries a composite unique constraint on (user, checkpoint, timestamp), which makes byte-identical duplicate writes impossible at the storage layer. Every points column is guarded by a check constraint (`points >= 0` on profiles, `base_points > 0` on checkpoints), so a negative award or a free checkpoint is rejected by the database regardless of which path produced it. Foreign keys cascade from scans, ledger entries, and memberships to their parent rows, which prevents orphaned reward history when an account is removed.

Read paths were indexed to match the access patterns the interface actually produces: per-user scan history and streak computation are served by `checkpoint_scans_user_idx` on (user, timestamp descending); ledger reconstruction and audit queries by `points_ledger_user_idx` on the same shape; and the active-checkpoint board by `checkpoints_active_idx`. The leaderboard view computes `rank() over (order by points desc, created_at asc)` over the profile table and returns a bounded result, which is a single sort over one row per student — a cost that grows linearly with the campus population and is negligible at that scale (Section 5.4.2 reports the measured latency). Should an institution deploy to a population where that sort dominates, an index on the ordering columns is the identified remedy; the query shape does not need to change.

## 4.5 Checkpoint Validation and the Points Algorithm

The validation routine is the technical heart of the study (specific objectives four and five). Its logic is:

1. Normalise the submitted code and resolve the checkpoint; fail with `checkpoint_not_found` if it does not exist or is inactive.
2. Enforce a per-user, per-checkpoint cooldown of eight hours; a violation returns `cooldown` with a retry interval. This defeats rapid replay of a single photographed code.
3. Resolve the difficulty multiplier: easy 1.0, medium 1.3, hard 1.8, epic 2.5.
4. Compute the award as `round(base_points × multiplier)`.
5. Insert the immutable `checkpoint_scans` row and the `points_ledger` entry in the same transaction.
6. Recompute the profile rollup: total points, streak (same-day scans preserve the streak, a gap resets it), and level as `floor(sqrt(points / 100)) + 1`.
7. Invoke badge evaluation.
8. Return a structured result containing the award, the new total, and the checkpoint metadata for display.

Two design decisions deserve justification. **Difficulty multipliers are non-linear on purpose**: the epic multiplier (2.5) is more than double the easy multiplier so that aspirational targets remain worth pursuing — the flow-theoretic requirement from Section 2.2.2. **The level curve is square-root based**, so early levels arrive quickly (the first level after 100 points, the sixth after 2,500) while later levels cost progressively more, producing the diminishing-return shape that keeps advanced users engaged without making the start feel unattainable.

The auditable ledger is what elevates this from a game counter to a research instrument: every point can be traced to a checkpoint, a timestamp, and a rule, which makes the evaluation in Chapter Five evidential rather than anecdotal.

**Worked example.** A student standing on the Main Library steps submits the code printed on the sign, `LIB-A1`. The function resolves the row (`easy`, base 10), finds the most recent scan of that checkpoint by that user, and — because none exists or it is older than eight hours — computes `round(10 × 1.0) = 10`. In the same transaction it inserts a `checkpoint_scans` row, inserts a `points_ledger` row with delta 10 and reason `checkpoint:LIB-A1`, recomputes the profile rollup (total points, streak, level), and evaluates badge eligibility. The response carries the award and the new total, which the interface renders alongside the distance to the next level. Were the same code submitted again sixty seconds later, step two would return `cooldown` with a retry interval measured from the original scan, and no row would be written — the behaviour confirmed empirically by the end-to-end suite in Section 5.2.3. The same sequence against `STAD-1` (`medium`, base 18) yields `round(18 × 1.3) = 23` points, which is the multiplicative path the difficulty tier is intended to open.

## 4.6 Badges, Leaderboards and Streaks

Thirteen badge definitions span four tiers (bronze, silver, gold, legendary) across five metrics: total scans, distinct checkpoints visited, total points, consecutive-day streak, and distance covered. Badge eligibility is evaluated server-side after each scan, so a student cannot award themselves.

The leaderboard is intentionally bounded. Rather than presenting an intimidating full table, the interface shows a podium for the top three and a window of rows around the requesting student, with the student's own rank and points always visible at the top of the screen. Rankings are presented as a weekly league so that a new participant can plausibly enter the table — the design response to the demotivation risk analysed in Section 2.7.

Streaks provide the habit-formation channel: they are computed from scan dates rather than from raw counts, so two scans in one day do not double the streak and a missed day does.

### 4.6.1 Atomicity, Idempotency and Failure Semantics

The reward path is designed so that partial states are unobservable. The award computation, the immutable scan row, the ledger entry, the profile rollup, and the badge evaluation execute inside one database transaction: either all of them commit or none of them do. A failure at any step — a malformed code, a missing checkpoint, a constraint violation — aborts the transaction and returns a structured result to the interface, so the system cannot enter a state in which points were announced but not recorded, or recorded but not reflected in the total. The end-to-end suite exercises precisely this property from the outside: after a successful scan it checks three separate tables, and after a rejected scan it checks that nothing changed.

Idempotency is provided by two mechanisms rather than one. The cooldown makes repeat submission of the same code a no-op with a structured `cooldown` response and a retry interval, which prevents both accidental double-taps and deliberate replay. The badge award is protected by a uniqueness constraint on (user, badge), so the eligibility function can be invoked after every scan — and can therefore be safely re-run after any future rule change — without ever duplicating an award. Together these mean the system's entry points are safe to retry, which is the property a mobile client on an unreliable network needs: a request that times out and is retried produces the same outcome as a request that succeeded once.

The failure vocabulary is deliberately small and enumerated (`checkpoint_not_found`, `cooldown`, and authentication or permission errors), so the interface can render specific remediation text rather than a generic failure — the error-recovery behaviour evaluated by the heuristic inspection in Section 5.6.

## 4.7 Progressive Web App Behaviour and Performance

The build produces a manifest and a service worker that precaches the application shell, so the interface opens instantly and renders cached content without connectivity; data-dependent screens show explicit empty or offline states rather than blank frames. The precache covers the shell assets — JavaScript, CSS, HTML, icons and fonts — eleven entries totalling approximately 743 KiB, of which the compressed first load is approximately 207 kB (Section 5.4.1).

Remote data follows a two-tier policy rather than a single blanket rule. Immutable design imagery (avatars) is served cache-first with a bounded thirty-day expiry, because a stale avatar is harmless. Live application data — points, ranks, boards, checkpoint lists — is served network-first with a five-second timeout and a seven-day fallback window: the network is always tried first so that a student never sees yesterday's leaderboard while online, and the cache is consulted only when the network is unavailable or slow, at which point a bounded stale view is explicitly better than an empty screen. This distinction matters for correctness as much as for experience: a cache-first policy applied to the API would have made rankings and totals silently stale, which would violate the trust precondition argued in Section 2.7.2.

Performance discipline is enforced at build time: the type check runs before bundling, the bundle is a single codebase for all platforms, and the production build completes in seconds. Section 5.4 reports the measured artefact sizes.

## 4.8 Security Model

Four controls respond to the threats identified in Section 2.6. **Server-side computation** means the award never depends on client-supplied values. **Cooldown enforcement** inside the transaction defeats rapid replay. **Append-only storage** of scans and ledger entries means rewards cannot be silently edited; corrections must appear as new entries. **Row-level security** ensures that even a leaked anon key cannot read another student's rows or write to reference tables.

Administrative actions are gated by a role column evaluated in the database, not by hiding buttons in the interface — a distinction that matters because interface hiding is not a security control. Residual risks (collusion between students, screenshot sharing of codes) are acknowledged in Section 3.9's discussion of future mitigations: time-boxed signed codes, device attestation, and optional geofence confirmation.

## 4.9 Implementation Process and Division of Labour

Implementation followed the five phases of Section 1.11, with the three-person division of labour described there: interface and component work (design-system port, screen implementations, motion), backend and logic (validation routine, points and badge algorithms, leaderboard view), and data and analytics (schema, migrations, seeds, reporting).

Quality gates were continuous rather than deferred: the type checker gates every build — the `build` command is defined as the type check followed by the bundle, so no artefact can be produced from a type-error state — the route-verification suite gates every interface change, and the end-to-end transaction test gates changes to the reward path. Section 5.2 reports the results of these gates as executed.

Integration across the three workstreams was deliberately synchronous rather than deferred to an end-game merge: the data layer, the validation routine, and the interface were exercised together in working sessions against a live staging copy of the schema, because the failure modes that matter most (a policy that silently returns no rows, a function that returns a shape the interface does not expect) only appear at the seams. The alternative — integrating once at the end — was rejected precisely because those seam failures are the expensive ones to locate.

## 4.10 Summary

This chapter presented the contribution: a three-tier architecture that locates all reward authority in the database; a token-faithful interface comprising twenty specification screens plus nine operational extensions; an eleven-table relational model with row-level security; the validation and points algorithms with their justifications; the badge, leaderboard, and streak mechanics; PWA delivery; and the security model with its residual risks. Chapter Five evaluates the system.
