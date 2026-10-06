from datetime import datetime
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from ha_pool_dashboard.installer import ensure_scheduler_yaml


ROOT = Path(__file__).resolve().parents[1]
UTILS_PATH = ROOT / "home_assistant" / "custom_components" / "ha_pool_dashboard" / "schedule_utils.py"
SPEC = spec_from_file_location("rc27_schedule_utils", UTILS_PATH)
assert SPEC and SPEC.loader
UTILS = module_from_spec(SPEC)
SPEC.loader.exec_module(UTILS)


def test_schedule_supports_three_periods_and_selected_days() -> None:
    periods = [
        {"enabled": True, "start": "06:00", "end": "08:00"},
        {"enabled": True, "start": "12:00", "end": "14:00"},
        {"enabled": True, "start": "18:00", "end": "20:00"},
    ]
    assert UTILS.scheduled_minutes(periods) == 360
    assert UTILS.schedule_is_active(periods, ["mon"], datetime(2026, 7, 20, 12, 30))
    assert not UTILS.schedule_is_active(periods, ["tue"], datetime(2026, 7, 20, 12, 30))


def test_automatic_mode_extends_last_period_to_recommendation() -> None:
    periods = [
        {"enabled": True, "start": "06:00", "end": "13:00"},
        {"enabled": True, "start": "16:00", "end": "22:00"},
    ]
    effective = UTILS.effective_periods(periods, 15)
    assert UTILS.scheduled_minutes(effective) == 900
    assert effective[-1]["end"] == "00:00"


def test_cross_midnight_period_stays_active() -> None:
    periods = [{"enabled": True, "start": "22:00", "end": "02:00"}]
    assert UTILS.schedule_is_active(periods, ["mon"], datetime(2026, 7, 20, 23, 0))
    assert UTILS.schedule_is_active(periods, ["mon"], datetime(2026, 7, 21, 1, 0))


def test_installer_adds_scheduler_yaml_once() -> None:
    initial = "default_config:\n"
    installed = ensure_scheduler_yaml(initial)
    assert "# HA Pool Dashboard RC27 scheduler" in installed
    assert installed.count("ha_pool_dashboard:") == 1
    assert ensure_scheduler_yaml(installed) == installed


def test_astronomical_season_keeps_4_september_in_summer() -> None:
    assert UTILS.astronomical_profile(datetime(2026, 9, 4, 12, 0)) == "summer"
    assert UTILS.astronomical_profile(datetime(2026, 10, 15, 12, 0)) == "autumn"


def test_adaptive_periods_keep_reference_start_and_extend_duration() -> None:
    autumn_reference = [{"enabled": True, "start": "11:00", "end": "16:00"}]
    start = UTILS.profile_start_minutes(autumn_reference)
    periods = UTILS.adaptive_periods(9, start)
    assert UTILS.scheduled_minutes(periods) == 9 * 60
    assert periods[0]["start"] == "11:00"
    assert periods[0]["end"] == "20:00"


def test_adaptive_24h_uses_two_periods_without_gap() -> None:
    periods = UTILS.adaptive_periods(24, 12 * 60)
    assert UTILS.scheduled_minutes(periods) == 24 * 60
    assert UTILS.schedule_is_active(periods, list(UTILS.WEEKDAYS), datetime(2026, 9, 4, 0, 30))
    assert UTILS.schedule_is_active(periods, list(UTILS.WEEKDAYS), datetime(2026, 9, 4, 23, 30))


def test_extension_is_neutralized_when_adaptive_program_already_owns_schedule() -> None:
    periods = [{"enabled": True, "start": "08:30", "end": "22:30"}]
    extension = {"date": "2026-09-04", "status": "approved", "target_hours": 14, "minutes": 60}
    result = UTILS.reconcile_extension(periods, 14, extension, "2026-09-04", "adaptive")
    assert result == {"date": "2026-09-04", "status": "none", "target_hours": 0, "minutes": 0}


def test_approved_extension_is_recalculated_after_manual_schedule_change() -> None:
    periods = [{"enabled": True, "start": "08:30", "end": "21:30"}]
    extension = {"date": "2026-09-04", "status": "approved", "target_hours": 14, "minutes": 120}
    result = UTILS.reconcile_extension(periods, 14, extension, "2026-09-04", "custom")
    assert result["status"] == "approved"
    assert result["target_hours"] == 14
    assert result["minutes"] == 60


def test_extension_disappears_when_custom_schedule_already_covers_recommendation() -> None:
    periods = [{"enabled": True, "start": "08:30", "end": "22:30"}]
    extension = {"date": "2026-09-04", "status": "approved", "target_hours": 14, "minutes": 60}
    result = UTILS.reconcile_extension(periods, 14, extension, "2026-09-04", "custom")
    assert result["status"] == "none"
    assert result["minutes"] == 0
