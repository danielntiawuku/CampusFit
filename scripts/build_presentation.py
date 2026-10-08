#!/usr/bin/env python3
"""CampusFit project-defence deck builder (v3).

Reads ``UG SLIDE TEMPLATE.pptx`` and writes ``CampusFit_Project_Defence.pptx``
with the 10-slide defence deck agreed with the student:

    1  Title (template title slide)
    2  Introduction
    3  Problems
    4  Proposed Solution
    5  Objectives
    6  System Diagram      (drawn: three-tier boxes + arrows)
    7  Flowchart           (drawn: scan_checkpoint() decision flow)
    8  Challenges
    9  Conclusion and Recommendation
   10  Demo Video          (reserved page with an embedded-video placeholder)

Everything is rebuilt from the clean template with python-pptx so the output
carries valid XML (the previous session had appended a second, mis-namespaced
``<a:txBody>`` to every shape, which PowerPoint silently ignored — that is why
the deck looked empty).  Body text uses explicit font sizes and the built-in
``scripts/verify_pptx.py`` checks that no text exceeds its shape.

Speaker notes are rewritten for CampusFit; the template shipped notes from an
unrelated thesis.
"""
from __future__ import annotations

import copy
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "UG SLIDE TEMPLATE.pptx"
DST = ROOT / "CampusFit_Project_Defence.pptx"

# ------------------------------------------------------------------- palette
INK = RGBColor(0x1A, 0x1A, 0x1A)        # body text
GREEN = RGBColor(0x17, 0x79, 0x5E)      # sub-headings / takeaways (dark mint)
GREY = RGBColor(0x5A, 0x5A, 0x5A)       # captions
MINT = RGBColor(0x1E, 0xCC, 0x8B)       # brand mint (fills / borders)
MINT_L = RGBColor(0xE6, 0xF9, 0xF1)     # light mint fill
AMBER = RGBColor(0xF5, 0xA6, 0x23)      # decision borders
AMBER_L = RGBColor(0xFD, 0xF3, 0xE0)    # light amber fill
RED = RGBColor(0xC0, 0x39, 0x2B)        # reject borders/text
RED_L = RGBColor(0xFB, 0xEC, 0xEA)      # light red fill
CREAM = RGBColor(0xFA, 0xF5, 0xEE)      # info strips
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

# normalised content-placeholder geometry (left, top, width, height)
BODY_BOX = (Inches(0.67), Inches(1.75), Inches(12.0), Inches(4.95))


# ---------------------------------------------------------- paragraph helpers
def _bullet(p, mode: str) -> None:
    """Write explicit bullet XML: 'dot' | 'num' | 'none'.

    Writing it explicitly (rather than relying on the master body style) keeps
    rendering identical for placeholders that carry their own list style.
    """
    pPr = p._p.get_or_add_pPr()
    for tag in ("a:buClrTx", "a:buClr", "a:buSzTx", "a:buSzPct", "a:buSzPts",
                "a:buFontTx", "a:buFont", "a:buNone", "a:buAutoNum", "a:buChar"):
        for el in pPr.findall(qn(tag)):
            pPr.remove(el)
    if mode == "none":
        pPr.set("marL", "0")
        pPr.set("indent", "0")
        els = [pPr.makeelement(qn("a:buNone"), {})]
    elif mode == "num":
        pPr.set("marL", "342900")     # 0.375" hanging indent
        pPr.set("indent", "-342900")
        els = [pPr.makeelement(qn("a:buFont"), {"typeface": "Arial"}),
               pPr.makeelement(qn("a:buAutoNum"), {"type": "arabicPeriod"})]
    else:  # dot
        pPr.set("marL", "342900")
        pPr.set("indent", "-342900")
        els = [pPr.makeelement(qn("a:buFont"), {"typeface": "Arial"}),
               pPr.makeelement(qn("a:buChar"), {"char": "\u2022"})]
    for el in els:
        pPr.insert_element_before(el, "a:tabLst", "a:defRPr", "a:extLst")


def _run(p, text: str, size: float, *, bold: bool = False,
         color: RGBColor = INK, italic: bool = False):
    r = p.add_run()
    r.text = text
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.italic = italic
    r.font.color.rgb = color
    return r


