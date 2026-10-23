#!/usr/bin/env python3
"""Pool Cockpit 4.1.0 — complete clean install or guarded upgrade from V4."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
VERSION = "4.1.0"
BASE = ROOT / "release/v4-rc8-2"
V41 = ROOT / "release/v4.1.0"
BUNDLE = BASE / "pool-dashboard-v4-rc8-2.js"
ASSETS = BASE / "assets"
HERO = BASE / "hero-ocean.svg"
OVERLAY = V41 / "pool-cockpit-dual-mode-card.js"
CAMERA = V41 / "assets/demo-pool-camera.jpg"
BACKEND = ROOT / "home_assistant/custom_components/ha_pool_dashboard"
BASE_RESOURCE = "/local/ha-pool-dashboard/pool-dashboard-v4-rc8-2.js"
V41_RESOURCE = "/local/ha-pool-dashboard/pool-cockpit-dual-mode-card.js"
OLD_TYPE = "custom:pool-dashboard-v4-test-card"
NEW_TYPE = "custom:pool-cockpit-dual-mode-card"
DASHBOARD = """title: Pool Cockpit V4.1.0
views:
  - title: Piscine
    path: overview
    icon: mdi:pool
    type: panel
    cards:
      - type: custom:pool-cockpit-dual-mode-card
        visual_theme: ocean
        language: fr
        title: Ma Piscine
        devices: []
