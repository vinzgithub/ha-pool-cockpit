#!/usr/bin/env python3
# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import argparse, re, shutil
from pathlib import Path

SCHEDULER_BLOCK = re.compile(
    r"\n?# HA Pool Dashboard RC27 scheduler\nha_pool_dashboard:\s*\n?",
    re.MULTILINE,
)

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="/config")
    parser.add_argument("--keep-dashboard", action="store_true")
    args = parser.parse_args()

    config_dir = Path(args.config)
    frontend = config_dir / "www" / "ha-pool-dashboard"
    dashboard = config_dir / "pool-dashboard.yaml"
    manifest = config_dir / ".ha_pool_dashboard_install.json"
    scheduler = config_dir / "custom_components" / "ha_pool_dashboard"
    configuration = config_dir / "configuration.yaml"

    if frontend.exists():
        shutil.rmtree(frontend)
    if dashboard.exists() and not args.keep_dashboard:
        dashboard.unlink()
    if manifest.exists():
        manifest.unlink()
    if scheduler.exists():
        shutil.rmtree(scheduler)
    if configuration.exists():
        content = configuration.read_text(encoding="utf-8")
        updated = SCHEDULER_BLOCK.sub("\n", content)
        if updated != content:
            configuration.write_text(updated, encoding="utf-8")

    print("Fichiers supprimés. Retirez la ressource Lovelace puis redémarrez Home Assistant.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
