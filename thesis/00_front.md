# CAMPUSFIT: DESIGN AND IMPLEMENTATION OF A GAMIFIED, CHECKPOINT-BASED MOBILE FITNESS APPLICATION FOR UNIVERSITY STUDENTS

A thesis submitted to the Department of Computer Science in partial fulfilment of the requirements for the degree of Bachelor of Science.

**Student names and index numbers:** [To be completed per team member]

**Supervisor:** [To be completed]

**Date:** October 2026

## ABSTRACT

Physical inactivity among university students is widespread, and existing mobile fitness applications rarely engage the physical and social structure of the campus in which students live. This research designs, implements, and evaluates CampusFit — a gamified, checkpoint-based fitness application that converts campus geography into a progress medium. QR-coded checkpoints placed at campus landmarks are scanned by students through an installable Progressive Web Application built with React, TypeScript, and Tailwind CSS, backed by a Supabase (PostgreSQL) service with row-level security.

All reward authority is located server-side: a single database function validates the checkpoint code, enforces an eight-hour per-user cooldown, applies a difficulty multiplier (1.0, 1.3, 1.8, 2.5), writes an append-only points ledger, and recomputes profile rollups including a square-root level curve and consecutive-day streaks. Badges are evaluated automatically against five metrics, and a database view computes bounded weekly leaderboards designed against the documented demotivation risks of open-ended rankings.

The methodology follows Design Science Research Methodology. Evaluation produced the following measured results: zero type errors under a gating type check; 29 of 29 routes rendering with zero console errors; 9 of 9 end-to-end transaction checks including award persistence, audit trail, and anti-replay rejection; a mean interface fidelity of 0.910 against the design specification across 19 comparable screens; a 207 kB compressed first load (155 kB in demo configuration) with an offline application shell; and backend reads at a median of approximately 300 ms. Simulation of the reward economy across casual, regular, and committed participation profiles confirmed the intended progression shape.

The study contributes an architecture that makes gamified rewards auditable without a custom backend, a method for measuring interface fidelity against design specifications, an empirically characterised progression curve, and a replicable four-layer model of campus-anchored fitness engagement. Usability scoring via the System Usability Scale is protocolled for a pilot study, and conclusions about sustained engagement are explicitly deferred pending that pilot and longitudinal replication.

**Keywords:** gamification, physical activity, checkpoint, QR code, Progressive Web Application, PostgreSQL, leaderboard, student wellness

## TABLE OF CONTENTS
