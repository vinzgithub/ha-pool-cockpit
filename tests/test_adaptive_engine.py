"""Moteur adaptatif de filtration : calcul de zéro, majoration unique, fraîcheur.

Scénarios de non-régression de la v4.2.2 :
- la durée produite par un calcul n'est jamais réinjectée dans le suivant ;
- la majoration de fréquentation n'est appliquée qu'une fois ;
- une mesure d'eau périmée ne dimensionne plus la filtration.
"""

from __future__ import annotations

import sys
import types
import asyncio
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "home_assistant" / "custom_components" / "ha_pool_dashboard"
PARIS_WINTER = timezone(timedelta(hours=1))
NOW = datetime(2026, 11, 14, 8, 0, tzinfo=PARIS_WINTER)

_SPEC = spec_from_file_location("v422_schedule_utils", BACKEND / "schedule_utils.py")
assert _SPEC and _SPEC.loader
UTILS = module_from_spec(_SPEC)
_SPEC.loader.exec_module(UTILS)


# --- Fonctions pures -------------------------------------------------------

def test_base_duration_is_half_water_temperature_rounded_up() -> None:
    hours, context = UTILS.adaptive_target_hours(water=12.7, hydraulic_hours=2, reference_hours=5)
    assert hours == 7
    assert context is None


def test_busy_bonus_is_added_exactly_once() -> None:
    hours, context = UTILS.adaptive_target_hours(
        water=12.7, hydraulic_hours=2, reference_hours=5, recent_load="busy"
    )
    assert hours == 9
    assert context == "busy"


def test_missing_water_uses_seasonal_floor_but_cold_water_can_reduce_duration() -> None:
    assert UTILS.adaptive_target_hours(water=2.0, hydraulic_hours=2, reference_hours=5)[0] == 2
    assert UTILS.adaptive_target_hours(water=None, hydraulic_hours=2, reference_hours=5)[0] == 5
    assert UTILS.adaptive_target_hours(water=None, hydraulic_hours=15, reference_hours=13)[0] == 15


def test_profile_duration_is_last_resort_without_any_measurement() -> None:
    assert UTILS.adaptive_target_hours(water=None, hydraulic_hours=None, reference_hours=5)[0] == 5


def test_reinforcement_rules_keep_their_priority_and_bounds() -> None:
    target = UTILS.adaptive_target_hours
    assert target(water=20, hydraulic_hours=2, reference_hours=5, water_condition="green") == (24.0, "water_problem")
    assert target(water=20, hydraulic_hours=2, reference_hours=5, recent_load="polluted") == (24.0, "water_problem")
    assert target(water=29, hydraulic_hours=2, reference_hours=5, heat_alert=True) == (24.0, "heat_alert")
    assert target(water=29, hydraulic_hours=2, reference_hours=5, sanitizer_low=True) == (24.0, "sanitizer_hot")
    assert target(water=5, hydraulic_hours=2, reference_hours=3, cold_alert=True, base_profile="winter") == (24.0, "frost")
    assert target(water=5, hydraulic_hours=2, reference_hours=5, cold_alert=True, base_profile="autumn") == (3.0, None)
    assert target(water=31, hydraulic_hours=2, reference_hours=5) == (20.0, "very_hot_water")
    assert target(water=29, hydraulic_hours=2, reference_hours=5) == (17.0, "hot_water")
    assert target(water=46, hydraulic_hours=2, reference_hours=5, recent_load="busy") == (24.0, "busy")


def test_hydraulic_floor_is_one_theoretical_turnover() -> None:
    assert UTILS.hydraulic_floor_hours(16, 10) == 2
    assert UTILS.hydraulic_floor_hours(5, 10) == 1
    assert UTILS.hydraulic_floor_hours(16, 0) is None
    assert UTILS.hydraulic_floor_hours("", None) is None


def test_measurement_freshness_window() -> None:
    assert UTILS.measurement_is_fresh(NOW - timedelta(hours=23), NOW)
    assert not UTILS.measurement_is_fresh(NOW - timedelta(hours=25), NOW)
    assert not UTILS.measurement_is_fresh(None, NOW)
    assert not UTILS.measurement_is_fresh((NOW - timedelta(hours=1)).replace(tzinfo=None), NOW)
    assert not UTILS.measurement_is_fresh(NOW + timedelta(seconds=1), NOW)
    assert not UTILS.measurement_is_fresh("invalid", NOW)
    assert UTILS.measurement_is_fresh(NOW - timedelta(hours=24), NOW)
    assert not UTILS.measurement_is_fresh(NOW - timedelta(hours=24, seconds=1), NOW)


