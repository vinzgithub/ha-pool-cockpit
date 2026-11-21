#!/usr/bin/env python3
"""Guarded Pool Cockpit v4.3.0 installer: fresh or official 4.2.1 upgrade.

This installer never starts/stops HA and never sends physical commands.
Stop Home Assistant before --yes or --rollback --yes.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile

ROOT = Path(__file__).resolve().parent
VERSION = "4.3.0"
NEW = ROOT / "release/v4.3.0/pool-cockpit.js"
OLD = ROOT / "release/v4.2.1/pool-cockpit.js"
BACKEND = ROOT / "home_assistant/custom_components/ha_pool_dashboard"
ASSETS = ROOT / "release/v4-rc8-2/assets"
HERO = ROOT / "release/v4-rc8-2/hero-ocean.svg"
CAMERA = ROOT / "release/v4.1.0/assets/demo-pool-camera.jpg"
RESOURCE = "/local/ha-pool-dashboard/pool-cockpit.js?v=4.3.0"
RESOURCE_RE = re.compile(
    r"(?m)^(?P<indent>[ \t]*)- url: /local/ha-pool-dashboard/pool-cockpit\.js"
    r"\?v=(?P<version>4\.2\.1(?:-[A-Za-z0-9_.-]+)?|4\.3\.0(?:-[A-Za-z0-9_.-]+)?)[ \t]*$"
)
DASHBOARD = """title: Piscine
views:
  - title: Piscine
    path: overview
    icon: mdi:pool
    type: panel
    cards:
      - type: custom:pool-dashboard-card
        visual_theme: ocean
        language: fr
        title: Ma Piscine
        devices: []
