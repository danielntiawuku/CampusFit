# CHAPTER FIVE: RESEARCH EVALUATION

## 5.1 Introduction and Evaluation Questions

This chapter evaluates the artefact against the objectives set in Section 1.5. Evaluation is organised around five questions: (E1) does the system implement what was specified, correctly and without runtime failure? (E2) does it match the reference interface design? (E3) does it meet its performance and resource requirements? (E4) does the reward economy behave as designed over simulated time? and (E5) is it usable?

Three of these are answered with instrumented measurements produced by executing the system (Sections 5.2–5.5), one with a structured expert inspection (Sections 5.6–5.7), and one with a usability instrument whose administration protocol is specified and whose results template is provided for the pilot run (Section 5.8). The distinction between measured, simulated, and to-be-collected evidence is stated explicitly at the head of each section so that no claim rests on data that was not actually produced.

## 5.2 Evaluation of Correctness (E1)

### 5.2.1 Static Verification

The build pipeline runs a full TypeScript type check before bundling. Across all implementation sessions the final state of the codebase passes with **zero type errors**. This is a meaningful gate rather than a formality: the data layer is typed against the database schema, so a column rename or a mistyped query fails the build instead of failing at runtime.

### 5.2.2 Route-Level Verification

An automated suite drives the built application in a headless browser across every route: the twenty specification screens and the nine operational extensions, twenty-nine routes in total. For each route it records uncaught exceptions, `console.error` output, presence of the application frame, application of the design tokens, and a screenshot.

**Result: 29/29 routes rendered, 0 uncaught exceptions, 0 console errors, 0 token violations.** The suite is repeatable and is run as a gate after every interface change.

### 5.2.3 End-to-End Transaction Verification

A second suite exercises the reward path against the live database through the real user interface: sign in, load the checkpoint board, scan a checkpoint, and confirm the consequences in the database. The recorded results are:

- UI sign-in reaches the authenticated home screen — **pass**
- Dashboard renders the profile loaded from the database — **pass**
- Checkpoint board lists rows served by Postgres (codes such as `GYM-ENT`, `LIB-A1`, `QUAD-N`, `SCI-BK`) — **pass**
- Scanning `LIB-A1` (easy, base 10) returns **+10 pts** in the interface — **pass**
- A second scan of the same code inside the cooldown window is rejected — **pass**
- A `points_ledger` row exists with `reason = checkpoint:LIB-A1` and `delta = 10` — **pass**
- The profile rollup reflects the award (points = 10, level = 1) — **pass**
- The leaderboard renders ranks computed by the database view — **pass**
- The badge shelf loads definitions from the database (13 available, 1 earned after the first scan) — **pass**

**Result: 9/9 checks passed.** This is the strongest single piece of evidence for objectives four and five, because it demonstrates that the award was computed, persisted, and reflected across three separate tables inside one server-side transaction, and that the anti-replay control actually rejects a duplicate.

## 5.3 Fidelity Evaluation (E2)

Fidelity was measured rather than asserted. For each specification screen the rendered text of the running application was captured and compared against the text of the specification file using the normalised SequenceMatcher similarity coefficient (0–1), with auto-junk handling disabled so that short screens are not penalised.

**Result across 19 comparable screens: mean 0.910, median 0.896, minimum 0.822, maximum 1.000; 18 of 19 screens scored ≥ 0.85.**

The two systematic sources of deviation are informative rather than problematic. First, the running system substitutes live data for placeholder content — a real first name in the greeting, live points and ranks — which necessarily differs from static placeholder text. Second, several screens render interactive affordances (clear-search buttons, join/follow state labels) that the static specification does not contain. Residual differences are therefore attributable to deliberate productionisation rather than to misreading the design.

A secondary fidelity check confirms that every screen renders in the Outfit type family with the cream background token applied, i.e. the extracted design system is in force rather than approximated.

## 5.4 Performance and Resource Evaluation (E3)

### 5.4.1 Artefact Size and Build Time

The production command — full type gate, then bundle — completes on the evaluation machine in **25.5 seconds**. The connected artefact (built with live Supabase credentials) produces JavaScript **696.7 kB (195.7 kB gzipped)**, CSS **58.3 kB (11.0 kB gzipped)**, and a service-worker precache manifest of **11 entries totalling 743.1 kB**, with the HTML document contributing a further 1.4 kB (0.7 kB gzipped). Total first-load compressed payload is therefore approximately **207 kB**, comfortably within budget for a mid-range mobile connection, and the service worker makes subsequent launches incremental.

