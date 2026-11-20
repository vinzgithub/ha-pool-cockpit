# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
"""Pure wintering configuration, sample validation and frost state machine."""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta, timezone
import math

from .schedule_utils import measurement_is_fresh, schedule_is_active

MODES = ('normal', 'hivernage_actif', 'maintenance')
EQUIPMENT_STATUSES = ('en_service', 'hiverne', 'maintenance', 'indisponible')
DEFAULT_WINTERING = {
    'schema': 1, 'revision': 0, 'mode': 'normal', 'previous_mode': 'normal',
    'confirmed_at': None, 'confirmed_by': None,
    'base_hours': 4.0, 'start': '02:00', 'hydraulic_ready': True,
    'dry_run_entity': '', 'flow_entity': '',
    'equipment': {'pump': {'status': 'en_service'}, 'pac': {'status': 'en_service'}},
    'frost': {'enabled': False, 'temperature_entity': '', 'sample_time_entity': '',
              'enter_c': 3.0, 'exit_c': 5.0, 'entry_delay_seconds': 60,
              'exit_delay_seconds': 600, 'minimum_run_seconds': 900,
              'max_age_minutes': 15, 'command_timeout_seconds': 120},
}


def parse_time(value):
    try:
        parsed = value if isinstance(value, datetime) else datetime.fromisoformat(str(value).replace('Z', '+00:00'))
        return parsed if parsed.utcoffset() is not None else None
    except (ValueError, TypeError, OverflowError):
        return None


def elapsed(now, since):
    stamp = parse_time(since)
    return max(0.0, now.timestamp() - stamp.timestamp()) if stamp else 0.0


def finite(value):
    try:
        result = float(value)
        return result if math.isfinite(result) else None
    except (TypeError, ValueError, OverflowError):
        return None


def normalize_wintering(stored=None):
    """Add absent fields without changing old schedules or activating a mode."""
    result = deepcopy(DEFAULT_WINTERING)
    stored = stored if isinstance(stored, dict) else {}
    for key in result:
        if key in stored and key not in ('frost', 'equipment', 'schema'):
            result[key] = deepcopy(stored[key])
    if stored.get('schema', 1) > 1:
        raise ValueError('Schéma hivernage plus récent : restauration nécessaire.')
    result['frost'].update(stored.get('frost') or {})
    result['equipment'].update(deepcopy(stored.get('equipment') or {}))
    # Unknown/future operation modes fail closed, never become normal silently.
    if result['mode'] not in MODES:
        result['mode'] = 'maintenance'
        result['hydraulic_ready'] = False
    return validate_wintering(result)


def validate_wintering(config):
    if config.get('mode') not in MODES:
        raise ValueError('Mode non pris en charge (hivernage passif réservé).')
    ranges = {'base_hours': (0.25, 24)}
    for key, (low, high) in ranges.items():
        number = finite(config.get(key))
        if number is None or not low <= number <= high:
            raise ValueError('Durée hivernale attendue entre 0,25 et 24 h.')
        config[key] = number
    start = str(config.get('start', ''))
    if len(start) != 5 or start[2] != ':' or not start.replace(':', '').isdigit() or not (0 <= int(start[:2]) < 24 and 0 <= int(start[3:]) < 60):
        raise ValueError('Heure de départ invalide.')
    if not isinstance(config.get('hydraulic_ready'), bool):
        raise ValueError('Confirmer la disponibilité hydraulique.')
    frost = config['frost']
    if not isinstance(frost.get('enabled'), bool):
        raise ValueError('Activation antigel invalide.')
    for key, low, high in (
        ('enter_c', -10, 10), ('exit_c', -9, 15), ('entry_delay_seconds', 0, 600),
        ('exit_delay_seconds', 30, 3600), ('minimum_run_seconds', 60, 7200),
        ('max_age_minutes', 1, 60), ('command_timeout_seconds', 30, 600),
    ):
        number = finite(frost.get(key))
        if number is None or not low <= number <= high:
            raise ValueError(f'Paramètre antigel invalide : {key}.')
        frost[key] = number
    if frost['exit_c'] <= frost['enter_c']:
        raise ValueError('Le seuil de sortie doit être supérieur au seuil d’entrée.')
    for key in ('temperature_entity', 'sample_time_entity'):
        if frost[key] and not str(frost[key]).startswith('sensor.'):
            raise ValueError('Choisir une entité sensor pour les mesures antigel.')
    if frost['enabled'] and not frost['temperature_entity']:
        raise ValueError('Choisir un capteur local avant d’activer l’antigel.')
    for key in ('dry_run_entity', 'flow_entity'):
        if config[key] and not str(config[key]).startswith('binary_sensor.'):
            raise ValueError('Le verrou à sec et le débit doivent être des binary_sensor.')
    for equipment in config['equipment'].values():
        if not isinstance(equipment, dict) or equipment.get('status') not in EQUIPMENT_STATUSES:
            raise ValueError('Statut équipement invalide.')
    return config


