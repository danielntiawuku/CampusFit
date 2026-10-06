# CHAPTER THREE: METHODOLOGY

## 3.1 Introduction

This chapter describes how the research was conducted. It justifies the research design, explains the requirement-gathering approach, documents the system modelling techniques, justifies every significant technology selection, defines the evaluation strategy, addresses ethical considerations, and acknowledges the inherent limitations of the chosen methods. The chapter is written so that another research team could reproduce the process with the same artefact as a result.

## 3.2 Research Design and Justification

### 3.2.1 Design Science Research Methodology

This study adopts Design Science Research Methodology (DSRM). Design science is the paradigm in which knowledge is generated through the deliberate construction and evaluation of an artefact that solves an identified problem in a real-world context (Hevner et al., 2004). It is appropriate here for three reasons. First, the research problem is a *build* problem: the gap identified in Chapter Two is an absence of a system, not an absence of measurements about an existing one. Second, design science explicitly requires evaluation of the artefact against utility and rigor criteria, which matches the institutional requirement for an evaluation chapter. Third, it permits the dual relevance demanded of applied computing research — the artefact must be both useful to the sponsoring context and informative to the research community.

Peffers et al. (2007) formalised DSRM into six activities: problem identification and motivation, definition of the objectives for a solution, design and development, demonstration, evaluation, and communication. This thesis follows that sequence directly: Chapter One performs activity one, Chapter Two grounds it, Chapter Three defines objectives and the design method, Chapter Four covers design, development and demonstration, Chapter Five performs evaluation, and Chapter Six communicates results.

### 3.2.2 Why Alternatives Were Rejected

An experimental design — for example a randomised trial of gamified versus non-gamified activity — would have required a deployed system, a control condition, and a sample size that a single undergraduate project cycle cannot deliver. A pure survey design would have produced attitudinal data without an artefact, which cannot satisfy specific objectives three through eight. A case study design would have been defensible but would not have produced the system the research objectives demand. DSRM therefore dominates the alternatives for this problem, and the empirical component is folded into DSRM's evaluation activity rather than substituted for it.

### 3.2.3 Research Approach

The study combines a **constructive** approach (building the artefact) with **descriptive and analytical** components (characterising requirements from literature and consultation, and analysing evaluation results). Quantitative methods dominate the evaluation: automated route verification, transaction-level database assertions, algorithmic simulation of the points system, and response-time measurement. Qualitative methods appear in requirement elicitation and in the thematic interpretation of usability feedback. The mixed character is deliberate: system correctness is objectively measurable, whereas usability is not.

### 3.2.4 Quality Criteria: Rigour, Relevance and Transparency

Design science imposes a dual obligation on the researcher: the artefact must be relevant to the context that motivated it, and the enquiry that produced it must be rigorous enough to survive scrutiny independent of that context (Hevner et al., 2004). Relevance was sought through three decisions — the problem was taken from documented student-activity evidence rather than invented, the requirements were elicited from the intended users themselves (Appendix C), and the resulting system was built to production standards rather than to demonstration standards, because a system that only works in a scripted walkthrough cannot support the evaluation claims made in Chapter Five.

Rigour was sought through four mechanisms. Every claim about the system's behaviour is produced by a repeatable script rather than by recollection: the type gate, the route-verification suite, the end-to-end transaction suite, the latency measurement, and the reward-economy simulation (Appendix E). Every instrument is reproduced in the appendices so that a third party can re-administer it. Every design decision is traced back to a requirement and forward to an evaluation question, as set out in Section 3.3.4 and restated as a traceability matrix in Appendix A. And negative results are reported: the heuristic inspection in Section 5.6 records its two low-severity findings, and Section 5.8 states plainly which data were not collected rather than presenting estimates in their place. Transparency about the boundary between measured and pending evidence is the operative quality criterion of this thesis.

## 3.3 Requirement Analysis

### 3.3.1 Sources

Requirements were drawn from three sources: (a) the literature reviewed in Chapter Two, which converts findings into design obligations (for example, novelty decay implies an administration surface for ongoing content); (b) informal consultation with students on the campus, using the structured questionnaire reproduced in Appendix C; and (c) inspection of comparable commercial applications, which yielded a feature baseline.

### 3.3.2 Functional Requirements

The elicited functional requirements are listed below, cross-referenced to the specific objectives they serve.