"""


def hash_file(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def paths(config):
    web = config / "www/ha-pool-dashboard"
    return {"yaml": config / "configuration.yaml", "dashboard": config / "pool-dashboard.yaml",
            "web": web, "js": web / "pool-cockpit.js",
            "backend": config / "custom_components/ha_pool_dashboard",
            "store": config / ".storage/ha_pool_dashboard.rc27",
            "premigration": config / ".storage/ha_pool_dashboard.rc27.pre_v430",
            "resources_store": config / ".storage/lovelace_resources"}


def check_symlinks(config):
    p = paths(config)
    for path in (config, config / "www", config / "custom_components", config / ".storage",
                 *p.values()):
        if path.is_symlink():
            raise RuntimeError("Lien symbolique sur un chemin géré.")
    if p["backend"].is_dir() and any(x.is_symlink() for x in p["backend"].rglob("*")):
        raise RuntimeError("Lien symbolique dans l'intégration existante.")


def verify_sources():
    for file in (NEW, OLD, BACKEND / "manifest.json", BACKEND / "services.yaml",
                 BACKEND / "wintering.py", BACKEND / "wintering_runtime.py", HERO, CAMERA):
        if not file.is_file():
            raise RuntimeError(f"Fichier source absent : {file}")
    if not ASSETS.is_dir():
        raise RuntimeError("Images de distribution manquantes.")
    sums = dict((line.partition("  ")[2].removeprefix("./"), line.partition("  ")[0])
                for line in (ROOT / "SHA256SUMS").read_text().splitlines() if "  " in line)
    for file in (NEW, OLD):
        if hash_file(file) != sums.get(file.relative_to(ROOT).as_posix()):
            raise RuntimeError(f"Empreinte SHA256 invalide : {file}")


def storage_resource(config):
    """Find one managed Lovelace JS resource; reject ambiguous/custom entries."""
    file = config / ".storage/lovelace_resources"
    if not file.is_file():
        return None
    try:
        payload = json.loads(file.read_text(encoding="utf-8"))
        entries = payload["data"]["items"]
    except (ValueError, KeyError, TypeError) as exc:
        raise RuntimeError("Ressources Lovelace stockées illisibles : aucune modification.") from exc
    if not isinstance(entries, list):
        raise RuntimeError("Format des ressources Lovelace inconnu.")
    found = [x for x in entries if isinstance(x, dict) and isinstance(x.get("url"), str)
             and x["url"].startswith("/local/ha-pool-dashboard/pool-cockpit.js")]
    if not found:
        return None
    if len(found) != 1:
        raise RuntimeError("Plusieurs ressources Pool Cockpit stockées : aucune modification.")
    item = found[0]
    url = item["url"]
    if item.get("type") != "module" or not re.fullmatch(
        r"/local/ha-pool-dashboard/pool-cockpit\.js\?v="
        r"(?:4\.2\.1|4\.3\.0)(?:-[A-Za-z0-9_.-]+)?", url
    ):
        raise RuntimeError("Ressource Pool Cockpit inconnue ou personnalisée.")
    return url


def update_storage_resource(config):
    """Update only the single verified URL; preserve every other storage byte."""
    existing = storage_resource(config)
    if existing is None or not existing.startswith(
        "/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.1"
    ):
        raise RuntimeError("Ressource Lovelace modifiée depuis la vérification.")
    file = config / ".storage/lovelace_resources"
    current = file.read_text(encoding="utf-8")
    if current.count(existing) != 1:
        raise RuntimeError("Occurrences ambiguës dans le stockage Lovelace.")
    write_yaml(file, current.replace(existing, RESOURCE, 1))


def preflight(config):
    verify_sources()
    p = paths(config)
    if not config.is_dir() or not p["yaml"].is_file():
        raise RuntimeError("Dossier Home Assistant invalide.")
    check_symlinks(config)
    current = p["yaml"].read_text(encoding="utf-8")
    exists = any(p[k].exists() for k in ("web", "backend", "dashboard"))
    if exists:
        if not all((p["js"].is_file(), p["backend"].is_dir(), p["dashboard"].is_file(),
                    (p["backend"] / "manifest.json").is_file())):
            raise RuntimeError("Installation existante incomplète : aucune modification.")
        dashboard = p["dashboard"].read_text(encoding="utf-8")
        if not any(card in dashboard for card in (
            "custom:pool-dashboard-card", "custom:pool-cockpit-card"
        )):
            raise RuntimeError("Tableau de bord Pool Cockpit inconnu.")
        matches = list(RESOURCE_RE.finditer(current))
        stored = storage_resource(config)
        if matches and stored is not None:
            raise RuntimeError("Ressource Pool Cockpit déclarée deux fois (YAML et stockage).")
        if len(matches) > 1 or current.count("/local/ha-pool-dashboard/pool-cockpit.js") > 1:
            raise RuntimeError("Ressource Lovelace non unique.")
        if matches:
            if "resource_mode: yaml" not in current:
                raise RuntimeError("Ressource YAML sans resource_mode: yaml : vérification manuelle.")
            resource_version = matches[0].group("version")
            source = "yaml"
        elif stored is not None:
            resource_version = stored.rsplit("?v=", 1)[-1]
            source = "storage"
        else:
            raise RuntimeError("Ressource Pool Cockpit V4.2.1 introuvable.")
        if resource_version.startswith("4.3.0"):
            if hash_file(p["js"]) == hash_file(NEW) and (
                (p["backend"] / "wintering.py").is_file()
                and (p["backend"] / "wintering_runtime.py").is_file()
            ):
                return "already", current
            raise RuntimeError("Version 4.3.0 personnalisée ou incomplète.")
        if not re.search(r"(?m)^ha_pool_dashboard:\s*$", current):
            raise RuntimeError("Intégration ha_pool_dashboard non reconnue.")
        if hash_file(p["js"]) != hash_file(OLD):
            raise RuntimeError("Bundle V4.2.1 différent de la version officielle.")
        if source == "storage":
            return "upgrade_storage", current
        match = matches[0]
        replacement = match.group("indent") + "- url: " + RESOURCE
        return "upgrade", current[:match.start()] + replacement + current[match.end():]
    if re.search(r"(?m)^\s*(lovelace|ha_pool_dashboard):", current):
        raise RuntimeError("Configuration existante non vierge : installation refusée.")
    if (config / ".ha_pool_dashboard_install.json").exists():
        raise RuntimeError("Ancienne installation détectée.")
    for key in ("lovelace_resources", "lovelace_dashboards"):
        f = config / ".storage" / key
        if f.is_file() and any(s in f.read_text(errors="replace") for s in ("pool-dashboard", "pool-cockpit")):
            raise RuntimeError("Ressource Pool Cockpit déjà enregistrée.")
    appendix = """
