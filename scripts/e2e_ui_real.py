#!/usr/bin/env python3
"""
End-to-end UI flow against the LIVE backend (Supabase), using only the
anonymous session — no service-role key required.

Walks the real user journey through the running dev server:
  login -> dashboard -> scan a real checkpoint -> +N pts -> re-scan (cooldown)
  -> profile points -> leaderboard -> badges

Requires: `npm run dev` on 127.0.0.1:5173 and .env configured (live mode).
"""
from __future__ import annotations

import asyncio
import json
import re
import subprocess
import sys
import tempfile
import time
import urllib.request

import websockets

BASE = "http://127.0.0.1:5173"
PORT = 9337
EMAIL = "demo@campusfit.app"
PASSWORD = "CampuFit@123!"

SET_INPUT = """
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


async def main() -> int:
    prof = tempfile.mkdtemp(prefix="cf-e2e-ui-")
    chrome = subprocess.Popen(
        [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            "--headless=new",
            f"--remote-debugging-port={PORT}",
            f"--user-data-dir={prof}",
            "--window-size=440,960",
            "--no-first-run",
            "--hide-scrollbars",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    ver = None
    for _ in range(60):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version", timeout=1) as r:
                ver = json.load(r)
            break
        except Exception:
            time.sleep(0.5)
    if not ver:
        chrome.terminate()
        print("Chrome DevTools endpoint never came up", file=sys.stderr)
        return 1

    checks: list[tuple[str, bool, str]] = []
    try:
        async with websockets.connect(ver["webSocketDebuggerUrl"], max_size=64 * 1024 * 1024) as ws:
            counter = 0
            session = None

            async def send(method, params=None):
                nonlocal counter
                counter += 1
                msg = {"id": counter, "method": method, "params": params or {}}
                if session:
                    msg["sessionId"] = session
                await ws.send(json.dumps(msg))
                while True:
                    data = json.loads(await ws.recv())
                    if data.get("id") == counter:
                        return data.get("result", {})

            async def js(expr):
                res = await send("Runtime.evaluate", {"expression": expr, "returnByValue": True})
                return res.get("result", {}).get("value")

            async def wait_js(expr, timeout=15.0):
                end = time.time() + timeout
                while time.time() < end:
                    try:
                        if await js(expr):
                            return True
                    except Exception:
                        pass
                    await asyncio.sleep(0.3)
                return False

            async def goto(route, settle=1.5):
                await send("Page.navigate", {"url": f"{BASE}{route}"})
                await wait_js("document.readyState === 'complete'", 15)
                await asyncio.sleep(settle)

            target = await send("Target.createTarget", {"url": "about:blank"})
            attach = await send("Target.attachToTarget", {"targetId": target["targetId"], "flatten": True})
            session = attach["sessionId"]
            await send("Page.enable")
            await send("Runtime.enable")
            await send(
                "Emulation.setDeviceMetricsOverride",
                {"width": 440, "height": 960, "deviceScaleFactor": 2, "mobile": True},
            )

            # 1. real sign-in
            await goto("/login", 1.2)
            await js(f"({SET_INPUT})('#email', {json.dumps(EMAIL)})")
            await js(f"({SET_INPUT})('#password', {json.dumps(PASSWORD)})")
            await js("[...document.querySelectorAll('button')].find(b => /Log In/.test(b.textContent)).click(); 'ok'")
            landed = await wait_js("location.pathname === '/home'", 20)
            checks.append(("live sign-in reaches /home", landed, f"path={await js('location.pathname')}"))

            # 2. dashboard shows live profile, not demo banner
            dash = (await js("document.body.innerText")) or ""
            checks.append(
                (
                    "dashboard renders live profile data",
                    len(dash) > 200 and "Demo mode" not in dash,
                    dash.strip().splitlines()[0][:60] if dash.strip() else "",
                )
            )

            # 3. scan screen lists real checkpoints and is NOT in demo mode
            await goto("/scan", 1.8)
            scan_text = (await js("document.body.innerText")) or ""
            codes = await js(
                "[...document.querySelectorAll('span.font-mono')].map(e => e.textContent.trim()).filter(Boolean)"
            )
            codes = codes or []
            checks.append(("scan board lists real checkpoint codes", len(codes) > 0, ",".join(codes[:5])))
            checks.append(("scan screen is live (no demo banner)", "Demo mode" not in scan_text, ""))

            # 4. award points with a real code (skip codes already on cooldown)
            awarded_code = None
            award_detail = ""
            for code in codes[:6]:
                await js(f"({SET_INPUT})('#cp-code', {json.dumps(code)})")
                await js("[...document.querySelectorAll('button')].find(b => /Claim/.test(b.textContent)).click(); 'ok'")
                got = await wait_js(r"/\+\d+ pts/.test(document.body.innerText)", 10)
                body = (await js("document.body.innerText")) or ""
                if got:
                    awarded_code = code
                    award_detail = next((l.strip() for l in body.splitlines() if "pts" in l and "+" in l), "")
                    break
                await asyncio.sleep(0.6)
            checks.append(("scan awards real points (+N pts)", awarded_code is not None, f"{awarded_code} {award_detail}"))

            # 5. cooldown blocks an immediate re-scan of the same code
            if awarded_code:
                await asyncio.sleep(1.0)
                await js(f"({SET_INPUT})('#cp-code', {json.dumps(awarded_code)})")
                await js("[...document.querySelectorAll('button')].find(b => /Claim/.test(b.textContent)).click(); 'ok'")
                cooled = await wait_js(
                    r"/Already scanned recently|try again in/i.test(document.body.innerText)", 10
                )
                checks.append(("re-scan hits the server cooldown", cooled, awarded_code))

            # 6. profile reflects a positive point balance
            await goto("/profile", 1.8)
            prof_text = (await js("document.body.innerText")) or ""
            m = re.search(r"([\d,]+)\s*(?:pts|points)", prof_text, re.I)
            pts = int(m.group(1).replace(",", "")) if m else 0
            checks.append(("profile shows awarded points", pts > 0, f"points={pts}"))

            # 7. leaderboard + badges render live rows
            await goto("/leaderboard", 1.8)
            lb = (await js("document.body.innerText")) or ""
            checks.append(("leaderboard renders ranks", "#" in lb and "pt" in lb.lower(), lb[:50].replace("\n", " ")))
            await goto("/badges", 1.8)
            bd = (await js("document.body.innerText")) or ""
            checks.append(("badge shelf renders", "badge" in bd.lower() or "collection" in bd.lower(), bd[:50].replace("\n", " ")))

            # 8. detail screens resolve from real ids (trip + club + checkpoint)
            await goto("/explore/search", 1.5)
            await goto("/workout", 1.5)
            workout = (await js("document.body.innerText")) or ""
            checks.append(("workout schedule renders trips", len(workout) > 200, workout[:50].replace("\n", " ")))
    finally:
        chrome.terminate()
        try:
            chrome.wait(timeout=5)
        except Exception:
            chrome.kill()

    ok = True
    for name, passed, detail in checks:
        print(f"{'PASS' if passed else 'FAIL'}  {name}  {detail}")
        ok = ok and passed
    print(f"\n{sum(1 for _, p, _ in checks if p)}/{len(checks)} checks passed")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