- **FR1 — Account and identity.** A student can register with a campus email, verify status, sign in securely, and manage a profile (objective 3).
- **FR2 — Checkpoint scanning.** A student can scan a QR code at a physical checkpoint and receive validated feedback (objective 4).
- **FR3 — Points and levels.** The system awards points by difficulty, computes levels, and maintains an auditable history (objective 5).
- **FR4 — Leaderboard.** The system ranks students and presents a bounded, weekly-rotating view (objective 6).
- **FR5 — Badges.** The system evaluates achievement conditions and awards badges automatically (objective 7).
- **FR6 — Activity analytics.** The student can review progress statistics (steps, active minutes, distance) over time.
- **FR7 — Social layer.** Clubs, shared challenges, and a FitClips feed support relatedness.
- **FR8 — Administration.** An authorised administrator can manage checkpoints, challenges, and inspect reports (objective 8).
- **FR9 — Support and feedback.** Students can read help content and submit problem reports.

### 3.3.3 Non-Functional Requirements

- **NFR1 — Usability.** Core actions (sign in, scan, view progress) must be completable without training; target System Usability Scale above 68, the accepted "acceptable" threshold (Bangor et al., 2008).
- **NFR2 — Performance.** The application shell must load on a mid-range mobile connection; interaction feedback must appear within 100 ms for local state changes (Nielsen, 1994).
- **NFR3 — Security.** No client-trustable reward path; all point awards must be computed server-side with row-level security on every table.
- **NFR4 — Availability and offline tolerance.** The application shell must install as a PWA and render without network, degrading gracefully to cached content.
- **NFR5 — Scalability.** The ranking query must remain index-supported as the student table grows.
- **NFR6 — Portability.** A single codebase must serve Android, iOS, and desktop browsers.

### 3.3.4 From Requirements to Design Decisions

Each non-functional requirement maps to a specific decision recorded in Chapter Four: NFR1 to the design-system port described in Section 4.3, NFR3 to the database routines in Section 4.5, NFR4 to the service worker described in Section 4.7, and NFR5 to the index and view definitions in Section 4.4. This traceability is the methodological device that connects objectives to methods, as promised in Section 1.11.

### 3.3.5 Requirement Prioritisation

Requirements were prioritised with the MoSCoW scheme — must have, should have, could have, won't have this time — because a fixed project cycle forces explicit trade-offs, and because stating the exclusions in advance is what makes the scope claims in Section 1.6 falsifiable. Table 3.1 records the outcome.

Table 3.1
*Prioritisation of functional requirements*

| Priority | Requirements | Rationale |
| --- | --- | --- |
| Must have | FR1 auth, FR2 scanning, FR3 points, FR5 badges, FR8 admin | The reward loop cannot function without them; they are objectives 3–5 and 7–8 |
| Should have | FR4 leaderboard, FR6 analytics, FR9 support | Core to the motivational model but not to transactional integrity |
| Could have | FR7 social layer (clubs, FitClips, challenges) | Supports relatedness; dependent on a critical mass of users |
| Won't have this time | Wearables, multi-campus tenancy, native shell, geofence confirmation | Out of scope by Section 1.6; recorded as future work in Section 6.8 |

The prioritisation has a direct methodological consequence: the "must have" row defines the scope of the end-to-end transaction suite in Section 3.6.1, because a failure there is a failure of the research contribution itself, while the "could have" row is evaluated only for presence and rendering rather than for transactional depth.

## 3.4 System Modelling

Four modelling techniques were used, each chosen for what it makes explicit.

**Use case modelling.** The system boundary encloses four primary actors — student, club captain, administrator, and the checkpoint system itself — with use cases for registration, verification, scanning, viewing analytics, managing checkpoints, and submitting reports. Use case modelling was selected because it exposes the actor/authority split that later becomes row-level security policy.

**Class/domain modelling.** The domain model identifies the central entities (Profile, Checkpoint, Scan, LedgerEntry, Badge, FitTrip, Club, Report) and their cardinalities. It was translated almost without modification into the relational schema of Section 4.4, which is why the class model is documented as an intermediate artefact rather than an end in itself.

**Sequence modelling.** The critical sequence — checkpoint scan — was modelled explicitly because it is the transaction on which the credibility of the entire reward economy depends. The model captures client request, code resolution, cooldown check, difficulty resolution, point computation, ledger insert, profile rollup, and response, all inside one database transaction.

**Interface modelling.** Rather than static wireframes, interface modelling was performed directly against the design system extracted from the reference designs, producing twenty specification screens plus the additional operational screens listed in Section 4.3. The rationale is recorded in Section 4.3.