def add_item(tf, item: dict, first: bool = False):
    """Append one paragraph to *tf*.

    item keys: k = 'head' | 'bullet' | 'num' | 'plain', t = text, s = size,
    b = bold, c = colour, sb = space before (pt).
    """
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    p.alignment = PP_ALIGN.LEFT
    p.line_spacing = 1.0
    p.space_after = Pt(item.get("sa", 0))
    p.space_before = Pt(item.get("sb", 6))
    kind = item["k"]
    if kind == "num":
        # manual "1. " prefix in the text with a hanging indent (auto-numbering
        # would also number the lead paragraphs above the list).
        _bullet(p, "none")
        pPr = p._p.get_or_add_pPr()
        pPr.set("marL", "342900")
        pPr.set("indent", "-342900")
        _run(p, item["t"], item.get("s", 13.5), bold=item.get("b", False),
             color=item.get("c", INK))
        p.space_before = Pt(item.get("sb", 3))
        return p
    _bullet(p, "none" if kind in ("head", "plain") else "dot")
    if kind == "head":
        _run(p, item["t"], item.get("s", 18), bold=True, color=item.get("c", GREEN))
        p.space_before = Pt(item.get("sb", 10))
    else:
        _run(p, item["t"], item.get("s", 14), bold=item.get("b", False),
             color=item.get("c", INK))
    return p


def fill_body(shape, items: list[dict]) -> None:
    """Replace *shape*'s text with the given item list and pin its geometry."""
    shape.left, shape.top, shape.width, shape.height = BODY_BOX
    tf = shape.text_frame
    tf.word_wrap = True
    tf.clear()
    for i, item in enumerate(items):
        add_item(tf, item, first=(i == 0))


def set_title(slide, text: str) -> None:
    """Replace the title text while keeping the template's title formatting."""
    tf = slide.shapes.title.text_frame
    for extra in list(tf.paragraphs[1:]):
        extra._p.getparent().remove(extra._p)
    p = tf.paragraphs[0]
    if p.runs:
        p.runs[0].text = text
        for r in list(p.runs[1:]):
            r._r.getparent().remove(r._r)
    else:
        _run(p, text, 32, bold=True)


def set_notes(slide, text: str) -> None:
    """Overwrite the speaker notes (template notes are from another thesis)."""
    slide.notes_slide.notes_text_frame.text = text


def body_shape(slide):
    """The main content placeholder (title is idx 0; body is idx 1)."""
    for shp in slide.shapes:
        if shp.is_placeholder and shp.placeholder_format.idx == 1:
            return shp
    for shp in slide.shapes:
        if "Content Placeholder" in shp.name:
            return shp
    raise LookupError(f"no content placeholder on slide {slide.slide_id}")


# ------------------------------------------------------------ deck mechanics
def duplicate_slide(prs: Presentation, index: int):
    """Deep-copy a template slide (all shapes, background) as a new slide."""
    src = prs.slides[index]
    dst = prs.slides.add_slide(src.slide_layout)
    for shp in list(dst.shapes):            # drop the clones add_slide made
        shp._element.getparent().remove(shp._element)
    src_bg = src._element.find(qn("p:cSld") + "/" + qn("p:bg"))
    cSld = dst._element.find(qn("p:cSld"))
    if src_bg is not None:
        cSld.insert(0, copy.deepcopy(src_bg))
    for shp in src.shapes:
        dst.shapes._spTree.append(copy.deepcopy(shp._element))
    return dst


def reorder(prs: Presentation, order: list[int]) -> None:
    """Reorder the slide id list to match *order* (original indices)."""
    sldIdLst = prs.slides._sldIdLst
    ids = list(sldIdLst)
    for sid in ids:
        sldIdLst.remove(sid)
    for i in order:
        sldIdLst.append(ids[i])


def drop_stray_rectangles(slide) -> None:
    """Remove leftover template rectangles (one runs off-canvas on slide 6)."""
    for shp in list(slide.shapes):
        if not shp.is_placeholder and shp.name.startswith("Rectangle"):
            shp._element.getparent().remove(shp._element)


