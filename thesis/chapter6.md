# CHAPTER SIX: CONCLUSION AND FUTURE WORKS

## 6.1 Introduction

This chapter consolidates the research. It restates the problem and the approach taken, summarises each chapter's contribution to the argument, enumerates the findings with the evidence that supports them, judges whether the objectives were achieved, states the contribution to knowledge, acknowledges the limitations that constrain the conclusions, and sets out recommendations and future work. Conclusions are drawn only where data and analysis support them; where evidence is pending, the conclusion is marked as pending rather than asserted.

## 6.2 Summary of the Study

The problem motivating the study was specific: university students are insufficiently active, generic fitness applications do not engage the campus environment in which students actually live, and no existing system combined campus-anchored checkpoints, auditable server-side reward allocation, competition design informed by social comparison risks, and institutional governance. The aim was to design, build, and evaluate a gamified checkpoint-based application that closes that gap.

The approach followed Design Science Research Methodology. Chapter One defined the problem, aim, questions, objectives, scope, and the systematic planning of content. Chapter Two grounded the work in self-determination theory, flow, and behaviour-change frameworks, reviewed the empirical gamification literature including its null findings, examined location-based activity systems and their novelty-decay problem, analysed QR and NFC as validation media, and derived a four-layer conceptual framework. Chapter Three justified the methodology, documented requirements, modelling, technology selection, instruments, ethics, and limitations. Chapter Four presented the contribution — architecture, interface, data model, algorithms, and security model. Chapter Five evaluated it. This chapter concludes.

**What each chapter contributed to the argument.** Chapter One established that the problem is real and specific: documented inactivity among students, structural barriers that generic applications do not address, and an institutional gap between wellness programmes that cannot persist and applications that cannot anchor. It converted that problem into six research questions and ten objectives, and it committed the thesis to a scope — one campus, one medium, no wearables — inside which every later claim would be evaluated.

Chapter Two performed the load-bearing work of grounding. It established *why* game elements can influence activity at all (self-determination theory and flow), *how* they should be anchored to recognised behaviour-change techniques so that evaluation can be evidence-based rather than aesthetic, and *where* the evidence is weak — heterogeneous effects, dark sides of competition, novelty decay, attrition. It then derived the four-layer framework (physical, validation, motivation, community and governance) that Chapter Four implements and Chapter Five evaluates. The chapter's comparative review located the contribution precisely: not a new game, and not another tracker, but the union of campus-anchored checkpoints, auditable server-side reward allocation, comparison-aware competition design, and institutional governance in one instrumented artefact.

Chapter Three justified the method by which those claims would be made testable. Design Science Research Methodology was selected because the gap is an absence of a system, requirements were elicited and prioritised rather than assumed, four instruments were defined before any result existed, six limitations were stated in advance, and the residual security threats were written down rather than discovered later. Chapter Four then presented the artefact itself: the three-tier architecture that places reward authority in the database transaction, the token-faithful interface derived from twenty specification screens, the eleven-table schema with row-level security, the validation and points algorithms with their justifications, and the security model with its acknowledged residues.

Chapter Five produced the evidence, and its structure mirrors the evaluation questions: correctness (type gate, 29/29 routes, 9/9 transaction checks), fidelity (0.910 mean against the specification), performance (207 kB connected first load, 25.5-second reproducible build, approximately 300 ms backend reads), reward-economy behaviour (simulation across three profiles plus sensitivity analysis), and usability by expert inspection (two low-severity findings) — with the user-study instrument specified but explicitly not populated, because the data had not been collected. This chapter now judges what all of that adds up to, states where the boundary of the evidence lies, and recommends what should happen next.

## 6.3 Findings and Their Evidence

**Finding 1 — The reward path can be made genuinely trustworthy without a bespoke application server.** By placing validation, cooldown enforcement, point computation, audit insertion, and rollup update inside one database function, and by enabling row-level security on every table, the system eliminates the client as an authority. The end-to-end suite demonstrated this empirically: a scan produced an award of +10 points, a `checkpoint_scans` row, a `points_ledger` entry with the reason string, and an updated profile rollup, while a duplicate scan inside the cooldown was rejected — 9 of 9 checks passing.

**Finding 2 — Interface fidelity to a designed specification can be measured, not merely claimed.** Automated comparison of rendered text against the specification produced a mean similarity of 0.910 across nineteen comparable screens, with eighteen screens at or above 0.85 and zero console errors across twenty-nine routes. The measurable deviations were attributable to live data substitution and to deliberately added production affordances.

