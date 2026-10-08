#!/usr/bin/env python3
"""
Real-use-case simulation: drive the app in a browser and assert that every
action the UI takes is reflected in Supabase, and that database rows are shown
in the UI.

Covers: map rendering, home quick links, challenge create -> list -> detail ->
delete, club join persistence across a reload, profile showing the joined club,
and a feed clip being visible in the app.

Requires: `npm run dev` on 127.0.0.1:5173 and .env configured (live).
"""
from __future__ import annotations
import asyncio, json, subprocess, sys, time, urllib.request, urllib.parse, urllib.error, tempfile
import websockets

BASE = "http://127.0.0.1:5173"
PORT = 9345
EMAIL = "demo@campusfit.app"
PASSWORD = "CampuFit@123!"

SET_INPUT = "(sel,val)=>{const el=document.querySelector(sel);if(!el)return 0;const p=el.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(el,val);el.dispatchEvent(new Event('input',{bubbles:true}));return 1;}"

ENV = dict(l.strip().split("=", 1) for l in open(".env", encoding="utf-8") if "=" in l and not l.startswith("#"))
URL = ENV["VITE_SUPABASE_URL"].rstrip("/")
SVC = ENV["SUPABASE_SERVICE_ROLE_KEY"]


def svc(method, path, body=None):
    h = {"apikey": SVC, "Authorization": f"Bearer {SVC}", "Content-Type": "application/json"}
    req = urllib.request.Request(URL + path, data=json.dumps(body).encode() if body is not None else None,
                                 method=method, headers=h)
    try:
        with urllib.request.urlopen(req) as r:
            t = r.read().decode(); return r.status, (json.loads(t) if t.strip() else {})
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]