# ------------------------------------------------------------ slide content
# Keyed by FINAL slide position (1-based; 0 = title, 10 = demo video).
CONTENT: dict[int, list[dict]] = {
    # ------------------------------------------------------- 2 Introduction
    2: [
        {"k": "bullet", "s": 14, "t": "Physical inactivity among university students is rising \u2014 sedentary academic routines, prolonged screen time and weak exercise habits (Edelmann et al., 2022)."},
        {"k": "bullet", "s": 14, "t": "Activity improves concentration, memory, mental health and resilience; the WHO advises regular moderate activity every week (Loprinzi, 2019; WHO, 2020)."},
        {"k": "bullet", "s": 14, "t": "Students report low motivation, weak accountability, time pressure and few engaging campus-based options (Alkhawaldeh et al., 2024)."},
        {"k": "bullet", "s": 14, "t": "Institutional responses are push-based (inductions, campaigns); commercial fitness apps are context-blind \u2014 neither fits campus life."},
        {"k": "bullet", "s": 14, "t": "Gamification (points, badges, leaderboards) increases engagement, but effects are heterogeneous and design-dependent (Hamari et al., 2014)."},
        {"k": "bullet", "s": 14, "b": True, "c": GREEN, "sb": 10, "t": "CampusFit makes the campus itself the delivery mechanism \u2014 QR checkpoints turn everyday movement into verifiable progress."},
    ],
    # ------------------------------------------------------------- 3 Problems
    3: [
        {"k": "head", "t": "Why existing approaches fail"},
        {"k": "bullet", "s": 14, "t": "Campus wellness programmes lose students as soon as one-off inductions and campaigns end; participation decays quickly (Roberts et al., 2024)."},
        {"k": "bullet", "s": 14, "t": "Fitness apps count steps but ignore campus context \u2014 no community, no exploration, and manual logging competes with students' scarce time."},
        {"k": "bullet", "s": 14, "t": "Barriers persist: motivation, accountability, time constraints, and the intimidation factor of gyms and organised sport."},
        {"k": "bullet", "s": 14, "t": "Structural mismatch: institutions lack a persistent delivery mechanism; apps lack any relationship with the institution."},
        {"k": "head", "t": "Research gap"},
        {"k": "bullet", "s": 14, "t": "No reviewed system combines campus-anchored checkpoints, server-side auditable rewards, competition designed against demotivation, and institutional governance."},
        {"k": "bullet", "s": 14, "b": True, "sb": 8, "t": "Core problem: no structured, gamified, campus-based fitness application integrates physical checkpoints with competitive motivation to raise student activity."},
    ],
    # -------------------------------------------------- 4 Proposed Solution
    4: [
        {"k": "bullet", "s": 14, "b": True, "t": "CampusFit \u2014 a gamified, checkpoint-based Progressive Web App (React + TypeScript + Tailwind): installable, offline-capable, one codebase."},
        {"k": "bullet", "s": 14, "t": "QR signs at campus landmarks (e.g. LIB-A1) are NFC-ready; a scan proves presence at the location \u2014 the same code string lives in the database."},
        {"k": "bullet", "s": 14, "t": "All reward authority is server-side: scan_checkpoint() resolves the code, enforces an 8-hour cooldown, applies the difficulty multiplier and writes the append-only ledger \u2014 one transaction."},
        {"k": "bullet", "s": 14, "t": "Difficulty tiers easy \u00d71.0 \u00b7 medium \u00d71.3 \u00b7 hard \u00d71.8 \u00b7 epic \u00d72.5; square-root level curve; daily streaks; badges evaluated automatically."},
        {"k": "bullet", "s": 14, "t": "Bounded weekly leaderboards and club totals \u2014 competition designed against the documented risks of open-ended rankings."},
        {"k": "bullet", "s": 14, "b": True, "c": GREEN, "sb": 10, "t": "Participatory, auditable, governable \u2014 every point traceable to a checkpoint, timestamp and rule, with no custom backend to operate."},
    ],
    # ---------------------------------------------------------- 5 Objectives
    5: [
        {"k": "head", "t": "General objective", "s": 17},
        {"k": "plain", "s": 14, "sb": 2, "t": "Develop and evaluate a functional mobile fitness application that integrates gamification and location-based checkpoint tracking within a university campus."},
        {"k": "head", "t": "Specific objectives", "s": 17},
        {"k": "num", "s": 13.5, "t": "1.  Analyse student fitness behaviour and determine system requirements."},
        {"k": "num", "s": 13.5, "t": "2.  Design a user-friendly mobile application interface."},
        {"k": "num", "s": 13.5, "t": "3.  Implement secure student registration and authentication."},
        {"k": "num", "s": 13.5, "t": "4.  Design and deploy QR/NFC-based checkpoint validation mechanisms."},
        {"k": "num", "s": 13.5, "t": "5.  Develop a dynamic points allocation algorithm."},
        {"k": "num", "s": 13.5, "t": "6.  Integrate leaderboard functionality for competitive ranking."},
        {"k": "num", "s": 13.5, "t": "7.  Implement a badge and achievement reward system."},
        {"k": "num", "s": 13.5, "t": "8.  Design an administrative dashboard for system management."},
        {"k": "num", "s": 13.5, "t": "9.  Test system usability, performance and scalability."},
        {"k": "num", "s": 13.5, "t": "10. Evaluate user engagement through pilot testing."},
    ],
    # ------------------------------------------- 8 Challenges / 9 Conclusion
    8: [
        {"k": "bullet", "s": 14, "t": "Novelty decay \u2014 engagement fades within weeks; checkpoint content must be administered as an ongoing programme, not a one-off installation (Althoff et al., 2016; Li et al., 2021)."},
        {"k": "bullet", "s": 14, "t": "Bearer QR codes can be shared \u2014 mitigated server-side with an 8-hour cooldown, a code registry, anti-double-scan checks and an append-only audit ledger."},
        {"k": "bullet", "s": 14, "t": "Leaderboards can demotivate bottom-ranked users \u2014 addressed with bounded weekly leagues, club totals and no permanent global table."},
        {"k": "bullet", "s": 14, "t": "No custom backend \u2014 validation, rollups and badge rules had to live inside Postgres functions under row-level security."},
        {"k": "bullet", "s": 14, "t": "Weak campus connectivity \u2014 handled by an installable PWA with a precached shell, plus demo mode when credentials are absent."},
        {"k": "bullet", "s": 14, "t": "Evaluation boundaries \u2014 single campus, short observation window, no control group; claims are stated narrowly with mitigations (Section 3.8)."},
    ],
    9: [
        {"k": "head", "t": "Conclusion"},
        {"k": "bullet", "s": 14, "t": "CampusFit converts campus geography into a fitness instrument \u2014 participatory, auditable and governable."},
        {"k": "bullet", "s": 14, "t": "Six verified findings: 29/29 routes with zero console errors \u00b7 9/9 end-to-end checks including anti-replay \u00b7 interface fidelity 0.910 \u00b7 ~207 kB first load with offline shell \u00b7 no high-severity usability defects \u00b7 progression curve validated in simulation."},
        {"k": "head", "t": "Recommendations"},
        {"k": "bullet", "s": 14, "t": "Practice \u2014 treat checkpoints as a continuous programme, place them where students already go, keep leaderboards weekly, audit the ledger."},
        {"k": "bullet", "s": 14, "t": "Research \u2014 run the SUS pilot with a larger sample, add a gamified-vs-tracking comparison, analyse the points ledger longitudinally, replicate across campuses."},
        {"k": "bullet", "s": 14, "t": "Policy \u2014 name a ledger steward, set retention rules for behavioural data, and review ranking fairness annually."},
    ],
}

