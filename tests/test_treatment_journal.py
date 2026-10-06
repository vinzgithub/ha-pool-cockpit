from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys
import types

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "home_assistant" / "custom_components" / "ha_pool_dashboard" / "treatment_journal.py"
INIT_PATH = ROOT / "home_assistant" / "custom_components" / "ha_pool_dashboard" / "__init__.py"

# Stubs minimaux : ce test valide la normalisation sans nécessiter Home Assistant.
homeassistant = types.ModuleType("homeassistant")
core = types.ModuleType("homeassistant.core")
helpers = types.ModuleType("homeassistant.helpers")
storage = types.ModuleType("homeassistant.helpers.storage")
core.HomeAssistant = object
storage.Store = object
sys.modules.setdefault("homeassistant", homeassistant)
sys.modules.setdefault("homeassistant.core", core)
sys.modules.setdefault("homeassistant.helpers", helpers)
sys.modules.setdefault("homeassistant.helpers.storage", storage)

SPEC = spec_from_file_location("pool_treatment_journal", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_treatment_journal_sanitizes_and_caps_history() -> None:
    raw = [
        {
            "date": f"2026-09-05T10:{i % 60:02d}:00Z",
            "kind": "ph_plus",
            "product": "AXTON pH+ poudre",
            "dose_amount": "155",
            "dose_unit": "g",
            "detail": "Palier +0,1",
            "extra": "ne doit pas être persisté",
        }
        for i in range(520)
    ]
    history = MODULE.sanitize_treatment_history(raw)
    assert len(history) == MODULE.MAX_HISTORY == 500
    assert history[0]["dose_amount"] == 155
    assert "extra" not in history[0]


def test_treatment_journal_has_dedicated_home_assistant_storage_key() -> None:
    assert MODULE.STORAGE_KEY == "ha_pool_dashboard.treatment_journal"
    source = INIT_PATH.read_text(encoding="utf-8")
    assert "ha_pool_dashboard/get_treatment_history" in source
    assert "ha_pool_dashboard/save_treatment_history" in source
    assert "TreatmentJournalStore" in source