async def main() -> int:
    checks = []
    # seed a clip row so the feed has something real to render
    _, clubs = svc("GET", "/rest/v1/clubs?select=id&limit=1")
    _, demo = svc("GET", "/rest/v1/profiles?select=id&email=eq.demo@campusfit.app")
    demo_id = demo[0]["id"] if demo else None
    caption = "Climbed the library steps again!"
    svc("DELETE", "/rest/v1/fitclips?caption=eq." + urllib.parse.quote(caption))
    svc("POST", "/rest/v1/fitclips",
        {"user_id": demo_id, "caption": caption, "video_url": "https://example.com/clip.webm"})

    prof = tempfile.mkdtemp(prefix="cf-act-")
    ch = subprocess.Popen([r"C:\Program Files\Google\Chrome\Application\chrome.exe", "--headless=new",
        f"--remote-debugging-port={PORT}", f"--user-data-dir={prof}", "--window-size=440,960",
        "--no-first-run", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    ver = None
    for _ in range(60):
        try:
            ver = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version", timeout=1)); break
        except Exception:
            time.sleep(0.5)
    try:
        async with websockets.connect(ver["webSocketDebuggerUrl"], max_size=64 * 1024 * 1024) as ws:
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

            async def wait_js(e, t=15.0):
                end = time.time() + t
                while time.time() < end:
                    try:
                        if await js(e): return True
                    except Exception:
                        pass
                    await asyncio.sleep(0.25)
                return False

            async def goto(route, settle=1.6):
                await send("Page.navigate", {"url": f"{BASE}{route}"})
                await wait_js("document.readyState==='complete'"); await asyncio.sleep(settle)

            async def click(text, contains=True):
                lit = json.dumps(text)
                if contains:
                    finder = "(x.textContent||'').replace(/\\s+/g,' ').includes(" + lit + ")"
                else:
                    finder = "(x.textContent||'').replace(/\\s+/g,' ').trim()===" + lit
                expr = "(()=>{const b=[...document.querySelectorAll('button')].find(x=>" + finder + ");if(!b)return 'missing';b.click();return 'ok'})()"
                await js(expr)

            async def body():
                return (await js("document.body.innerText")) or ""

            c = await send("Target.createTarget", {"url": "about:blank"})
            a = await send("Target.attachToTarget", {"targetId": c["targetId"], "flatten": True}); sess = a["sessionId"]
            await send("Page.enable"); await send("Runtime.enable")
            await send("Emulation.setDeviceMetricsOverride", {"width": 440, "height": 960, "deviceScaleFactor": 2, "mobile": True})

            await goto("/login", 1.4)
            await js(f"({SET_INPUT})('#email',{json.dumps(EMAIL)})")
            await js(f"({SET_INPUT})('#password',{json.dumps(PASSWORD)})")
            await click("Log In", contains=True)
            await wait_js("location.pathname === '/home'", 25)
            await asyncio.sleep(1.2)

            # 1. quick links
            home = await body()
            checks.append(("home shows a Quick links section", "Quick links" in home, ""))
            for label in ["Scan", "Map", "Challenges", "Badges"]:
                checks.append((f"quick link present: {label}", label in home, ""))

            # 2. map renders a real mapbox canvas
            await goto("/map", 3.0)
            canvas = await js("!!document.querySelector('.mapboxgl-canvas')")
            noerr = await js("!/Map unavailable|Map failed|Add a Mapbox token/.test(document.body.innerText)")
            checks.append(("map renders a Mapbox canvas", bool(canvas), ""))
            checks.append(("map shows no error placeholder", bool(noerr), ""))

            # 3. feed shows the seeded clip (backend row -> UI)
            await goto("/clips", 2.0)
            feed = await body()
            checks.append(("feed renders the clip row", caption in feed, caption))

            # 4. create a challenge through the UI
            await goto("/challenges", 2.0)
            title = "Climb-a-thon 2026"
            await goto("/challenges/new", 1.6)
            await js(f"({SET_INPUT})('#ch-title',{json.dumps(title)})")
            await js(f"({SET_INPUT})('#ch-desc','Scan 12 checkpoints this week')")
            await js(f"({SET_INPUT})('#ch-target','12')")
            await click("Create challenge")
            await wait_js("location.pathname === '/challenges'", 12)
            await asyncio.sleep(1.5)
            listtext = await body()
            checks.append(("challenge appears in the list after create", title in listtext, ""))
            _, rows = svc("GET", f"/rest/v1/challenges?select=id,title&title=eq.{urllib.parse.quote(title)}")
            checks.append(("challenge row persisted in Supabase", isinstance(rows, list) and len(rows) == 1, f"rows={rows}"))
            challenge_id = rows[0]["id"] if isinstance(rows, list) and rows else None

            # 5. open the detail page
            if challenge_id:
                await click(title)
                await wait_js(f"location.pathname === '/challenges/{challenge_id}'", 12)
                await asyncio.sleep(1.2)
                detail = await body()
                checks.append(("challenge detail renders its data", "Scan 12 checkpoints this week" in detail, detail[:60]))

                # 6. delete it -> list + DB agree
                await click("Delete")
                await wait_js("location.pathname === '/challenges'", 12)
                await asyncio.sleep(1.5)
                _, after = svc("GET", f"/rest/v1/challenges?select=id&id=eq.{challenge_id}")
                checks.append(("delete removes it from Supabase", isinstance(after, list) and len(after) == 0, f"rows={after}"))

            # 7. membership: UI must agree with Supabase and survive a reload
            await goto("/challenges", 2.2)
            _, members = svc("GET", "/rest/v1/club_members?select=club_id,user_id")
            mine = [m for m in (members if isinstance(members, list) else []) if m.get("user_id") == demo_id]
            leave_n = await js("[...document.querySelectorAll('button')].filter(x=>x.textContent.trim()==='Leave club').length") or 0
            join_n = await js("[...document.querySelectorAll('button')].filter(x=>x.textContent.trim()==='Join club').length") or 0
            checks.append(("membership buttons agree with Supabase rows", leave_n == len(mine),
                           f"db={len(mine)} ui_leave={leave_n} ui_join={join_n}"))

            if len(mine) > 0:
                await click("Leave club")
                await asyncio.sleep(1.8)
                await goto("/challenges", 2.4)
                _, after_leave = svc("GET", "/rest/v1/club_members?select=club_id,user_id")
                left = [m for m in (after_leave if isinstance(after_leave, list) else []) if m.get("user_id") == demo_id]
                checks.append(("leaving removes the row (persisted, not just local)", len(left) == len(mine) - 1,
                               f"before={len(mine)} after={len(left)}"))

                await click("Join club")
                await asyncio.sleep(1.8)
                await goto("/challenges", 2.4)
                _, after_join = svc("GET", "/rest/v1/club_members?select=club_id,user_id")
                joined_back = [m for m in (after_join if isinstance(after_join, list) else []) if m.get("user_id") == demo_id]
                checks.append(("re-joining restores membership after a reload", len(joined_back) == len(mine),
                               f"before={len(mine)} after={len(joined_back)}"))

                # 8. profile reflects a joined club
                _, clubs_named = svc("GET", "/rest/v1/clubs?select=id,name")
                name_by_id = {c["id"]: c["name"] for c in (clubs_named if isinstance(clubs_named, list) else [])}
                club_names = [name_by_id.get(m["club_id"]) for m in joined_back]
                await goto("/profile", 2.6)
                prof_text = await body()
                shown = [n for n in club_names if n and n in prof_text]
                checks.append(("profile shows a joined club", len(shown) > 0, ", ".join(shown) or "none"))
            else:
                checks.append(("club join control available", False, "no memberships to test"))
    finally:
        ch.terminate()
        try:
            ch.wait(timeout=5)
        except Exception:
            ch.kill()

    # do not leave the seeded clip behind in the live database
    svc("DELETE", "/rest/v1/fitclips?caption=eq." + urllib.parse.quote(caption))

    ok = True
    for name, passed, detail in checks:
        print(f"{'PASS' if passed else 'FAIL'}  {name}  {detail}")
        ok = ok and passed
    print(f"\n{sum(1 for _, p, _ in checks if p)}/{len(checks)} checks passed")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