# Speaker notes, keyed by FINAL slide position (0-based: 0 = title … 9 = demo).
NOTES: dict[int, str] = {
    0: ("Opening. Greet the panel, state the project title and your details. "
        "One-line hook: CampusFit turns the campus itself into a fitness "
        "instrument. Preview the talk: problem, solution, objectives, system "
        "diagram, flow, challenges, conclusion - then the live demo."),
    1: ("Set the context. Students are among the least active populations and "
        "inactivity hits concentration, mental health and resilience. Two "
        "institutional responses exist - push-based campus campaigns and "
        "commercial step-counting apps - and neither fits campus life. "
        "Gamification works but is design-dependent. Close with the CampusFit "
        "thesis: make the campus the delivery mechanism."),
    2: ("Walk the four failure modes quickly: campaigns decay, apps ignore "
        "context, personal barriers persist, and the structural mismatch - "
        "institutions lack a delivery mechanism, apps lack the institution. "
        "Name the research gap, then read the core problem statement verbatim; "
        "it is the sentence every later slide answers."),
    3: ("Solution in one breath: an installable PWA plus printed QR signs plus "
        "a Supabase backend. Stress the key design decision - the client never "
        "holds reward authority. scan_checkpoint() validates, applies the "
        "8-hour cooldown and difficulty multiplier, writes the append-only "
        "ledger and recomputes rollups in ONE transaction. Multipliers are "
        "non-linear on purpose (epic is worth more than double easy)."),
    4: ("Read the general objective, then skim the ten specific objectives - "
        "note that each maps to evidence in the thesis: 3-4 to the scan RPC, "
        "5 to the points algorithm, 6-7 to leaderboard and badges, 8 to the "
        "admin dashboard, 9-10 to the Chapter Five evaluation."),
    5: ("Walk the diagram left to right: physical tier (signs carrying one code "
        "string), client tier (presentation only), backend tier (auth, RLS, "
        "database functions). Point out the return arrow - the award comes "
        "back as data for display. Bottom strips: security model (no client "
        "authority, append-only ledger) and deployment (static bundle on "
        "Vercel, demo or connected mode from the same source)."),
    6: ("Trace the worked example: a student scans LIB-A1. Reject paths first "
        "(unknown code, or cooldown inside 8 hours - no row is written), then "
        "the happy path: award = round(base x multiplier), one transaction "
        "writes scan + ledger, rollups recompute, badges evaluate, result "
        "returns to the UI. Emphasise every branch runs server-side."),
    7: ("Be candid about difficulty. Novelty decay is the dominant risk and is "
        "why content administration matters. Bearer codes are mitigated, not "
        "ignored (cooldown, registry, audit trail). Leaderboard design "
        "counteracts demotivation. Architecture constraints (no app server, "
        "offline-first) and the evaluation boundaries are stated honestly."),
    8: ("Conclusion: the six verified findings, each backed by Chapter Five - "
        "29/29 routes, 9/9 end-to-end checks, fidelity 0.910, ~207 kB offline "
        "PWA, no high-severity usability defects, validated progression "
        "curve. Then the three recommendation audiences: practice, research, "
        "institutional policy."),
    9: ("Demo page. Play the recorded walkthrough: sign-up and OTP, dashboard, "
        "scan of LIB-A1, points/streak/badges updating, weekly leaderboard, "
        "FitTrips and FitClips, admin dashboard. If playback fails, switch to "
        "the live app on Vercel - demo mode works without credentials."),
}