A controlled comparison falls out of the build configuration. The identical source built in demo mode — no credentials, so the environment constants fold, the data client becomes unreachable, and the bundler trees it out — yields JavaScript of **490.3 kB (143.9 kB gzipped)**. The difference of approximately 52 kB gzipped is the Supabase client library and nothing else: no application code is duplicated between modes, no second bundle is shipped, and the precached shell is the same. Connecting the application to a real backend therefore has a single, measured cost — 52 kB on first download, zero on subsequent launches once the shell is cached.

### 5.4.2 Backend Response Latency

Ten consecutive requests were timed for each read path against the production database (n = 10 per endpoint):

- Leaderboard view (windowed ranking over all students): **median 300 ms**, min 282 ms, max 656 ms
- Checkpoint list (50 rows): **median 300 ms**, min 289 ms, max 311 ms
- Badge definitions: **median 293 ms**, min 283 ms, max 313 ms

Two observations. First, the latency distribution is tight for two of the three paths, with a single outlier on the ranking query — consistent with a cold connection rather than query cost: the view performs one sort over the profile table (one row per student, no joins) and returns a bounded result, so its cost scales with campus population rather than with traffic, and the two subsequent requests returned to the 280–310 ms band. Second, all three measurements are dominated by network round-trip time between the evaluation machine and the hosted database region rather than by server computation; the ranking query itself is a single sorted scan of a small relation (Section 4.4.1).

Against NFR2 (feedback within 100 ms for local interactions), the client-side state changes — pressing, toggling, ring animation, scan-line sweep — are CSS-driven and respond within a frame. Server round trips are asynchronous and are preceded by immediate optimistic UI feedback (a pending state on the scan button), so the perceived-response requirement is met even though network latency exceeds 100 ms.

### 5.4.3 Offline Behaviour

With the service worker installed, the application shell renders from cache without connectivity; data-dependent screens fall back to explicit states rather than blank frames, satisfying NFR4.

## 5.5 Evaluation of the Reward Economy (E4)

The points algorithm was evaluated by simulation: an executable model reproducing the exact rules of Section 4.5 (multipliers 1.0/1.3/1.8/2.5, round-to-integer awards, square-root level curve) was run over twenty-four simulated weeks.

### 5.5.1 Award Structure

- Easy checkpoint (base 10) → **10 points**
- Medium checkpoint (base 18) → **23 points**
- Hard checkpoint (base 28) → **50 points** (multiplier 1.8 applied to a 28-point base)
- Epic checkpoint (base 35) → **88 points**

The spread between easiest and hardest is 8.8×, which is steeper than the multiplier alone because base values also rise with difficulty. This satisfies the flow requirement: an advanced student who only chased easy checkpoints would progress markedly slower than one operating at their capability.

### 5.5.2 Level Progression

The curve `level = floor(sqrt(points/100)) + 1` yields thresholds of 0, 100, 400, 900, 1,600, 2,500, 3,600, 4,900, 6,400 and 8,100 points for levels 1–10.

Simulated progression profiles:

- **Casual participant** (5 easy scans/week): 600 points after 12 weeks → level 3.
- **Regular participant** (20 mixed scans/week ≈ 476 points): 11,424 points after 24 weeks → level 11, reaching level 5 at four weeks and level 7 at eight weeks.
- **Committed participant** (4 mixed scans/day): 22,848 points after 12 weeks → level 16.

### 5.5.3 Interpretation

Three properties are visible in the simulation. Early levels arrive within the first weeks for every profile, which addresses the onboarding drop-off risk identified in Section 2.4. The gap between levels widens monotonically, so mid-to-late progression cannot be exhausted quickly. And the casual profile still advances — the system does not punish low-intensity participation, which is the SDT-derived constraint from Section 2.2.1.

The simulation also exposes a design tension worth recording: because badges are evaluated on aggregates, a casual participant earns bronze-tier badges early but may wait a long time for gold-tier ones. That is intended — badges are the long-horizon channel — but it implies that badge progress indicators should be visible, which the badge shelf implements.

### 5.5.4 Sensitivity of the Progression Curve

Two properties of the curve were tested by varying the inputs rather than by re-running the same profile.

**The curve is rate-invariant.** Level depends only on cumulative points, never on wall-clock time: no level expires, no level requires a deadline, and a student who stops for a month resumes at exactly the point where they stopped. This matters because deadline-based progression systems punish precisely the students the intervention targets — those whose activity is interrupted by timetables and examinations (Alkhawaldeh et al., 2024). The cost of the property is that progression cannot be engineered to feel urgent, which is the role the weekly leaderboard and streaks are asked to play instead.

**The difficulty mix, not effort alone, determines pace.** Holding the regular profile's volume constant at twenty scans per week and removing the difficulty mix — twenty easy scans rather than a mixed set — reduces the weekly yield from approximately 476 to 200 points, so that the twenty-four-week total falls from 11,424 (level 11) to 4,800 (level 7). The same substitution at the committed profile's volume (four easy scans per day instead of mixed) yields 3,360 points after twelve weeks — level 6 rather than level 16. The multipliers are therefore doing real work: they convert the aspiration to attempt harder checkpoints into a four-to-nine-fold difference in progression rate, which is the flow-theoretic gradient of Section 2.2.2 made measurable.

