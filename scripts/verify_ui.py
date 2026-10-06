#!/usr/bin/env python3
"""
Visual/behavioural verification for CampusFit.

Boots headless Chrome over the DevTools protocol, walks every app route,
and for each one:
  * seeds the demo session, waits for render,
  * captures a screenshot (verify/shots/<slug>.png),
  * records console errors / uncaught exceptions,
  * checks the design tokens (Outfit family, cream background),
  * diffs the rendered text against the original Google Stitch screen HTML.

Run with the Vite dev server already listening on 127.0.0.1:5173.
"""
from __future__ import annotations

import asyncio
import base64
import difflib
import json
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

import websockets

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "verify" / "shots"
REPORT = ROOT / "verify" / "report.json"
ORIG = ROOT.parent / "_campusfit_screens"
BASE = "http://127.0.0.1:5173"
DEBUG_PORT = 9333
# Demo account created in the connected Supabase project (scripts/e2e_supabase.py).
LOGIN_EMAIL = "demo@campusfit.app"
LOGIN_PASSWORD = "CampuFit@123!"

# route -> original stitch screen (None = new screen with no original)
ROUTES: list[tuple[str, str | None]] = [
    # "/" intentionally redirects to /home once a session exists, so it has
    # no meaningful text comparison of its own.
    ("/", None),
    ("/login", "08_Log_In.html"),
    ("/signup", "07_Create_Account.html"),
    ("/verify", "09_Student_Verification.html"),
    ("/otp", "10_OTP_Verification.html"),
    ("/onboarding", "11_Onboarding_Interests.html"),
    ("/home", "01_Student_Dashboard.html"),
    ("/feed", "02_FitClips_Inspiration.html"),
    ("/clips", "13_FitClips_Vertical_Feed.html"),
    ("/explore", "03_FitTrip_Explorer.html"),
    ("/explore/map", "12_FitTrip_Explorer_Map.html"),
    ("/explore/search", "14_FitTrip_Explorer_Search.html"),
    ("/stats", "04_Activity_Stats.html"),
    ("/profile", "15_Student_Profile.html"),
    ("/clubs", "16_Club_Dashboard.html"),
    ("/settings", "17_Settings.html"),
    ("/help", "18_Help_FAQ.html"),
    ("/report", "19_Report_a_Problem.html"),
    ("/report/done", "20_Submission_Success.html"),
    ("/scan", None),
    ("/leaderboard", None),
    ("/badges", None),
    ("/admin", None),
    ("/notifications", None),
    ("/edit-profile", None),
    ("/privacy", None),
    ("/record", None),
    ("/forgot-password", None),
    ("/logo", "05_CampusFit_Logo_Mark.html"),
]


def original_text(name: str) -> str:
    html = (ORIG / name).read_text(encoding="utf-8")
    html = re.sub(r"<script.*?</script>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<style.*?</style>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", html)
    text = text.replace("&amp;", "&").replace("&nbsp;", " ").replace("&quot;", '"')
    return re.sub(r"\s+", " ", text).strip()


def slug(route: str) -> str:
    return route.strip("/").replace("/", "_") or "root"


class Cdp:
    def __init__(self, ws):
        self.ws = ws
        self.next_id = 0
        self.session: str | None = None
        self.events: list[dict] = []

    async def send(self, method: str, params: dict | None = None) -> dict:
        self.next_id += 1
        msg = {"id": self.next_id, "method": method, "params": params or {}}
        if self.session:
            msg["sessionId"] = self.session
        await self.ws.send(json.dumps(msg))
        while True:
            raw = await self.ws.recv()
            data = json.loads(raw)
            if data.get("id") == self.next_id:
                if "error" in data:
                    raise RuntimeError(f"{method}: {data['error']}")
                return data.get("result", {})
            self.events.append(data)

    async def evaluate(self, expr: str):
        result = await self.send("Runtime.evaluate", {"expression": expr, "returnByValue": True})
        return result.get("result", {}).get("value")

    async def wait_for(self, expr: str, timeout: float = 12.0) -> bool:
        deadline = time.time() + timeout
        while time.time() < deadline:
            try:
                if await self.evaluate(expr):
                    return True
            except Exception:
                pass
            await asyncio.sleep(0.25)
        return False


