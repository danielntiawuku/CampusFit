#!/usr/bin/env python3
"""
Final-year project defence slide filler for CampusFit.

Fills the UG SLIDE TEMPLATE.pptx text placeholders with the approved content and
writes a clean presentation to CampusFit_Project_Defence.pptx.

The template is left completely untouched except for the <a:t> runs that hold
placeholder text on the title slide (slide 1) and the closing slide (slide 8).
Every other run — the top banner, the date, the page number, and the layout
graphics — is preserved verbatim. In particular the banner text "FINAL YEAR
PROJECT PRESENTATION & DEMO" and the date "9/15/2025" / page numbers are NOT
changed; only the PROJECT TITLE / NAME placeholders are replaced with the
CampusFit project title (the personal NAME / ID / SUPERVISOR fields are left as
the template's placeholders, which the student completes before the defence).

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

PROJECT_TITLE = "CampusFit — A Gamified, Checkpoint-Based Campus Fitness Application"
CLOSING_TITLE = "THANK YOU — Q&A"


def _t_positions(xml: str) -> list[int]:
    """Document order start positions of every <a:t> run."""
    return [m.start() for m in re.finditer(r"<a:t>", xml)]


def _replace_run(xml: str, run_index: int, text: str) -> str:
    """Replace the inner text of the *run_index*-th <a:t>...</a:t> run,
    preserving both the opening and closing tags (0-based, document order)."""
    positions = _t_positions(xml)
    if run_index >= len(positions):
        raise IndexError(f"slide has only {len(positions)} runs; asked for run {run_index}")
    text_start = positions[run_index] + len("<a:t>")
    text_end = xml.index("</a:t>", text_start)  # start of the closing tag
    return xml[:text_start] + html.escape(text, quote=False) + xml[text_end:]


def fill_slide(xml: str, slide_no: int) -> str:
    runs = _t_positions(xml)

    # Slide 1 — title slide.
    # Layout (document order): banner | PROJECT TITLE | NAME | ID | SUPERVISOR |
    # : | 19 | TH | SEPTEMBER 2025 | 9/15/2025 | 1
    # We replace run 1 (PROJECT TITLE) with the project title. The banner (run 0),
    # the personal fields NAME/ID/SUPERVISOR (runs 2/3/4), the colon, the date and
    # the page number are all left untouched.
    if slide_no == 1:
        out = _replace_run(xml, 1, PROJECT_TITLE)  # run 1 = PROJECT TITLE
        return out

    # Slide 8 — closing slide.
    # Layout (document order): banner | PROJECT TITLE | NAME | ID | SUPERVISOR: 19 |
    # TH | SEPTEMBER 2025 | 9/15/2025 | 8
    # We replace run 1 (the "PROJECT TITLE" placeholder) with the closing title.
    if slide_no == 8:
        out = _replace_run(xml, 1, CLOSING_TITLE)  # run 1 = PROJECT TITLE
        return out

    # Slides 2–7 already carry the correct section headings in the template
    # ("OUTLINE OF  PRESENTATION", "Introduction", "Aims and Objectives",
    #  "Related Work", "Proposed Solution", "End Slide"). Nothing to change.
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
