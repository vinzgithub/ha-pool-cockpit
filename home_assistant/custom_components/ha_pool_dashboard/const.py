# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

DOMAIN = "ha_pool_dashboard"
STORAGE_VERSION = 1
STORAGE_KEY = "ha_pool_dashboard.rc27"
UPDATE_EVENT = "ha_pool_dashboard_updated"

DEFAULT_WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
DEFAULT_DATA = {
    "pump": {
        "entity_id": "",
        "power_entity": "",
        "energy_entity": "",
        "mode": "manual",
        "weekdays": DEFAULT_WEEKDAYS,
        "periods": [
            {"enabled": True, "start": "06:00", "end": "13:00"},
            {"enabled": True, "start": "16:00", "end": "22:00"},
            {"enabled": False, "start": "00:00", "end": "00:00"},
        ],
        "recommended_hours": 0,
        "extension": {"date": "", "status": "none", "target_hours": 0, "minutes": 0},
    },
    "light": {
        "entity_id": "",
        "power_entity": "",
        "mode": "manual",
        "weekdays": DEFAULT_WEEKDAYS,
        "periods": [
            {"enabled": True, "start": "20:00", "end": "23:00"},
            {"enabled": False, "start": "00:00", "end": "00:00"},
            {"enabled": False, "start": "00:00", "end": "00:00"},
        ],
        "auto_off_minutes": 120,
    },
    "pac": {
        "command_entity": "",
        "control_mode_entity": "",
        "setpoint_entity": "",
        "mode_entity": "",
        "status_entity": "",
        "inlet_temperature_entity": "",
        "outlet_temperature_entity": "",
        "ambient_temperature_entity": "",
        "coil_temperature_entity": "",
        "ipm_temperature_entity": "",
        "voltage_entity": "",
        "current_entity": "",
        "power_entity": "",
        "energy_entity": "",
        "daily_energy_entity": "",
        "monthly_energy_entity": "",
        "compressor_fault_code_entity": "",
        "water_flow_entity": "",
        "high_pressure_entity": "",
        "low_pressure_entity": "",
        "fault_entity": "",
        "communication_entity": "",
        "mode": "manual",
        "weekdays": DEFAULT_WEEKDAYS,
        "periods": [
            {"enabled": True, "start": "09:00", "end": "20:00"},
            {"enabled": False, "start": "00:00", "end": "00:00"},
            {"enabled": False, "start": "00:00", "end": "00:00"},
        ],
        "requires_pump": True,
        "write_enabled": False,
    },
    "coordination": {
        "role": "master",
        "site_name": "Site A",
        "peer_name": "Site B",
        "allow_satellite_manual": True,
    },
    "camera_entity": "",
    "notify_service": "",
    "notifications_enabled": False,
    "boost_until": None,
    "light_auto_off_at": None,
    "overrides": {},
    "measurement_sources": {},
    "history": [],
    "watch": {},
    "last_notifications": {},
}
