from pathlib import Path
import json
from ha_pool_dashboard.weather import detect_weather_entities

def test_weather_discovery(tmp_path: Path) -> None:
    storage=tmp_path/'.storage'; storage.mkdir()
    (storage/'core.entity_registry').write_text(json.dumps({'data':{'entities':[{'entity_id':'weather.maison','disabled_by':None},{'entity_id':'sensor.temperature_exterieure','disabled_by':None},{'entity_id':'sensor.indice_uv','disabled_by':None}]}}),encoding='utf-8')
    result=detect_weather_entities(tmp_path)
    assert result['weather']=='weather.maison'
    assert result['air_temperature']=='sensor.temperature_exterieure'
    assert result['uv_index']=='sensor.indice_uv'


def test_weather_alert_discovery_lists_all_departments(tmp_path: Path) -> None:
    storage = tmp_path / '.storage'
    storage.mkdir()
    entities = [
        {'entity_id': 'weather.maison', 'disabled_by': None},
        {'entity_id': 'sensor.essonne_weather_alert', 'original_name': 'Weather alert', 'disabled_by': None},
        {'entity_id': 'sensor.var_vigilance_meteo', 'name': 'Vigilance météo Var', 'disabled_by': None},
        {'entity_id': 'sensor.old_weather_alert', 'disabled_by': 'integration'},
    ]
    (storage / 'core.entity_registry').write_text(json.dumps({'data': {'entities': entities}}), encoding='utf-8')

    result = detect_weather_entities(tmp_path)

    assert result['weather_alert'] == 'sensor.essonne_weather_alert'
    assert result['weather_alerts'] == [
        'sensor.essonne_weather_alert',
        'sensor.var_vigilance_meteo',
    ]
