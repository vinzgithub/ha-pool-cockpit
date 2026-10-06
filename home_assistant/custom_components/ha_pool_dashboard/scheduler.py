# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta
from typing import Any
import math
import unicodedata

from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DEFAULT_DATA, DEFAULT_WEEKDAYS, DOMAIN, STORAGE_KEY, STORAGE_VERSION, UPDATE_EVENT

SEASONAL_DEFAULTS = {
    "spring": {
        "weekdays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        "periods": [{"enabled": True, "start": "10:00", "end": "15:00"}, {"enabled": False, "start": "00:00", "end": "00:00"}, {"enabled": False, "start": "00:00", "end": "00:00"}],
    },
    "summer": {
        "weekdays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        "periods": [{"enabled": True, "start": "08:30", "end": "21:30"}, {"enabled": False, "start": "00:00", "end": "00:00"}, {"enabled": False, "start": "00:00", "end": "00:00"}],
    },
    "autumn": {
        "weekdays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        "periods": [{"enabled": True, "start": "11:00", "end": "16:00"}, {"enabled": False, "start": "00:00", "end": "00:00"}, {"enabled": False, "start": "00:00", "end": "00:00"}],
    },
    "winter": {
        "weekdays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        "periods": [{"enabled": True, "start": "02:00", "end": "05:00"}, {"enabled": False, "start": "00:00", "end": "00:00"}, {"enabled": False, "start": "00:00", "end": "00:00"}],
    },
    "maintenance": {
        "weekdays": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        "periods": [{"enabled": False, "start": "00:00", "end": "00:00"}, {"enabled": False, "start": "00:00", "end": "00:00"}, {"enabled": False, "start": "00:00", "end": "00:00"}],
    },
}
from .schedule_utils import (
    adaptive_periods, astronomical_profile, effective_periods, next_boundary,
    profile_start_minutes, reconcile_extension, schedule_is_active, scheduled_minutes,
)


def _deep_merge(base: dict[str, Any], update: dict[str, Any]) -> dict[str, Any]:
    result = deepcopy(base)
    for key, value in update.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = deepcopy(value)
    return result


def _iso(value: Any) -> datetime | None:
    if not value:
        return None
    parsed = dt_util.parse_datetime(str(value))
    return dt_util.as_local(parsed) if parsed else None


