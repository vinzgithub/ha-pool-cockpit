# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from __future__ import annotations

"""Journal persistant des traitements piscine.

FIX14.5 : ce stockage est volontairement séparé du moteur de programmation.
Il ne pilote aucun équipement et ne modifie aucune recommandation métier.
"""

from copy import deepcopy
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

STORAGE_VERSION = 1
STORAGE_KEY = "ha_pool_dashboard.treatment_journal"
MAX_HISTORY = 500


def _clean_string(value: Any, limit: int = 240) -> str:
    return str(value or "")[:limit]


def _clean_number(value: Any) -> float | int | None:
    if value in (None, ""):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if not (number == number and abs(number) != float("inf")):
        return None
    return int(number) if number.is_integer() else number


def sanitize_treatment_history(history: Any) -> list[dict[str, Any]]:
    """Normalise un journal reçu du navigateur avant écriture dans .storage."""
    if not isinstance(history, list):
        return []
    result: list[dict[str, Any]] = []
    for raw in history[:MAX_HISTORY]:
        if not isinstance(raw, dict):
            continue
        entry = {
            "date": _clean_string(raw.get("date"), 64),
            "kind": _clean_string(raw.get("kind"), 64),
            "product": _clean_string(raw.get("product"), 160),
            "detail": _clean_string(raw.get("detail"), 320),
            "dose_unit": _clean_string(raw.get("dose_unit"), 16),
            "treatment": _clean_string(raw.get("treatment"), 32),
        }
        for key in (
            "dose_amount",
            "dose_g",
            "dose_ml",
            "setting",
            "volume_m3",
            "sanitizer_level",
            "feeder_setting",
        ):
            entry[key] = _clean_number(raw.get(key))
        entry["next_measure_at"] = _clean_string(raw.get("next_measure_at"), 64)
        # Une entrée sans date ni type n'apporte rien au journal.
        if not entry["date"] and not entry["kind"]:
            continue
        result.append(entry)
    return result[:MAX_HISTORY]


class TreatmentJournalStore:
    """Persistance durable du journal dans Home Assistant `.storage`."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.history: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        payload = await self.store.async_load() or {}
        self.history = sanitize_treatment_history(payload.get("history") or [])

    async def async_save(self, history: Any) -> list[dict[str, Any]]:
        self.history = sanitize_treatment_history(history)
        await self.store.async_save({"history": self.history})
        return deepcopy(self.history)

    def public_history(self) -> list[dict[str, Any]]:
        return deepcopy(self.history)
