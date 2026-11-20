"""T01–T16: deterministic HA fixture, no network or physical pump."""
import asyncio
from copy import deepcopy
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import pytest
from test_adaptive_engine import engine, _State, NOW


def configure(engine, **changes):
    scheduler = engine.scheduler
    return asyncio.run(scheduler.async_configure_wintering({
        'confirmed': True, 'expected_revision': scheduler._winter_config()['revision'], 'changes': changes}, 'test-admin'))


def sources(engine):
    engine.scheduler.data['watch']['sensor_sources'] = [
        {'key': 'blue', 'name': 'Blue Connect', 'temperature': 'sensor.eau', 'ph': 'sensor.ph', 'last_analysis': 'sensor.sample'},
        {'key': 'flipr', 'name': 'Flipr', 'temperature': 'sensor.flipr', 'ph': 'sensor.ph2', 'last_analysis': 'sensor.sample2'},
    ]
    for key in ('sensor.sample', 'sensor.sample2'):
        engine.hass.states.items[key] = _State(engine.clock['now'].isoformat(), engine.clock['now'])
    engine.hass.states.items['sensor.flipr'] = _State('12.7', engine.clock['now'])


def winter(engine):
    sources(engine)
    configure(engine, mode='hivernage_actif', base_hours=4, start='02:00',
              equipment={'blue': 'hiverne', 'flipr': 'hiverne', 'pac': 'hiverne'})


def frost(engine, **params):
    engine.scheduler.data['pump'].update(entity_id='switch.pump', mode='automatic')
    engine.hass.states.items['switch.pump'] = _State('off', engine.clock['now'])
    engine.hass.states.items['sensor.local'] = _State('2', engine.clock['now'])
    engine.hass.states.items['sensor.local_sample'] = _State(engine.clock['now'].isoformat(), engine.clock['now'])
    configure(engine, frost={'enabled': True, 'temperature_entity': 'sensor.local',
                            'sample_time_entity': 'sensor.local_sample', **params})


def tick(engine, seconds=30, temperature=None):
    engine.clock['now'] += timedelta(seconds=seconds)
    if temperature is not None:
        engine.hass.states.items['sensor.local'].state = str(temperature)
        engine.hass.states.items['sensor.local_sample'].state = engine.clock['now'].isoformat()
    asyncio.run(engine.scheduler.async_tick(engine.clock['now']))


def test_T01_wintered_sources_never_drive_duration_or_quality_alerts(engine):
    winter(engine)
    engine.hass.states.items['sensor.eau'].state = '35'  # changing outside water
    engine.hass.states.items['sensor.ph'] = _State('2', NOW)
    engine.scheduler.data['watch']['ph_entities'] = ['sensor.ph']
    engine.scheduler.data['notifications_enabled'] = True
    tick(engine)
    state = engine.scheduler.public_state()
    assert state['pump']['recommended_hours'] == 4
    assert state['watch']['adaptive_water_temperature_c'] is None
    assert state['watch']['adaptive_water_status'] == 'hiverne'
    assert state['pump']['periods'][0] == {'enabled': True, 'start': '02:00', 'end': '06:00'}
    assert not any('pH moyen' in str(call) for call in engine.hass.commands)


def test_T02_T03_T04_normal_samples_and_bonus(engine):
    sources(engine)
    assert engine.cycles(1) == [7]
    engine.scheduler.data['watch']['recent_load'] = 'busy'
    assert engine.cycles(10) == [9]*10
    engine.scheduler.data['watch']['recent_load'] = 'normal'
    for key in ('sensor.eau', 'sensor.flipr'):
        engine.hass.states.items[key].state = '24'
    assert engine.cycles(1) == [12]
    for key in ('sensor.eau', 'sensor.flipr'):
        engine.hass.states.items[key].state = '12.7'
    assert engine.cycles(1) == [7]


def test_T05_custom_proposal_is_explicit_without_overwriting_12_hours(engine):
    scheduler=engine.scheduler
    scheduler.data['pump']['periods']=[{'enabled':True,'start':'02:00','end':'14:00'}]
    scheduler.data['seasonal_profiles']['source']='custom'
    scheduler.data['watch']['recent_load']='busy'
    engine.cycles(1)
    state=scheduler.public_state()['winter_status']
    assert state['calculated_hours']==9 and state['applied_hours']==12
    assert state['different'] and 'personnalisées' in state['reason']


