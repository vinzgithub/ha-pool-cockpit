#!/usr/bin/env python3
"""Pool Cockpit 4.2.0 — cautious, complete single-resource fresh installation.

For already-configured V4.1.0 dashboards use the documented manual upgrade.
Does not access Home Assistant at runtime, operate equipment, or restart services.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
VERSION = "4.2.0"
FRONTEND = ROOT / "release/v4.2.0/pool-cockpit.js"
ASSETS = ROOT / "release/v4-rc8-2/assets"
HERO = ROOT / "release/v4-rc8-2/hero-ocean.svg"
CAMERA = ROOT / "release/v4.1.0/assets/demo-pool-camera.jpg"
BACKEND = ROOT / "home_assistant/custom_components/ha_pool_dashboard"
RESOURCE = "/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.0"
CARD = "custom:pool-cockpit-card"

DASHBOARD = """title: Piscine
views:
  - title: Piscine
    path: overview
    icon: mdi:pool
    type: panel
    cards:
      - type: custom:pool-cockpit-card
        visual_theme: ocean
        language: fr
        title: Ma Piscine
        devices: []
"""


def destinations(config: Path) -> dict[str, Path]:
    web = config / "www/ha-pool-dashboard"
    return {
        "config": config / "configuration.yaml",
        "dashboard": config / "pool-dashboard.yaml",
        "web": web,
        "frontend": web / FRONTEND.name,
        "assets": web / "assets",
        "camera": web / "assets" / CAMERA.name,
        "backend": config / "custom_components/ha_pool_dashboard",
    }


def preflight(config: Path) -> str:
    for src in (FRONTEND, HERO, CAMERA, BACKEND / "manifest.json", BACKEND / "services.yaml"):
        if not src.is_file():
            raise RuntimeError(f"Missing release file: {src.relative_to(ROOT)}")
    if not ASSETS.is_dir() or not any(ASSETS.iterdir()):
        raise RuntimeError("Missing frontend graphics")
    if not config.is_dir() or not (config / "configuration.yaml").is_file():
        raise RuntimeError("Select the actual Home Assistant config directory")
    p = destinations(config)
    for key in ("config", "dashboard", "web", "frontend", "assets", "camera", "backend"):
        if p[key].is_symlink():
            raise RuntimeError(f"Symlinks not supported: {p[key]}")
    for key in ("dashboard", "web", "backend"):
        if p[key].exists():
            raise RuntimeError(f"Existing Pool Cockpit files: {p[key]}; do not overwrite")
    if (config / ".ha_pool_dashboard_install.json").exists():
        raise RuntimeError("Previous Pool Cockpit installation detected")
    current = p["config"].read_text(encoding="utf-8")
    if any(line.lstrip().startswith(("lovelace:", "ha_pool_dashboard:")) for line in current.splitlines()):
        raise RuntimeError("Existing Lovelace/integration configuration; manual setup required")
    for store in ("lovelace_resources", "lovelace_dashboards"):
        f = config / ".storage" / store
        if f.is_file() and any(term in f.read_text(errors="replace") for term in ("pool-dashboard", "pool-cockpit")):
            raise RuntimeError(f"Existing Lovelace Pool Cockpit entry: {f}")
    return current + ("" if current.endswith("\n") else "\n") + (
        "\n# Pool Cockpit V4.2.0\n"
        "ha_pool_dashboard:\n"
        "lovelace:\n"
        "  mode: storage\n"
        "  resource_mode: yaml\n"
        "  resources:\n"
        f"    - url: {RESOURCE}\n"
        "      type: module\n"
        "  dashboards:\n"
        "    pool-cockpit:\n"
        "      mode: yaml\n"
        "      title: Piscine\n"
        "      icon: mdi:pool\n"
        "      show_in_sidebar: true\n"
        "      filename: pool-dashboard.yaml\n"
    )


def install(config: Path) -> Path:
    new_settings = preflight(config)
    p = destinations(config)
    date = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    backup = config / ".pool_cockpit_backups" / ("v4.2.0-" + date)
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(p["config"], backup / "configuration.yaml")
    try:
        p["web"].mkdir(parents=True, exist_ok=False)
        shutil.copy2(FRONTEND, p["frontend"])
        shutil.copytree(ASSETS, p["assets"])
        shutil.copy2(HERO, p["web"] / HERO.name)
        shutil.copy2(CAMERA, p["camera"])
        shutil.copytree(BACKEND, p["backend"])
        p["dashboard"].write_text(DASHBOARD, encoding="utf-8")
        p["config"].write_text(new_settings, encoding="utf-8")
    except Exception:
        shutil.copy2(backup / "configuration.yaml", p["config"])
        p["dashboard"].unlink(missing_ok=True)
        if p["web"].is_dir():
            shutil.rmtree(p["web"])
        if p["backend"].is_dir():
            shutil.rmtree(p["backend"])
        raise
    return backup


def main() -> int:
    print("NOTICE: install_v42.py installs historical V4.2.0; for new installations use install_v421.py.", file=sys.stderr)
    parser = argparse.ArgumentParser(description="Pool Cockpit V4.2.0 complete fresh install")
    parser.add_argument("--config", type=Path, required=True, help="Home Assistant configuration directory")
    parser.add_argument("--dry-run", action="store_true", help="Check without changing anything")
    parser.add_argument("--yes", action="store_true", help="Authorize installation")
    args = parser.parse_args()
    config = args.config.expanduser().resolve()
    try:
        if args.dry_run or not args.yes:
            preflight(config)
            print("READY: Pool Cockpit V4.2.0 single-resource fresh install; no changes made.")
            if not args.dry_run:
                print("Add --yes to install.")
            return 0
        backup = install(config)
    except (OSError, RuntimeError, ValueError) as e:
        print(f"STOP: {e}", file=sys.stderr)
        return 1
    print("INSTALLED: Pool Cockpit V4.2.0 — one JavaScript resource")
    print(f"Backup: {backup}")
    print("Check Home Assistant configuration, then restart it manually.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