**Finding 3 — A square-root level curve plus steep difficulty multipliers yields a progression shape that rewards intensity without punishing casual participation.** Simulation across three profiles showed a casual participant reaching level 3 in twelve weeks, a regular participant reaching level 11 in twenty-four weeks, and a committed participant reaching level 16 in twelve weeks, with monotonic widening of level thresholds from 100 points (level 2) to 8,100 points (level 10).

**Finding 4 — A single-codebase Progressive Web App meets the portability and offline requirements at a small resource cost.** The compressed first load is approximately 207 kB in the connected production build (155 kB in demo configuration, the 52 kB difference being the bundled data client), the application shell is precached for offline launch, the full build including the type gate completes in 25.5 seconds, and backend reads ran at a median of approximately 300 ms in the evaluation environment, dominated by network round-trip rather than query cost.

**Finding 5 — Expert inspection found no high-severity usability issues.** Two low-severity findings (no back gesture on the snap-scrolling feed; no sign-out confirmation) were recorded with severity so that the inspection remains falsifiable. This finding is bounded: heuristic inspection is not a substitute for the pilot study, and the thesis does not treat it as one.

**Finding 6 — The specification screens were insufficient for a production system, and the extensions are identifiable.** Nine operational screens — scanner, leaderboard, badge shelf, administration dashboard, notifications, edit profile, privacy, forgot password, and record FitClip — were required for the system to function, and each was built from the same tokens so that the extension is visually indistinguishable from the specification.

## 6.4 Achievement of Research Objectives

Judged against the specific objectives of Section 1.5.2: objectives one through eight are achieved with documentary or instrumented evidence; objective nine is substantially achieved, with performance and correctness evidence collected and the usability score pending the pilot; objective ten remains open pending administration of the engagement study. The general objective — a functional application integrating gamification and checkpoint tracking within a university campus — is achieved in the sense that the application functions end to end against a live database, and evaluated in the sense that correctness, fidelity, and performance have been measured.

This judgement is deliberately conservative. Claiming full success on objectives nine and ten without participant data would violate the evidential standard set in Chapter Three, and the thesis is stronger for stating the boundary plainly.

### 6.4.1 Objective-to-Evidence Map

Table 6.1 makes the judgement auditable by naming the specific evidence behind each status rather than restating the objective.

Table 6.1
*Specific objectives: status and primary evidence*

| Objective | Status | Primary evidence |
| --- | --- | --- |
| 1. Analyse fitness behaviour and derive requirements | Achieved | Section 3.3; prioritisation table (Table 3.1); questionnaire (Appendix C); traceability (Appendix A.2) |
| 2. Design a user-friendly interface | Achieved | 29/29 routes, zero console errors, mean fidelity 0.910 over 19 comparable screens (Section 5.2.2, 5.3) |
| 3. Secure registration and authentication | Achieved | End-to-end sign-in through the real interface, session persistence, role-aware access (Section 5.2.3) |
| 4. QR/NFC checkpoint validation | Achieved | 9/9 transaction checks including award persistence and cooldown rejection |
| 5. Dynamic points allocation algorithm | Achieved | Server-side computation verified in transaction; simulation and sensitivity (Sections 5.5.1–5.5.4) |
| 6. Leaderboard functionality | Achieved functionally | Database-ranked view, bounded window, weekly framing; motivational effect pending pilot |
| 7. Badge and achievement system | Achieved | 13 definitions across 4 tiers, server-side evaluation, first award observed end-to-end |
| 8. Administrative dashboard | Achieved | Checkpoint performance, aggregate statistics, report triage (Section 4.3.2) |
| 9. Usability, performance, scalability | Substantially achieved | Sections 5.4–5.7; SUS pending pilot administration |
| 10. Evaluate engagement through pilot testing | Open | Protocol and instrument complete (Section 5.8, Appendix D); not yet administered |

## 6.5 Contribution to Knowledge

The study contributes in four ways.

First, **an architectural contribution**: a pattern in which all reward authority is relocated into the database transaction, making a gamified economy auditable and tamper-resistant without a custom backend — demonstrated, not asserted.

Second, **a design contribution**: a method for deriving a tokenised design system from specification screens and then *measuring* implementation fidelity against them, turning interface fidelity into a repeatable quality gate rather than a subjective review.

Third, **an empirical contribution**: characterisation of a square-root level curve combined with steep difficulty multipliers, with simulated progression profiles for casual, regular, and committed participants, giving future implementers a concrete, tested shape rather than an arbitrary one.