# ------------------------------------------------------------ draw helpers
def _box(slide, x, y, w, h, *, fill, line, shape=MSO_SHAPE.ROUNDED_RECTANGLE,
         line_w=1.25, dash=None):
    sp = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    sp.fill.solid()
    sp.fill.fore_color.rgb = fill
    sp.line.color.rgb = line
    sp.line.width = Pt(line_w)
    if dash is not None:
        sp.line.dash_style = dash
    sp.shadow.inherit = False
    return sp


def _shape_text(sp, lines, *, anchor=MSO_ANCHOR.MIDDLE,
                align=PP_ALIGN.CENTER, margin=0.08):
    """Write centered lines into an autoshape. lines: dicts t/s/b/c/bullet."""
    tf = sp.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    m = Inches(margin)
    tf.margin_left = tf.margin_right = m
    tf.margin_top = tf.margin_bottom = Inches(0.03)
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        # bullets always read better flush-left, even in a centred box
        p.alignment = PP_ALIGN.LEFT if ln.get("bullet") else align
        p.line_spacing = 1.0
        p.space_before = Pt(ln.get("sb", 0))
        p.space_after = Pt(ln.get("sa", 0))
        if ln.get("bullet"):
            _bullet(p, "dot")
            pPr = p._p.get_or_add_pPr()
            pPr.set("marL", "228600")   # tighter hanging indent inside boxes
            pPr.set("indent", "-228600")
        else:
            _bullet(p, "none")
        _run(p, ln["t"], ln.get("s", 11), bold=ln.get("b", False),
             color=ln.get("c", INK), italic=ln.get("i", False))
    return sp


