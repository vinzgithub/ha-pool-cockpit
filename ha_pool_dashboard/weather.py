# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from __future__ import annotations
from pathlib import Path
from typing import Any
from .storage import load_json, unwrap_storage

def _norm(value: Any) -> str:
    return str(value or '').strip().lower().replace('-', '_')

def _entity_haystack(entity: dict[str, Any]) -> str:
    return ' '.join(_norm(entity.get(key)) for key in ('entity_id', 'unique_id', 'original_name', 'name'))


def detect_weather_entities(config_dir: Path) -> dict[str, Any]:
    path = config_dir / '.storage' / 'core.entity_registry'
    if not path.exists(): return {}
    entities = unwrap_storage(load_json(path)).get('entities', [])
    result: dict[str, Any] = {}
    weather = [e for e in entities if not e.get('disabled_by') and str(e.get('entity_id', '')).startswith('weather.')]
    if weather:
        weather.sort(key=lambda e: (0 if any(t in _norm(e.get('entity_id')) for t in ('home','maison','meteo')) else 1, e['entity_id']))
        result['weather'] = weather[0]['entity_id']

    alert_tokens = ('weather_alert', 'alerte_meteo', 'vigilance_meteo', 'vigilance')
    alerts = []
    for entity in entities:
        entity_id = str(entity.get('entity_id', ''))
        if entity.get('disabled_by') or not entity_id.startswith('sensor.'):
            continue
        haystack = _entity_haystack(entity)
        if any(token in haystack for token in alert_tokens):
            alerts.append(entity_id)
    alerts = sorted(set(alerts))
    if alerts:
        result['weather_alert'] = alerts[0]
        result['weather_alerts'] = alerts
    rules = {
        'air_temperature': ('temperature_exterieure','temperature_ext','outdoor_temperature','air_temperature'),
        'humidity': ('humidite_exterieure','outdoor_humidity'),
        'wind_speed': ('wind_speed','vitesse_vent'),
        'uv_index': ('uv_index','indice_uv','index_uv'),
    }
    for metric, tokens in rules.items():
        matches=[]
        for e in entities:
            entity_id=str(e.get('entity_id',''))
            if e.get('disabled_by') or not entity_id.startswith('sensor.'): continue
            haystack=_entity_haystack(e)
            score=sum(10 for token in tokens if token in haystack)
            if score: matches.append((score,entity_id))
        if matches:
            matches.sort(key=lambda item:(-item[0],item[1]))
            result[metric]=matches[0][1]
    return result
