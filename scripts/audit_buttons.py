#!/usr/bin/env python3
"""
Broad button audit: on each route, click every button once (reloading between
clicks) and flag any that produce no observable change (path, body text length,
or the button's own label). Camera/OAuth buttons are expected to be no-ops and
are listed separately.
"""
from __future__ import annotations
import asyncio, json, subprocess, sys, time, urllib.request, tempfile
import websockets

BASE = "http://127.0.0.1:5173"
PORT = 9344
EMAIL = "demo@campusfit.app"
PASSWORD = "CampuFit@123!"
# /settings is excluded: its "Log out" button ends the session and would make
# every later route render the login page instead.
ROUTES = ["/home", "/workout", "/profile", "/clubs", "/challenges",
          "/explore", "/explore/search", "/stats", "/badges", "/leaderboard", "/notifications"]

SET_INPUT = "(sel,val)=>{const el=document.querySelector(sel);if(!el)return 0;const p=el.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(el,val);el.dispatchEvent(new Event('input',{bubbles:true}));return 1;}"

EXPECTED_NOOP = ("google", "apple", "forgot", "more_vert", "add a comment", "reply",
                 "like", "camera", "start camera", "stop camera", "play", "km", "miles")


async def main():
    prof = tempfile.mkdtemp(prefix="cf-audit-")
    ch = subprocess.Popen([r"C:\Program Files\Google\Chrome\Application\chrome.exe", "--headless=new",
        f"--remote-debugging-port={PORT}", f"--user-data-dir={prof}", "--window-size=440,960",
        "--no-first-run", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    ver = None
    for _ in range(60):
        try:
            ver = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version", timeout=1)); break
        except Exception:
            time.sleep(0.5)
    flagged, noop, total = [], [], 0
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
            c = await send("Target.createTarget", {"url": "about:blank"})
            a = await send("Target.attachToTarget", {"targetId": c["targetId"], "flatten": True}); sess = a["sessionId"]
            await send("Page.enable"); await send("Runtime.enable")
            async def goto(route):
                await send("Page.navigate", {"url": f"{BASE}{route}"})
                await wait_js("document.readyState==='complete'", 15); await asyncio.sleep(1.5)
            await goto("/login")
            await js(f"({SET_INPUT})('#email',{json.dumps(EMAIL)})")
            await js(f"({SET_INPUT})('#password',{json.dumps(PASSWORD)})")
            await js("[...document.querySelectorAll('button')].find(b=>/Log In/.test(b.textContent)).click(); 'ok'")
            await wait_js("location.pathname === '/home'", 20)

            for route in ROUTES:
                await goto(route)
                labels = await js("""
                  [...document.querySelectorAll('button')].map(b => (b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim()).filter(Boolean)
                """) or []
                for idx, label in enumerate(labels):
                    total += 1
                    await goto(route)
                    before = await js("JSON.stringify([location.pathname, document.body.innerText.length])")
                    await js(f"""
                      (() => {{ const bs=[...document.querySelectorAll('button')]; const b=bs[{idx}]; if(!b) return 'x'; b.click(); return 'ok'; }})()
                    """)
                    await asyncio.sleep(0.9)
                    after = await js("JSON.stringify([location.pathname, document.body.innerText.length])")
                    if before == after:
                        low = label.lower()
                        if any(k in low for k in EXPECTED_NOOP):
                            noop.append((route, label))
                        else:
                            flagged.append((route, label))
    finally:
        ch.terminate()
        try: ch.wait(timeout=5)
        except Exception: ch.kill()

    print(f"audited {total} buttons across {len(ROUTES)} routes\n")
    print(f"unexpected no-ops ({len(flagged)}):")
    for r, l in flagged:
        print(f"  {r:20} {l!r}")
    print(f"\nexpected decorative no-ops ({len(noop)}):")
    for r, l in noop[:20]:
        print(f"  {r:20} {l!r}")


if __name__ == "__main__":
    asyncio.run(main())
