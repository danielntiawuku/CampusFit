#!/usr/bin/env python3
"""
Coherence/flow test for the fixed journeys:
  * OTP screen  -> Verify        -> /onboarding
  * Onboarding  -> choose + cont -> /home  (Skip also exits)
  * Admin hub   -> each admin card -> its sub-page
  * Settings / profile deep links resolve

Requires: `npm run dev` on 127.0.0.1:5173, .env live.
"""
from __future__ import annotations

import asyncio
import json
import subprocess
import sys
import tempfile
import time
import urllib.request

import websockets

BASE = "http://127.0.0.1:5173"
PORT = 9340
EMAIL = "demo@campusfit.app"
PASSWORD = "CampuFit@123!"

SET_INPUT = "(sel,val)=>{const el=document.querySelector(sel);if(!el)return 0;const p=el.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(el,val);el.dispatchEvent(new Event('input',{bubbles:true}));return 1;}"


async def main() -> int:
    prof = tempfile.mkdtemp(prefix="cf-flows-")
    chrome = subprocess.Popen(
        [r"C:\Program Files\Google\Chrome\Application\chrome.exe", "--headless=new",
         f"--remote-debugging-port={PORT}", f"--user-data-dir={prof}", "--window-size=440,960",
         "--no-first-run", "--hide-scrollbars", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    ver = None
    for _ in range(60):
        try:
            ver = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version", timeout=1)); break
        except Exception:
            time.sleep(0.5)
    if not ver:
        chrome.terminate(); print("no devtools", file=sys.stderr); return 1

    checks: list[tuple[str, bool, str]] = []
    try:
        async with websockets.connect(ver["webSocketDebuggerUrl"], max_size=64*1024*1024) as ws:
            nid = 0; sess = None
            async def send(m, p=None):
                nonlocal nid
                nid += 1; my = nid; msg = {"id": my, "method": m, "params": p or {}}
                if sess: msg["sessionId"] = sess
                await ws.send(json.dumps(msg))
                while True:
                    d = json.loads(await ws.recv())
                    if d.get("id") == my: return d.get("result", {})
            async def js(e):
                r = await send("Runtime.evaluate", {"expression": e, "returnByValue": True})
                return r.get("result", {}).get("value")
            async def wait_js(e, t=12.0):
                end = time.time() + t
                while time.time() < end:
                    try:
                        if await js(e): return True
                    except Exception: pass
                    await asyncio.sleep(0.25)
                return False
            async def goto(route, settle=1.4):
                await send("Page.navigate", {"url": f"{BASE}{route}"})
                await wait_js("document.readyState === 'complete'")
                await asyncio.sleep(settle)

            c = await send("Target.createTarget", {"url": "about:blank"})
            a = await send("Target.attachToTarget", {"targetId": c["targetId"], "flatten": True})
            sess = a["sessionId"]
            await send("Page.enable"); await send("Runtime.enable")
            await send("Emulation.setDeviceMetricsOverride", {"width": 440, "height": 960, "deviceScaleFactor": 2, "mobile": True})

            # sign in (session persists for authed deep links)
            await goto("/login", 1.2)
            await js(f"({SET_INPUT})('#email',{json.dumps(EMAIL)})")
            await js(f"({SET_INPUT})('#password',{json.dumps(PASSWORD)})")
            await js("[...document.querySelectorAll('button')].find(b=>/Log In/.test(b.textContent)).click(); 'ok'")
            await wait_js("location.pathname === '/home'", 20)

            # 1. OTP Verify -> /onboarding
            await goto("/otp")
            await js("[...document.querySelectorAll('button')].find(b=>/Verify/.test(b.textContent)).click(); 'ok'")
            ok = await wait_js("location.pathname === '/onboarding'", 8)
            checks.append(("OTP Verify -> /onboarding", ok, await js("location.pathname")))

            # 2. Onboarding: Continue disabled until a card is chosen
            await goto("/onboarding")
            disabled0 = await js("document.getElementById('continue-btn')?.disabled === true")
            checks.append(("Onboarding Continue disabled with no selection", bool(disabled0), f"disabled={disabled0}"))
            await js("document.querySelector('.selection-card')?.click(); 'ok'")
            enabled = await wait_js("document.getElementById('continue-btn')?.disabled === false", 6)
            checks.append(("Onboarding Continue enables after selecting", bool(enabled), f"enabled={enabled}"))
            await js("document.getElementById('continue-btn').click(); 'ok'")
            ok = await wait_js("location.pathname === '/home'", 8)
            checks.append(("Onboarding Continue -> /home", ok, await js("location.pathname")))

            # 3. Onboarding Skip -> /home
            await goto("/onboarding")
            await js("[...document.querySelectorAll('button')].find(b=>/^Skip$/.test(b.textContent.trim())).click(); 'ok'")
            ok = await wait_js("location.pathname === '/home'", 8)
            checks.append(("Onboarding Skip -> /home", ok, await js("location.pathname")))

            # 4. Admin hub -> each sub-page
            await goto("/admin")
            for label, expect in [
                ("Problem reports", "/admin/reports"),
                ("Checkpoints", "/admin/checkpoints"),
                ("Clubs", "/admin/clubs"),
                ("Students", "/admin/students"),
            ]:
                await goto("/admin")
                await js(
                    "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes(%s));if(b){b.click();return 'ok'}return 'missing'})()"
                    % json.dumps(label)
                )
                ok = await wait_js(f"location.pathname === {json.dumps(expect)}", 8)
                checks.append((f"Admin hub -> {expect}", ok, await js("location.pathname")))

            # 5. Deep links resolve
            for route in ["/privacy", "/forgot-password", "/map", "/settings", "/edit-profile", "/challenges"]:
                await goto(route, 1.0)
                body = await js("document.body.innerText") or ""
                checks.append((f"{route} renders content", len(body) > 40, f"len={len(body)}"))
    finally:
        chrome.terminate()
        try: chrome.wait(timeout=5)
        except Exception: chrome.kill()

    okall = True
    for name, passed, detail in checks:
        print(f"{'PASS' if passed else 'FAIL'}  {name}  {detail}")
        okall = okall and passed
    print(f"\n{sum(1 for _, p, _ in checks if p)}/{len(checks)} checks passed")
    return 0 if okall else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