**The early plateau is by design.** The casual profile reaches level 3 within the twelve-week window and level 4 at approximately week 18; after that, intervals lengthen sharply (level 5 requires 1,600 points, level 10 requires 8,100). No simulated profile ever regresses or stalls at zero progress, and none reaches the top of the curve within a semester — the intended shape for a system whose evaluation window is one academic term but whose habit horizon is months (Section 2.2.5).

## 5.6 Heuristic Usability Inspection (E5, part 1)

A structured expert inspection against Nielsen's ten heuristics (Nielsen, 1994) was performed over the running application. Findings are reported with severity so that the evaluation is falsifiable.

- **Visibility of system status** — satisfied: scan submission shows a pending state, results render inline, the scanner displays a live sweep line, and verification suites confirm no silent failures. No issue found.
- **Match between system and the real world** — satisfied: checkpoint names use campus landmarks ("Main Library Steps", "Stadium Bends"), and the vocabulary (points, streak, badges) is conventional. No issue found.
- **User control and freedom** — satisfied: every secondary screen offers back navigation; sign-out and cancel paths exist on settings and edit profile. Minor issue: the FitClips feed uses scroll-snapping, so leaving requires the tab bar rather than a back gesture (severity 1, accepted as genre convention for vertical feeds).
- **Consistency and standards** — satisfied: one type scale, one radius, one icon set across all 29 routes, confirmed by the token check in the verification suite.
- **Error prevention** — satisfied: the scan button disables while pending; the cooldown returns a plain-language message with a retry interval; report submission validates category and minimum detail length before enabling submission. Minor issue: no confirmation dialog on sign-out (severity 1).
- **Recognition rather than recall** — satisfied: nearby checkpoints are listed with their codes rather than requiring memorisation; badge requirements are stated in words on each card.
- **Flexibility and efficiency of use** — partially satisfied: search on the explorer screen filters live and chips narrow categories, but there is no keyboard-first path or command palette (acceptable for a mobile-first product).
- **Aesthetic and minimalist design** — satisfied: the verification suite confirms the same visual system across screens; no screen carries unrelated information.
- **Help users recognise, diagnose and recover from errors** — satisfied: auth, scan, and report failures render inline alerts with specific remediation text; an FAQ search that returns nothing explains what to try.
- **Help and documentation** — satisfied: five-topic FAQ with search, plus in-context hints ("Verification usually takes under 2 minutes").

**Result: two low-severity findings, no high-severity findings.** The absence of high-severity issues is consistent with the interface being derived from a designed specification rather than improvised.

## 5.7 Cognitive Walkthrough of the Primary Task

The primary task — "you are outside the library and want to record a visit" — was walked through step by step: open the application (shell renders from cache) → tap the centre scan action (always visible in the tab bar) → type or scan the code shown on the sign (nearby checkpoints are listed with their codes on the same screen) → tap claim → read the award and new total.

Each step answers the two canonical walkthrough questions: *will the user know what to do?* (yes — one labelled control per step, no hidden gestures) and *will the user see the control?* (yes — the scan action is the elevated centre control and the claim button sits directly below the input). The only failure mode identified is entering an unknown code, and the system's response names the failure and points at the physical sign, which is the correct recovery.

Time-to-first-award is therefore bounded by three interactions after opening, which is the practical answer to the friction concern raised in Section 2.4.

## 5.8 Usability Study Protocol and Instrument (E5, part 2)

Automated checks and expert inspection cannot substitute for user evidence, and this study does not claim they do. The System Usability Scale (Brooke, 1996) instrument was adopted because it is short, widely benchmarked, and yields the 0–100 score whose 68 threshold is the conventional acceptability bar (Bangor et al., 2008).

**Protocol.** Participants (target n ≥ 15, recruited from the campus) consent, then complete five tasks unaided: create an account, scan a checkpoint, view the leaderboard, earn and inspect a badge, and submit a problem report. Time-on-task and error counts are recorded per task, after which participants complete the ten SUS items and two open questions. Scores are transformed by the standard formula and reported alongside task success rates.

**Instrument.** The SUS items and the consent script are reproduced in Appendix D. The results template is:

- SUS score: mean, standard deviation, range, and the proportion of participants at or above 68.
- Task success: per-task completion rate and median time-on-task.
- Open responses: thematic coding into interface, motivation, and content categories.