Two conformance rules governed the use of these models. The first was *model-to-schema fidelity*: every entity in the class model had to appear as a table (or as columns of a parent table) in the relational schema, and every relationship had to be expressible as a key constraint, so that the model could not silently drift from what was built. The second was *use-case-to-route fidelity*: every use case had to resolve to at least one reachable route in the navigation graph, which was later verified mechanically by the route-verification suite — twenty-nine routes, each rendering without error (Section 5.2.2). Sequence modelling received the deepest treatment because it targets the single transaction on which the credibility of the whole artefact depends; its steps were transcribed almost literally into the `scan_checkpoint` routine described in Section 4.5, which is why the implemented logic can be compared step-for-step against the model.

Models were treated as disposable intermediate artefacts rather than as deliverables: they existed to expose contradictions early and were revised whenever implementation revealed a better structure. What persists is their conformance to the final system, which the two rules above make checkable.

## 3.5 Technology Selection and Justification

### 3.5.1 Client: React with TypeScript, Tailwind CSS, and PWA Delivery

React was selected over native mobile frameworks for three reasons tied to the non-functional requirements. It satisfies NFR6 with a single codebase, it allows the application to be delivered as an installable Progressive Web App so that no store approval or device storage budget is required, and its component model suits a screen set derived from a design system. TypeScript was adopted to satisfy NFR3 indirectly: type errors in data-layer calls are caught at build time, and the build pipeline fails when types regress. Tailwind CSS was selected because the reference designs are expressed in utility classes with Material 3 design tokens, allowing the extracted token set to be reproduced exactly rather than reinterpreted.

The trade-off is acknowledged: a web-delivered application has more limited access to background sensors than a native application, which is one reason the intervention is checkpoint-anchored rather than sensor-anchored.

### 3.5.2 Backend: Supabase (PostgreSQL) with Row-Level Security

A managed Postgres backend with row-level security was selected over a document database for three reasons. The domain is relational (users, checkpoints, scans, badges, memberships) and the leaderboard is inherently a ranked query — a natural fit for SQL. Security policy can be declared declaratively beside the data, satisfying NFR3 without a bespoke API layer. And server-side functions allow the points algorithm to execute inside the database transaction, which is the only place where it cannot be bypassed by a modified client.

### 3.5.3 Validation Medium: QR with NFC-Ready Modelling

QR codes were selected as the primary validation medium (Section 2.6) for zero marginal hardware cost and universal read support. The checkpoint entity stores an opaque code string, so an NFC tag carrying the same string requires no schema change.

### 3.5.4 Tooling and Quality Gates

The build pipeline runs a full type check before bundling, and a service worker is generated at build time for offline shell caching. Automated verification uses a headless browser driving the real application against the real database; this is described in Section 3.6.1.

### 3.5.5 Development Environment, Versioning and Reproducibility

The project is developed with the Node.js toolchain: npm for dependency management, Vite for bundling, React with TypeScript for the client, and the Supabase command-line interface for schema migration. Dependency versions are pinned through the committed lockfile, so that a clean checkout reproduces the same dependency tree; the documented build sequence (`npm ci`, `npm run build`, `python scripts/verify_ui.py`) is sufficient to regenerate the artefact and its verification evidence from source.

Reproducibility extends to the evaluation itself. The five verification scripts — type gate, UI verification, end-to-end transaction suite, reward simulation, and page-count check — are deterministic and ship with the project, so every numerical claim in Chapter Five and Appendix E can be regenerated by a third party against a staging copy of the schema. This is the practical meaning of the transparency criterion in Section 3.2.4: the thesis reports script output, and the scripts are part of the submission.

## 3.6 Data Collection and Analysis Methods

### 3.6.1 Instruments

Four instruments were used:

1. **Structured questionnaire** (Appendix C) for requirement elicitation, covering current activity levels, barriers, and attitudes to competitive features. Closed items use five-point Likert scales; two open items capture suggested features. Results are analysed descriptively (frequencies and percentages), which is sufficient for requirement prioritisation and consistent with the study's aim.
2. **Automated system verification suite**, which walks every route of the deployed application in a headless browser, records console errors and exceptions, captures screenshots, checks that design tokens are applied, and computes a text-level similarity coefficient between the rendered screen and the reference design specification.
3. **End-to-end transaction tests**, which drive the real user interface to sign in, scan a checkpoint, and confirm in the database that the points ledger row, the scan record, and the profile rollup were all written, and that a repeat scan within the cooldown window is rejected.
4. **System Usability Scale questionnaire** (Brooke, 1996) administered after task-based sessions, scored by the standard transformation to a 0–100 scale.