def _textbox(slide, x, y, w, h, lines, *, align=PP_ALIGN.LEFT,
             anchor=MSO_ANCHOR.TOP):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    _shape_text(tb, lines, align=align, anchor=anchor, margin=0.0)
    return tb


def _arrow(slide, x, y, w, h, shape, *, fill=MINT):
    sp = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    sp.fill.solid()
    sp.fill.fore_color.rgb = fill
    sp.line.fill.background()
    sp.shadow.inherit = False
    return sp


# ----------------------------------------------------------- special slides
def build_title_slide(slide) -> None:
    """Slide 1 — keep the template banner, rebuild the subtitle block."""
    sub = body_shape(slide)
    sub.left, sub.top, sub.width, sub.height = (Inches(1.75), Inches(1.29),
                                                Inches(9.56), Inches(4.26))
    tf = sub.text_frame
    tf.word_wrap = True
    tf.clear()
    # The template title slide has a navy field — light text only.
    LIGHT = RGBColor(0xC9, 0xCF, 0xDA)
    lines = [
        ("CampusFit", 40, True, MINT, 0),
        ("A Gamified, Checkpoint-Based Campus Fitness Application", 18, False, WHITE, 8),
        ("NAME:  Daniel Ntiawuku", 14, False, WHITE, 24),
        ("REG NO:  2201234567", 14, False, WHITE, 4),
        ("SUPERVISOR:  Dr. [Supervisor Name]", 14, False, WHITE, 4),
        ("DEPARTMENT OF COMPUTER SCIENCE", 13, False, LIGHT, 22),
        ("UNIVERSITY OF GHANA", 13, False, LIGHT, 2),
        ("OCTOBER 2026", 13, False, LIGHT, 2),
    ]
    for i, (text, size, bold, color, sb) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.CENTER
        p.line_spacing = 1.05
        p.space_before = Pt(sb)
        p.space_after = Pt(0)
        _bullet(p, "none")
        _run(p, text, size, bold=bold, color=color)


def draw_system_diagram(slide) -> None:
    """Slide 6 — three-tier architecture boxes, request/return arrows, strips."""
    _textbox(slide, 0.67, 1.60, 12.0, 0.32,
             [{"t": "Three-tier architecture \u2014 the client never holds reward authority",
               "s": 12.5, "c": GREY, "i": True}])

    tiers = [
        ("Physical tier", [
            "Printed QR signs at landmarks (LIB-A1)",
            "Code registry maps code \u2192 checkpoint",
            "NFC-ready, no schema change",
        ]),
        ("Client tier", [
            "React 19 + TypeScript + Tailwind PWA",
            "Collects the code, renders award & profile",
            "Installable, offline shell (Vercel)",
            "Zero reward authority \u2014 presentation only",
        ]),
        ("Backend tier", [
            "Supabase \u2014 auth (email + OTP)",
            "Postgres + row-level security",
            "scan_checkpoint() in one transaction",
            "REST data client generated from schema",
        ]),
    ]
    xs = [0.67, 4.97, 9.27]
    for x, (name, bullets) in zip(xs, tiers):
        sp = _box(slide, x, 2.05, 3.4, 2.35, fill=MINT_L, line=MINT, line_w=1.5)
        lines = [{"t": name, "s": 14, "b": True, "c": GREEN, "sa": 6}]
        lines += [{"t": b, "s": 10.5, "bullet": True, "sb": 3, "c": INK}
                  for b in bullets]
        _shape_text(sp, lines, align=PP_ALIGN.CENTER)

    # forward arrows: physical -> client -> backend
    _arrow(slide, 4.16, 2.97, 0.72, 0.5, MSO_SHAPE.RIGHT_ARROW)
    _arrow(slide, 8.46, 2.97, 0.72, 0.5, MSO_SHAPE.RIGHT_ARROW)
    # return arrow: structured award result flows back to the client
    back = _arrow(slide, 4.97, 4.62, 7.7, 0.46, MSO_SHAPE.LEFT_ARROW)
    _shape_text(back, [{"t": "structured award result \u2192 new points, streak, level, badges",
                        "s": 10.5, "b": True, "c": INK}], margin=0.18)

    sec = _box(slide, 0.67, 5.32, 12.0, 0.72, fill=CREAM, line=MINT)
    tf = sec.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = Inches(0.15)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    p.line_spacing = 1.0
    _bullet(p, "none")
    _run(p, "Security model:  ", 12, bold=True, color=GREEN)
    _run(p, "row-level security on every table \u00b7 all business logic in database "
            "functions \u00b7 append-only audit ledger \u2014 a modified browser cannot "
            "bypass validation.", 12)

    dep = _box(slide, 0.67, 6.14, 12.0, 0.5, fill=CREAM, line=MINT)
    tf = dep.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = Inches(0.15)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    p.line_spacing = 1.0
    _bullet(p, "none")
    _run(p, "Deployment:  ", 12, bold=True, color=GREEN)
    _run(p, "static bundle on Vercel \u2014 build-time environment switches demo / "
            "connected mode; the database is the only stateful component.", 12)