def test_T06_frost_ignores_quota_weekdays_and_ordinary_override(engine):
    winter(engine)
    engine.scheduler.data['pump']['weekdays']=[]
    engine.scheduler.data['overrides']['pump']={'state':'off','persistent':True}
    frost(engine,entry_delay_seconds=0)
    assert engine.hass.states.items['switch.pump'].state=='on'
    assert engine.scheduler.data['overrides']['pump']['state']=='off'
    assert engine.scheduler.public_state()['winter_status']['origin']=='antigel'
    assert any('Conflit' in a for a in engine.scheduler.data['winter_runtime']['alerts'])


def test_T07_command_not_followed_by_actual_state_alerts(engine):
    async def no_effect(domain,service,data,**kwargs):
        engine.hass.commands.append((domain,service,data))
    engine.hass.services.async_call=no_effect
    frost(engine,entry_delay_seconds=0,command_timeout_seconds=30)
    tick(engine,31,2)
    state=engine.scheduler.public_state()['winter_status']
    assert state['runtime']['pump_state']=='off'
    assert not state['runtime']['flow_verified']
    assert any('non suivie' in text for text in state['runtime']['alerts'])
    assert state['runtime']['command'].get('confirmed_at') is None


def test_T08_hysteresis_delays_and_minimum_run(engine):
    frost(engine,entry_delay_seconds=60,exit_delay_seconds=60,minimum_run_seconds=180)
    assert not engine.scheduler.data['winter_runtime']['frost']['requested']
    tick(engine,30,3.1)  # reset entry debounce
    tick(engine,30,2)
    tick(engine,30,2)
    assert not engine.scheduler.data['winter_runtime']['frost']['requested']
    tick(engine,30,2)
    assert engine.scheduler.data['winter_runtime']['frost']['requested']
    tick(engine,60,6)
    tick(engine,60,4.9)  # reset exit debounce
    tick(engine,60,6)
    assert engine.scheduler.data['winter_runtime']['frost']['requested']
    tick(engine,60,6)
    assert not engine.scheduler.data['winter_runtime']['frost']['requested']


def test_T09_stale_acquisition_not_replaced_by_recent_ha_report(engine):
    sources(engine)
    engine.hass.states.items['sensor.sample'].state=(NOW-timedelta(days=3)).isoformat()
    engine.hass.states.items['sensor.sample2'].state='unavailable'
    assert engine.cycles(1)==[5]
    frost(engine,entry_delay_seconds=0)
    engine.hass.states.items['sensor.local_sample'].state=(NOW-timedelta(hours=1)).isoformat()
    tick(engine)
    status=engine.scheduler.public_state()['winter_status']
    assert status['runtime']['frost']['status']=='unconfirmed'
    assert status['runtime']['frost']['requested']  # hold existing demand
    assert any('Capteur antigel' in text for text in status['runtime']['alerts'])


def test_T09_missing_sensor_never_invents_emergency_start(engine):
    configure(engine,frost={'enabled':True,'temperature_entity':'sensor.absent'})
    assert engine.scheduler.data['winter_runtime']['frost']['status']=='unconfirmed'
    assert not engine.scheduler.data['winter_runtime']['frost']['requested']


def test_T10_pac_hibernation_does_not_block_pump(engine):
    winter(engine)
    frost(engine,entry_delay_seconds=0)
    engine.scheduler.data['pac'].update(command_entity='switch.pac',write_enabled=True)
    asyncio.run(engine.scheduler.async_control('pac','on'))
    assert not any(call[2].get('entity_id')=='switch.pac' for call in engine.hass.commands)
    assert engine.hass.states.items['switch.pump'].state=='on'


