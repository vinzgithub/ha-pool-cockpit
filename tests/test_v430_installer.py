"""Offline tests for the guarded V4.3.0 installer."""
import importlib.util
from pathlib import Path
import subprocess
import sys
import pytest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("install_v430", ROOT / "install_v430.py")
installer = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = installer
spec.loader.exec_module(installer)


def make_config(tmp_path):
    c = tmp_path / "ha"
    c.mkdir()
    (c / "configuration.yaml").write_text("default_config:\n")
    return c


def test_fresh_install_and_dry_run(tmp_path):
    c = make_config(tmp_path)
    p = subprocess.run(["sh", str(ROOT / "install.sh"), "--config", str(c), "--dry-run"],
                       capture_output=True, text=True)
    assert p.returncode == 0, p.stderr
    assert "READY: fresh" in p.stdout
    assert sorted(x.name for x in c.iterdir()) == ["configuration.yaml"]
    kind, yaml = installer.preflight(c)
    backup = installer.install(c, kind, yaml)
    paths = installer.paths(c)
    assert paths["js"].read_bytes() == installer.NEW.read_bytes()
    assert (paths["backend"] / "wintering_runtime.py").is_file()
    assert (backup / "configuration.yaml").is_file()
    assert installer.preflight(c)[0] == "already"


def test_upgrade_and_rollback_restores_store(tmp_path):
    import install_v421
    c = make_config(tmp_path)
    install_v421.install(c)
    paths = installer.paths(c)
    paths["store"].parent.mkdir(exist_ok=True)
    old_store = '{"version":1,"data":{"pump":{"mode":"manual"}}}\n'
    paths["store"].write_text(old_store)
    before_yaml = paths["yaml"].read_text()
    before_dashboard = paths["dashboard"].read_text()
    before_js = paths["js"].read_bytes()
    kind, yaml = installer.preflight(c)
    assert kind == "upgrade"
    backup = installer.install(c, kind, yaml)
    assert paths["dashboard"].read_text() == before_dashboard
    assert paths["store"].read_text() == old_store
    assert paths["js"].read_bytes() == installer.NEW.read_bytes()
    paths["store"].write_text('{"version":2}\n')
    paths["premigration"].write_text(old_store)
    installer.restore(c, backup, require_upgrade=True)
    assert paths["yaml"].read_text() == before_yaml
    assert paths["dashboard"].read_text() == before_dashboard
    assert paths["js"].read_bytes() == before_js
    assert paths["store"].read_text() == old_store
    assert not paths["premigration"].exists()


def test_custom_bundle_refusal(tmp_path):
    import install_v421
    c = make_config(tmp_path)
    install_v421.install(c)
    paths = installer.paths(c)
    paths["js"].write_text("// private")
    with pytest.raises(RuntimeError, match="différent"):
        installer.preflight(c)
    assert paths["js"].read_text() == "// private"


def test_incomplete_install_and_symlink_refusal(tmp_path):
    c = make_config(tmp_path)
    (c / "www/ha-pool-dashboard").mkdir(parents=True)
    with pytest.raises(RuntimeError, match="incomplète"):
        installer.preflight(c)
    (c / "www/ha-pool-dashboard").rmdir()
    (c / "www").rmdir()
    (c / "www").symlink_to(tmp_path, target_is_directory=True)
    with pytest.raises(RuntimeError, match="symbolique"):
        installer.preflight(c)