# --- Planificateur complet, Home Assistant simulé --------------------------

class _State:
    def __init__(self, value: str, reported: datetime | None = None, attributes: dict | None = None) -> None:
        self.state = value
        self.attributes = attributes or {"unit_of_measurement": "°C"}
        self.last_updated = reported
        self.last_reported = reported


class _States:
    def __init__(self) -> None:
        self.items: dict[str, _State] = {}

    def get(self, entity_id: str) -> _State | None:
        return self.items.get(entity_id)


class _Hass:
    def __init__(self) -> None:
        self.states = _States()
        self.commands = []
        self.events = []

        async def call(domain, service, data, **_kwargs):
            self.commands.append((domain, service, data))
            entity_id = data.get("entity_id")
            if entity_id:
                self.states.items[entity_id] = _State("on" if service == "turn_on" else "off", NOW)

        self.services = types.SimpleNamespace(async_call=call)
        self.bus = types.SimpleNamespace(
            async_fire=lambda *args: self.events.append(args),
            async_listen=lambda *_args: None,
        )


@pytest.fixture
def engine(monkeypatch):
    """Charge scheduler.py avec un Home Assistant minimal et une horloge pilotée."""

    clock = {"now": NOW}

    def _module(name: str, **members):
        module = types.ModuleType(name)
        module.__dict__.update(members)
        monkeypatch.setitem(sys.modules, name, module)
        return module

    class _Store:
        def __init__(self, *_args, **_kwargs) -> None:
            self.saved = None

        async def async_save(self, data):
            self.saved = deepcopy(data)

        async def async_load(self):
            return deepcopy(self.saved)

    _module("homeassistant")
    _module("homeassistant.const", EVENT_STATE_CHANGED="state_changed")
    _module("homeassistant.core", HomeAssistant=object, callback=lambda function: function)
    _module("homeassistant.helpers")
    _module("homeassistant.helpers.event", async_track_time_interval=lambda *_a, **_k: None)
    _module("homeassistant.helpers.storage", Store=_Store)
    dt_module = _module(
        "homeassistant.util.dt",
        now=lambda: clock["now"],
        utcnow=lambda: clock["now"],
        as_local=lambda value: value,
        parse_datetime=lambda value: datetime.fromisoformat(str(value).replace("Z", "+00:00")),
    )
    _module("homeassistant.util", dt=dt_module)

    package = types.ModuleType("v422_backend")
    package.__path__ = [str(BACKEND)]
    monkeypatch.setitem(sys.modules, "v422_backend", package)
    for name in ("const", "schedule_utils", "scheduler"):
        spec = spec_from_file_location(f"v422_backend.{name}", BACKEND / f"{name}.py")
        assert spec and spec.loader
        module = module_from_spec(spec)
        monkeypatch.setitem(sys.modules, f"v422_backend.{name}", module)
        spec.loader.exec_module(module)

    hass = _Hass()
    scheduler = sys.modules["v422_backend.scheduler"].PoolScheduler(hass)
    scheduler.data = scheduler._normalize(scheduler.data)
    scheduler.data["seasonal_profiles"]["source"] = "adaptive"
    scheduler.data["watch"].update(
        temperature_entities=["sensor.eau"],
        air_temperature_entity="sensor.air",
        pool_volume_m3=16,
        pump_flow_m3h=10,
        recent_load="normal",
        context_updated_at=NOW.isoformat(),
    )
    hass.states.items["sensor.eau"] = _State("12.7", NOW)
    hass.states.items["sensor.air"] = _State("3.3", NOW)

    def cycles(count: int, step: timedelta = timedelta(seconds=30)) -> list[float]:
        results = []
        for _ in range(count):
            clock["now"] += step
            scheduler._refresh_adaptive_schedule(clock["now"])
            results.append(scheduler.data["pump"]["recommended_hours"])
        return results

    return types.SimpleNamespace(scheduler=scheduler, hass=hass, clock=clock, cycles=cycles)


def test_busy_bonus_does_not_accumulate_over_cycles(engine) -> None:
    engine.scheduler.data["watch"]["recent_load"] = "busy"
    engine.scheduler.data["pump"]["recommended_hours"] = 9  # valeur envoyée par le dashboard
    assert engine.cycles(20) == [9.0] * 20
    assert engine.scheduler.data["pump"]["periods"][0] == {"enabled": True, "start": "02:00", "end": "11:00"}
    assert engine.scheduler.data["watch"]["adaptive_context"] == "busy"


def test_previous_recommendation_never_blocks_a_decrease(engine) -> None:
    engine.scheduler.data["pump"]["recommended_hours"] = 12  # ancienne durée, eau à 24 °C
    assert engine.cycles(1) == [7.0]
    assert engine.scheduler.data["pump"]["periods"][0] == {"enabled": True, "start": "02:00", "end": "09:00"}


