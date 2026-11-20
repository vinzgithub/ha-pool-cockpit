"""Distribution must be reproducible from reviewed sources."""
import importlib.util
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]


def test_v430_distribution_is_reproducible():
    sys.path.insert(0, str(ROOT / 'tools'))
    try:
        spec = importlib.util.spec_from_file_location('build_wintering_v430', ROOT / 'tools/build_wintering_v430.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        assert module.generate() == (ROOT / 'release/v4.3.0/pool-cockpit.js').read_bytes()
    finally:
        sys.path.pop(0)
