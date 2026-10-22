#!/usr/bin/env python3
"""Deterministic release ZIP containing only the V4.1.0 optional overlay."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo
import hashlib

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "release/pool-cockpit-v4.1.0.zip"
SOURCES = (
    "release/v4.1.0/pool-cockpit-dual-mode-card.js",
    "release/v4.1.0/assets/demo-pool-camera.jpg",
    "release/v4.1.0/INSTALLATION.md",
    "docs/releases/V4.1.0.md",
    "LICENSE",
)

def assemble():
    content = {path: (ROOT / path).read_bytes() for path in SOURCES}
    if not content[SOURCES[1]].startswith(bytes.fromhex("ffd8ff")):
        raise ValueError("Demo camera must be a JPEG.")
    source = content[SOURCES[0]].decode("utf-8")
    for marker in ('start:"07:00",end:"14:00"', 'start:"15:00",end:"22:00"', "pool-dashboard-v4-test-card"):
        if marker not in source:
            raise ValueError("V4.1.0 source is missing a validated feature: " + marker)
    content["SHA256SUMS"] = "".join(
        f"{hashlib.sha256(data).hexdigest()}  {path}\n"
        for path, data in sorted(content.items())
    ).encode("utf-8")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUT, "w", ZIP_DEFLATED, compresslevel=9) as archive:
        for path, data in sorted(content.items()):
            info = ZipInfo(path, (2026, 10, 22, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, data)
    return hashlib.sha256(OUT.read_bytes()).hexdigest()

if __name__ == "__main__":
    print("V4.1.0 ZIP:", OUT, "SHA256:", assemble())