# Pool Cockpit V4.3.0
ha_pool_dashboard:
lovelace:
  mode: storage
  resource_mode: yaml
  resources:
    - url: /local/ha-pool-dashboard/pool-cockpit.js?v=4.3.0
      type: module
  dashboards:
    pool-cockpit:
      mode: yaml
      title: Piscine
      icon: mdi:pool
      show_in_sidebar: true
      filename: pool-dashboard.yaml
"""
    return "fresh", current + ("" if current.endswith("\n") else "\n") + appendix


def write_yaml(path, text):
    # Use a same-directory temporary file, replacing the YAML atomically.
    fd, tmp_name = tempfile.mkstemp(prefix=".pool-v430-", dir=path.parent)
    os.close(fd)
    tmp = Path(tmp_name)
    try:
        if path.exists():
            shutil.copymode(path, tmp)
        tmp.write_text(text, encoding="utf-8")
        os.replace(tmp, path)
    finally:
        tmp.unlink(missing_ok=True)


def backup_files(config, kind):
    p = paths(config)
    tag = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    backup = config / ".pool_cockpit_backups" / ("v4.3.0-" + tag)
    backup.mkdir(parents=True, exist_ok=False)
    shutil.copy2(p["yaml"], backup / "configuration.yaml")
    if kind in ("upgrade", "upgrade_storage"):
        shutil.copy2(p["js"], backup / "pool-cockpit.js")
        shutil.copy2(p["dashboard"], backup / "pool-dashboard.yaml")
        shutil.copytree(p["backend"], backup / "ha_pool_dashboard")
        for key in ("store", "premigration"):
            if p[key].is_file():
                shutil.copy2(p[key], backup / p[key].name)
        if kind == "upgrade_storage":
            shutil.copy2(p["resources_store"], backup / "lovelace_resources")
    (backup / "metadata.json").write_text(json.dumps({
        "kind": kind, "version": VERSION,
        "store": p["store"].exists(),
        "premigration": p["premigration"].exists(),
        "lovelace_resources": kind == "upgrade_storage",
    }), encoding="utf-8")
    return backup


def restore(config, backup, *, require_upgrade=False):
    base = (config / ".pool_cockpit_backups").resolve()
    if backup.is_symlink() or backup.resolve().parent != base:
        raise RuntimeError("Sauvegarde externe ou lien symbolique refusé.")
    backup = backup.resolve()
    meta = json.loads((backup / "metadata.json").read_text(encoding="utf-8"))
    kind = meta.get("kind")
    if meta.get("version") != VERSION or kind not in ("fresh", "upgrade", "upgrade_storage"):
        raise RuntimeError("Sauvegarde incompatible.")
    if require_upgrade and kind not in ("upgrade", "upgrade_storage"):
        raise RuntimeError("Restauration automatique réservée aux migrations.")
    p = paths(config)
    if not (backup / "configuration.yaml").is_file():
        raise RuntimeError("Configuration sauvegardée absente.")
    if kind in ("upgrade", "upgrade_storage"):
        for name in ("pool-cockpit.js", "pool-dashboard.yaml", "ha_pool_dashboard/manifest.json"):
            if not (backup / name).is_file():
                raise RuntimeError("Sauvegarde incomplète : " + name)
        for key in ("store", "premigration"):
            if meta.get(key) and not (backup / p[key].name).is_file():
                raise RuntimeError("Sauvegarde du stockage incomplète : " + key)
        if kind == "upgrade_storage" and not (backup / "lovelace_resources").is_file():
            raise RuntimeError("Sauvegarde de la ressource Lovelace absente.")
    # Home Assistant must be stopped to avoid live-storage races.
    if p["backend"].exists():
        shutil.rmtree(p["backend"])
    if kind in ("upgrade", "upgrade_storage"):
        shutil.copytree(backup / "ha_pool_dashboard", p["backend"])
        shutil.copy2(backup / "pool-cockpit.js", p["js"])
        shutil.copy2(backup / "pool-dashboard.yaml", p["dashboard"])
        p["store"].parent.mkdir(parents=True, exist_ok=True)
        for key in ("store", "premigration"):
            if meta[key]:
                shutil.copy2(backup / p[key].name, p[key])
            else:
                p[key].unlink(missing_ok=True)
        if kind == "upgrade_storage":
            write_yaml(p["resources_store"], (backup / "lovelace_resources").read_text(encoding="utf-8"))
    else:
        if p["web"].exists():
            shutil.rmtree(p["web"])
        p["dashboard"].unlink(missing_ok=True)
    write_yaml(p["yaml"], (backup / "configuration.yaml").read_text(encoding="utf-8"))


def install(config, kind, yaml):
    p = paths(config)
    backup = backup_files(config, kind)
    stage = config / "custom_components/.ha_pool_dashboard_v430_stage"
    old_backend = config / "custom_components/.ha_pool_dashboard_v430_previous"
    try:
        if stage.exists() or old_backend.exists():
            raise RuntimeError("Installation interrompue détectée.")
        p["backend"].parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(BACKEND, stage)
        if kind in ("upgrade", "upgrade_storage"):
            p["backend"].rename(old_backend)
        stage.rename(p["backend"])
        p["web"].mkdir(parents=True, exist_ok=True)
        staged_js = p["web"] / ".pool-cockpit-v430-staged.js"
        shutil.copy2(NEW, staged_js)
        os.replace(staged_js, p["js"])
        if kind == "fresh":
            shutil.copytree(ASSETS, p["web"] / "assets")
            shutil.copy2(HERO, p["web"] / HERO.name)
            shutil.copy2(CAMERA, p["web"] / "assets" / CAMERA.name)
            p["dashboard"].write_text(DASHBOARD, encoding="utf-8")
        if kind == "upgrade_storage":
            update_storage_resource(config)
        else:
            write_yaml(p["yaml"], yaml)
        if hash_file(p["js"]) != hash_file(NEW):
            raise RuntimeError("Erreur de vérification du bundle copié.")
    except Exception:
        restore(config, backup)
        raise
    finally:
        if stage.exists():
            shutil.rmtree(stage)
        if old_backend.exists():
            shutil.rmtree(old_backend)
    return backup


def main():
    parser = argparse.ArgumentParser(description="Pool Cockpit V4.3.0 : installer sécurisé")
    parser.add_argument("--config", required=True, type=Path, help="Dossier configuration.yaml")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--dry-run", action="store_true")
    group.add_argument("--yes", action="store_true")
    parser.add_argument("--rollback", type=Path, help="Dossier BACKUP affiché à l'installation")
    args = parser.parse_args()
    config = args.config.expanduser().resolve()
    try:
        if args.rollback:
            if not args.yes:
                print("Ajouter --yes pour confirmer le retour arrière, Home Assistant arrêté.")
                return 0
            if not paths(config)["yaml"].is_file():
                raise RuntimeError("Dossier HA invalide.")
            check_symlinks(config)
            restore(config, args.rollback, require_upgrade=True)
            print("RESTORED: configuration, backend, JavaScript et stockage restaurés.")
            print("Redémarrer Home Assistant manuellement.")
            return 0
        kind, yaml = preflight(config)
        if kind == "already":
            print("ALREADY: Pool Cockpit V4.3.0 déjà installé, aucun fichier modifié.")
            return 0
        if not args.yes:
            print(f"READY: {kind} -> V4.3.0 ; aucune modification.")
            print("Arrêter Home Assistant avant --yes. Redémarrage manuel ensuite.")
            return 0
        saved = install(config, kind, yaml)
    except (OSError, ValueError, KeyError, RuntimeError, json.JSONDecodeError) as exc:
        print("STOP:", exc, file=sys.stderr)
        return 1
    print(f"INSTALLED: V4.3.0 ({kind}). BACKUP: {saved}")
    print("Redémarrer HA manuellement. Antigel désactivé par défaut.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