def test_T11_T16_exit_does_not_reactivate_equipment_and_requires_new_sample(engine):
    winter(engine)
    configure(engine,mode='normal')
    assert engine.scheduler._equipment('blue')['status']=='hiverne'
    assert engine.scheduler._equipment('pac')['status']=='hiverne'
    configure(engine,equipment={'blue':'en_service'})
    assert engine.scheduler._water_sources(engine.clock['now'])[0]['status']=='awaiting_sample'
    engine.clock['now']+=timedelta(seconds=1)
    engine.hass.states.items['sensor.sample'].state=engine.clock['now'].isoformat()
    assert engine.scheduler._water_sources(engine.clock['now'])[0]['status']=='fresh'


def test_T12_manual_edit_remains_custom_after_ticks(engine):
    winter(engine)
    periods=[{'enabled':True,'start':'01:00','end':'07:00'}]
    asyncio.run(engine.scheduler.async_save_config({'pump':{'periods':periods},'seasonal_profiles':{'source':'custom'}}))
    tick(engine)
    assert engine.scheduler.data['seasonal_profiles']['source']=='custom'
    assert engine.scheduler.data['pump']['periods'][0]==periods[0]
    assert engine.scheduler.public_state()['winter_status']['different']


@pytest.mark.parametrize('lock', ['maintenance','pump','hydraulic','dry','unknown','external'])
def test_T13_every_hydraulic_lock_blocks_frost_and_manual_start(engine,lock):
    frost(engine,entry_delay_seconds=0)
    if lock=='maintenance':configure(engine,mode='maintenance')
    elif lock=='pump':configure(engine,equipment={'pump':'indisponible'})
    elif lock=='hydraulic':configure(engine,hydraulic_ready=False)
    elif lock in ('dry','unknown'):
        engine.hass.states.items['binary_sensor.dry']=_State('on' if lock=='dry' else 'unavailable',NOW)
        configure(engine,dry_run_entity='binary_sensor.dry')
    else:
        engine.scheduler.data['overrides']['pump']={'state':'off','persistent':True,'source':'external'}
    tick(engine)
    assert engine.hass.states.items['switch.pump'].state=='off'
    engine.hass.commands.clear()
    if lock!='external':asyncio.run(engine.scheduler.async_control('pump','on'))
    assert not any(call[1]=='turn_on' for call in engine.hass.commands)
    assert any('bloquée' in text for text in engine.scheduler.data['winter_runtime']['alerts'])


def test_T14_restart_preserves_frost_and_equipment_but_not_fake_observations(engine):
    winter(engine)
    frost(engine,entry_delay_seconds=0)
    tick(engine,30,2)
    scheduler=type(engine.scheduler)(engine.hass)
    scheduler.store.saved=deepcopy(engine.scheduler.store.saved)
    engine.clock['now']+=timedelta(minutes=5)
    asyncio.run(scheduler.async_load())
    assert scheduler._winter_config()['mode']=='hivernage_actif'
    assert scheduler._equipment('pac')['status']=='hiverne'
    assert scheduler.data['winter_runtime']['frost']['requested']
    assert all((datetime.fromisoformat(row['end'])-datetime.fromisoformat(row['start'])).total_seconds()<120 for row in scheduler.data['winter_runtime']['observations'])
    scheduler.data['coordination']['role']='satellite'
    engine.hass.commands.clear()
    asyncio.run(scheduler.async_tick(engine.clock['now']))
    assert not engine.hass.commands
    assert not scheduler.public_state()['winter_status']['master']


@pytest.mark.parametrize('date,hours',[(datetime(2026,3,29),23),(datetime(2026,10,25),25)])
def test_T15_dst_timeline_has_actual_day_length(engine,date,hours):
    from importlib import import_module
    module=import_module('v422_backend.wintering')
    now=date.replace(tzinfo=ZoneInfo('Europe/Paris'))
    program=module.day_program([{'enabled':True,'start':'00:00','end':'12:00'},{'enabled':True,'start':'12:00','end':'00:00'}],['mon','tue','wed','thu','fri','sat','sun'],now)
    assert program['elapsed_hours']==hours
    assert len(program['segments'])==1
    start=datetime.fromisoformat(program['segments'][0]['start'])
    end=datetime.fromisoformat(program['segments'][0]['end'])
    assert (end-start).total_seconds()==hours*3600


