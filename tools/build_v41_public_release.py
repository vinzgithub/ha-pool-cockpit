#!/usr/bin/env python3
"""Build a reproducible *complete* Pool Cockpit V4.1.0 ZIP, no CI artifact storage."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import hashlib

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "release/pool-cockpit-v4.1.0.zip"
FILES = (
    "install_v41.py",
    "README.md",
    "README.fr.md",
    "LICENSE",
    "tests/test_v41_full_install.py",
    "tests/test_v41_default_mode.js",
    "release/v4.1.0/INSTALLATION.md",
    "docs/releases/V4.1.0.md",
)
DIRS = (
    "release/v4-rc8-2",
    "release/v4.1.0/assets",
    "home_assistant/custom_components/ha_pool_dashboard",
)

def build() -> tuple[Path, str]:
    names = set(FILES)
    names.add("release/v4.1.0/pool-cockpit-dual-mode-card.js")
    for directory in DIRS:
        for path in (ROOT / directory).rglob("*"):
            if path.is_file() and "__pycache__" not in path.parts and path.suffix not in {".pyc", ".pyo"}:
                names.add(path.relative_to(ROOT).as_posix())
    content = {name: (ROOT / name).read_bytes() for name in sorted(names)}
    base = content["release/v4-rc8-2/pool-dashboard-v4-rc8-2.js"]
    overlay = content["release/v4.1.0/pool-cockpit-dual-mode-card.js"]
    image = content["release/v4.1.0/assets/demo-pool-camera.jpg"]
    assert len(base) > 1_000_000, "V4.0.0 base bundle missing"
    assert image.startswith(bytes.fromhex("ffd8ff")), "Invalid demonstration JPEG"
    assert b'07:00' in overlay and b'22:00' in overlay, "Missing 14 h demo schedule"
    assert b'pool-dashboard-v4-test-card' in overlay, "Missing shared V4 engine"
    assert b'custom:pool-cockpit-dual-mode-card' in content["install_v41.py"]
    content["SHA256SUMS"] = "".join(
        f"{hashlib.sha256(data).hexdigest()}  {name}\n"
        for name, data in sorted(content.items())
    ).encode("utf-8")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUTPUT, "w", ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in sorted(content.items()):
            info = ZipInfo(name, (2026, 10, 22, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, data)
    return OUTPUT, hashlib.sha256(OUTPUT.read_bytes()).hexdigest()


if __name__ == "__main__":
    path, digest = build()
    print(f"Pool Cockpit V4.1.0 complete archive: {path} SHA256: {digest}")
