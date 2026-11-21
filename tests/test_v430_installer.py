"""Offline tests for the guarded V4.3.0 installer."""
import importlib.util
import json
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


def test_storage_resource_upgrade_retains_dashboard_and_all_other_resources(tmp_path):
    """Matches an established HA dashboard using YAML card + UI-managed resource."""
    import install_v421
    c = make_config(tmp_path)
    install_v421.install(c)
    p = installer.paths(c)
    original = p["yaml"].read_text()
    original = original.replace(
        "  resource_mode: yaml\n  resources:\n    - url: /local/ha-pool-dashboard/pool-cockpit.js?v=4.2.1\n      type: module\n", ""
    )
    p["yaml"].write_text(original)
    dashboard = p["dashboard"].read_text().replace(
        "custom:pool-cockpit-card", "custom:pool-dashboard-card"
    )
    p["dashboard"].write_text(dashboard)
    resources = c / ".storage/lovelace_resources"
    resources.parent.mkdir(exist_ok=True)
    payload = {
        "version": 1, "minor_version": 1, "key": "lovelace_resources",
        "data": {"items": [
            {"id": "unrelated", "url": "/local/something-else.js", "type": "module"},
            {"id": "pool", "url": "/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.1",
             "type": "module"}
        ]}
    }
    before_resources = json.dumps(payload, indent=2) + "\n"
    resources.write_text(before_resources)
    before_yaml = p["yaml"].read_text()
    before_js = p["js"].read_bytes()
    kind, yaml = installer.preflight(c)
    assert kind == "upgrade_storage"
    assert yaml == before_yaml
    backup = installer.install(c, kind, yaml)
    assert p["yaml"].read_text() == before_yaml
    assert p["dashboard"].read_text() == dashboard
    assert p["js"].read_bytes() == installer.NEW.read_bytes()
    updated = json.loads(resources.read_text())
    assert updated["data"]["items"][0] == payload["data"]["items"][0]
    assert updated["data"]["items"][1]["url"].endswith("?v=4.3.0")
    assert (backup / "lovelace_resources").read_text() == before_resources
    assert installer.preflight(c)[0] == "already"
    installer.restore(c, backup, require_upgrade=True)
    assert p["yaml"].read_text() == before_yaml
    assert p["dashboard"].read_text() == dashboard
    assert p["js"].read_bytes() == before_js
    assert resources.read_text() == before_resources


def test_storage_resource_upgrade_rejects_ambiguous_resources(tmp_path):
    import install_v421
    c = make_config(tmp_path)
    install_v421.install(c)
    p = installer.paths(c)
    original = p["yaml"].read_text()
    original = original.replace(
        "  resource_mode: yaml\n  resources:\n    - url: /local/ha-pool-dashboard/pool-cockpit.js?v=4.2.1\n      type: module\n", ""
    )
    p["yaml"].write_text(original)
    p["dashboard"].write_text(p["dashboard"].read_text().replace(
        "custom:pool-cockpit-card", "custom:pool-dashboard-card"
    ))
    r = c / ".storage/lovelace_resources"
    r.parent.mkdir(exist_ok=True)
    r.write_text(json.dumps({"data": {"items": [
        {"url": "/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.1", "type": "module"},
        {"url": "/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.1", "type": "module"},
    ]}}))
    with pytest.raises(RuntimeError, match="Plusieurs ressources"):
        installer.preflight(c)
    assert p["js"].read_bytes() == installer.OLD.read_bytes()