def test_confirmation_revision_and_schema_guards(engine):
    before=deepcopy(engine.scheduler.data)
    with pytest.raises(ValueError):asyncio.run(engine.scheduler.async_configure_wintering({'changes':{'mode':'hivernage_actif'}},'user'))
    assert engine.scheduler.data==before
    configure(engine,base_hours=5)
    with pytest.raises(ValueError):asyncio.run(engine.scheduler.async_configure_wintering({'confirmed':True,'expected_revision':0,'changes':{'base_hours':6}},'user'))
    assert engine.scheduler._winter_config()['base_hours']==5
    for changes in ({'mode':'hivernage_passif'},{'frost':{'enter_c':6,'exit_c':5}},{'base_hours':float('nan')},{'mode':'hivernage_actif'}):
        with pytest.raises(ValueError):configure(engine,**changes)


def test_generic_save_cannot_bypass_confirmation_or_reinject_outputs(engine):
    before=deepcopy(engine.scheduler._winter_config())
    asyncio.run(engine.scheduler.async_save_config({'wintering':{'mode':'hivernage_actif'},'winter_runtime':{'frost':{'requested':True}},'pump':{'recommended_hours':24}}))
    assert engine.scheduler._winter_config()==before
    assert not engine.scheduler.data['winter_runtime']['frost']['requested']
    assert engine.scheduler.data['pump']['recommended_hours']==7


def test_migration_keeps_existing_config_and_does_not_enable_wintering(engine):
    old=deepcopy(engine.scheduler.data)
    old.pop('wintering');old.pop('schema_version');old.pop('winter_runtime')
    normalized=engine.scheduler._normalize(deepcopy(old))
    for key in ('pump','pac','light','overrides','measurement_sources'):
        assert normalized[key]==old[key]
    assert normalized['schema_version']==2
    assert normalized['wintering']['mode']=='normal'
    assert not normalized['wintering']['frost']['enabled']


def test_maintenance_detour_preserves_pre_winter_custom_program(engine):
    scheduler = engine.scheduler
    scheduler.data['seasonal_profiles']['source'] = 'custom'
    scheduler.data['pump']['periods'] = [{'enabled': True, 'start': '10:00', 'end': '15:00'}]
    original = deepcopy(scheduler.data['pump']['periods'])
    winter(engine)
    configure(engine, mode='maintenance')
    configure(engine, mode='hivernage_actif', base_hours=4, start='02:00')
    configure(engine, mode='maintenance')
    configure(engine, mode='normal')
    assert scheduler.data['pump']['periods'] == original
    assert scheduler.data['seasonal_profiles']['source'] == 'custom'
    assert 'pre_winter_schedule' not in scheduler.data
    assert scheduler._equipment('blue')['status'] == 'hiverne'


def test_custom_proposal_exposes_current_sample_diagnostics(engine):
    sources(engine)
    engine.scheduler.data['seasonal_profiles']['source'] = 'custom'
    engine.cycles(1)
    assert engine.scheduler.public_state()['winter_status']['water_temperature_c'] == 12.7
    engine.hass.states.items['sensor.sample'].state = 'unknown'
    engine.hass.states.items['sensor.sample2'].state = 'unknown'
    engine.cycles(1)
    assert engine.scheduler.public_state()['winter_status']['water_temperature_c'] is None


def test_notification_failure_does_not_interrupt_persistence_or_control(engine):
    async def failed(*args):
        raise RuntimeError('notification unavailable')
    engine.scheduler._notify = failed
    winter(engine)
    frost(engine, entry_delay_seconds=0)
    assert engine.hass.states.items['switch.pump'].state == 'on'
    assert any(row.get('action') == 'échec' or 'non transmise' in str(row) for row in engine.scheduler.data['history'])


def test_flow_sensor_failure_after_timeout_is_not_verified(engine):
    winter(engine)
    configure(engine, flow_entity='binary_sensor.flow')
    engine.hass.states.items['binary_sensor.flow'] = _State('off', NOW)
    frost(engine, entry_delay_seconds=0, command_timeout_seconds=30)
    tick(engine, 31, 2)
    runtime = engine.scheduler.public_state()['winter_status']['runtime']
    assert runtime['pump_state'] == 'on' and runtime['flow_verified'] is False
    assert any('débit non vérifié' in a for a in runtime['alerts'])