def draw_flowchart(slide) -> None:
    """Slide 7 — scan_checkpoint() decision flow with two reject branches."""
    _textbox(slide, 0.67, 1.60, 12.0, 0.32,
             [{"t": "scan_checkpoint() \u2014 server-authoritative validation in a single transaction",
               "s": 12.5, "c": GREY, "i": True}])

    MX, MW = 1.0, 5.5          # main column

    def proc(y, h, text, *, final=False, size=11.5):
        sp = _box(slide, MX, y, MW, h,
                  fill=MINT if final else MINT_L,
                  line=MINT if final else MINT, line_w=1.5)
        _shape_text(sp, [{"t": text, "s": size, "b": final, "c": INK}])
        return sp

    def dec(y, h, text):
        sp = _box(slide, MX, y, MW, h, fill=AMBER_L, line=AMBER,
                  shape=MSO_SHAPE.DIAMOND, line_w=1.5)
        _shape_text(sp, [{"t": text, "s": 10.5, "b": True, "c": INK}])
        return sp

    def down(y):
        _arrow(slide, MX + MW / 2 - 0.16, y + 0.02, 0.32, 0.18,
               MSO_SHAPE.DOWN_ARROW)

    proc(2.05, 0.46, "Student scans QR sign or enters code (e.g. LIB-A1)")
    down(2.51)
    dec(2.73, 0.60, "Checkpoint found & active?")
    down(3.33)
    dec(3.55, 0.60, "8-hour cooldown passed?")
    down(4.15)
    proc(4.37, 0.60,
         "One transaction \u2014 award = round(base \u00d7 multiplier 1.0\u20132.5); "
         "insert scan + append-only ledger", size=11)
    down(4.97)
    proc(5.19, 0.46, "Recompute points, streak and level; evaluate badges")
    down(5.65)
    proc(5.87, 0.46,
         "Return award \u2192 UI shows points, refreshes profile & leaderboard",
         final=True, size=11)

    def reject(arrow_y, box_y, text):
        _arrow(slide, 6.62, arrow_y, 0.44, 0.26, MSO_SHAPE.RIGHT_ARROW,
               fill=AMBER)
        sp = _box(slide, 7.12, box_y, 4.9, 0.44, fill=RED_L, line=RED,
                  line_w=1.25)
        _shape_text(sp, [{"t": text, "s": 10.5, "c": RED}])

    reject(2.90, 2.81, "REJECT \u2014 checkpoint_not_found (code missing or inactive)")
    reject(3.72, 3.63, "REJECT \u2014 cooldown active, retry in HH:MM (no row written)")

    tip = _box(slide, 7.12, 4.60, 4.9, 1.3, fill=CREAM, line=MINT)
    _shape_text(tip, [
        {"t": "Anti-abuse by design", "s": 12, "b": True, "c": GREEN, "sa": 4},
        {"t": "8-hour per-user cooldown \u00b7 code registry \u00b7 append-only audit "
              "trail \u00b7 one atomic transaction \u2014 a modified client cannot "
              "mint points.", "s": 11, "c": INK},
    ], align=PP_ALIGN.LEFT, margin=0.14)


