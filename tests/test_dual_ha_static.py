from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCHEDULER = (ROOT / "home_assistant/custom_components/ha_pool_dashboard/scheduler.py").read_text(encoding="utf-8")
CONST = (ROOT / "home_assistant/custom_components/ha_pool_dashboard/const.py").read_text(encoding="utf-8")


def test_dual_ha_role_is_persisted_and_master_is_default() -> None:
    assert '"coordination": {' in CONST
    assert '"role": "master"' in CONST
    assert '"site_name": "Site A"' in CONST
    assert '"peer_name": "Site B"' in CONST
    assert 'coordination["role"]' in SCHEDULER


def test_satellite_never_executes_automatic_schedule() -> None:
    assert "def _is_master" in SCHEDULER
    assert "if self._is_master():" in SCHEDULER
    assert 'for target in ("pump", "light", "pac")' in SCHEDULER
    evaluate = SCHEDULER[SCHEDULER.index("async def async_evaluate"):SCHEDULER.index("async def async_tick")]
    assert "if self._is_master():" in evaluate


def test_master_detects_manual_changes_coming_from_satellite() -> None:
    assert "EVENT_STATE_CHANGED" in SCHEDULER
    assert "_async_state_changed" in SCHEDULER
    assert "_async_register_external_override" in SCHEDULER
    assert '"commande externe / satellite"' in SCHEDULER
    assert '"persistent": True' in SCHEDULER


def test_role_inversion_keeps_manual_satellite_control_explicit() -> None:
    assert '"allow_satellite_manual": True' in CONST
    assert 'allow_satellite_manual' in SCHEDULER
    assert 'if state == "auto" and not self._is_master()' in SCHEDULER