### 3.6.2 Analysis

Quantitative results are reported as descriptive statistics with effect directions rather than inferential claims, because the pilot sample is small; over-claiming from a convenience sample would be a methodological error. Verification results are reported as counts and coefficients. Qualitative responses to open questionnaire items are coded thematically into requirement categories.

### 3.6.3 Why These Methods Attain the Objectives

The mapping is direct: automated verification demonstrates that every designed screen exists and renders correctly (objectives 2 and 9); transaction tests demonstrate validated scanning (objective 4), points computation (objective 5), and data-layer integrity (the database half of objective 6 and 7); the questionnaire and SUS instrument support objectives 9 and 10.

### 3.6.4 Measurement Tooling and Its Justification

Each instrument is paired with a specific tool, and each pairing has a rationale that would be contested by an examiner if left implicit.

**Headless-browser automation.** The route and transaction suites drive the real application in an automated browser rather than inspecting source code or exercising functions in isolation. Unit-level inspection cannot detect the failures that matter most in a three-tier system — a policy that silently returns an empty set, a response shape the interface does not expect, a route that renders without its guard — and manual walkthroughs cannot be repeated identically after every change. Automation converts the evaluation into a gate: the same script, the same assertions, executed on demand (Section 3.5.5).

**Normalised text similarity for fidelity.** Rendered text was compared against specification text using the SequenceMatcher similarity coefficient with auto-junk handling disabled. Text was chosen over pixel comparison deliberately: pixel diffs are sensitive to antialiasing, sub-pixel font rendering, animation timing, and viewport rounding, and would therefore report noise as deviation on a system whose screens contain live data. Text comparison is stable under those variations and fails only on content differences — which are exactly the differences the study cares about. The trade-off is that layout regressions preserve wording, which is why screenshots accompany every run and why the heuristic inspection covers layout as a separate instrument (threats to validity are recorded in Section 5.10).

**Latency timing.** Backend reads were timed as ten consecutive requests per endpoint, reported as median with minimum and maximum. The median is reported because the distribution is right-skewed by cold connections — the first request after an idle period opens a TLS session and a connection pool, and that outlier would distort a mean. The sample size is stated because ten requests characterise central tendency and variability for this purpose; they are not a load test, and Section 3.8 records simulated load as a limitation.

**Executable simulation of the reward economy.** The points rules are deterministic, so the algorithm was reproduced as an executable model and run over simulated participation profiles. Simulation is admissible here — and would not be for a stochastic human-behaviour claim — precisely because the rules contain no randomness: every value the model produces is a value the database would produce for the same inputs. The model's credibility rests on its agreement with the live system, which is why the end-to-end suite (Section 5.2.3) and the simulation (Section 5.5) are reported as complementary rather than as independent evidence.

## 3.7 Ethical Considerations

Four ethical issues were anticipated. **Informed consent** — participants in any questionnaire or usability session are told the purpose, that participation is voluntary, and that they may withdraw; the consent script is in Appendix C. **Data minimisation** — the system stores an email, display name, campus, and activity events; it does not collect location traces, health metrics, or biometric identifiers. Checkpoint scans record the checkpoint identifier and timestamp, not continuous positioning. **Privacy of ranking** — leaderboards expose a display name and score, not email; profile visibility controls restrict who can open a profile. **Security of credentials** — passwords are handled by the authentication provider with salted hashing; the research team never handles password material, and administrative access is gated by a server-side role check rather than by UI hiding.

A specific risk in any points system is incentive to cheat (Section 2.6). The design response — server-side validation, cooldowns, an append-only ledger, and admin-visible audit trails — is documented in Section 4.5.

## 3.8 Limitations of the Research Methodology

The limitations are stated plainly because the template requires acknowledgement of inherent limitations.

1. **Sample size and composition.** Requirement and usability data come from a convenience sample at one campus. Results are indicative for that context and cannot be generalised to other institutions without replication.
2. **Short observation window.** Novelty effects inflate early engagement metrics; the literature reviewed in Section 2.5 shows that decay typically appears over weeks, which a single academic project cycle cannot observe fully. Longitudinal claims are therefore explicitly out of scope.
3. **No control group.** The design does not permit causal attribution of activity change to gamification; evaluation establishes functionality, correctness, and perceived usability rather than clinical efficacy.
4. **Self-reported activity.** Where activity figures are self-reported in the questionnaire, recall and social-desirability bias are possible.
5. **Simulated load.** Scalability analysis uses analytical reasoning and query-plan inspection rather than production-scale load testing, since deploying realistic concurrent users is beyond the project's scope.
6. **Reference design constraint.** Working from a fixed design specification improves fidelity but constrains exploratory interface iteration; usability problems inherent to the specification would be inherited rather than discovered. The heuristic evaluation in Chapter Five is the mitigation.

