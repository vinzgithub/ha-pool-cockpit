from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCHEDULER = (ROOT / "home_assistant/custom_components/ha_pool_dashboard/scheduler.py").read_text(encoding="utf-8")
INIT = (ROOT / "home_assistant/custom_components/ha_pool_dashboard/__init__.py").read_text(encoding="utf-8")


def test_pump_manual_override_is_persistent_and_checked_before_schedule() -> None:
    assert 'override.get("persistent")' in SCHEDULER
    assert '"persistent": True' in SCHEDULER
    assert '"forçage manuel prioritaire"' in SCHEDULER
    assert SCHEDULER.index('override.get("persistent")') < SCHEDULER.index('mode = block.get("mode", "manual")')


def test_program_resume_requires_explicit_auto_command() -> None:
    assert 'target == "pump" and state == "auto"' in SCHEDULER
    assert 'pop("pump", None)' in SCHEDULER
    assert '"reprise du programme"' in SCHEDULER
    assert 'vol.In(("on", "off", "auto"))' in INIT
