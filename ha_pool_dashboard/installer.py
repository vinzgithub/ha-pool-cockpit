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

SCHEDULER_YAML_MARKER = "# Pool Cockpit scheduler"


def ensure_scheduler_yaml(content: str) -> str:
    if re.search(r"(?m)^ha_pool_dashboard\s*:\s*(?:#.*)?$", content):
        return content
    suffix = "" if content.endswith("\n") else "\n"
    return f"{content}{suffix}\n{SCHEDULER_YAML_MARKER}\nha_pool_dashboard:\n"


def _top_level_block_span(lines: list[str], key: str) -> tuple[int, int] | None:
    pattern = re.compile(rf"^{re.escape(key)}\s*:")
    for start, line in enumerate(lines):
        if not pattern.match(line):
            continue
        end = len(lines)
        for index in range(start + 1, len(lines)):
            candidate = lines[index]
            if re.match(r"^[^\s#][^:]*:", candidate):
                end = index
                break
        return start, end
    return None


def _child_block_end(lines: list[str], start: int, end: int, indent: int) -> int:
    pattern = re.compile(rf"^ {{{indent}}}[^\s#][^:]*:")
    for index in range(start + 1, end):
        if pattern.match(lines[index]):
            return index
    return end


def ensure_lovelace_yaml(content: str, version: str) -> str:
    resource_url = f"/local/ha-pool-dashboard/pool-dashboard.js?v={version}"
    lines = content.splitlines()

    span = _top_level_block_span(lines, "lovelace")
    if span is None:
        prefix = content.rstrip("\n")
        if prefix:
            prefix += "\n\n"
        return (
            f"{prefix}"
            "# Pool Cockpit dashboard\n"
            "lovelace:\n"
            "  mode: storage\n"
            "  resource_mode: yaml\n"
            "  resources:\n"
            f"    - url: {resource_url}\n"
            "      type: module\n"
            "  dashboards:\n"
            "    pool-cockpit:\n"
            "      mode: yaml\n"
            "      title: Piscine\n"
            "      icon: mdi:pool\n"
            "      show_in_sidebar: true\n"
            "      filename: pool-dashboard.yaml\n"
        )

    start, end = span

    mode_index = next(
        (i for i in range(start + 1, end) if re.match(r"^  mode\s*:", lines[i])),
        None,
    )
    if mode_index is None:
        lines.insert(start + 1, "  mode: storage")

    start, end = _top_level_block_span(lines, "lovelace")
    resource_mode_index = next(
        (i for i in range(start + 1, end) if re.match(r"^  resource_mode\s*:", lines[i])),
        None,
    )
    if resource_mode_index is None:
        mode_index = next(
            (i for i in range(start + 1, end) if re.match(r"^  mode\s*:", lines[i])),
            start,
        )
        lines.insert(mode_index + 1, "  resource_mode: yaml")
    else:
        value = lines[resource_mode_index].split(":", 1)[1].split("#", 1)[0].strip()
        if value != "yaml":
            raise RuntimeError(
                "La configuration Lovelace existante utilise un resource_mode incompatible. "
                "Pool Cockpit n'a pas modifié configuration.yaml."
            )

    start, end = _top_level_block_span(lines, "lovelace")
    resources_index = next(
        (i for i in range(start + 1, end) if re.match(r"^  resources\s*:", lines[i])),
        None,
    )

    if resources_index is None:
        dashboards_index = next(
            (i for i in range(start + 1, end) if re.match(r"^  dashboards\s*:", lines[i])),
            end,
        )
        lines[dashboards_index:dashboards_index] = [
            "  resources:",
            f"    - url: {resource_url}",
            "      type: module",
        ]
    else:
        if not re.match(r"^  resources\s*:\s*(?:#.*)?$", lines[resources_index]):
            raise RuntimeError(
                "Le bloc Lovelace resources utilise une forme externe/non standard. "
                "Pool Cockpit n'a pas modifié configuration.yaml."
            )

        start, end = _top_level_block_span(lines, "lovelace")
        resources_index = next(
            i for i in range(start + 1, end)
            if re.match(r"^  resources\s*:", lines[i])
        )
        resources_end = _child_block_end(lines, resources_index, end, 2)

        existing_resource = next(
            (
                i for i in range(resources_index + 1, resources_end)
                if "/local/ha-pool-dashboard/pool-dashboard.js" in lines[i]
            ),
            None,
        )

        if existing_resource is None:
            lines[resources_end:resources_end] = [
                f"    - url: {resource_url}",
                "      type: module",
            ]
        else:
            indent = lines[existing_resource][:len(lines[existing_resource]) - len(lines[existing_resource].lstrip())]
            lines[existing_resource] = f"{indent}- url: {resource_url}"

    start, end = _top_level_block_span(lines, "lovelace")
    dashboards_index = next(
        (i for i in range(start + 1, end) if re.match(r"^  dashboards\s*:", lines[i])),
        None,
    )

    dashboard_lines = [
        "    pool-cockpit:",
        "      mode: yaml",
        "      title: Piscine",
        "      icon: mdi:pool",
        "      show_in_sidebar: true",
        "      filename: pool-dashboard.yaml",
    ]

    if dashboards_index is None:
        lines[end:end] = ["  dashboards:", *dashboard_lines]
    else:
        if not re.match(r"^  dashboards\s*:\s*(?:#.*)?$", lines[dashboards_index]):
            raise RuntimeError(
                "Le bloc Lovelace dashboards utilise une forme externe/non standard. "
                "Pool Cockpit n'a pas modifié configuration.yaml."
            )

        start, end = _top_level_block_span(lines, "lovelace")
        dashboards_index = next(
            i for i in range(start + 1, end)
            if re.match(r"^  dashboards\s*:", lines[i])
        )
        dashboards_end = _child_block_end(lines, dashboards_index, end, 2)

        pool_dashboard_exists = any(
            re.match(r"^    pool-cockpit\s*:", lines[i])
            for i in range(dashboards_index + 1, dashboards_end)
        )

        if not pool_dashboard_exists:
            lines[dashboards_end:dashboards_end] = dashboard_lines

    return "\n".join(lines).rstrip("\n") + "\n"

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
            raise RuntimeError("Composant Pool Cockpit introuvable dans l’archive.")
        shutil.copytree(scheduler_source, scheduler_target, dirs_exist_ok=True)
        atomic_write_text(dashboard_target, generate_dashboard(devices, theme, weather))
        configuration = configuration_target.read_text(encoding="utf-8") if configuration_target.exists() else ""
        updated_configuration = ensure_scheduler_yaml(configuration)
        updated_configuration = ensure_lovelace_yaml(updated_configuration, self.version)
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
