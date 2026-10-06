#!/usr/bin/env python3
"""
End-to-end test against the real Supabase backend.

Signs in through the UI, verifies that dashboard data comes from Postgres,
scans a checkpoint twice (award + cooldown), and confirms the server-side
award in points_ledger.

Requires: `npm run dev` on 127.0.0.1:5173 and .env configured.
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
PORT = 9336
EMAIL = "demo@campusfit.app"
PASSWORD = "CampuFit@123!"
CODE = "LIB-A1"  # seeded checkpoint


def api(method: str, path: str, body: dict | None = None, token: str | None = None):
    env = dict(line.strip().split("=", 1) for line in open(".env", encoding="utf-8") if "=" in line)
    req = urllib.request.Request(
        env["VITE_SUPABASE_URL"].rstrip("/") + path,
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers={
            "apikey": env["SUPABASE_SERVICE_ROLE_KEY"],
            "Authorization": f"Bearer {token or env['SUPABASE_SERVICE_ROLE_KEY']}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            text = resp.read().decode()
            return resp.status, (json.loads(text) if text.strip() else {})
    except urllib.error.HTTPError as exc:
        text = exc.read().decode()
        return exc.code, (json.loads(text) if text.strip() else {})


async def main() -> int:
    # --- reset the demo account so the run is repeatable (cooldowns, points)
    env = dict(line.strip().split("=", 1) for line in open(".env", encoding="utf-8") if "=" in line)
    user_id = None
    _, users = api("GET", "/auth/v1/admin/users")
    for user in (users.get("users", []) if isinstance(users, dict) else []):
        if user.get("email") == EMAIL:
            user_id = user["id"]
    if user_id:
        for table in ("checkpoint_scans", "points_ledger", "user_badges"):
            api("DELETE", f"/rest/v1/{table}?user_id=eq.{user_id}")
        api(
            "PATCH",
            f"/rest/v1/profiles?id=eq.{user_id}",
            {"points": 0, "level": 1, "streak_days": 0},
        )
        print(f"reset demo account {user_id} ({env['VITE_SUPABASE_URL']})")

    profile_dir = tempfile.mkdtemp(prefix="cf-e2e-")
    chrome = subprocess.Popen(
        [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            "--headless=new",
            f"--remote-debugging-port={PORT}",
            f"--user-data-dir={profile_dir}",
            "--window-size=440,960",
            "--no-first-run",
            "--hide-scrollbars",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    version = None
    for _ in range(60):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version", timeout=1) as resp:
                version = json.load(resp)
            break
        except Exception:
            time.sleep(0.5)
    if not version:
        chrome.terminate()
        print("Chrome DevTools endpoint never came up", file=sys.stderr)
        return 1

    checks: list[tuple[str, bool, str]] = []
    try:
        async with websockets.connect(version["webSocketDebuggerUrl"], max_size=64 * 1024 * 1024) as ws:
            counter = 0
            session = None

            async def send(method: str, params: dict | None = None) -> dict:
                nonlocal counter
                counter += 1
                message = {"id": counter, "method": method, "params": params or {}}
                if session:
                    message["sessionId"] = session
                await ws.send(json.dumps(message))
                while True:
                    raw = await ws.recv()
                    data = json.loads(raw)
                    if data.get("id") == counter:
                        return data.get("result", {})

            async def js(expr: str):
                res = await send("Runtime.evaluate", {"expression": expr, "returnByValue": True})
                return res.get("result", {}).get("value")

            async def wait_js(expr: str, timeout: float = 15.0) -> bool:
                deadline = time.time() + timeout
                while time.time() < deadline:
                    try:
                        if await js(expr):
                            return True
                    except Exception:
                        pass
                    await asyncio.sleep(0.3)
                return False

            target = await send("Target.createTarget", {"url": "about:blank"})
            attach = await send(
                "Target.attachToTarget", {"targetId": target["targetId"], "flatten": True}
            )
            session = attach["sessionId"]
            await send("Page.enable")
            await send("Runtime.enable")
            await send(
                "Emulation.setDeviceMetricsOverride",
                {"width": 440, "height": 960, "deviceScaleFactor": 2, "mobile": True},
            )

            async def goto(route: str, settle: float = 1.4) -> None:
                await send("Page.navigate", {"url": f"{BASE}{route}"})
                await wait_js("document.readyState === 'complete'")
                await asyncio.sleep(settle)

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

            # --- 1. sign in through the real auth flow --------------------
            await goto("/login", 1.0)
            await js(f"({SET_INPUT})('#email', {json.dumps(EMAIL)})")
            await js(f"({SET_INPUT})('#password', {json.dumps(PASSWORD)})")
            await js(
                "[...document.querySelectorAll('button')].find(b => /Log In/.test(b.textContent)).click(); 'clicked'"
            )
            landed = await wait_js("location.pathname === '/home'", 20)
            checks.append(("UI sign-in reaches /home", landed, f"path={await js('location.pathname')}"))

            greeted = await wait_js("/Good morning,\\s+Ama/.test(document.body.innerText)", 12)
            body = (await js("document.body.innerText")) or ""
            checks.append(
                ("dashboard greets the Supabase profile", greeted, body[:80].replace("\n", " "))
            )

            # --- 2. data served from Postgres (not demo fixtures) ---------
            _, rows = api("GET", "/rest/v1/checkpoints?select=code&limit=5")
            await goto("/scan", 1.6)
            scan_text = (await js("document.body.innerText")) or ""
            db_codes = {row["code"] for row in rows}
            present = any(code in scan_text for code in db_codes)
            checks.append(("checkpoint board shows DB rows", present, sorted(db_codes)[:4]))

            # --- 3. scan awards points server-side ------------------------
            _, ledger_before = api("GET", "/rest/v1/points_ledger?select=id")
            await js(f"({SET_INPUT})('#cp-code', {json.dumps(CODE)})")
            await js(
                "[...document.querySelectorAll('button')].find(b => /Claim/.test(b.textContent)).click(); 'clicked'"
            )
            awarded = await wait_js("/\\+\\d+ pts/.test(document.body.innerText)", 12)
            result_text = (await js("document.body.innerText")) or ""
            snippet = next(
                (line for line in result_text.splitlines() if "pts" in line), ""
            )
            checks.append(("scan awards points (+N pts UI)", awarded, snippet.strip()))

            # --- 4. cooldown blocks a second scan of the same code --------
            await asyncio.sleep(1.0)
            await js(f"({SET_INPUT})('#cp-code', {json.dumps(CODE)})")
            await js(
                "[...document.querySelectorAll('button')].find(b => /Claim/.test(b.textContent)).click(); 'clicked'"
            )
            cooled = await wait_js(
                "/Already scanned recently|cooldown|try again in/i.test(document.body.innerText)", 12
            )
            checks.append(("re-scan hits the cooldown rule", cooled, ""))

            # --- 5. ledger + profile points in Postgres -------------------
            _, ledger = api("GET", "/rest/v1/points_ledger?select=delta,reason")
            _, profiles = api(
                "GET",
                "/rest/v1/profiles?select=points,level,full_name&id=eq.d4f54441-f3b3-4a71-987f-f7414bbd544d",
            )
            ledger_rows = [r for r in ledger if isinstance(r, dict)]
            checks.append(
                (
                    "points_ledger row written by the RPC",
                    any(r.get("reason") == f"checkpoint:{CODE}" for r in ledger_rows),
                    f"rows={len(ledger_rows)}",
                )
            )
            profile = profiles[0] if profiles else {}
            checks.append(
                (
                    "profile points/level updated",
                    bool(profile) and profile.get("points", 0) > 0,
                    f"points={profile.get('points')} level={profile.get('level')}",
                )
            )

            # --- 6. leaderboard view + badges reachable -------------------
            await goto("/leaderboard", 1.6)
            lb = (await js("document.body.innerText")) or ""
            checks.append(("leaderboard renders ranks", "#" in lb and "pts" in lb.lower(), lb[:60].replace("\n", " ")))
            await goto("/badges", 1.6)
            bd = (await js("document.body.innerText")) or ""
            checks.append(("badge shelf renders from DB", "Badge" in bd or "Collection" in bd, bd[:60].replace("\n", " ")))
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