async def main() -> int:
    if SHOTS.exists():
        shutil.rmtree(SHOTS, ignore_errors=True)
    SHOTS.mkdir(parents=True, exist_ok=True)

    profile_dir = tempfile.mkdtemp(prefix="cf-verify-")
    chrome = subprocess.Popen(
        [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            "--headless=new",
            f"--remote-debugging-port={DEBUG_PORT}",
            f"--user-data-dir={profile_dir}",
            "--window-size=440,960",
            "--no-first-run",
            "--disable-extensions",
            "--hide-scrollbars",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    version = None
    for _ in range(60):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{DEBUG_PORT}/json/version", timeout=1) as resp:
                version = json.load(resp)
            break
        except Exception:
            time.sleep(0.5)
    if not version:
        chrome.terminate()
        print("Chrome DevTools endpoint never came up", file=sys.stderr)
        return 1

    report: list[dict] = []
    try:
        async with websockets.connect(version["webSocketDebuggerUrl"], max_size=64 * 1024 * 1024) as ws:
            cdp = Cdp(ws)
            created = await cdp.send("Target.createTarget", {"url": "about:blank"})
            attached = await cdp.send(
                "Target.attachToTarget", {"targetId": created["targetId"], "flatten": True}
            )
            cdp.session = attached["sessionId"]
            await cdp.send("Page.enable")
            await cdp.send("Runtime.enable")
            await cdp.send(
                "Emulation.setDeviceMetricsOverride",
                {"width": 440, "height": 960, "deviceScaleFactor": 2, "mobile": True},
            )

            # Sign in once (Supabase session persists across navigations).
            await cdp.send("Page.navigate", {"url": f"{BASE}/login"})
            await cdp.wait_for("document.readyState === 'complete'")
            await asyncio.sleep(0.8)
            set_input = """
                (sel, value) => {
                  const el = document.querySelector(sel);
                  if (!el) return 'missing';
                  const proto = el.tagName === 'TEXTAREA'
                    ? window.HTMLTextAreaElement.prototype
                    : window.HTMLInputElement.prototype;
                  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
                  el.dispatchEvent(new Event('input', { bubbles: true }));
                  return 'ok';
                }
            """
            await cdp.evaluate(f"({set_input})('#email', {json.dumps(LOGIN_EMAIL)})")
            await cdp.evaluate(f"({set_input})('#password', {json.dumps(LOGIN_PASSWORD)})")
            await cdp.evaluate(
                "[...document.querySelectorAll('button')].find(b => /Log In/.test(b.textContent)).click(); 'ok'"
            )
            await cdp.wait_for("location.pathname === '/home'", 25)
            await asyncio.sleep(1.0)

            for route, original in ROUTES:
                cdp.events.clear()
                await cdp.send("Page.navigate", {"url": f"{BASE}{route}"})
                await cdp.wait_for("document.readyState === 'complete'")
                await asyncio.sleep(1.1)

                text = (await cdp.evaluate("document.body.innerText")) or ""
                tokens = await cdp.evaluate(
                    """(() => {
                        const cs = getComputedStyle(document.body);
                        const root = document.querySelector('.app-frame');
                        return JSON.stringify({
                            font: cs.fontFamily,
                            bg: cs.backgroundColor,
                            hasFrame: Boolean(root),
                            nav: Boolean(document.querySelector('nav[aria-label="Primary"]')),
                            title: document.title,
                        });
                    })()"""
                )
                info = json.loads(tokens) if tokens else {}

                shot = SHOTS / f"{slug(route)}.png"
                png = await cdp.send("Page.captureScreenshot", {"format": "png"})
                shot.write_bytes(base64.b64decode(png["data"]))

                errors = []
                for ev in cdp.events:
                    method = ev.get("method")
                    params = ev.get("params", {})
                    if method == "Runtime.exceptionThrown":
                        errors.append(params.get("exceptionDetails", {}).get("text", "exception"))
                    elif method == "Runtime.consoleAPICalled" and params.get("type") == "error":
                        args = ", ".join(str(a.get("value", a.get("description", ""))) for a in params.get("args", []))
                        errors.append(f"console.error: {args}")

                similarity = None
                if original and (ORIG / original).exists():
                    similarity = round(
                        difflib.SequenceMatcher(
                            None,
                            original_text(original),
                            re.sub(r"\s+", " ", text).strip(),
                            autojunk=False,
                        ).ratio(),
                        3,
                    )

                entry = {
                    "route": route,
                    "original": original,
                    "similarity": similarity,
                    "console_errors": errors,
                    "tokens": info,
                    "screenshot": str(shot.relative_to(ROOT)),
                    "text_length": len(text),
                }
                report.append(entry)
                flag = "OK "
                if errors or (similarity is not None and similarity < 0.45) or not info.get("hasFrame"):
                    flag = "WARN"
                print(
                    f"{flag} {route:<20} sim={similarity} errors={len(errors)} "
                    f"font={'Outfit' in (info.get('font') or '')} nav={info.get('nav')} text={len(text)}"
                )

            REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    finally:
        chrome.terminate()
        try:
            chrome.wait(timeout=5)
        except Exception:
            chrome.kill()

    problems = [
        r
        for r in report
        if r["console_errors"]
        or not r["tokens"].get("hasFrame")
        or (r["similarity"] is not None and r["similarity"] < 0.45)
    ]
    print(f"\n{len(report)} routes checked, {len(problems)} with warnings -> {REPORT}")
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
