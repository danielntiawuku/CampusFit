"""Report exact page counts of CampusFit_Thesis.docx per Heading-1 section.

Opens the document read-only in Microsoft Word (COM), repaginates, then walks
the paragraphs collecting the page number where each Heading 1 starts.
Word is closed without saving anything.

Usage:  python scripts/pagecount.py [path/to.docx]
"""
import os
import sys

import pythoncom
import win32com.client

TEMPLATE_MIN = {
    "CHAPTER ONE": 12,
    "CHAPTER TWO": 25,
    "CHAPTER THREE": 12,
    "CHAPTER FOUR": 8,
    "CHAPTER FIVE": 10,
    "CHAPTER SIX": 10,
}


def main() -> int:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, "CampusFit_Thesis.docx")
    path = os.path.abspath(path)
    if not os.path.exists(path):
        print("NOT FOUND: " + path)
        return 1

    pythoncom.CoInitialize()
    word = win32com.client.DispatchEx("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    doc = None
    try:
        doc = word.Documents.Open(path, ReadOnly=True, AddToRecentFiles=False)
        doc.Repaginate()
        total = doc.ComputeStatistics(2)  # wdStatisticPages
        words = doc.ComputeStatistics(0)  # wdStatisticWords

        marks = []  # (title, start_page)
        for i in range(1, doc.Paragraphs.Count + 1):
            p = doc.Paragraphs(i)
            style = str(p.Range.Style.NameLocal)
            if style.lower().startswith("heading 1"):
                title = p.Range.Text.strip().replace("\r", "").replace("\x07", "")
                if title:
                    marks.append((title, p.Range.Information(1)))

        print("file: " + path)
        print("total pages: %d   total words: %d" % (total, words))
        print("")
        print("%-52s %6s %6s %6s" % ("section", "start", "pages", "min"))
        print("-" * 74)
        check = 0
        for idx, (title, start) in enumerate(marks):
            # a section runs from its own start page up to (but not including)
            # the next section's start page; the last one runs to the last page
            nxt = marks[idx + 1][1] if idx + 1 < len(marks) else total + 1
            pages = nxt - start
            check += pages
            key = next((k for k in TEMPLATE_MIN if title.upper().startswith(k)), None)
            mn = TEMPLATE_MIN.get(key, 0)
            flag = ""
            if mn:
                flag = " OK" if pages >= mn else " SHORT by %d" % (mn - pages)
            print("%-52s %6d %6d %6s%s" % (title[:52], start, pages, mn or "-", flag))
        print("-" * 74)
        print("section pages sum: %d (document: %d)" % (check, total))
        return 0
    finally:
        try:
            if doc is not None:
                doc.Close(SaveChanges=False)
        finally:
            word.Quit()
            pythoncom.CoUninitialize()


if __name__ == "__main__":
    sys.exit(main())
