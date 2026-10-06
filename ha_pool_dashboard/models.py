# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any

@dataclass(slots=True)
class EntityMatch:
    metric: str
    entity_id: str
    score: int
    reasons: list[str] = field(default_factory=list)

@dataclass(slots=True)
class PoolDevice:
    key: str
    brand: str
    name: str
    device_id: str | None
    entities: dict[str, str] = field(default_factory=dict)
    matches: dict[str, EntityMatch] = field(default_factory=dict)
    metadata: dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return {
            "key": self.key,
            "brand": self.brand,
            "name": self.name,
            "device_id": self.device_id,
            "entities": dict(self.entities),
            "metadata": dict(self.metadata),
            "matches": {
                key: {
                    "entity_id": value.entity_id,
                    "score": value.score,
                    "reasons": list(value.reasons),
                }
                for key, value in self.matches.items()
            },
        }