def sample_health(state, now, *, stamp=None, max_age_hours=24, after=None, low=-5, high=60):
    """Prefer the acquisition timestamp; never certify a restored HA cache."""
    if not state or str(state.state).lower() in ('unknown', 'unavailable', 'none'):
        return None, 'unavailable', None
    value = finite(state.state)
    if value is None:
        return None, 'incoherent', None
    unit = str(state.attributes.get('unit_of_measurement', '')).lower()
    if unit in ('f', '°f'):
        value = (value - 32) * 5 / 9
    if not math.isfinite(value) or not low <= value <= high:
        return None, 'incoherent', None
    # An explicit sample time is required for wintering sources. HA state
    # timestamps remain the compatibility path only for unmapped old sources.
    reported = parse_time(stamp)
    if state.attributes.get('restored') or not measurement_is_fresh(reported, now, max_age_hours):
        return None, 'stale', reported.isoformat() if reported else None
    reactivated = parse_time(after)
    if reactivated and reported <= reactivated:
        return None, 'awaiting_sample', reported.isoformat()
    return value, 'fresh', reported.isoformat()


def frost_transition(config, previous, temperature, health, now):
    state = deepcopy(previous or {})
    active = bool(state.get('requested'))
    state.update(temperature_c=temperature, sensor_status=health, evaluated_at=now.isoformat())
    if not config['enabled']:
        return {**state, 'requested': False, 'status': 'disabled', 'entry_since': None,
                'exit_since': None, 'active_since': None}
    if temperature is None or health != 'fresh':
        # On loss of a sensor, keep an existing demand but never invent a new
        # safe temperature or an unconfigured emergency-start policy.
        state.update(requested=active, status='unconfirmed', entry_since=None, exit_since=None)
        return state
    if not active:
        state['exit_since'] = None
        if temperature <= config['enter_c']:
            state['entry_since'] = state.get('entry_since') or now.isoformat()
            if elapsed(now, state['entry_since']) >= config['entry_delay_seconds']:
                state.update(requested=True, active_since=now.isoformat(), entry_since=None, status='requested')
            else:
                state.update(requested=False, status='entry_delay')
        else:
            state.update(requested=False, entry_since=None, status='monitoring')
    else:
        state['entry_since'] = None
        if temperature >= config['exit_c']:
            state['exit_since'] = state.get('exit_since') or now.isoformat()
            if elapsed(now, state['exit_since']) >= config['exit_delay_seconds'] and elapsed(now, state.get('active_since')) >= config['minimum_run_seconds']:
                state.update(requested=False, active_since=None, exit_since=None, status='monitoring')
            else:
                state['status'] = 'exit_delay'
        else:
            state.update(exit_since=None, status='requested')
    return state


def day_program(periods, weekdays, now):
    """Real elapsed intervals for a local day, including its 23/25 h DST days."""
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = midnight + timedelta(days=1)
    cursor, finish = midnight.astimezone(timezone.utc), end.astimezone(timezone.utc)
    segments = []
    while cursor < finish:
        active = schedule_is_active(periods, weekdays, cursor.astimezone(now.tzinfo))
        following = min(cursor + timedelta(minutes=1), finish)
        if active:
            if segments and segments[-1]['end'] == cursor.isoformat():
                segments[-1]['end'] = following.isoformat()
            else:
                segments.append({'start': cursor.isoformat(), 'end': following.isoformat(), 'state': 'on'})
        cursor = following
    return {'start': midnight.isoformat(), 'end': end.isoformat(), 'segments': segments,
            'elapsed_hours': (finish.timestamp() - midnight.timestamp()) / 3600}
