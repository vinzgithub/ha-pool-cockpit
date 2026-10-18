#!/usr/bin/env python3
"""Pool Cockpit V4 clean-install preview (Home Assistant Core/Docker).

This installer intentionally refuses to overwrite an existing Pool Cockpit
installation. It uses the verified RC8.2 bundle and the matching backend
shipped in the source repository. Run --dry-run first.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
VERSION = "4.0.0"
BUNDLE = ROOT / "release" / "v4-rc8-2" / "pool-dashboard-v4-rc8-2.js"
ASSETS = ROOT / "release" / "v4-rc8-2" / "assets"
BACKEND = ROOT / "home_assistant" / "custom_components" / "ha_pool_dashboard"
RESOURCE = f"/local/ha-pool-dashboard/pool-dashboard-v4-rc8-2.js?v={VERSION}"
DASHBOARD = """title: Pool Cockpit V4
views:
  - title: Piscine
    path: overview
    icon: mdi:pool
    type: panel
    cards:
      - type: custom:pool-dashboard-v4-test-card
        visual_theme: ocean
        title: Ma Piscine
        devices: []
"""


def preflight(config: Path) -> None:
    if not config.is_dir() or not (config / "configuration.yaml").is_file():
        raise RuntimeError(f"Répertoire Home Assistant invalide : {config}")
    for file in (BUNDLE, BACKEND / "manifest.json"):
        if not file.is_file():
            raise RuntimeError(f"Fichier de distribution manquant : {file}")
    if not ASSETS.is_dir():
        raise RuntimeError(f"Ressources graphiques manquantes : {ASSETS}")
    for path in (
        config / "pool-dashboard.yaml",
        config / "custom_components" / "ha_pool_dashboard",
        config / "www" / "ha-pool-dashboard",
        config / ".ha_pool_dashboard_install.json",
    ):
        if path.exists():
            raise RuntimeError(
                f"Installation Pool Cockpit existante détectée : {path}. "
                "Migration non prise en charge par cet installateur neuf ; aucun fichier modifié."
            )
    conf = (config / "configuration.yaml").read_text(encoding="utf-8")
    if any(line.lstrip().startswith("lovelace:") for line in conf.splitlines()):
        raise RuntimeError("Bloc lovelace existant : configuration manuelle requise.")
    if any(line.lstrip().startswith("ha_pool_dashboard:") for line in conf.splitlines()):
        raise RuntimeError("Composant Pool Cockpit déjà configuré.")
    # Home Assistant .storage may already contain custom resources/dashboards.
    for storage_name in ("lovelace_resources", "lovelace_dashboards"):
        storage_path = config / ".storage" / storage_name
        if storage_path.exists():
            data = storage_path.read_text(encoding="utf-8")
            if "pool-dashboard" in data or "pool-cockpit" in data:
                raise RuntimeError(f"Ancienne ressource Pool Cockpit détectée dans {storage_path}")


def install(config: Path) -> Path:
    preflight(config)
    original_config = (config / "configuration.yaml").read_text(encoding="utf-8")
    backup = config / ".pool_cockpit_backups" / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(config / "configuration.yaml", backup / "configuration.yaml")
    target_www = config / "www" / "ha-pool-dashboard"
    target_backend = config / "custom_components" / "ha_pool_dashboard"
    dashboard_path = config / "pool-dashboard.yaml"
    try:
        target_www.mkdir(parents=True, exist_ok=False)
        shutil.copy2(BUNDLE, target_www / BUNDLE.name)
        shutil.copytree(ASSETS, target_www / "assets")
        shutil.copytree(BACKEND, target_backend)
        dashboard_path.write_text(DASHBOARD, encoding="utf-8")
        suffix = "" if original_config.endswith("\n") else "\n"
        additions = (
            "\n# Pool Cockpit V4 clean-install\n"
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
        (config / "configuration.yaml").write_text(original_config + suffix + additions, encoding="utf-8")
    except Exception:
        (config / "configuration.yaml").write_text(original_config, encoding="utf-8")
        dashboard_path.unlink(missing_ok=True)
        if target_backend.exists():
            shutil.rmtree(target_backend)
        if target_www.exists():
            shutil.rmtree(target_www)
        raise
    return backup


def main() -> int:
    parser = argparse.ArgumentParser(description="Pool Cockpit V4 : installation neuve uniquement")
    parser.add_argument("--config", type=Path, required=True, help="Répertoire de configuration HA sur l'hôte")
    parser.add_argument("--dry-run", action="store_true", help="Vérifier sans rien écrire")
    args = parser.parse_args()
    config = args.config.expanduser().resolve()
    try:
        preflight(config)
        if args.dry_run:
            print(f"PRÊT : configuration {config}, bundle {BUNDLE.name}, backend présent. Aucun fichier modifié.")
            return 0
        backup = install(config)
    except (OSError, RuntimeError) as error:
        print(f"ÉCHEC : {error}", file=sys.stderr)
        return 1
    print(f"Installé : Pool Cockpit {VERSION}")
    print(f"Sauvegarde configuration.yaml : {backup}")
    print("Vérifier la configuration avec Home Assistant avant le redémarrage.")
    print("Aucun appareil n'est nécessaire pour ouvrir la page ; associer les appareils ensuite.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
