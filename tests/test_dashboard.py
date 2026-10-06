from ha_pool_dashboard.dashboard_generator import generate_dashboard
from ha_pool_dashboard.models import PoolDevice

def test_single_dashboard_card():
    devices = [
        PoolDevice(
            key="1",
            brand="blue_connect",
            name="Blue Connect",
            device_id="1",
            entities={"temperature": "sensor.pool_temperature", "ph": "sensor.pool_ph"},
        ),
        PoolDevice(
            key="2",
            brand="flipr",
            name="Flipr",
            device_id="2",
            entities={"temperature": "sensor.flipr_temperature", "orp": "sensor.flipr_orp"},
        ),
    ]
    text = generate_dashboard(devices, "ocean")
    assert text.count("custom:pool-dashboard-card") == 1
    assert "visual_theme: ocean" in text
    assert 'key: "1"' in text
    assert 'key: "2"' in text
    assert "brand: blue_connect" in text
    assert "brand: flipr" in text


def test_weather_alert_list_is_emitted_as_yaml() -> None:
    text = generate_dashboard([], "ocean", {
        "weather": "weather.maison",
        "weather_alert": "sensor.vigilance_91",
        "weather_alerts": ["sensor.vigilance_91", "sensor.vigilance_83"],
    })
    assert "weather_alert: sensor.vigilance_91" in text
    assert "weather_alerts:\n            - sensor.vigilance_91\n            - sensor.vigilance_83" in text


def test_dashboard_emits_measurement_enable_helper() -> None:
    device = PoolDevice(
        key="flipr:1",
        brand="flipr",
        name="Flipr",
        device_id="1",
        entities={"ph": "sensor.flipr_ph"},
        metadata={"enabled_entity": "input_boolean.ha_pool_flipr_enabled"},
    )

    text = generate_dashboard([device], "ocean")

    assert "enabled_entity: input_boolean.ha_pool_flipr_enabled" in text
