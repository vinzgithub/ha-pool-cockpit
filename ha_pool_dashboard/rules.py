# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

BRAND_TOKENS = {
    "blue_connect": ("blue connect", "blue_connect", "blueriiot", "blueriot", "zodiac"),
    "flipr": ("flipr",),
}

METRIC_RULES = {
    "temperature": {"domains": {"sensor"}, "tokens": ("temperature", "water_temperature", "temp_eau"), "device_classes": {"temperature"}, "units": {"°c", "°f"}},
    "ph": {"domains": {"sensor"}, "tokens": ("_ph", " ph ", "ph_"), "device_classes": set(), "units": {"ph"}},
    "orp": {"domains": {"sensor"}, "tokens": ("orp", "redox"), "device_classes": set(), "units": {"mv"}},
    "conductivity": {"domains": {"sensor"}, "tokens": ("conductivity", "conductivite", "conductivité"), "device_classes": set(), "units": {"µs/cm", "us/cm", "ms/cm"}},
    "salinity": {"domains": {"sensor"}, "tokens": ("salinity", "salinite", "salinité"), "device_classes": set(), "units": {"g/l", "ppt"}},
    "free_chlorine": {"domains": {"sensor"}, "tokens": ("chlore_libre", "free_chlorine", "estimated_fc", "estime_fc"), "device_classes": set(), "units": {"mg/l", "ppm"}},
    "battery": {"domains": {"sensor"}, "tokens": ("battery", "batterie"), "device_classes": {"battery"}, "units": {"%"}},
    "bluetooth_signal": {"domains": {"sensor"}, "tokens": ("signal_bluetooth", "bluetooth_signal", "rssi"), "device_classes": {"signal_strength"}, "units": {"dbm", "%"}},
    "bluetooth_state": {"domains": {"sensor", "binary_sensor"}, "tokens": ("etat_bluetooth", "bluetooth_state", "bluetooth_status"), "device_classes": {"connectivity"}, "units": set()},
    "last_analysis": {"domains": {"sensor"}, "tokens": ("last_analysis", "last_measure", "derniere_analyse", "dernière_analyse"), "device_classes": {"timestamp"}, "units": set()},
    "start_analysis": {"domains": {"button", "script"}, "tokens": ("nouvelle_analyse", "new_analysis", "analyse_60s", "measurement"), "device_classes": set(), "units": set()},
}

SIGNIFICANT_METRICS = {"temperature", "ph", "orp", "conductivity", "salinity", "free_chlorine"}
