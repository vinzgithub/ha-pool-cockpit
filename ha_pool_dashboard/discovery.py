# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from __future__ import annotations
from pathlib import Path
from typing import Any
from .models import EntityMatch, PoolDevice
from .rules import BRAND_TOKENS, METRIC_RULES, SIGNIFICANT_METRICS
from .storage import load_json, unwrap_storage

def normalize(value: Any) -> str:
    return str(value or "").strip().lower().replace("-", "_")

def entity_haystack(entity: dict[str, Any]) -> str:
    return " ".join(normalize(entity.get(k)) for k in ("entity_id", "unique_id", "original_name", "name", "platform"))

def device_haystack(device: dict[str, Any]) -> str:
    return " ".join(normalize(device.get(k)) for k in ("name", "name_by_user", "manufacturer", "model"))

def detect_brand(text: str) -> str | None:
    for brand, tokens in BRAND_TOKENS.items():
        if any(token in text for token in tokens):
            return brand
    return None

def metric_score(entity: dict[str, Any], metric: str) -> tuple[int, list[str]]:
    rule = METRIC_RULES[metric]
    entity_id = str(entity.get("entity_id", ""))
    domain = entity_id.split(".", 1)[0] if "." in entity_id else ""
    if domain not in rule["domains"]:
        return -1, [f"domain:{domain}:rejected"]

    text = f" {entity_haystack(entity)} "
    sensor_options = ((entity.get("options") or {}).get("sensor") or {})
    device_class = normalize(entity.get("device_class") or sensor_options.get("device_class"))
    unit = normalize(entity.get("unit_of_measurement") or sensor_options.get("unit_of_measurement"))

    score = 0
    reasons: list[str] = []
    matching_tokens = [token for token in rule["tokens"] if token in text]
    if matching_tokens:
        score += 20
        reasons.append("tokens:" + ",".join(matching_tokens))
    if device_class and device_class in rule["device_classes"]:
        score += 12
        reasons.append(f"device_class:{device_class}")
    if unit and unit in rule["units"]:
        score += 8
        reasons.append(f"unit:{unit}")

    if metric == "salinity" and any(x in text for x in ("chlore", "chlorine", "_fc")):
        return -1, ["excluded:chlorine_is_not_salinity"]
    if metric == "ph" and any(x in text for x in ("orp", "redox")):
        return -1, ["excluded:orp_is_not_ph"]
    if metric == "bluetooth_signal" and not any(x in text for x in ("signal", "rssi")):
        return -1, ["excluded:not_a_signal_entity"]
    if metric == "bluetooth_state" and not any(x in text for x in ("etat", "state", "status", "connect")):
        return -1, ["excluded:not_a_state_entity"]

    return (score, reasons) if score > 0 else (0, ["no_positive_signal"])

class DiscoveryEngine:
    def __init__(self, config_dir: Path) -> None:
        self.config_dir = config_dir

    def discover(self) -> list[PoolDevice]:
        entity_path = self.config_dir / ".storage" / "core.entity_registry"
        device_path = self.config_dir / ".storage" / "core.device_registry"
        if not entity_path.exists():
            raise FileNotFoundError(f"Registre d'entités absent : {entity_path}")

        entities = unwrap_storage(load_json(entity_path)).get("entities", [])
        devices = unwrap_storage(load_json(device_path)).get("devices", []) if device_path.exists() else []
        devices_by_id = {d.get("id"): d for d in devices if d.get("id")}
        candidates: dict[str, PoolDevice] = {}

        for entity in entities:
            if entity.get("disabled_by") or not entity.get("entity_id"):
                continue
            device = devices_by_id.get(entity.get("device_id"), {})
            brand = detect_brand(f"{entity_haystack(entity)} {device_haystack(device)}")
            if not brand:
                continue

            key = entity.get("device_id") or f"{brand}:{normalize(entity.get('platform'))}"
            candidate = candidates.setdefault(
                key,
                PoolDevice(
                    key=key,
                    brand=brand,
                    name=device.get("name_by_user") or device.get("name") or ("Blue Connect" if brand == "blue_connect" else "Flipr"),
                    device_id=entity.get("device_id"),
                    metadata={"manufacturer": device.get("manufacturer"), "model": device.get("model")},
                ),
            )

            for metric in METRIC_RULES:
                score, reasons = metric_score(entity, metric)
                current = candidate.matches.get(metric)
                if score > 0 and (current is None or score > current.score):
                    match = EntityMatch(metric=metric, entity_id=entity["entity_id"], score=score, reasons=reasons)
                    candidate.matches[metric] = match
                    candidate.entities[metric] = entity["entity_id"]

        return sorted(
            [d for d in candidates.values() if SIGNIFICANT_METRICS.intersection(d.entities)],
            key=lambda d: (d.brand, d.name.lower()),
        )