### 3.8.1 Limitation–Mitigation Summary

Table 3.2 records each limitation together with the claim it restricts, the mitigation actually applied, and the section where the effect is visible. The purpose is to make the boundary of every conclusion in Chapter Five mechanically checkable rather than a matter of reader interpretation.

Table 3.2
*Limitations, restricted claims and mitigations*

| Limitation | Claim it restricts | Mitigation applied | Where visible |
| --- | --- | --- | --- |
| Single-campus convenience sample | Generalisation to other institutions | Claims scoped to one context; replication recommended | Sections 6.6–6.7 |
| Short observation window | Durability of engagement | Decay treated as a design input (content treadmill); longitudinal work deferred | Sections 2.5.2, 6.8 |
| No control group | Causal attribution of activity change | Evaluation limited to correctness, fidelity and perceived usability | Sections 5.9, 6.6 |
| Self-reported activity | Questionnaire-derived quantities | Automated ledger data preferred wherever available; recall bias stated | Sections 4.4, 3.7 |
| Simulated load | Production scalability | Index-supported query design; measured latency; query-plan reasoning | Sections 4.4.1, 5.4.2 |
| Fixed reference specification | Freedom to redesign during evaluation | Heuristic inspection and walkthrough over the inherited design; redesign cycle recommended | Sections 5.6–5.7, 6.9 |

## 3.9 Residual Threats and Future Mitigations

Section 2.6.1 enumerated five threats to the reward economy and showed that four of them (remote replay, duplication, enumeration, client forgery) are closed by controls that execute outside the client. This section states what remains open, because a security claim that acknowledges no residue is not credible.

**Residual threat 1 — physical presence is asserted, not proven.** A student who obtains a code by other means (a photograph forwarded in a group chat, a code read from across a courtyard) can redeem it as if present. The cooldown and the audit trail limit the *rate* and make the pattern *visible*, but they do not prevent the first fraudulent award. **Planned mitigation:** time-boxed signed codes — each printed sign would carry a code valid only for a rolling interval, re-derived server-side and rotated daily, so that a forwarded screenshot expires; this requires a printing workflow outside the application, which is why it is scheduled as future work rather than implemented now.

**Residual threat 2 — collusive redeems.** Two or more students may knowingly share awards, inflating a club total or a ranking position. Server-side controls cannot distinguish cooperation from fraud when both parties are authenticated and acting deliberately. **Planned mitigation:** an anomaly-detection query over the ledger (award sequences with implausible travel timing, codes redeemed from geographically distant sessions) surfaced on the administration dashboard, plus optional geofence confirmation using the coordinate field already present in the checkpoint schema.

**Residual threat 3 — administrative surface area.** An administrator account can retire checkpoints, review reports, and inspect aggregate statistics. Although the role check executes in the database and the scan and ledger tables are append-only, a compromised administrator credential is still a compromise of the content layer. **Planned mitigation:** mandatory multi-factor authentication for administrative roles, short session lifetimes, and an immutable log of administrative writes.

**Residual threat 4 — enumeration of short codes.** Codes such as `LIB-A1` are deliberately human-legible so that a student can type a code shown on a sign when a camera is inconvenient. Legibility trades against guessability. The current controls (cooldown consumption per attempt, per-user rate limiting, and full audit logging) mean that enumeration yields no reward without a corresponding cooldown and produces a detectable pattern, but a future revision could lengthen codes at the cost of manual-entry convenience, or pair them with a device-bound token.

None of these residuals invalidates the evaluation claims, because the claims are about transactional correctness and auditable reward allocation rather than about cryptographic proof of presence. They are recorded here so that Chapter Six can bound its conclusions honestly and so that the future-work items in Section 6.8 have a stated motivation.

## 3.10 Summary

This chapter justified Design Science Research Methodology, documented requirement elicitation and the resulting functional and non-functional requirements, described the four modelling techniques used, justified each technology selection against the requirements, defined the four data collection instruments and their analysis, addressed ethics, stated six limitations, and specified the residual security threats together with their planned mitigations. Chapter Four presents the resulting design and implementation — the core contribution of the research.