def test_duration_follows_water_cooling(engine) -> None:
    water = engine.hass.states.items["sensor.eau"]
    engine.hass.states.items["sensor.air"].state = "18"
    water.state = "24"
    assert engine.cycles(1) == [12.0]
    water.state = "12.7"
    assert engine.cycles(1) == [7.0]


def test_stale_water_measurement_is_ignored(engine) -> None:
    engine.clock["now"] += timedelta(days=30)  # sonde retirée de l'eau, état figé
    assert engine.cycles(1) == [5.0]  # repli : profil automne, pas seulement hydraulique
    watch = engine.scheduler.data["watch"]
    assert watch["adaptive_water_temperature_c"] is None
    assert watch["adaptive_water_status"] == "stale"


def test_fresh_sensor_still_counts_when_another_one_is_stale(engine) -> None:
    engine.scheduler.data["watch"]["temperature_entities"] = ["sensor.eau", "sensor.eau_2"]
    engine.hass.states.items["sensor.eau_2"] = _State("30", NOW - timedelta(days=3))
    assert engine.cycles(1) == [7.0]
    assert engine.scheduler.data["watch"]["adaptive_water_status"] == "fresh"


def test_water_status_distinguishes_unavailable_and_unconfigured(engine) -> None:
    engine.hass.states.items["sensor.eau"].state = "unavailable"
    engine.cycles(1)
    assert engine.scheduler.data["watch"]["adaptive_water_status"] == "unavailable"
    engine.scheduler.data["watch"]["temperature_entities"] = []
    engine.cycles(1)
    assert engine.scheduler.data["watch"]["adaptive_water_status"] == "none"


def test_custom_schedule_is_left_untouched(engine) -> None:
    engine.scheduler.data["seasonal_profiles"]["source"] = "custom"
    before = [dict(period) for period in engine.scheduler.data["pump"]["periods"]]
    engine.scheduler.data["pump"]["recommended_hours"] = 9
    engine.cycles(3)
    assert engine.scheduler.data["pump"]["periods"] == before
    assert engine.scheduler.data["pump"]["recommended_hours"] == 9


@pytest.mark.parametrize("value", [float('nan'), float('inf'), -float('inf'), 'invalid', -1, 0])
def test_invalid_hydraulics_cannot_crash_scheduler(value):
    assert UTILS.hydraulic_floor_hours(value, 10) is None
    assert UTILS.hydraulic_floor_hours(16, value) is None


def test_extreme_hydraulics_are_bounded():
    assert UTILS.hydraulic_floor_hours(1e308, 1e-308) == 24


@pytest.mark.parametrize("loss,status", [("unavailable", "unavailable"), ("unknown", "unavailable"),
                                        ("stale", "stale"), ("removed", "none")])
def test_summer_temperature_loss_and_recovery(engine, loss, status):
    engine.clock['now'] = datetime(2026, 7, 15, 10, tzinfo=PARIS_WINTER)
    water = engine.hass.states.items['sensor.eau']
    water.state, water.last_reported = '24', engine.clock['now']
    engine.hass.states.items['sensor.air'].state = '20'
    assert engine.cycles(1) == [12]
    if loss == 'removed':
        # The existing dashboard can send [] when all devices are stale.
        engine.scheduler.data['watch']['temperature_entities'] = []
    elif loss == 'stale':
        water.last_reported = engine.clock['now'] - timedelta(days=2)
    else:
        water.state = loss
    assert engine.cycles(5) == [13] * 5
    assert engine.scheduler.data['watch']['adaptive_water_status'] == status
    engine.scheduler.data['watch']['temperature_entities'] = ['sensor.eau']
    water.state, water.last_reported = '12.7', engine.clock['now']
    assert engine.cycles(1) == [7]


def test_fallback_uses_hot_effective_profile_outside_summer(engine):
    engine.hass.states.items['sensor.eau'].state = 'unavailable'
    engine.hass.states.items['sensor.air'].state = '32'
    assert engine.cycles(1) == [13]
    assert engine.scheduler.data['watch']['adaptive_effective_profile'] == 'summer'


def test_fallback_respects_configured_profile_and_hydraulics(engine):
    scheduler = engine.scheduler
    scheduler.data['seasonal_profiles'].update(follow_astronomical=False, current='summer')
    scheduler.data['seasonal_profiles']['profiles']['summer']['periods'] = [
        {'enabled': True, 'start': '09:00', 'end': '20:00'}]
    engine.hass.states.items['sensor.eau'].state = 'unavailable'
    assert engine.cycles(1) == [11]
    scheduler.data['watch'].update(pool_volume_m3=160, pump_flow_m3h=10)
    assert engine.cycles(1) == [16]