class PoolScheduler:
    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.data: dict[str, Any] = deepcopy(DEFAULT_DATA)
        self._remove_interval = None
        self._remove_state_listener = None
        self._last_requested: dict[str, str] = {}

    async def async_load(self) -> None:
        stored = await self.store.async_load() or {}
        self.data = self._normalize(_deep_merge(DEFAULT_DATA, stored))
        self._remove_interval = async_track_time_interval(
            self.hass, self.async_tick, timedelta(seconds=30)
        )
        self._remove_state_listener = self.hass.bus.async_listen(EVENT_STATE_CHANGED, self._async_state_changed)
        self._refresh_adaptive_schedule(dt_util.now())
        await self.async_evaluate("démarrage")

    async def async_unload(self) -> None:
        if self._remove_interval:
            self._remove_interval()
            self._remove_interval = None
        if self._remove_state_listener:
            self._remove_state_listener()
            self._remove_state_listener = None

    def _normalize(self, data: dict[str, Any]) -> dict[str, Any]:
        for target in ("pump", "light", "pac"):
            block = data.setdefault(target, {})
            allowed_modes = ("off", "manual", "program", "automatic") if target == "pump" else ("off", "manual", "program")
            block["mode"] = "automatic" if target == "pump" and block.get("mode") == "automatic_full" else block.get("mode") if block.get("mode") in allowed_modes else "manual"
            block["weekdays"] = [day for day in block.get("weekdays", DEFAULT_WEEKDAYS) if day in DEFAULT_WEEKDAYS]
            periods = list(block.get("periods") or [])[:3]
            while len(periods) < 3:
                periods.append({"enabled": False, "start": "00:00", "end": "00:00"})
            block["periods"] = [
                {
                    "enabled": bool(period.get("enabled", True)),
                    "start": str(period.get("start", "00:00"))[:5],
                    "end": str(period.get("end", "00:00"))[:5],
                }
                for period in periods
            ]
        pac = data.setdefault("pac", {})
        # Migration transparente FIX4 -> FIX5 : l'ancien champ générique
        # compressor_entity devient le code défaut compresseur exposé en sensor.
        if not pac.get("compressor_fault_code_entity") and pac.get("compressor_entity"):
            pac["compressor_fault_code_entity"] = pac.get("compressor_entity")
        for key in (
            "command_entity", "control_mode_entity", "setpoint_entity", "mode_entity", "status_entity",
            "inlet_temperature_entity", "outlet_temperature_entity", "ambient_temperature_entity",
            "coil_temperature_entity", "ipm_temperature_entity", "voltage_entity", "current_entity",
            "power_entity", "energy_entity", "daily_energy_entity", "compressor_fault_code_entity", "water_flow_entity",
            "high_pressure_entity", "low_pressure_entity", "fault_entity", "communication_entity",
        ):
            pac[key] = str(pac.get(key) or "")
        pac.pop("compressor_entity", None)
        pac["requires_pump"] = pac.get("requires_pump") is not False
        # FIX6: programmation PAC persistée et évaluée côté Home Assistant,
        # mais toutes les écritures restent volontairement verrouillées.
        pac["write_enabled"] = False

        coordination = data.setdefault("coordination", {})
        coordination["role"] = coordination.get("role") if coordination.get("role") in ("master", "satellite") else "master"
        coordination["site_name"] = str(coordination.get("site_name") or "Site A")[:40]
        coordination["peer_name"] = str(coordination.get("peer_name") or "Site B")[:40]
        coordination["allow_satellite_manual"] = coordination.get("allow_satellite_manual") is not False

        seasonal = data.setdefault("seasonal_profiles", {})
        try:
            schema = int(seasonal.get("schema") or 0)
        except (TypeError, ValueError):
            schema = 0
        legacy_profiles = schema < 2
        follow = True if legacy_profiles else seasonal.get("follow_astronomical") is not False
        suggested = astronomical_profile(dt_util.now())
        current = str(seasonal.get("current") or suggested)
        if follow or current not in SEASONAL_DEFAULTS:
            current = suggested
        profiles: dict[str, Any] = {}
        for key, definition in SEASONAL_DEFAULTS.items():
            stored_profile = {} if legacy_profiles else dict((seasonal.get("profiles") or {}).get(key) or {})
            weekdays = [day for day in stored_profile.get("weekdays", definition["weekdays"]) if day in DEFAULT_WEEKDAYS]
            periods = list(stored_profile.get("periods") or definition["periods"])[:3]
            while len(periods) < 3:
                periods.append({"enabled": False, "start": "00:00", "end": "00:00"})
            profiles[key] = {
                "weekdays": weekdays,
                "periods": [
                    {
                        "enabled": bool(period.get("enabled", True)),
                        "start": str(period.get("start", "00:00"))[:5],
                        "end": str(period.get("end", "00:00"))[:5],
                    }
                    for period in periods
                ],
            }
        source = seasonal.get("source") if seasonal.get("source") in ("custom", "adaptive", "suspended") else "custom"
        seasonal.update({
            "schema": 3,
            "current": current,
            "follow_astronomical": follow,
            "source": source,
            "profiles": profiles,
            "last_adaptive_signature": str(seasonal.get("last_adaptive_signature") or ""),
            "suspended_at": str(seasonal.get("suspended_at") or ""),
            "manual_revision": int(seasonal.get("manual_revision") or 0),
            "initialized": True,
        })

        extension = data.setdefault("pump", {}).setdefault("extension", {})
        extension["date"] = str(extension.get("date") or "")
        extension["status"] = extension.get("status") if extension.get("status") in ("none", "approved", "ignored") else "none"
        try:
            extension["target_hours"] = max(0.0, min(24.0, float(extension.get("target_hours") or 0)))
            extension["minutes"] = max(0, min(1440, int(extension.get("minutes") or 0)))
        except (TypeError, ValueError):
            extension.update({"target_hours": 0, "minutes": 0})
        data["measurement_sources"] = {str(key): bool(value) for key, value in dict(data.get("measurement_sources") or {}).items()}
        data["history"] = list(data.get("history") or [])[:100]
        data["overrides"] = dict(data.get("overrides") or {})
        return data

    def _is_master(self) -> bool:
        return self.data.get("coordination", {}).get("role", "master") == "master"

    @staticmethod
    def _normalized_text(value: Any) -> str:
        text = unicodedata.normalize("NFD", str(value or ""))
        return "".join(char for char in text if unicodedata.category(char) != "Mn").lower()

    @classmethod
    def _severity(cls, value: Any) -> int:
        if isinstance(value, bool):
            return 1 if value else 0
        if isinstance(value, (int, float)):
            return max(0, min(3, int(value)))
        text = cls._normalized_text(value)
        if "rouge" in text or "red" in text:
            return 3
        if "orange" in text:
            return 2
        if "jaune" in text or "yellow" in text:
            return 1
        return 0

    def _state_number(self, entity_id: str, *, temperature: bool = False) -> float | None:
        if not entity_id:
            return None
        state = self.hass.states.get(entity_id)
        if not state or str(state.state).lower() in ("unknown", "unavailable", "none"):
            return None
        try:
            value = float(state.state)
        except (TypeError, ValueError):
            return None
        if temperature:
            unit = str(state.attributes.get("unit_of_measurement") or "").lower()
            if "°f" in unit or unit == "f":
                value = (value - 32) * 5 / 9
        return value

    def _water_temperature(self) -> float | None:
        ids = list(self.data.get("watch", {}).get("temperature_entities") or [])
        values = [self._state_number(str(entity_id), temperature=True) for entity_id in ids]
        usable = [value for value in values if value is not None and -5 <= value <= 60]
        return sum(usable) / len(usable) if usable else None

    def _air_temperature(self) -> float | None:
        watch = self.data.get("watch", {})
        explicit = self._state_number(str(watch.get("air_temperature_entity") or ""), temperature=True)
        if explicit is not None:
            return explicit
        entity_id = str(watch.get("weather_entity") or "")
        state = self.hass.states.get(entity_id) if entity_id else None
        if not state:
            return None
        try:
            value = float(state.attributes.get("temperature"))
        except (TypeError, ValueError):
            return None
        unit = str(state.attributes.get("temperature_unit") or "°C").lower()
        return (value - 32) * 5 / 9 if "°f" in unit or unit == "f" else value

    def _thermal_alerts(self) -> tuple[bool, bool, int]:
        watch = self.data.get("watch", {})
        entity_id = str(watch.get("weather_alert_entity") or "")
        state = self.hass.states.get(entity_id) if entity_id else None
        if not state:
            return bool(watch.get("weather_heat_alert")), bool(watch.get("weather_cold_alert")), 0
        heat = False
        cold = False
        severity = self._severity(state.state)
        for key, value in dict(state.attributes or {}).items():
            key_text = self._normalized_text(key)
            value_text = self._normalized_text(value)
            item_severity = self._severity(value)
            combined = f"{key_text} {value_text}"
            if "canicule" in combined or "heatwave" in combined:
                heat = heat or item_severity >= 2
            if any(token in combined for token in ("grand froid", "froid", "cold", "gel", "freeze")):
                cold = cold or item_severity >= 2
        return heat, cold, severity

    def _fresh_frontend_recommended_hours(self, now: datetime) -> float | None:
        updated = _iso(self.data.get("watch", {}).get("context_updated_at"))
        if not updated or abs((now - updated).total_seconds()) > 15 * 60:
            return None
        try:
            value = float(self.data.get("pump", {}).get("recommended_hours") or 0)
        except (TypeError, ValueError):
            return None
        return max(0.0, min(24.0, value)) if value > 0 else None

    def _refresh_adaptive_schedule(self, now: datetime) -> bool:
        seasonal = self.data.get("seasonal_profiles", {})
        # FIX14.2: custom = user priority, suspended = frozen schedule,
        # adaptive = only state allowed to recalculate periods automatically.
        if seasonal.get("source") != "adaptive":
            return False
        suggested = astronomical_profile(now)
        base = suggested if seasonal.get("follow_astronomical") is not False else str(seasonal.get("current") or suggested)
        if base not in SEASONAL_DEFAULTS:
            base = suggested
        seasonal["current"] = base
        if base == "maintenance":
            seasonal["source"] = "custom"
            seasonal["last_adaptive_signature"] = ""
            seasonal["suspended_at"] = ""
            return True

        water = self._water_temperature()
        air = self._air_temperature()
        heat_alert, cold_alert, alert_severity = self._thermal_alerts()
        effective = base
        context = "season"
        if heat_alert or (air is not None and air >= 30) or (water is not None and water >= 28):
            effective = "summer"
            context = "hot"
        elif cold_alert or (air is not None and air <= 5 and base in ("spring", "autumn", "winter")):
            effective = "winter"
            context = "cold"

        profiles = seasonal.get("profiles") or {}
        base_profile = dict(profiles.get(base) or SEASONAL_DEFAULTS[base])
        effective_profile = dict(profiles.get(effective) or SEASONAL_DEFAULTS[effective])
        reference_hours = scheduled_minutes(list(base_profile.get("periods") or [])) / 60
        candidates: list[float] = []
        if water is not None:
            candidates.append(max(1.0, math.ceil(water / 2)))
        watch = self.data.get("watch", {})
        try:
            volume = float(watch.get("pool_volume_m3") or 0)
            flow = float(watch.get("pump_flow_m3h") or 0)
        except (TypeError, ValueError):
            volume = flow = 0
        # Plancher hydraulique : un renouvellement théorique du bassin.
        hydraulic_hours = max(1.0, math.ceil(volume / flow)) if volume > 0 and flow > 0 else None
        if hydraulic_hours is not None:
            candidates.append(hydraulic_hours)
        fresh_recommended = self._fresh_frontend_recommended_hours(now)
        if fresh_recommended is not None:
            candidates.append(fresh_recommended)
        target_hours = max(candidates) if candidates else reference_hours

        water_condition = str(watch.get("water_condition") or "")
        recent_load = str(watch.get("recent_load") or "")
        try:
            sanitizer_level = float(watch.get("sanitizer_level"))
            sanitizer_min = float(watch.get("sanitizer_min"))
            sanitizer_low = sanitizer_level < sanitizer_min
        except (TypeError, ValueError):
            sanitizer_low = False

        if water_condition in ("green", "cloudy") or recent_load == "polluted":
            target_hours = 24.0
            context = "water_problem"
        elif heat_alert and water is not None and water >= 28:
            target_hours = 24.0
            context = "heat_alert"
        elif sanitizer_low and water is not None and water >= 28:
            target_hours = 24.0
            context = "sanitizer_hot"
        elif cold_alert and base == "winter":
            target_hours = 24.0
            context = "frost"
        elif recent_load == "busy":
            target_hours = min(24.0, target_hours + 2.0)
            context = "busy"
        elif water is not None and water > 30:
            target_hours = min(24.0, target_hours + 4.0)
            context = "very_hot_water"
        elif water is not None and water > 28:
            target_hours = min(24.0, target_hours + max(1.0, math.ceil((water - 28) * 2)))
            context = "hot_water"

        target_hours = max(0.0, min(24.0, target_hours))
        start_reference = profile_start_minutes(list(effective_profile.get("periods") or []))
        periods = adaptive_periods(target_hours, start_reference)
        weekdays = [day for day in base_profile.get("weekdays", DEFAULT_WEEKDAYS) if day in DEFAULT_WEEKDAYS]
        signature = f"{base}|{effective}|{target_hours:.3f}|{weekdays}|{periods}|{round(water,1) if water is not None else '-'}|{round(air,1) if air is not None else '-'}|{hydraulic_hours if hydraulic_hours is not None else '-'}|{int(heat_alert)}|{int(cold_alert)}|{water_condition}|{recent_load}"
        changed = (
            self.data.get("pump", {}).get("periods") != periods
            or self.data.get("pump", {}).get("weekdays") != weekdays
            or seasonal.get("last_adaptive_signature") != signature
        )
        self.data["pump"]["periods"] = periods
        self.data["pump"]["weekdays"] = weekdays
        self.data["pump"]["recommended_hours"] = target_hours
        seasonal["last_adaptive_signature"] = signature
        seasonal["suspended_at"] = ""
        watch["adaptive_base_profile"] = base
        watch["adaptive_effective_profile"] = effective
        watch["adaptive_context"] = context
        watch["adaptive_water_temperature_c"] = water
        watch["adaptive_air_temperature_c"] = air
        watch["adaptive_hydraulic_hours"] = hydraulic_hours
        watch["adaptive_heat_alert"] = heat_alert
        watch["adaptive_cold_alert"] = cold_alert
        watch["adaptive_alert_severity"] = alert_severity
        watch["adaptive_target_hours"] = target_hours
        watch["adaptive_updated_at"] = now.isoformat()
        return changed

    def _target_for_entity(self, entity_id: str) -> str | None:
        for target in ("pump", "light", "pac"):
            block = self.data.get(target, {})
            configured = block.get("command_entity", "") if target == "pac" else block.get("entity_id", "")
            if configured == entity_id:
                return target
        return None

    @callback
    def _async_state_changed(self, event) -> None:
        if not self._is_master():
            return
        entity_id = str(event.data.get("entity_id") or "")
        target = self._target_for_entity(entity_id)
        if not target:
            return
        old_state = event.data.get("old_state")
        new_state = event.data.get("new_state")
        old_value = str(getattr(old_state, "state", "")).lower()
        new_value = str(getattr(new_state, "state", "")).lower()
        if old_value not in ("on", "off") or new_value not in ("on", "off") or old_value == new_value:
            return
        if self._last_requested.get(entity_id) == new_value:
            self._last_requested.pop(entity_id, None)
            return
        block = self.data.get(target, {})
        if block.get("mode") not in ("program", "automatic"):
            return
        # Une remontée tardive d'un ordre déjà attendu par le programme ne doit
        # jamais être prise pour une commande manuelle externe.
        expected = self._desired_state(target, dt_util.now())
        if expected == new_value:
            return
        self.hass.async_create_task(self._async_register_external_override(target, new_value))

    async def _async_register_external_override(self, target: str, state: str) -> None:
        now = dt_util.now()
        if target == "pump":
            self.data.setdefault("overrides", {})[target] = {
                "state": state, "until": None, "persistent": True, "source": "external"
            }
        else:
            self.data.setdefault("overrides", {})[target] = {
                "state": state, "until": self._next_boundary(target, now).isoformat(), "source": "external"
            }
        self._record(target, state, "commande externe / satellite")
        await self.store.async_save(self.data)
        self.hass.bus.async_fire(UPDATE_EVENT, self.public_state(include_history=False))

    def _reconcile_extension(self, now: datetime) -> None:
        block = self.data.get("pump", {})
        source = self.data.get("seasonal_profiles", {}).get("source", "custom")
        block["extension"] = reconcile_extension(
            block.get("periods") or [],
            block.get("recommended_hours"),
            block.get("extension") or {},
            now.date().isoformat(),
            source,
        )

    async def async_save_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        self.data = self._normalize(_deep_merge(self.data, payload))
        now = dt_util.now()
        self._refresh_adaptive_schedule(now)
        self._reconcile_extension(now)
        await self.store.async_save(self.data)
        await self.async_evaluate("configuration")
        return self.public_state()

    def _extension_is_current(self, now: datetime) -> bool:
        extension = self.data.get("pump", {}).get("extension") or {}
        return extension.get("date") == now.date().isoformat()

    def _target_periods(self, target: str) -> list[dict[str, Any]]:
        block = self.data[target]
        if target != "pump":
            return block["periods"]
        mode = block.get("mode")
        extension = block.get("extension") or {}
        source = self.data.get("seasonal_profiles", {}).get("source", "custom")
        if source != "adaptive" and mode == "automatic" and self._extension_is_current(dt_util.now()) and extension.get("status") == "approved":
            return effective_periods(block["periods"], extension.get("target_hours"))
        return block["periods"]

    def _scheduled_active(self, target: str, now: datetime) -> bool:
        block = self.data[target]
        return schedule_is_active(self._target_periods(target), block["weekdays"], now)

    def _next_boundary(self, target: str, now: datetime) -> datetime:
        block = self.data[target]
        return next_boundary(self._target_periods(target), block["weekdays"], now)

    def _desired_state(self, target: str, now: datetime) -> str | None:
        block = self.data[target]
        override = self.data.get("overrides", {}).get(target) or {}
        if override.get("persistent") and override.get("state") in ("on", "off"):
            return override.get("state")
        override_until = _iso(override.get("until"))
        if override_until and now < override_until:
            return override.get("state")
        if override:
            self.data["overrides"].pop(target, None)

        if target == "pump":
            boost_until = _iso(self.data.get("boost_until"))
            if boost_until and now < boost_until:
                return "on"
            if boost_until:
                self.data["boost_until"] = None

        if target == "light":
            auto_off = _iso(self.data.get("light_auto_off_at"))
            if auto_off and now >= auto_off:
                self.data["light_auto_off_at"] = None
                return "off"

        mode = block.get("mode", "manual")
        if mode == "off":
            return "off"
        if mode == "manual":
            return None
        desired = "on" if self._scheduled_active(target, now) else "off"
        if target == "pac" and desired == "on" and block.get("requires_pump", True):
            pump_entity_id = self.data.get("pump", {}).get("entity_id", "")
            pump_state = self.hass.states.get(pump_entity_id) if pump_entity_id else None
            if not pump_state or str(pump_state.state).lower() != "on":
                return "off"
        return desired

    async def _set_entity(self, target: str, state: str, reason: str) -> bool:
        block = self.data[target]
        if target == "pac" and not block.get("write_enabled", False):
            return False
        entity_id = block.get("command_entity", "") if target == "pac" else block.get("entity_id", "")
        if not entity_id or "." not in entity_id:
            return False
        current = self.hass.states.get(entity_id)
        current_state = current.state if current else None
        if current_state == state or self._last_requested.get(entity_id) == state:
            return False
        domain = entity_id.split(".", 1)[0]
        allowed_domains = ("switch", "input_boolean") if target == "pac" else ("switch", "light", "input_boolean")
        if domain not in allowed_domains:
            return False
        self._last_requested[entity_id] = state
        await self.hass.services.async_call(
            domain, "turn_on" if state == "on" else "turn_off", {"entity_id": entity_id}, blocking=False
        )
        self._record(target, state, reason)
        return True

    def _record(self, target: str, state: str, reason: str) -> None:
        self.data["history"] = [
            {
                "date": dt_util.utcnow().isoformat(),
                "target": target,
                "state": state,
                "reason": reason,
            },
            *self.data.get("history", []),
        ][:100]

    async def async_evaluate(self, reason: str) -> None:
        now = dt_util.now()
        if self._is_master():
            for target in ("pump", "light", "pac"):
                desired = self._desired_state(target, now)
                if desired:
                    await self._set_entity(target, desired, reason)
        await self.store.async_save(self.data)
        self.hass.bus.async_fire(UPDATE_EVENT, self.public_state(include_history=False))

    async def async_tick(self, _now: datetime) -> None:
        self._last_requested.clear()
        now = dt_util.now()
        self._refresh_adaptive_schedule(now)
        self._reconcile_extension(now)
        source = self.data.get("seasonal_profiles", {}).get("source")
        reason = "programme adaptatif" if source == "adaptive" else "programme adaptatif suspendu" if source == "suspended" else "programme"
        await self.async_evaluate(reason)
        await self.async_check_notifications()

    async def async_control(self, target: str, state: str) -> dict[str, Any]:
        now = dt_util.now()
        block = self.data[target]

        if not self._is_master() and not self.data.get("coordination", {}).get("allow_satellite_manual", True):
            return self.public_state()
        if state == "auto" and not self._is_master():
            return self.public_state()
        if target == "pac" and not block.get("write_enabled", False):
            return self.public_state()

        if target == "pump" and state == "auto":
            self.data["boost_until"] = None
            self.data.get("overrides", {}).pop("pump", None)
            self._record("pump", "auto", "reprise du programme")
            await self.store.async_save(self.data)
            await self.async_evaluate("reprise du programme")
            return self.public_state()

        if state not in ("on", "off"):
            return self.public_state()

        is_override = block.get("mode") in ("program", "automatic")
        if target == "pump":
            self.data["boost_until"] = None
            # A manual press on Start/Stop is authoritative and persistent.
            # The schedule cannot change the pump again until the user explicitly
            # chooses "Reprendre le programme". The override is stored, so it
            # also survives a Home Assistant restart.
            self.data.setdefault("overrides", {})["pump"] = {
                "state": state,
                "persistent": True,
                "since": now.isoformat(),
            }
            reason = "forçage manuel prioritaire"
        elif is_override:
            until = self._next_boundary(target, now)
            self.data["overrides"][target] = {"state": state, "until": until.isoformat()}
            reason = "dérogation manuelle"
        else:
            reason = "commande manuelle"

        if target == "light" and state == "on":
            minutes = max(0, min(1440, int(block.get("auto_off_minutes") or 0)))
            self.data["light_auto_off_at"] = (now + timedelta(minutes=minutes)).isoformat() if minutes else None
        changed = await self._set_entity(target, state, reason)
        if not changed:
            self._record(target, state, reason)
        await self.store.async_save(self.data)
        return self.public_state()

    async def async_boost(self, hours: int) -> dict[str, Any]:
        if not self._is_master():
            return self.public_state()
        hours = max(0, min(4, int(hours)))
        self.data["boost_until"] = (dt_util.now() + timedelta(hours=hours)).isoformat() if hours else None
        self.data.get("overrides", {}).pop("pump", None)
        self._record("pump", "on" if hours else "auto", f"boost {hours} h" if hours else "boost annulé")
        await self.store.async_save(self.data)
        await self.async_evaluate("boost")
        return self.public_state()

    async def async_extension(self, action: str) -> dict[str, Any]:
        if not self._is_master():
            return self.public_state()
        now = dt_util.now()
        block = self.data["pump"]
        source = self.data.get("seasonal_profiles", {}).get("source", "custom")
        if source == "adaptive":
            block.setdefault("extension", {}).update({"date": now.date().isoformat(), "status": "none", "target_hours": 0, "minutes": 0})
            self._record("pump", "extension", "prolongation neutralisée : programme adaptatif déjà dimensionné")
            await self.store.async_save(self.data)
            return self.public_state()
        base_minutes = scheduled_minutes(block.get("periods") or [])
        try:
            target_minutes = max(0, min(1440, round(float(block.get("recommended_hours") or 0) * 60)))
        except (TypeError, ValueError):
            target_minutes = 0
        missing = max(0, target_minutes - base_minutes)
        extension = block.setdefault("extension", {})
        if action == "approve" and missing:
            extension.update({"date": now.date().isoformat(), "status": "approved", "target_hours": target_minutes / 60, "minutes": missing})
            self._record("pump", "extension", f"prolongation validée +{missing} min")
        elif action == "ignore":
            extension.update({"date": now.date().isoformat(), "status": "ignored", "target_hours": 0, "minutes": missing})
            self._record("pump", "extension", "prolongation ignorée pour aujourd’hui")
        else:
            extension.update({"date": now.date().isoformat(), "status": "none", "target_hours": 0, "minutes": missing})
            self._record("pump", "extension", "décision de prolongation réinitialisée")
        await self.store.async_save(self.data)
        await self.async_evaluate("prolongation")
        return self.public_state()

    async def async_clear_history(self) -> dict[str, Any]:
        self.data["history"] = []
        await self.store.async_save(self.data)
        return self.public_state()

    async def async_test_notification(self) -> None:
        await self._notify("Test HA Pool Dashboard", "Les notifications piscine sont correctement configurées.")

    async def _notify(self, title: str, message: str) -> None:
        service = str(self.data.get("notify_service") or "").replace("notify.", "")
        if service and self.hass.services.has_service("notify", service):
            await self.hass.services.async_call("notify", service, {"title": title, "message": message}, blocking=False)
        else:
            await self.hass.services.async_call(
                "persistent_notification", "create", {"title": title, "message": message}, blocking=False
            )

    async def async_check_notifications(self) -> None:
        if not self.data.get("notifications_enabled"):
            return
        watch = self.data.get("watch") or {}
        messages: list[tuple[str, str]] = []
        ph_values: list[float] = []
        for entity_id in watch.get("ph_entities", []):
            state = self.hass.states.get(entity_id)
            try:
                value = float(state.state)
            except (AttributeError, TypeError, ValueError):
                continue
            ph_values.append(value)
        if ph_values:
            ph_average = sum(ph_values) / len(ph_values)
            if ph_average < 7.0 or ph_average > 7.7:
                messages.append(("ph", f"pH moyen hors plage : {ph_average:.2f}"))
        try:
            sanitizer = float(watch.get("sanitizer_level"))
            sanitizer_min = float(watch.get("sanitizer_min"))
        except (TypeError, ValueError):
            sanitizer = sanitizer_min = None
        if sanitizer is not None and sanitizer_min is not None and sanitizer < sanitizer_min:
            messages.append(("sanitizer", f"{watch.get('sanitizer_label', 'Désinfectant')} insuffisant : {sanitizer:.1f} mg/L"))
        next_measure_at = _iso(watch.get("next_measure_at"))
        if next_measure_at and dt_util.now() >= next_measure_at:
            messages.append(("remeasure", "La nouvelle mesure après traitement est maintenant attendue."))
        if watch.get("stock_low"):
            messages.append(("stock", f"Stock de désinfectant faible : {watch.get('stock_g', '—')} g"))
        maintenance_due = list(watch.get("maintenance_due") or [])
        if maintenance_due:
            messages.append(("maintenance", f"Entretien à effectuer : {', '.join(maintenance_due[:3])}"))
        if watch.get("weather_alert"):
            messages.append(("weather", str(watch["weather_alert"])))
        active_keys = {key for key, _message in messages}
        for stale_key in set(self.data.setdefault("last_notifications", {})) - active_keys:
            self.data["last_notifications"].pop(stale_key, None)
        for key, message in messages:
            previous = self.data.setdefault("last_notifications", {}).get(key)
            if previous == message:
                continue
            self.data["last_notifications"][key] = message
            await self._notify("Alerte piscine", message)
        if messages:
            await self.store.async_save(self.data)

    def public_state(self, include_history: bool = True) -> dict[str, Any]:
        now = dt_util.now()
        result = deepcopy(self.data)
        result["backend_available"] = True
        result.setdefault("coordination", {})["scheduler_active"] = self._is_master()
        result["coordination"]["status"] = "master" if self._is_master() else "satellite"
        for target in ("pump", "light", "pac"):
            block = result[target]
            periods = self._target_periods(target)
            block["scheduled_hours"] = round(scheduled_minutes(periods) / 60, 2)
            block["schedule_active"] = self._scheduled_active(target, now)
            block["next_boundary"] = self._next_boundary(target, now).isoformat()
            if target == "pump":
                base_periods = self.data["pump"].get("periods") or []
                base_minutes = scheduled_minutes(base_periods)
                block["base_scheduled_hours"] = round(base_minutes / 60, 2)
                block["base_next_boundary"] = next_boundary(base_periods, block["weekdays"], now).isoformat()
                try:
                    target_minutes = max(0, min(1440, round(float(block.get("recommended_hours") or 0) * 60)))
                except (TypeError, ValueError):
                    target_minutes = 0
                source = self.data.get("seasonal_profiles", {}).get("source", "custom")
                missing = 0 if source == "adaptive" else max(0, target_minutes - base_minutes)
                extension = block.get("extension") or {}
                current = source != "adaptive" and extension.get("date") == now.date().isoformat()
                approved = current and extension.get("status") == "approved"
                display_target_hours = extension.get("target_hours", 0) if approved else (target_minutes / 60 if target_minutes else 0)
                proposed = effective_periods(base_periods, display_target_hours)
                enabled = [period for period in proposed if period.get("enabled", True) and scheduled_minutes([period])]
                block["proposed_extension_minutes"] = missing
                block["proposed_end"] = enabled[-1].get("end", "") if enabled else ""
                block["extension_status"] = extension.get("status", "none") if current else "none"
                block["approved_extension_minutes"] = extension.get("minutes", 0) if approved else 0
        if not include_history:
            result.pop("history", None)
        return result
