#!/usr/bin/env python3
"""Generate the CampusFit PWA icons (mint rounded square + white pulse ring).

Pure-stdlib PNG writer so we don't need Pillow (disk space is tight).
"""
import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
FAVICON = Path(__file__).resolve().parent.parent / "public" / "favicon.svg"

MINT = (30, 204, 139)
INK = (14, 18, 16)
WHITE = (255, 255, 255, 255)


def chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def make_icon(size: int) -> bytes:
    radius = size * 0.22
    # Pulse/heartbeat line across the middle, drawn as a thick polyline.
    points = [
        (0.12, 0.55),
        (0.32, 0.55),
        (0.40, 0.32),
        (0.52, 0.72),
        (0.60, 0.55),
        (0.88, 0.55),
    ]
    pts = [(x * size, y * size) for x, y in points]
    half = size * 0.045

    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filter: None
        for x in range(size):
            # rounded-rect mask
            cx = min(max(x, radius), size - radius)
            cy = min(max(y, radius), size - radius)
            inside = (x - cx) ** 2 + (y - cy) ** 2 <= radius * radius
            if not inside:
                raw += bytes((0, 0, 0, 0))
                continue
            colour = MINT
            # pulse polyline (square distance to each segment)
            for i in range(len(pts) - 1):
                x1, y1 = pts[i]
                x2, y2 = pts[i + 1]
                dx, dy = x2 - x1, y2 - y1
                if dx == dy == 0:
                    continue
                t = max(0.0, min(1.0, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
                px, py = x1 + t * dx, y1 + t * dy
                if (x - px) ** 2 + (y - py) ** 2 <= half * half:
                    colour = WHITE[:3]
                    break
            raw += bytes(colour) + b"\xff"

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for size in (192, 512):
        path = OUT / f"icon-{size}.png"
        path.write_bytes(make_icon(size))
        print(f"wrote {path} ({path.stat().st_size} bytes)")

    FAVICON.write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#1ECC8B"/>
  <polyline points="8,36 20,36 25,22 33,46 38,36 56,36" fill="none"
            stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
""",
        encoding="utf-8",
    )
    print(f"wrote {FAVICON}")


if __name__ == "__main__":
    main()