@pytest.mark.parametrize('value', ['NaN', 'Infinity', '-Infinity', 'invalid', '-6', '61'])
def test_invalid_water_uses_fallback(engine, value):
    engine.hass.states.items['sensor.eau'].state = value
    assert engine.cycles(1) == [5]
    assert engine.scheduler.data['watch']['adaptive_water_status'] == 'unavailable'


def test_last_reported_supports_unchanged_but_repeated_measurements(engine):
    water = engine.hass.states.items['sensor.eau']
    water.last_updated = NOW - timedelta(days=10)
    assert engine.cycles(1) == [7]
    water.last_reported = None
    assert engine.cycles(1) == [5]
    water.last_updated = engine.clock['now']
    assert engine.cycles(1) == [7]


@pytest.mark.parametrize('reported', [None, 'invalid', NOW.replace(tzinfo=None), NOW + timedelta(days=1)])
def test_unverifiable_timestamp_is_not_fresh(engine, reported):
    water = engine.hass.states.items['sensor.eau']
    water.last_reported = water.last_updated = reported
    assert engine.cycles(1) == [5]
    assert engine.scheduler.data['watch']['adaptive_water_status'] == 'stale'


def test_explicitly_restored_measurement_is_not_fresh(engine):
    engine.hass.states.items['sensor.eau'].attributes['restored'] = True
    assert engine.cycles(1) == [5]
    assert engine.scheduler.data['watch']['adaptive_water_status'] == 'stale'


def test_fahrenheit_and_duplicate_entities(engine):
    engine.scheduler.data['watch']['temperature_entities'] = ['sensor.eau', 'sensor.eau', 'sensor.second']
    engine.hass.states.items['sensor.eau'] = _State('68', NOW, {'unit_of_measurement': '°F'})
    engine.hass.states.items['sensor.second'] = _State('24', NOW)
    assert engine.cycles(1) == [11]
    assert engine.scheduler.data['watch']['adaptive_water_temperature_c'] == 22


def test_freshness_uses_elapsed_time_across_dst():
    from zoneinfo import ZoneInfo
    paris = ZoneInfo('Europe/Paris')
    reported = datetime(2026, 10, 24, 12, tzinfo=paris)
    now = datetime(2026, 10, 25, 12, tzinfo=paris)
    assert not UTILS.measurement_is_fresh(reported, now)  # 25 real hours


def test_stale_air_falls_back_to_fresh_weather(engine):
    engine.hass.states.items['sensor.air'].last_reported = NOW - timedelta(days=2)
    engine.scheduler.data['watch']['weather_entity'] = 'weather.pool'
    engine.hass.states.items['weather.pool'] = _State('sunny', NOW, {'temperature': 86, 'temperature_unit': '°F'})
    engine.cycles(1)
    assert engine.scheduler.data['watch']['adaptive_air_temperature_c'] == 30
    engine.hass.states.items['weather.pool'].last_reported = NOW - timedelta(days=2)
    engine.cycles(1)
    assert engine.scheduler.data['watch']['adaptive_air_temperature_c'] is None


@pytest.mark.parametrize('timestamp', ['', 'invalid', (NOW - timedelta(minutes=16)).isoformat(),
                                       (NOW + timedelta(days=1)).isoformat()])
def test_stale_frontend_context_cannot_force_24h(engine, timestamp):
    engine.hass.states.items['sensor.eau'].state = '29'
    engine.scheduler.data['watch'].update(context_updated_at=timestamp, weather_heat_alert=True,
                                         sanitizer_level=0, sanitizer_min=1)
    assert engine.cycles(1) == [17]
    assert engine.scheduler.data['watch']['adaptive_context'] == 'hot_water'


def test_fresh_frontend_rules_expire_without_dashboard(engine):
    engine.hass.states.items['sensor.eau'].state = '29'
    engine.scheduler.data['watch'].update(sanitizer_level=0, sanitizer_min=1)
    assert engine.cycles(1) == [24]
    assert engine.scheduler.data['watch']['adaptive_context'] == 'sanitizer_hot'
    engine.clock['now'] += timedelta(minutes=16)
    assert engine.cycles(1) == [17]


