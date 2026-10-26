"""Offline checks for the V4.2.1 single-resource fresh installer."""
import hashlib
import importlib.util
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("install_v421", ROOT / "install_v421.py")
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)
SHA256 = "5080ca2c2f399a3470b7f38e75133737b520564e33cc6c407f8e8f06e44b03ac"

class InstallV421Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.config = Path(self.temp.name)
        (self.config / "configuration.yaml").write_text("default_config:\n", encoding="utf-8")

    def test_constants_and_preflight_are_v421_only(self):
        self.assertEqual(installer.VERSION, "4.2.1")
        self.assertEqual(installer.FRONTEND, ROOT / "release/v4.2.1/pool-cockpit.js")
        self.assertEqual(installer.RESOURCE, "/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.1")
        self.assertNotIn("4.2.0", (ROOT / "install_v421.py").read_text(encoding="utf-8"))
        cfg = installer.preflight(self.config)
        self.assertIn("Pool Cockpit V4.2.1", cfg)
        self.assertIn("?v=4.2.1", cfg)
        self.assertNotIn("4.2.0", cfg)
        self.assertEqual(cfg.count("    - url: "), 1)
        self.assertIn(installer.CARD, installer.DASHBOARD)

    def test_fresh_install_file_hash_and_existing_install_refusal(self):
        expected = SHA256
        frontend_bytes = installer.FRONTEND.read_bytes()
        self.assertEqual(hashlib.sha256(frontend_bytes).hexdigest(), expected)
        sums = (ROOT / "SHA256SUMS").read_text(encoding="utf-8")
        self.assertIn(expected + "  ./release/v4.2.1/pool-cockpit.js", sums)
        attachment = (ROOT / "release/v4.2.1/pool-cockpit.js.sha256").read_text(encoding="utf-8")
        self.assertEqual(attachment, expected + "  pool-cockpit.js\n")
        backup = installer.install(self.config)
        target = installer.destinations(self.config)["frontend"]
        self.assertEqual(hashlib.sha256(target.read_bytes()).hexdigest(), expected)
        self.assertEqual((backup / "configuration.yaml").read_text(encoding="utf-8"), "default_config:\n")
        self.assertIn("v4.2.1-", backup.name)
        config_text = (self.config / "configuration.yaml").read_text(encoding="utf-8")
        self.assertIn("?v=4.2.1", config_text)
        with self.assertRaises(RuntimeError):
            installer.preflight(self.config)

    def test_refuse_existing_lovelace_without_writes(self):
        config_file = self.config / "configuration.yaml"
        old = "default_config:\nlovelace:\n  mode: storage\n"
        config_file.write_text(old, encoding="utf-8")
        with self.assertRaises(RuntimeError):
            installer.preflight(self.config)
        self.assertEqual(config_file.read_text(encoding="utf-8"), old)
        self.assertFalse((self.config / "www").exists())

    def test_dry_run_and_shell_upgrade_refusal(self):
        p = subprocess.run(["python3", str(ROOT / "install_v421.py"), "--config",
                            str(self.config), "--dry-run"], capture_output=True, text=True)
        self.assertEqual(p.returncode, 0, p.stderr)
        self.assertIn("V4.2.1", p.stdout)
        self.assertEqual(sorted(x.name for x in self.config.iterdir()), ["configuration.yaml"])
        s = subprocess.run(["sh", str(ROOT / "install.sh"), "--upgrade"],
                           capture_output=True, text=True)
        self.assertEqual(s.returncode, 2)
        self.assertIn("release/v4.2.1/README.md", s.stderr)
        self.assertNotIn("unrecognized arguments", s.stderr)

if __name__ == "__main__":
    unittest.main()