Fourth, **a domain contribution**: a replicable model of campus-anchored fitness engagement — physical layer, validation layer, motivation layer, governance layer — that other institutions can adopt, since checkpoints, badges, and challenges are data rather than code.

Fifth, **a boundary-discipline contribution**: the thesis demonstrates a reporting standard in which measured, simulated, and pending evidence are labelled as such at every point of use. The heuristic inspection reports its own two findings; the fidelity metric reports its own minimum; the usability section publishes an instrument template instead of a number. In a domain where engagement claims are routinely made from screenshots, the explicit separation of these evidence classes is itself a contribution to how gamified wellness systems should be evaluated.

Sixth, **a negative result worth recording**: the comparison in Section 2.9 and the sensor-first analysis in Section 2.9.1 together show that a validated union of the four gaps does not exist in the reviewed systems, and that the obvious simplification — replacing checkpoints with continuous sensing — fails on equity, privacy, attribution, and portability grounds rather than on technical ones. Documenting why the harder architecture was chosen prevents the same dead end from being retried by the next implementation team.

The contributions are deliberately bounded. None of them is a claim about behaviour change in the wild; those remain the province of the pilot and of replication, as Sections 6.6 and 6.7 state.

## 6.6 Limitations Affecting the Conclusions

The conclusions are bounded by the limitations of Chapter Three. The requirements context is a single campus and a convenience sample, so generalisation requires replication. The observation window cannot see novelty decay, which the literature suggests appears over weeks; therefore no claim is made about sustained engagement. There is no control group, so no causal claim is made about activity change. Scalability is argued from index-supported query design and observed latency rather than from production-scale load testing. Finally, the usability conclusion awaits pilot data.

Stating these limitations is not a formality: each one marks a specific sentence in this thesis that a reader should *not* find anywhere.

## 6.7 Recommendations

### For Practice

Institutions adopting such a system should treat checkpoint content as an ongoing programme rather than a one-off installation, because the novelty-decay evidence is unambiguous. Placement should exploit locations students already visit before it targets aspirational destinations, so that early rewards are attainable. Leaderboards should be framed as weekly leagues with bounded windows rather than permanent global tables, and cooperative club totals should be offered alongside individual ranking. Administrators should monitor the audit ledger for anomalous patterns (rapid sequences of scans, geographically implausible timing) as the operational counterpart to the technical anti-replay controls.

### For Research

Future studies should run the pilot instrument described in Section 5.8 with a sample large enough for the SUS distribution to be meaningful, and should extend the observation window beyond one academic term to capture decay and recovery. A comparative design — gamified versus activity-tracking-only conditions — would allow causal inference that this design cannot support. Longitudinal analysis of the `points_ledger` table itself is promising: because every award is attributed, retention and engagement can be analysed without relying on self-report. Three further studies would be especially informative: a leaderboard-design experiment comparing bounded weekly windows against full-table visibility against no ranking, which operationalises the differential-response hypothesis of Section 2.3.6; a difficulty-mix study examining whether the multiplier gradient of Section 5.5.4 actually shifts the checkpoints students attempt in practice; and a multi-campus replication to test whether the framework's content-as-data property survives different physical environments.

### For Institutional Policy and Governance

Institutions that deploy such a system should treat it as data governance, not as an application purchase. Four policy positions follow from the architecture. **Stewardship of the ledger.** The points ledger is a behavioural record; it should have a named institutional owner, a retention policy, and an explicit statement that it is never sold or used for disciplinary purposes. **Fairness review.** Because the leaderboard is a public comparison surface, its design should be reviewed annually against the outcome it produces for bottom-ranked students — the documented risk from Section 2.7 — and adjusted (league size, window, rotation frequency) if it consistently discourages a subgroup. **Content funding.** The novelty-decay evidence makes checkpoint and challenge refresh a recurring operational cost; an institution that installs signs and provides no budget for rotation has funded an installation, not an intervention. **Accessibility of participation.** Students with mobility limitations must have an equivalent path to points and recognition — alternative checkpoints, or non-locational challenges — so that the physical layer does not become a participation barrier for part of the target population. This last point is a design requirement that the current implementation does not yet fully satisfy and is recorded honestly in Section 6.8.

## 6.8 Future Works

The following extensions are technically natural and scientifically interesting, ordered roughly by cost.