def test_thermal_alert_entity_must_be_live(engine):
    engine.hass.states.items['sensor.eau'].state = '29'
    engine.scheduler.data['watch']['weather_alert_entity'] = 'sensor.alert'
    alert = _State('orange', NOW, {'Canicule': 'Orange'})
    engine.hass.states.items['sensor.alert'] = alert
    assert engine.cycles(1) == [24]
    alert.last_reported = NOW - timedelta(days=2)
    assert engine.cycles(1) == [17]
    alert.last_reported, alert.state = engine.clock['now'], 'unavailable'
    assert engine.cycles(1) == [17]


@pytest.mark.parametrize('source', ['custom', 'suspended'])
def test_nonadaptive_state_is_untouched_even_after_temperature_loss(engine, source):
    scheduler = engine.scheduler
    scheduler.data['seasonal_profiles']['source'] = source
    before = deepcopy(scheduler.data)
    engine.hass.states.items['sensor.eau'].state = 'unavailable'
    assert scheduler._refresh_adaptive_schedule(NOW) is False
    assert scheduler.data == before


@pytest.mark.parametrize('source', ['custom', 'suspended'])
def test_approved_extension_survives_ticks_without_changing_base_periods(engine, source):
    scheduler = engine.scheduler
    scheduler.data['seasonal_profiles']['source'] = source
    scheduler.data['pump'].update(mode='automatic', recommended_hours=15)
    before = deepcopy(scheduler.data['pump']['periods'])  # 13 h
    asyncio.run(scheduler.async_extension('approve'))
    asyncio.run(scheduler.async_tick(NOW))
    assert scheduler.data['pump']['periods'] == before
    state = scheduler.public_state()['pump']
    assert state['extension_status'] == 'approved'
    assert state['approved_extension_minutes'] == 120
    assert state['scheduled_hours'] == 15
    engine.clock['now'] += timedelta(days=1)
    asyncio.run(scheduler.async_tick(engine.clock['now']))
    assert scheduler.public_state()['pump']['extension_status'] == 'none'
    assert scheduler.public_state()['pump']['scheduled_hours'] == 13


def test_adaptive_does_not_stack_extension(engine):
    scheduler = engine.scheduler
    engine.cycles(1)
    scheduler.data['pump'].update(mode='automatic', extension={
        'date': NOW.date().isoformat(), 'status': 'approved', 'target_hours': 15, 'minutes': 480})
    asyncio.run(scheduler.async_tick(NOW))
    assert scheduler.public_state()['pump']['scheduled_hours'] == 7
    assert scheduler.public_state()['pump']['extension_status'] == 'none'


@pytest.mark.parametrize('manual_state', ['on', 'off'])
def test_manual_override_survives_recalculation_restart_and_only_explicit_resume_clears_it(engine, manual_state):
    scheduler = engine.scheduler
    scheduler.data['pump'].update(mode='automatic', entity_id='switch.pump')
    engine.hass.states.items['switch.pump'] = _State('off', NOW)
    asyncio.run(scheduler.async_control('pump', manual_state))
    engine.hass.states.items['sensor.eau'].state = 'unavailable'
    asyncio.run(scheduler.async_tick(NOW))
    restarted = type(scheduler)(engine.hass)
    restarted.store.saved = deepcopy(scheduler.store.saved)
    asyncio.run(restarted.async_load())
    assert restarted._desired_state('pump', NOW) == manual_state
    assert engine.hass.states.items['switch.pump'].state == manual_state
    assert restarted.data['overrides']['pump']['persistent'] is True
    asyncio.run(restarted.async_control('pump', 'auto'))
    assert 'pump' not in restarted.data['overrides']


def test_frontend_save_cannot_reinject_old_recommendation(engine):
    scheduler = engine.scheduler
    for _ in range(5):
        asyncio.run(scheduler.async_save_config({'pump': {'recommended_hours': 24},
                     'watch': {'context_updated_at': NOW.isoformat(), 'recent_load': 'busy'}}))
        assert scheduler.data['pump']['recommended_hours'] == 9


def test_boost_and_satellite_and_pac_lock_remain_effective(engine):
    scheduler = engine.scheduler
    scheduler.data['pump'].update(mode='automatic', entity_id='switch.pump')
    asyncio.run(scheduler.async_boost(2))
    engine.hass.states.items['sensor.eau'].state = 'unavailable'
    asyncio.run(scheduler.async_tick(NOW))
    assert scheduler._desired_state('pump', NOW) == 'on'
    scheduler.data['coordination']['role'] = 'satellite'
    engine.hass.commands.clear()
    asyncio.run(scheduler.async_tick(NOW))
    assert not engine.hass.commands
    scheduler.data['coordination']['role'] = 'master'
    scheduler.data['pac']['command_entity'] = 'switch.pac'
    asyncio.run(scheduler.async_control('pac', 'on'))
    assert not engine.hass.commands