def build_demo_slide(slide) -> None:
    """Slide 10 — reserved page with an embedded-video placeholder."""
    set_title(slide, "DEMO VIDEO")
    sub = body_shape(slide)
    sub.text_frame.clear()
    from pptx.enum.dml import MSO_LINE_DASH_STYLE
    rect = _box(slide, 2.67, 1.42, 8.0, 4.45, fill=CREAM, line=MINT,
                line_w=1.75, dash=MSO_LINE_DASH_STYLE.DASH)
    rect.adjustments[0] = 0.06
    _shape_text(rect, [
        {"t": "\u25b6  DEMO VIDEO", "s": 30, "b": True, "c": GREEN, "sa": 10},
        {"t": "Reserved for the demo \u2014 insert the video here",
         "s": 14, "c": GREY},
        {"t": "(Insert \u2192 Video \u2192 This device)", "s": 11.5, "c": GREY,
         "sb": 6},
    ])
    _textbox(slide, 0.9, 6.05, 11.5, 0.6,
             [{"t": "Walkthrough: sign-up & OTP \u2192 dashboard \u2192 scan LIB-A1 "
                    "\u2192 points, streak & badges \u2192 weekly leaderboard "
                    "\u2192 FitTrips & FitClips \u2192 admin dashboard",
               "s": 13, "c": GREY}], align=PP_ALIGN.CENTER)


# ------------------------------------------------------------------- build
def build() -> None:
    if not SRC.exists():
        raise SystemExit(f"template not found: {SRC}")

    prs = Presentation(str(SRC))
    if len(prs.slides) != 8:
        raise SystemExit(f"expected 8 template slides, found {len(prs.slides)}")

    # Two extra content slides for Challenges and Conclusion and Recommendation.
    duplicate_slide(prs, 2)
    duplicate_slide(prs, 2)
    # Final order: title, six template content slides, the two copies, closing slide.
    reorder(prs, [0, 1, 2, 3, 4, 5, 6, 8, 9, 7])
    slides = list(prs.slides)
    if len(slides) != 10:
        raise SystemExit(f"expected 10 slides after reorder, found {len(slides)}")

    # Titles for slides 2-9 (0-based 1-8); 1 keeps the template banner,
    # slide 10 gets its title inside build_demo_slide().
    titles = {
        1: "Introduction",
        2: "Problems",
        3: "Proposed Solution",
        4: "Objectives",
        5: "System Diagram",
        6: "Flowchart",
        7: "Challenges",
        8: "Conclusion and Recommendation",
    }
    for idx, title in titles.items():
        set_title(slides[idx], title)

    # The two drawn slides: clear and normalise their content placeholders
    # (empty placeholders render nothing) and drop the stray rectangles.
    for idx in (5, 6):
        b = body_shape(slides[idx])
        b.left, b.top, b.width, b.height = BODY_BOX
        b.text_frame.clear()
        drop_stray_rectangles(slides[idx])

    # Text bodies for the six written slides.
    for pos, items in CONTENT.items():
        fill_body(body_shape(slides[pos - 1]), items)

    # Special slides: title, diagrams, demo page.
    build_title_slide(slides[0])
    draw_system_diagram(slides[5])
    draw_flowchart(slides[6])
    build_demo_slide(slides[9])

    # Speaker notes for every slide (template notes are from another thesis).
    for i, slide in enumerate(slides):
        set_notes(slide, NOTES[i])

    # Refresh cached slide-number field results (PowerPoint re-renders them,
    # but some previewers display the stale cache copied from the template).
    for i, slide in enumerate(slides, 1):
        for shp in slide.shapes:
            for fld in shp._element.findall(".//" + qn("a:fld")):
                if fld.get("type") == "slidenum":
                    t = fld.find(qn("a:t"))
                    if t is not None:
                        t.text = str(i)

    cp = prs.core_properties
    cp.title = "CampusFit \u2014 Final Year Project Defence"
    cp.author = "Daniel Ntiawuku"
    cp.subject = "Gamified, checkpoint-based campus fitness application"

    prs.save(str(DST))
    print(f"wrote {DST}")
    print(f"size: {DST.stat().st_size:,} bytes")
    for i, slide in enumerate(slides, 1):
        title = slide.shapes.title.text_frame.text if slide.shapes.title else "?"
        print(f"  slide {i:>2}: {title}")


if __name__ == "__main__":
    build()
