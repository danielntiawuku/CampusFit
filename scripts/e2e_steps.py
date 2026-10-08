#!/usr/bin/env python3
"""
Verify the FitTrip step tracker: open a real trip, start tracking, feed a
synthetic walking signal through DeviceMotionEvent, and confirm the on-screen
step count increases.

Requires: `npm run dev` on 127.0.0.1:5173, .env configured (live).
"""
from __future__ import annotations
import asyncio, json, subprocess, sys, time, urllib.request, tempfile
import websockets

BASE = "http://127.0.0.1:5173"
PORT = 9343
EMAIL = "demo@campusfit.app"
PASSWORD = "CampuFit@123!"

SET_INPUT = "(sel,val)=>{const el=document.querySelector(sel);if(!el)return 0;const p=el.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(el,val);el.dispatchEvent(new Event('input',{bubbles:true}));return 1;}"


def first_trip_id() -> str:
    env = dict(l.strip().split("=", 1) for l in open(".env", encoding="utf-8") if "=" in l and not l.startswith("#"))
    url = env["VITE_SUPABASE_URL"].rstrip("/"); svc = env["SUPABASE_SERVICE_ROLE_KEY"]
    req = urllib.request.Request(url + "/rest/v1/fittrips?select=id&limit=1",
                                 headers={"apikey": svc, "Authorization": f"Bearer {svc}"})
    with urllib.request.urlopen(req) as r:
        rows = json.loads(r.read().decode())
    return rows[0]["id"] if rows else ""


async def main() -> int:
    trip = first_trip_id()
    if not trip:
        print("FAIL  no fittrips row to test with"); return 1
    prof = tempfile.mkdtemp(prefix="cf-steps-")
    ch = subprocess.Popen([r"C:\Program Files\Google\Chrome\Application\chrome.exe", "--headless=new",
        f"--remote-debugging-port={PORT}", f"--user-data-dir={prof}", "--window-size=440,960",
        "--no-first-run", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    ver = None
    for _ in range(60):
        try:
            ver = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version", timeout=1)); break
        except Exception:
            time.sleep(0.5)
    checks = []
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
                res = r.get("result", {})
                return res.get("value")
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
            await send("Page.navigate", {"url": f"{BASE}/login"}); await wait_js("document.readyState==='complete'"); await asyncio.sleep(1.4)
            await js(f"({SET_INPUT})('#email',{json.dumps(EMAIL)})")
            await js(f"({SET_INPUT})('#password',{json.dumps(PASSWORD)})")
            await js("[...document.querySelectorAll('button')].find(b=>/Log In/.test(b.textContent)).click(); 'ok'")
            await wait_js("location.pathname === '/home'", 20)

            await send("Page.navigate", {"url": f"{BASE}/trip/{trip}"})
            await wait_js("document.readyState==='complete'"); await asyncio.sleep(1.8)
            checks.append(("trip detail shows the step tracker", await js("!!document.body.innerText.match(/Trip tracker/i)"), trip))

            await js("[...document.querySelectorAll('button')].find(b=>/Start this FitTrip/.test(b.textContent)).click(); 'ok'")
            await asyncio.sleep(1.2)
            running = await js("/Counting steps/.test(document.body.innerText)")
            checks.append(("tracker enters the running state", bool(running), ""))

            # synthetic walking signal: 2 Hz oscillation around gravity, 30 ms samples
            await js("""
              (() => {
                window.__dm = 0;
                if (window.__dmTimer) clearInterval(window.__dmTimer);
                const t0 = performance.now();
                window.__dmTimer = setInterval(() => {
                  const t = (performance.now() - t0) / 1000;
                  const mag = 9.8 + 2.6 * Math.sin(2 * Math.PI * 2 * t);
                  const ev = new DeviceMotionEvent('devicemotion', {
                    accelerationIncludingGravity: { x: mag, y: 0, z: 0 },
                    interval: 30,
                  });
                  window.dispatchEvent(ev);
                  window.__dm++;
                }, 30);
                return 'started';
              })()
            """)
            await asyncio.sleep(5.0)
            await js("clearInterval(window.__dmTimer); window.__dm")
            dispatched = await js("window.__dm") or 0
            counted = await js("""
              (() => {
                const label = [...document.querySelectorAll('p')].find(p => p.textContent.trim() === 'Steps');
                const raw = label && label.previousElementSibling && label.previousElementSibling.textContent;
                return raw ? Number(raw.replace(/[^0-9]/g, '')) : -1;
              })()
            """)
            counted = int(counted) if counted is not None else -1
            checks.append((f"synthetic motion dispatched ({dispatched} samples)", dispatched > 50, f"samples={dispatched}"))
            checks.append((f"steps counted from motion (got {counted})", counted > 0, f"steps={counted}"))

            # stop & save persists to today's device total
            await js("[...document.querySelectorAll('button')].find(b=>/Stop & save/.test(b.textContent)).click(); 'ok'")
            await asyncio.sleep(1.0)
            saved = await js("localStorage.getItem('campusfit.steps.' + new Date().toISOString().slice(0,10))")
            checks.append(("stop persists today's steps", bool(saved) and int(saved) > 0, f"saved={saved}"))
    finally:
        ch.terminate()
        try: ch.wait(timeout=5)
        except Exception: ch.kill()

    ok = True
    for name, passed, detail in checks:
        print(f"{'PASS' if passed else 'FAIL'}  {name}  {detail}")
        ok = ok and passed
    print(f"\n{sum(1 for _, p, _ in checks if p)}/{len(checks)} checks passed")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
