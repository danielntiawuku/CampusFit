#!/usr/bin/env python3
"""
CampusFit PG defence slide filler — v2.

Fills the UG SLIDE TEMPLATE.pptx with the approved defence content on every
slide, leaving the template master, banner, date, page numbers and all other
runs untouched. On the title slide (1) and closing slide (8) the PROJECT TITLE
placeholder is replaced with the CampusFit title; the personal NAME/ID/SUPERVISOR
fields are left as the template's placeholders (the student completes them), and
the date "9/15/2025" / "SEPTEMBER 2025" and page numbers are kept verbatim.

On slides 2-7 the single template heading text box is reused: we leave the
heading as-is (it already carries the correct section title) and write the
defence bullet content into it below the heading. (The template provides only
one text box per slide; PowerPoint will render everything we put in that box.)

Output: CampusFit_Project_Defence.pptx
"""
from __future__ import annotations

import html
import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "UG SLIDE TEMPLATE.pptx"
DST = ROOT / "CampusFit_Project_Defence.pptx"

PROJECT_TITLE = "CampusFit \u2014 A Gamified, Checkpoint-Based Campus Fitness Application"
CLOSING_TITLE = "THANK YOU \u2014 Q&A"

# Defence content for slides 2-7. Each entry is the bullet text (may be multi-line,
# separated by "\n" to create multiple paragraphs in the same text box).
SLIDE_BULLETS = {
    2: [
        "Problem and motivation",
        "Research aim, questions and objectives",
        "Literature and theoretical framework",
        "Methodology and design",
        "System architecture and implementation",
        "Evaluation: verification, fidelity, performance, reward economy",
        "Findings, contributions and future work",
    ],
    3: [
        "University students are among the least active populations: nearly half",
        "inactive in sampled cohorts (Alkhawaldeh et al., 2024); 22.4%",
        "insufficiently active (Edelmann et al., 2022).",
        "",
        "Generic fitness apps count steps but do not engage the campus",
        "environment students actually live and move through (McCallum et al., 2018).",
        "",
        "Gamification increases physical activity, but heterogeneously, and with",
        "documented risks in purely competitive designs (Hamari et al., 2014;",
        "Mazeas et al., 2022; Nishi et al., 2024).",
        "",
        "Research gap: no reviewed system combines campus-anchored checkpoints,",
        "server-side auditable reward allocation, competition designed against",
        "leaderboard demotivation risks, and institutional governance in one",
        "instrumented artefact.",
        "",
        "Contribution: a gamified, QR/NFC checkpoint-based mobile application that",
        "turns the campus into a fitness instrument \u2014 participatory, auditable,",
        "and governable.",
    ],
    4: [
        "Aim",
        "To design, develop and evaluate a gamified, checkpoint-based mobile",
        "fitness application that promotes sustained physical activity within a",
        "university campus.",
        "",
        "Specific objectives",
        "1. Analyse student fitness behaviour and determine system requirements",
        "2. Design a user-friendly mobile application interface",
        "3. Implement secure student registration and authentication",
        "4. Design and deploy QR/NFC-based checkpoint validation mechanisms",
        "5. Develop a dynamic points allocation algorithm",
        "6. Integrate leaderboard functionality for competitive ranking",
        "7. Implement a badge and achievement reward system",
        "8. Design an administrative dashboard for system management",
        "9. Test system usability, performance, and scalability",
        "10. Evaluate user engagement through pilot testing",
    ],
    5: [
        "Self-determination theory \u2014 points as competence feedback, not",
        "compliance payment; relatedness through clubs and crews (Ryan & Deci, 2000).",
        "",
        "Flow theory \u2014 four difficulty tiers (easy/medium/hard/epic) keep",
        "challenge matched to ability (Csikszentmihalyi, 1990).",
        "",
        "Sustainability \u2014 novelty decay is the dominant failure mode; campus",
        "content must be continuously administered (Althoff et al., 2016;",
        "Li et al., 2021).",
        "",
        "Location-based precedent \u2014 Pokémon Go reached least-active users most",
        "(Althoff et al., 2016), with decay later (Li et al., 2021).",
        "",
        "Attrition \u2014 drop-out is the norm in the first weeks; friction in the",
        "core action is the failure mode to design against (Linardon &",
        "Fuller-Tyszkiewicz, 2020).",
        "",
        "Why not sensors alone \u2014 equity, privacy, attribution, and portable",
        "codebase rule out a sensor-first architecture (Section 2.9.1).",
    ],
    6: [
        "Architecture (three tiers)",
        "\u2022 Client: React 19 + TypeScript + Tailwind CSS, Progressive Web App",
        "  with precached shell.",
        "\u2022 Backend: Supabase / PostgreSQL with row-level security; all reward",
        "  authority in server-side database functions.",
        "\u2022 Physical: printed QR codes (NFC-ready); same code string as the",
        "  database checkpoint row.",
        "",
        "Refereed reward economy",
        "\u2022 scan_checkpoint() resolves the checkpoint, enforces an 8-hour",
        "  per-user cooldown, applies a difficulty multiplier, writes an",
        "  append-only audit ledger, and recomputes points / level / streak in",
        "  one transaction.",
        "\u2022 Multipliers: easy \u00d71.0, medium \u00d71.3, hard \u00d71.8, epic \u00d72.5.",
    ],
    7: [
        "Thank you.",
        "",
        "Summary \u2014 six verified findings",
        "1. Schema-implementation fidelity: 29/29 routes, 0 console errors.",
        "2. Reward-path correctness: 9/9 end-to-end checks, including",
        "   cooldown rejection.",
        "3. Points economy verified under simulation across casual, regular and",
        "   committed profiles.",
        "4. Interface fidelity to the design specification: mean 0.910 over",
        "   19 comparable screens.",
        "5. No high-severity usability findings on heuristic inspection.",
        "6. Single-codebase PWA: ~207 kB connected first load (cold build",
        "   25.5 s), offline shell.",
        "",
        "Future work: usability pilot (SUS), NFC / signed rotating codes,",
        "geofence confirmation, wearable integration, multi-campus federation.",
    ],
}


