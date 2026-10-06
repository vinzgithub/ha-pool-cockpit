# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from __future__ import annotations
import json
from typing import Any
from .models import PoolDevice

def _weather_yaml(weather: dict[str, Any] | None) -> list[str]:
    if not weather:
        return ["          {}"]
    lines: list[str] = []
    for key, value in weather.items():
        if isinstance(value, list):
            lines.append(f"          {key}:")
            lines.extend(f"            - {item}" for item in value)
        else:
            lines.append(f"          {key}: {value}")
    return lines


def generate_dashboard(devices: list[PoolDevice], theme: str, weather: dict[str, Any] | None = None) -> str:
    lines = [
        "title: Piscine",
        "views:",
        "  - title: Piscine",
        "    path: overview",
        "    icon: mdi:pool",
        "    type: panel",
        "    cards:",
        "      - type: custom:pool-dashboard-card",
        f"        visual_theme: {theme}",
        "        title: Ma Piscine",
        "        weather:",
        *_weather_yaml(weather),
        "        devices:",
    ]

    if not devices:
        lines.append("          []")

    for device in devices:
        lines.extend([
            f"          - key: {json.dumps(device.key, ensure_ascii=False)}",
            f"            name: {json.dumps(device.name, ensure_ascii=False)}",
            f"            brand: {device.brand}",
            *([f"            enabled_entity: {device.metadata.get('enabled_entity')}"] if device.metadata.get("enabled_entity") else []),
            "            entities:",
        ])
        for metric, entity_id in device.entities.items():
            lines.append(f"              {metric}: {entity_id}")

    return "\n".join(lines) + "\n"