"""


def file_match(a: Path, b: Path) -> bool:
    return a.is_file() and b.is_file() and hashlib.sha256(a.read_bytes()).digest() == hashlib.sha256(b.read_bytes()).digest()


def paths(config: Path) -> dict[str, Path]:
    web = config / "www/ha-pool-dashboard"
    return {
        "config": config / "configuration.yaml",
        "dashboard": config / "pool-dashboard.yaml",
        "web": web,
        "base": web / BUNDLE.name,
        "overlay": web / OVERLAY.name,
        "camera": web / "assets" / CAMERA.name,
        "backend": config / "custom_components/ha_pool_dashboard",
    }


def sources_ready() -> None:
    for file in (BUNDLE, HERO, OVERLAY, CAMERA, BACKEND / "manifest.json", BACKEND / "services.yaml"):
        if not file.is_file():
            raise RuntimeError(f"Required release file missing: {file.relative_to(ROOT)}")
    if not ASSETS.is_dir() or not any(ASSETS.iterdir()):
        raise RuntimeError("V4 frontend assets are missing")


def upgrade_yaml(config_text: str, dashboard_text: str) -> tuple[str, str]:
    if dashboard_text.count(OLD_TYPE) != 1 or NEW_TYPE in dashboard_text:
        raise RuntimeError("Expected one unchanged V4 dashboard card; please upgrade manually")
    if "resource_mode: yaml" not in config_text:
        raise RuntimeError("Existing Lovelace resources are not YAML-managed; use manual upgrade")
    lines = config_text.splitlines(keepends=True)
    hits = [
        i for i, line in enumerate(lines)
        if line.lstrip().startswith("- url: " + BASE_RESOURCE + "?v=")
    ]
    if len(hits) != 1:
        raise RuntimeError("Expected exactly one existing V4 resource; cannot auto-upgrade")
    i = hits[0]
    if i + 1 >= len(lines) or lines[i + 1].strip() != "type: module":
        raise RuntimeError("Existing resource format is unsupported")
    if V41_RESOURCE in config_text:
        raise RuntimeError("V4.1 resource already registered")
    indent = lines[i][:len(lines[i]) - len(lines[i].lstrip())]
    lines.insert(i + 2, f"{indent}- url: {V41_RESOURCE}?v=4.1.0\n{indent}  type: module\n")
    return "".join(lines), dashboard_text.replace(OLD_TYPE, NEW_TYPE, 1)


def preflight(config: Path, upgrade: bool) -> tuple[str, str]:
    sources_ready()
    p = paths(config)
    if not config.is_dir() or not p["config"].is_file():
        raise RuntimeError(f"Invalid Home Assistant configuration directory: {config}")
    for key in ("config", "dashboard", "web", "base", "overlay", "camera", "backend"):
        if p[key].is_symlink():
            raise RuntimeError(f"Symlink at managed path is not supported: {p[key]}")
    current = p["config"].read_text(encoding="utf-8")
    if upgrade:
        if not p["dashboard"].is_file() or not p["backend"].is_dir():
            raise RuntimeError("Compatible Pool Cockpit V4 installation was not found")
        if not file_match(p["base"], BUNDLE):
            raise RuntimeError("V4 bundle differs from official RC8.2; refusing to overwrite custom files")
        if p["overlay"].exists() or p["camera"].exists():
            raise RuntimeError("Existing V4.1/demo files detected; no automatic overwrite")
        return upgrade_yaml(current, p["dashboard"].read_text(encoding="utf-8"))
    # Fresh install only: do not touch existing custom dashboards or components.
    for key in ("dashboard", "web", "backend"):
        if p[key].exists():
            raise RuntimeError(f"Existing Pool Cockpit files: {p[key]}; use --upgrade only for compatible V4")
    if (config / ".ha_pool_dashboard_install.json").exists():
        raise RuntimeError("Existing Pool Cockpit installation detected")
    if any(line.lstrip().startswith(("lovelace:", "ha_pool_dashboard:")) for line in current.splitlines()):
        raise RuntimeError("Existing Lovelace/Pool Cockpit YAML: use manual integration instructions")
    for store in ("lovelace_resources", "lovelace_dashboards"):
        file = config / ".storage" / store
        if file.exists():
            body = file.read_text(encoding="utf-8")
            if "pool-dashboard" in body or "pool-cockpit" in body:
                raise RuntimeError(f"Existing Pool Cockpit storage entry: {file}")
    suffix = "" if current.endswith("\n") else "\n"
    settings = (
        "\n# Pool Cockpit V4.1.0\n"
        "ha_pool_dashboard:\n"
        "lovelace:\n"
        "  mode: storage\n"
        "  resource_mode: yaml\n"
        "  resources:\n"
        f"    - url: {BASE_RESOURCE}?v=4.0.0\n"
        "      type: module\n"
        f"    - url: {V41_RESOURCE}?v=4.1.0\n"
        "      type: module\n"
        "  dashboards:\n"
        "    pool-cockpit:\n"
        "      mode: yaml\n"
        "      title: Piscine\n"
        "      icon: mdi:pool\n"
        "      show_in_sidebar: true\n"
        "      filename: pool-dashboard.yaml\n"
    )
    return current + suffix + settings, DASHBOARD


def install(config: Path, upgrade: bool) -> Path:
    config_new, dashboard_new = preflight(config, upgrade)
    p = paths(config)
    date = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    backup = config / ".pool_cockpit_backups" / ("v4.1.0-" + date)
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(p["config"], backup / "configuration.yaml")
    if upgrade:
        shutil.copy2(p["dashboard"], backup / "pool-dashboard.yaml")
    try:
        if not upgrade:
            p["web"].mkdir(parents=True, exist_ok=False)
            shutil.copy2(BUNDLE, p["base"])
            shutil.copytree(ASSETS, p["web"] / "assets")
            shutil.copy2(HERO, p["web"] / HERO.name)
            shutil.copytree(BACKEND, p["backend"])
        shutil.copy2(OVERLAY, p["overlay"])
        (p["web"] / "assets").mkdir(parents=True, exist_ok=True)
        shutil.copy2(CAMERA, p["camera"])
        p["dashboard"].write_text(dashboard_new, encoding="utf-8")
        p["config"].write_text(config_new, encoding="utf-8")
    except Exception:
        shutil.copy2(backup / "configuration.yaml", p["config"])
        if upgrade:
            shutil.copy2(backup / "pool-dashboard.yaml", p["dashboard"])
            p["overlay"].unlink(missing_ok=True)
            p["camera"].unlink(missing_ok=True)
        else:
            p["dashboard"].unlink(missing_ok=True)
            if p["backend"].is_dir():
                shutil.rmtree(p["backend"])
            if p["web"].is_dir():
                shutil.rmtree(p["web"])
        raise
    return backup


def main() -> int:
    parser = argparse.ArgumentParser(description="Pool Cockpit V4.1.0 complete install or V4 upgrade")
    parser.add_argument("--config", type=Path, required=True, help="Path to Home Assistant /config")
    parser.add_argument("--upgrade", action="store_true", help="Guarded upgrade from official V4.0.0")
    parser.add_argument("--dry-run", action="store_true", help="Preflight only; never writes")
    parser.add_argument("--yes", action="store_true", help="Allow writing to the selected Home Assistant directory")
    args = parser.parse_args()
    directory = args.config.expanduser().resolve()
    try:
        preflight(directory, args.upgrade)
        if args.dry_run or not args.yes:
            print(f"READY: V4.1.0 {'upgrade' if args.upgrade else 'fresh install'}; no changes made.")
            if not args.dry_run:
                print("Pass --yes to authorize installation.")
            return 0
        backup = install(directory, args.upgrade)
    except (OSError, RuntimeError, ValueError) as exc:
        print(f"STOP: {exc}", file=sys.stderr)
        return 1
    print(f"INSTALLED: Pool Cockpit {VERSION}")
    print(f"Backup: {backup}")
    print("Validate Home Assistant configuration and restart Home Assistant manually.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
