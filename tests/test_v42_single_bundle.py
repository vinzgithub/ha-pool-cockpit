"""Contract tests for a deterministic single-resource Pool Cockpit bundle."""
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build_unified_pool_cockpit as bundler


class SingleBundleTests(unittest.TestCase):
    def test_single_bundle_is_stable_and_loads_core_before_wrapper(self):
        a = bundler.generate()
        b = bundler.generate()
        self.assertEqual(a, b)
        self.assertGreater(len(a), 1_000_000)
        s = a.decode()
        self.assertIn('const DUAL="pool-cockpit-card";', s)
        self.assertIn('const STANDALONE="pool-cockpit-demo-card";', s)
        self.assertIn('if (!customElements.get("pool-dashboard-v4-test-card"))', s)
        self.assertIn("pool-cockpit-card", s)
        self.assertNotIn('const DUAL="pool-cockpit-dual-mode-card";', s)
        self.assertLess(s.index('customElements.define("pool-dashboard-v4-test-card"'),
                        s.index('const DUAL="pool-cockpit-card";'))

    def test_generated_file_has_valid_javascript_syntax(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "pool-cockpit.js"
            p, digest = bundler.build(path)
            self.assertEqual(p.read_bytes(), bundler.generate())
            self.assertEqual(len(digest), 64)
            subprocess.run(["node", "--check", str(path)], check=True, capture_output=True, text=True)

    def test_only_one_public_custom_card_is_registered(self):
        s = bundler.generate().decode()
        # Base engine's old RC name is internal, never published as a card.
        self.assertNotIn('window.customCards.push({type:"pool-dashboard-v4-test-card"', s)
        self.assertIn('window.customCards.push({type:"pool-cockpit-card"', s)


if __name__ == "__main__":
    unittest.main()
