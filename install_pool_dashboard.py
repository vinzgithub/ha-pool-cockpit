#!/usr/bin/env python3
# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from __future__ import annotations
import argparse
from pathlib import Path
from ha_pool_dashboard import __version__
from ha_pool_dashboard.installer import Installer, THEMES

def find_config(explicit: str | None) -> Path:
    candidates = ([Path(explicit).expanduser()] if explicit else []) + [
        Path("/config"), Path("/homeassistant"), Path.home() / ".homeassistant", Path.cwd()
    ]
    for candidate in candidates:
        if (candidate / "configuration.yaml").exists() or (candidate / ".storage").exists():
            return candidate.resolve()
    raise SystemExit("Configuration Home Assistant introuvable. Utilisez --config /config")

def choose_theme(preselected: str | None) -> str:
    if preselected:
        return preselected
    themes = [
        ("ocean", "🌊 Ocean — immersif et spectaculaire"),
        ("sky", "☁ Sky — clair et premium"),
        ("night", "🌙 Night — sombre et élégant"),
        ("auto", "✨ Auto — suit le thème système"),
    ]
    print("\nChoisissez le thème :")
    for index, (_, label) in enumerate(themes, 1):
        print(f"  {index}) {label}")
    answer = input("Votre choix [1] : ").strip() or "1"
    try:
        return themes[int(answer) - 1][0]
    except (ValueError, IndexError):
        raise SystemExit("Choix invalide.")

def main() -> int:
    parser = argparse.ArgumentParser(description=f"HA Pool Dashboard {__version__}")
    parser.add_argument("--config")
    parser.add_argument("--theme", choices=THEMES)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--diagnostic", action="store_true")
    parser.add_argument("--yes", action="store_true")
    args = parser.parse_args()

    config_dir = find_config(args.config)
    theme = choose_theme(args.theme)
    installer = Installer(Path(__file__).resolve().parent, config_dir, __version__)
    plan = installer.plan(theme)

    print(f"\nHA Pool Dashboard {__version__}")
    print(f"Configuration : {config_dir}")
    print(f"Thème : {theme}")
    print(f"Appareils utiles détectés : {len(plan['devices'])}")
    if plan.get("discovery_source") == "previous_install":
        print("Source : configuration de l’installation précédente (secours)")
    elif plan.get("discovery_source") == "none":
        print("Attention : aucun appareil détecté ; l’installation sera interrompue.")
    if plan.get("weather"):
        print("Météo détectée :")
        for metric, entity_id in plan["weather"].items():
            print(f"    {metric:18} {entity_id}")
    else:
        print("Météo détectée : aucune entité compatible")

    for device in plan["devices"]:
        print(f" • {device['name']} ({device['brand']})")
        for metric, entity_id in device["entities"].items():
            print(f"    {metric:18} {entity_id}")
        if args.diagnostic:
            for metric, match in device["matches"].items():
                print(f"      diagnostic {metric}: score={match['score']} [{', '.join(match['reasons'])}]")

    if args.dry_run:
        print("\nSimulation terminée : aucun fichier modifié.")
        return 0

    if not args.yes:
        answer = input("\nInstaller ? [O/n] ").strip().lower()
        if answer not in ("", "o", "oui", "y", "yes"):
            return 1

    try:
        result = installer.install(theme)
    except RuntimeError as error:
        raise SystemExit(f"Installation interrompue : {error}")
    print("\nInstallation terminée.")
    print(f"Sauvegarde : {result['backup_dir']}")
    print(f"Ressource attendue : /local/ha-pool-dashboard/pool-dashboard.js?v={__version__}")
    print("RC28.3 installée : activation indépendante de chaque appareil et comportement RC28.2 conservé. Redémarrage Home Assistant requis.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

# Beta17.7 assets are stored under frontend/dist/assets and must be copied with the frontend dist directory.
