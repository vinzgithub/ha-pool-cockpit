"""Fast, offline V4.1.0 installation checks; never connect to Home Assistant."""
import importlib.util
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("install_v41", ROOT / "install_v41.py")
inst = importlib.util.module_from_spec(spec)
spec.loader.exec_module(inst)

class InstallV41Tests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.config = Path(self.tmp.name) / "config"
        self.config.mkdir()
        (self.config / "configuration.yaml").write_text("default_config:\n", encoding="utf-8")

    def test_no_sensor_clean_install_and_files(self):
        config_path = self.config / "configuration.yaml"
        original = config_path.read_text()
        cfg, dashboard = inst.preflight(self.config, False)
        self.assertIn("pool-cockpit-dual-mode-card.js?v=4.1.0", cfg)
        self.assertIn(inst.NEW_TYPE, dashboard)
        self.assertEqual(config_path.read_text(), original)
        self.assertFalse((self.config / "www").exists())
        backup = inst.install(self.config, False)
        p = inst.paths(self.config)
        self.assertTrue(inst.file_match(p["base"], inst.BUNDLE))
        self.assertTrue(inst.file_match(p["overlay"], inst.OVERLAY))
        self.assertTrue(inst.file_match(p["camera"], inst.CAMERA))
        self.assertTrue((p["backend"] / "scheduler.py").exists())
        self.assertTrue(p["backend"].is_dir())
        self.assertEqual(p["config"].read_text().count(inst.V41_RESOURCE), 1)
        self.assertEqual(p["dashboard"].read_text().count(inst.NEW_TYPE), 1)
        self.assertEqual((backup / "configuration.yaml").read_text(), original)
        with self.assertRaises(RuntimeError):
            inst.preflight(self.config, False)

    def _v4(self):
        p = inst.paths(self.config)
        p["web"].mkdir(parents=True)
        (p["web"] / "assets").mkdir()
        import shutil
        shutil.copy2(inst.BUNDLE, p["base"])
        shutil.copytree(inst.BACKEND, p["backend"])
        p["dashboard"].write_text(
            "title: A\nviews:\n  - title: Piscine\n    cards:\n      - type: custom:pool-dashboard-v4-test-card\n        title: Private settings\n        devices:\n          - sensor.private\n"
        )
        p["config"].write_text(
            "default_config:\nha_pool_dashboard:\n"
            "lovelace:\n  mode: storage\n  resource_mode: yaml\n"
            "  resources:\n    - url: /local/ha-pool-dashboard/pool-dashboard-v4-rc8-2.js?v=4.0.0\n"
            "      type: module\n"
            "  dashboards:\n    pool-cockpit:\n      mode: yaml\n      filename: pool-dashboard.yaml\n"
        )
        return p

    def test_v4_upgrade_preserves_custom_configuration_and_bundle(self):
        p = self._v4()
        original_bundle = p["base"].read_bytes()
        original_backend = (p["backend"] / "manifest.json").read_bytes()
        original_dashboard = p["dashboard"].read_text()
        original_config = p["config"].read_text()
        cfg, dashboard = inst.preflight(self.config, True)
        self.assertIn("Private settings", dashboard)
        self.assertIn("sensor.private", dashboard)
        self.assertIn("pool-cockpit-dual-mode-card.js?v=4.1.0", cfg)
        backup = inst.install(self.config, True)
        self.assertEqual(p["base"].read_bytes(), original_bundle)
        self.assertEqual((p["backend"] / "manifest.json").read_bytes(), original_backend)
        self.assertIn("sensor.private", p["dashboard"].read_text())
        self.assertIn(inst.NEW_TYPE, p["dashboard"].read_text())
        self.assertIn(inst.V41_RESOURCE, p["config"].read_text())
        self.assertEqual((backup / "pool-dashboard.yaml").read_text(), original_dashboard)
        self.assertEqual((backup / "configuration.yaml").read_text(), original_config)
        self.assertTrue(p["camera"].exists())
        with self.assertRaises(RuntimeError):
            inst.preflight(self.config, True)

    def test_modified_v4_bundle_refuses_upgrade_without_changes(self):
        p = self._v4()
        p["base"].write_bytes(b"modified")
        original = p["config"].read_bytes()
        with self.assertRaises(RuntimeError):
            inst.preflight(self.config, True)
        self.assertEqual(p["config"].read_bytes(), original)
        self.assertFalse(p["overlay"].exists())
        self.assertFalse((self.config / ".pool_cockpit_backups").exists())

    def test_existing_lovelace_refused_before_writes(self):
        (self.config / "configuration.yaml").write_text("default_config:\nlovelace:\n  mode: storage\n")
        with self.assertRaisesRegex(RuntimeError, "Existing Lovelace"):
            inst.preflight(self.config, False)
        self.assertFalse((self.config / ".pool_cockpit_backups").exists())

    def test_dry_run_never_writes(self):
        result = subprocess.run(
            [sys.executable, str(ROOT / "install_v41.py"), "--config", str(self.config), "--dry-run"],
            capture_output=True, text=True, check=True
        )
        self.assertIn("no changes made", result.stdout)
        self.assertEqual(list(self.config.iterdir()), [self.config / "configuration.yaml"])

    def test_upgrade_rollback_if_write_fails(self):
        p = self._v4()
        before_c = p["config"].read_bytes()
        before_d = p["dashboard"].read_bytes()
        original_write = Path.write_text
        def fail_dashboard(obj, content, *args, **kwargs):
            if obj == p["dashboard"]:
                raise OSError("simulated write failure")
            return original_write(obj, content, *args, **kwargs)
        with patch.object(Path, "write_text", fail_dashboard):
            with self.assertRaises(OSError):
                inst.install(self.config, True)
        self.assertEqual(p["config"].read_bytes(), before_c)
        self.assertEqual(p["dashboard"].read_bytes(), before_d)
        self.assertFalse(p["overlay"].exists())
        self.assertFalse(p["camera"].exists())


if __name__ == "__main__":
    unittest.main()
