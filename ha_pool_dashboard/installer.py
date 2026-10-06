# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from __future__ import annotations
import json, re, shutil
from pathlib import Path
from .backup import create_backup
from .dashboard_generator import generate_dashboard
from .discovery import DiscoveryEngine
from .storage import atomic_write_text, load_json
from .weather import detect_weather_entities
from .models import PoolDevice

THEMES = ("ocean", "sky", "night", "auto")

SCHEDULER_YAML_MARKER = "# HA Pool Dashboard RC27 scheduler"


def ensure_scheduler_yaml(content: str) -> str:
    if re.search(r"(?m)^ha_pool_dashboard\s*:\s*(?:#.*)?$", content):
        return content
    suffix = "" if content.endswith("\n") else "\n"
    return f"{content}{suffix}\n{SCHEDULER_YAML_MARKER}\nha_pool_dashboard:\n"

class Installer:
    def __init__(self, source_dir: Path, config_dir: Path, version: str) -> None:
        self.source_dir = source_dir
        self.config_dir = config_dir
        self.version = version

    def _previous_devices(self) -> list[PoolDevice]:
        manifest_path = self.config_dir / ".ha_pool_dashboard_install.json"
        if not manifest_path.exists():
            return []
        try:
            payload = load_json(manifest_path)
        except (OSError, ValueError):
            return []

        restored: list[PoolDevice] = []
        for item in payload.get("devices", []):
            entities = item.get("entities") or {}
            if not entities:
                continue
            restored.append(
                PoolDevice(
                    key=item.get("key") or f"{item.get('brand', 'pool')}:{item.get('name', 'device')}",
                    brand=item.get("brand") or "pool",
                    name=item.get("name") or "Analyseur piscine",
                    device_id=item.get("device_id"),
                    entities=dict(entities),
                    metadata=dict(item.get("metadata") or {}),
                )
            )
        return restored

    def _discover_devices(self, strict: bool = False) -> tuple[list[PoolDevice], str]:
        devices = DiscoveryEngine(self.config_dir).discover()
        if devices:
            return devices, "registry"

        previous = self._previous_devices()
        if previous:
            return previous, "previous_install"

        if strict:
            raise RuntimeError(
                "Aucun analyseur de piscine détecté. L'installation a été interrompue "
                "sans modifier pool-dashboard.yaml. Vérifiez que Blue Connect ou Flipr "
                "est présent dans le registre d'entités Home Assistant."
            )
        return [], "none"

    def plan(self, theme: str) -> dict:
        devices, discovery_source = self._discover_devices(strict=False)
        weather = detect_weather_entities(self.config_dir)
        return {
            "theme": theme,
            "devices": [device.as_dict() for device in devices],
            "weather": weather,
            "discovery_source": discovery_source,
        }

    def install(self, theme: str) -> dict:
        devices, discovery_source = self._discover_devices(strict=True)
        weather = detect_weather_entities(self.config_dir)
        frontend_source_dir = self.source_dir / "frontend" / "dist"
        frontend_target_dir = self.config_dir / "www" / "ha-pool-dashboard"
        frontend_target = frontend_target_dir / "pool-dashboard.js"
        dashboard_target = self.config_dir / "pool-dashboard.yaml"
        configuration_target = self.config_dir / "configuration.yaml"
        scheduler_source = self.source_dir / "home_assistant" / "custom_components" / "ha_pool_dashboard"
        scheduler_target = self.config_dir / "custom_components" / "ha_pool_dashboard"

        backup_dir = create_backup(
            self.config_dir,
            [frontend_target, dashboard_target, configuration_target, scheduler_target],
        )
        frontend_target_dir.mkdir(parents=True, exist_ok=True)
        for source_path in frontend_source_dir.rglob("*"):
            relative_path = source_path.relative_to(frontend_source_dir)
            target_path = frontend_target_dir / relative_path
            if source_path.is_dir():
                target_path.mkdir(parents=True, exist_ok=True)
            elif source_path.is_file():
                target_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source_path, target_path)
        if not scheduler_source.exists():
            raise RuntimeError("Composant de programmation RC28.3 introuvable dans l’archive.")
        shutil.copytree(scheduler_source, scheduler_target, dirs_exist_ok=True)
        atomic_write_text(dashboard_target, generate_dashboard(devices, theme, weather))
        configuration = configuration_target.read_text(encoding="utf-8") if configuration_target.exists() else ""
        updated_configuration = ensure_scheduler_yaml(configuration)
        if updated_configuration != configuration:
            atomic_write_text(configuration_target, updated_configuration)

        manifest = {
            "version": self.version,
            "theme": theme,
            "backup_dir": str(backup_dir),
            "devices": [device.as_dict() for device in devices],
            "weather": weather,
            "discovery_source": discovery_source,
            "scheduler_component": str(scheduler_target),
            "scheduler_configured": True,
        }
        atomic_write_text(
            self.config_dir / ".ha_pool_dashboard_install.json",
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        )
        return manifest
