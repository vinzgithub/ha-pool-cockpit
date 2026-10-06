from ha_pool_dashboard.discovery import metric_score

def test_chlorine_not_salinity():
    entity = {"entity_id": "sensor.flipr_chlore_libre_estime_fc", "unit_of_measurement": "ppm"}
    score, reasons = metric_score(entity, "salinity")
    assert score == -1
    assert "excluded:chlorine_is_not_salinity" in reasons

def test_bluetooth_state_not_signal():
    entity = {"entity_id": "sensor.flipr_etat_bluetooth"}
    signal_score, _ = metric_score(entity, "bluetooth_signal")
    state_score, _ = metric_score(entity, "bluetooth_state")
    assert signal_score == -1
    assert state_score > 0
