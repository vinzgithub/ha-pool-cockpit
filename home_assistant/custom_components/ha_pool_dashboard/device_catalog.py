"""RC8: shared dashboard catalogue, deliberately independent of the scheduler."""
from __future__ import annotations

from copy import deepcopy
import asyncio
import re
from typing import Any

from homeassistant.helpers.storage import Store

STORAGE_KEY = "ha_pool_dashboard.device_catalog"
ENTITY = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")
CATEGORIES = {"measurement", "pump", "pac", "light", "camera", "other"}

MEASUREMENT_DOMAINS = {
    **{key: {"sensor"} for key in ("temperature", "ph", "orp", "conductivity", "salinity", "free_chlorine", "battery", "bluetooth_signal", "last_analysis")},
    "bluetooth_state": {"sensor", "binary_sensor"},
    "analysis_status": {"sensor", "binary_sensor"},
    "start_analysis": {"button", "script"},
}


def normalize_catalog(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError("invalid_catalog")
    devices = value.get("devices", [])
    visibility = value.get("visibility", {})
    if not isinstance(devices, list) or len(devices) > 200 or not isinstance(visibility, dict) or len(visibility) > 500:
        raise ValueError("invalid_catalog")
    result, ids, entities_used = [], set(), set()
    for raw in devices:
        if not isinstance(raw, dict) or not isinstance(raw.get("id"), str) or not raw["id"] or len(raw["id"]) > 240:
            raise ValueError("invalid_device")
        if raw["id"] in ids or raw["id"] in {"role_pump", "role_light", "role_pac", "role_camera"} or raw.get("category") not in CATEGORIES:
            raise ValueError("duplicate_or_invalid_device")
        ids.add(raw["id"])
        entities = raw.get("entities", {})
        if not isinstance(entities, dict) or len(entities) > 32 or any(not isinstance(v, str) or not ENTITY.fullmatch(v) for v in entities.values()):
            raise ValueError("invalid_entities")
        if entities_used.intersection(entities.values()) or len(set(entities.values())) != len(entities):
            raise ValueError("duplicate_entities")
        if raw["category"] == "measurement":
            if any(v.split(".")[0] not in MEASUREMENT_DOMAINS.get(k, set()) for k, v in entities.items()):
                raise ValueError("unsafe_measurement_association")
            if not set(entities).intersection({"temperature", "ph", "orp", "conductivity", "salinity", "free_chlorine"}):
                raise ValueError("missing_measurement")
        elif not entities:
            raise ValueError("missing_entities")
        entities_used.update(entities.values())
        refs = raw.get("entity_refs", {})
        if not isinstance(refs, dict):
            raise ValueError("invalid_entities")
        safe_refs = {str(k)[:80]: {str(a)[:40]: str(b)[:240] for a, b in v.items() if a in {"id", "unique_id", "platform"}} for k, v in refs.items() if isinstance(v, dict) and k in entities}
        result.append({"id": raw["id"], "name": str(raw.get("name", ""))[:160], "category": raw["category"], "profile": str(raw.get("profile", "generic"))[:40], "entities": dict(entities), "entity_refs": safe_refs, "enabled_for_calculation": raw.get("enabled_for_calculation") is True, "association_status": "validated"})
    if any(not isinstance(k, str) or len(k) > 240 or not isinstance(v, bool) for k, v in visibility.items()):
        raise ValueError("invalid_visibility")
    removed = value.get("removed", [])
    if not isinstance(removed, list) or len(removed) > 500 or any(not isinstance(k, str) or len(k) > 240 for k in removed):
        raise ValueError("invalid_removed")
    return {"schema": 1, "devices": result, "visibility": dict(visibility), "removed": list(dict.fromkeys(removed)), "camera_button": value.get("camera_button") is not False}


class DeviceCatalogStore:
    def __init__(self, hass: Any) -> None:
        self.store = Store(hass, 1, STORAGE_KEY)
        self.scopes: dict[str, Any] = {}
        self.lock = asyncio.Lock()
        self.error = False

    async def async_load(self) -> None:
        try:
            raw = await self.store.async_load()
            if raw is not None and (not isinstance(raw, dict) or not isinstance(raw.get("scopes"), dict)):
                raise ValueError("invalid_catalog_storage")
            self.scopes = deepcopy((raw or {}).get("scopes", {}))
        except (ValueError, TypeError, OSError):
            self.error = True

    def read(self, scope: str) -> dict[str, Any]:
        if self.error or not scope or len(scope) > 120:
            raise ValueError("invalid_catalog_storage")
        raw = self.scopes.get(scope)
        if raw is None:
            return {**normalize_catalog({}), "revision": 0}
        if not isinstance(raw, dict) or type(raw.get("revision")) is not int or raw["revision"] < 0:
            raise ValueError("invalid_catalog_revision")
        return {**normalize_catalog(raw), "revision": raw["revision"]}

    async def save(self, scope: str, value: dict[str, Any], expected: int) -> dict[str, Any]:
        if not scope or len(scope) > 120:
            raise ValueError("invalid_scope")
        async with self.lock:
            current = self.read(scope)
            if current["revision"] != expected:
                raise ValueError("catalog_conflict")
            updated = {**normalize_catalog(value), "revision": expected + 1}
            scopes = {**self.scopes, scope: updated}
            await self.store.async_save({"schema": 1, "scopes": scopes})
            self.scopes = scopes
            return deepcopy(updated)