1. **Complete the usability pilot.** Administer the SUS instrument, publish the score distribution against the 68 benchmark, and fold task success and time-on-task into Section 5.9.
2. **NFC and signed one-time codes.** The schema already models checkpoints medium-agnostically; adding NFC tags and time-boxed signed codes would close the screenshot-sharing residual risk identified in Section 4.8.
3. **Geofence confirmation.** Optional coordinate validation would convert physical presence from an assertion into a corroborated claim.
4. **Wearable integration.** Heart-rate and continuous step sources would allow points to reflect effort rather than visit count, at the cost of the scope exclusion recorded in Section 1.6.
5. **Native application shell.** Wrapping or migrating to a native runtime would enable background sensing and push notifications for streak protection.
6. **Multi-campus federation.** The current design isolates campuses implicitly through checkpoints; explicit tenancy would allow inter-university leagues and test the ranking design at larger scale.
7. **Personalised difficulty.** The level curve is static; adapting checkpoint recommendations to observed capability would operationalise the flow requirement directly rather than through fixed tiers.
8. **Privacy-preserving analytics.** Aggregate dashboards for institutional wellness reporting that never expose individual trajectories.

### 6.8.1 Sequencing, Dependencies and Effort

The eight extensions are not independent, and their ordering is driven by dependency rather than by ambition.

**Phase 1 — evidence (item 1).** The pilot is first because four of the other extensions would change what the pilot measures: personalised difficulty, native push notifications, and wearable-derived points would all alter the intervention being evaluated. The pilot needs no code changes at all — only ethics clearance, recruitment, and the administration of Appendix D — so it is also the cheapest item on the list and the one that converts the thesis's two open objectives into data.

**Phase 2 — closing the residual risks (items 2 and 3).** Signed rotating codes and optional geofence confirmation are the planned mitigations recorded in Section 3.9. The schema is already medium-agnostic, so NFC support and signed codes require no structural change; the real dependency is operational (a printing and rotation workflow) and interactional (a permission flow that explains why location access improves fairness without becoming surveillance). Sequencing these immediately after the pilot keeps the anti-replay story defensible before any wider deployment.

**Phase 3 — sensing and native delivery (items 4 and 5).** Wearable integration and a native shell are the highest-cost items because both relax scope exclusions that the current architecture depends on (Section 1.6): background sensing, push notifications for streak protection, and a second distribution surface. They should be attempted only with the pilot's evidence in hand, since the equity and privacy trade-offs argued in Section 2.9.1 must be revisited with data rather than with reasoning alone.

**Phase 4 — scale and governance (items 6 and 8).** Multi-campus federation introduces explicit tenancy and would test the ranking design against a much larger population; privacy-preserving aggregate analytics depend on that deployment model and on the institutional stewardship policy recommended in Section 6.7. Both are organisationally, not technically, constrained.

**Continuous — personalisation (item 7).** Adaptive difficulty has no external dependency other than longitudinal data, which is why it is listed as a continuous thread rather than a phase: every week of ledger history improves the capability estimate that a future recommender would use, and the square-root curve's static thresholds can be recalibrated without touching the schema.

This sequencing keeps the evaluation instrument stable during the pilot, closes acknowledged security residues before scaling, and defers the architecture-changing extensions until their trade-offs can be argued from evidence.

## 6.9 Reflections on the Research Process

Two process observations are worth recording for whoever repeats this work. First, building the quality gates early — type checking before bundling, route verification before interface changes, transaction tests before reward-path changes — converted verification from a final-week scramble into a routine that ran continuously, and it is the reason the reported figures are measurements rather than recollections. Second, working from a fixed design specification was constraining in exactly the way anticipated in Section 3.8: fidelity was easy to guarantee, but usability defects inherent to the specification would have been inherited. The heuristic inspection partially mitigated this, and a redesign cycle with pilot participants is the proper remedy.

## 6.10 Conclusion

This research set out to close a specific gap: students move through a campus that no fitness system treats as meaningful, and existing gamification is rarely instrumented to be auditable. The study derived a four-layer framework from theory and literature, implemented it as a three-tier Progressive Web App with database-authoritative rewards, and evaluated it with repeatable instrumentation. The evidence supports six findings — trustworthy rewards without a custom backend, measurable interface fidelity, a progression curve that rewards intensity without punishing casual participation, a small and offline-capable artefact, no high-severity usability defects on inspection, and a production screen set that extends the specification without departing from it.

The work is honest about its boundaries: engagement claims await the pilot, and generalisation awaits replication. Within those boundaries, the study demonstrates that a campus can be converted into a fitness instrument that is participatory, auditable, and governable — and that the demonstration can be verified by anyone who reruns the tests reported here.