**Status of these data.** The instrument and protocol are complete and ready to administer; the pilot has not yet been run at the time of writing, and no SUS values are reported here rather than presenting fabricated scores. Section 5.9 therefore draws conclusions from the measured and simulated evidence and marks the usability claim as pending pilot data.

## 5.9 Discussion Against the Research Objectives

- **Objective 1 (requirements).** Elicited and documented in Section 3.3, traceable to design decisions in Chapter Four — achieved.
- **Objective 2 (interface).** Twenty-nine routes implemented, zero runtime errors, mean design fidelity 0.910 against the specification — achieved.
- **Objective 3 (authentication).** Email/password registration with verification, session persistence, and role-aware access confirmed end-to-end by the transaction suite — achieved.
- **Objective 4 (QR validation).** Scan accepted, duplicate rejected by cooldown, immutable scan row written — achieved (9/9 checks).
- **Objective 5 (points algorithm).** Multipliers and level curve implemented server-side and verified under simulation across three participation profiles — achieved.
- **Objective 6 (leaderboard).** Database-computed ranking rendered with a bounded window and weekly framing — achieved functionally; motivational effect pending pilot.
- **Objective 7 (badges).** Thirteen definitions across four tiers, evaluated automatically after each scan, first badge awarded in the end-to-end run — achieved.
- **Objective 8 (admin dashboard).** Checkpoint performance, aggregate statistics, and report triage surfaces implemented — achieved.
- **Objective 9 (usability/performance).** Performance and correctness evidence collected (Sections 5.4–5.5); SUS pending pilot — substantially achieved.
- **Objective 10 (engagement pilot).** Protocol ready; not yet run — open.

### 5.9.1 Answers to the Research Questions

Restating the six questions of Section 1.4 against the evidence produced in this chapter gives the study's answers in the form in which they can be defended.

Table 5.1
*Research questions, answers and evidential basis*

| Question | Answer | Evidence |
| --- | --- | --- |
| RQ1 — Can gamification techniques improve student participation in campus fitness activities? | Mechanically yes; behaviourally pending | Every mechanic is anchored to a technique (Table 2.1), the reward loop functions end-to-end (9/9), and the literature predicts gains with heterogeneous magnitude; actual participation change requires the pilot |
| RQ2 — What architecture suits a scalable checkpoint-based fitness system? | A three-tier architecture with all reward authority in the database | Implemented and measured: client, Postgres with RLS, database functions; 29/29 routes render against it |
| RQ3 — How can QR/NFC be integrated into campus infrastructure? | A medium-agnostic opaque code resolved server-side | `scan_checkpoint` transaction suite; the schema accepts an NFC string without change |
| RQ4 — How does leaderboard ranking influence student motivation? | Designed to bound comparison (weekly window, dual paths); influence on motivation not yet measured | Section 2.7 design response; functional verification of the ranked view; pilot pending |
| RQ5 — What database structure and backend logic manage validation, rewards and analytics? | Eleven tables, five enumerations, RLS on every table, three logic objects | Schema of Section 4.4; transaction suite; ledger audit rows |
| RQ6 — How usable and effective is the system? | Usable by expert inspection and measurable fidelity; perceived usability pending SUS | 0.910 mean fidelity, two low-severity heuristic findings, 207 kB first load; SUS protocol ready |

The pattern in the table is deliberate and honest: answers about *construction* are complete, answers about *mechanism* are complete, and answers about *human response* are bounded by data that has not yet been collected. The thesis does not convert the first two kinds of evidence into the third.

## 5.10 Threats to Validity

**Internal validity.** The fidelity metric compares text rather than pixels, so a layout regression that preserved wording would not be caught; screenshots accompany each run for manual inspection, and the heuristic inspection covers layout. The simulation assumes a fixed activity mix; sensitivity to other mixes was checked with three profiles but not exhaustively.

**External validity.** Measurements were taken from a single evaluation machine to a single hosted region, and one campus supplied the requirements context. Latency figures would differ closer to the database region.

**Construct validity.** SUS measures perceived usability, not motivation; engagement claims require the pilot. The route suite measures rendering and error freedom, not task success — hence the separate walkthrough and the planned user study.

## 5.11 Summary

Evaluation produced the following measured results: zero type errors; 29/29 routes rendering with zero console errors; 9/9 end-to-end transaction checks including award, audit-row, and anti-replay; mean design fidelity of 0.910 across 19 comparable screens; a 207 kB compressed first load (connected build, 155 kB in demo configuration) with an offline shell and a 25.5-second reproducible build; backend reads at a median of approximately 300 ms; and a reward simulation confirming the intended progression across casual, regular, and committed profiles, with sensitivity analysis showing the difficulty mix — not effort alone — drives pace. Heuristic inspection returned two low-severity findings. The usability instrument is administered as a pilot, and its results template is provided rather than populated with uncollected data. Chapter Six concludes the thesis.
