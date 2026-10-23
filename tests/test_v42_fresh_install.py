"""Offline tests for the official one-resource Pool Cockpit 4.2 installer."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("install_v42",ROOT/"install_v42.py")
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class InstallV42Tests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        (self.root/"configuration.yaml").write_text("default_config:\n")
    def test_install_is_single_resource(self):
        cfg=module.preflight(self.root)
        self.assertEqual(cfg.count("    - url: "),1)
        self.assertIn(module.RESOURCE,cfg)
        self.assertIn(module.CARD,module.DASHBOARD)
        self.assertNotIn("pool-dashboard-v4-rc8-2.js",cfg)
        self.assertNotIn("pool-cockpit-dual-mode-card.js",cfg)
        backup=module.install(self.root)
        p=module.destinations(self.root)
        self.assertEqual(p["frontend"].read_bytes(),module.FRONTEND.read_bytes())
        self.assertTrue(p["camera"].is_file())
        self.assertTrue((p["backend"]/"manifest.json").is_file())
        self.assertEqual((backup/"configuration.yaml").read_text(),"default_config:\n")
        with self.assertRaises(RuntimeError):
            module.preflight(self.root)
    def test_existing_lovelace_is_not_modified(self):
        original="default_config:\nlovelace:\n  mode: storage\n"
        f=self.root/"configuration.yaml"
        f.write_text(original)
        with self.assertRaises(RuntimeError):
            module.preflight(self.root)
        self.assertEqual(f.read_text(),original)
        self.assertFalse((self.root/"www").exists())

if __name__=="__main__":
    unittest.main()