def _t_positions(xml: str) -> list[int]:
    """Document order start positions of every <a:t> run."""
    return [m.start() for m in re.finditer(r"<a:t>", xml)]


def _replace_run(xml: str, run_index: int, text: str) -> str:
    """Replace the inner text of the *run_index*-th <a:t> run, preserving the
    enclosing <a:t>...</a:t> tags (0-based, document order)."""
    positions = _t_positions(xml)
    if run_index >= len(positions):
        raise IndexError(f"slide has {len(positions)} runs; asked for run {run_index}")
    text_start = positions[run_index] + len("<a:t>")
    text_end = xml.index("</a:t>", text_start)  # start of the closing tag
    return xml[:text_start] + html.escape(text, quote=False) + xml[text_end:]


def _replace_first_run_with_multiline(xml: str, lines: list[str]) -> str:
    """Replace the first (heading) text run with heading + bullets.

    We keep the heading text (the template already has the correct heading in
    that run) and append the bullets after it, all inside the same <a:t> run
    so that PowerPoint treats them as one text box with multiple paragraphs.
    """
    positions = _t_positions(xml)
    if not positions:
        return xml
    heading_start = positions[0] + len("<a:t>")
    heading_end = xml.index("</a:t>", heading_start)
    heading = xml[heading_start:heading_end]
    # Build the new inner text: heading (preserved) + blank line + bullets.
    parts: list[str] = [heading.strip()]
    for ln in lines:
        parts.append(ln)
    new_inner = "\n".join(parts)
    return xml[:heading_start] + html.escape(new_inner, quote=False) + xml[heading_end:]


def fill_slide(xml: str, slide_no: int) -> str:
    # Slide 1 — title slide.
    # Layout (document order): banner | PROJECT TITLE | NAME | ID | SUPERVISOR |
    # : | 19 | TH | SEPTEMBER 2025 | 9/15/2025 | 1
    # We replace only the PROJECT TITLE run (index 1) with the CampusFit title.
    if slide_no == 1:
        return _replace_run(xml, 1, PROJECT_TITLE)

    # Slide 8 — closing slide.
    # Layout (document order): banner | PROJECT TITLE | NAME | ID | SUPERVISOR: 19 |
    # TH | SEPTEMBER 2025 | 9/15/2025 | 8
    # Replace only the PROJECT TITLE run (index 1) with the closing title.
    if slide_no == 8:
        return _replace_run(xml, 1, CLOSING_TITLE)

    # Slides 2-7: the template heading text box already holds the correct
    # section title (e.g. "Introduction"). We keep the heading and append the
    # defence bullet content inside the same text box.
    if slide_no in SLIDE_BULLETS:
        return _replace_first_run_with_multiline(xml, SLIDE_BULLETS[slide_no])

    return xml


def build() -> None:
    if not SRC.exists():
        raise SystemExit(f"template not found: {SRC}")

    if DST.exists():
        DST.unlink()
    shutil.copyfile(SRC, DST)

    patches: dict[str, bytes] = {}
    with zipfile.ZipFile(DST, "r") as z:
        for n in sorted(z.namelist()):
            if not (n.startswith("ppt/slides/slide") and n.endswith(".xml")):
                continue
            m = re.search(r"slide(\d+)", n)
            if not m:
                continue
            slide_no = int(m.group(1))
            xml = z.read(n).decode("utf-8")
            patched = fill_slide(xml, slide_no)
            patches[n] = patched.encode("utf-8")

    members: list[tuple[zipfile.ZipInfo, bytes]] = []
    with zipfile.ZipFile(DST, "r") as z:
        for item in z.infolist():
            data = z.read(item.filename)
            if item.filename in patches:
                data = patches[item.filename]
            members.append((item, data))

    with zipfile.ZipFile(DST, "w", zipfile.ZIP_DEFLATED) as z:
        for item, data in members:
            z.writestr(item, data)

    print(f"wrote {DST}")
    print(f"size: {DST.stat().st_size:,} bytes")


if __name__ == "__main__":
    build()
