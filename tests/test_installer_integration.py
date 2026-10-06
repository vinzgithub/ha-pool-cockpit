from pathlib import Path
from unittest.mock import patch

from ha_pool_dashboard.installer import Installer
from ha_pool_dashboard.models import PoolDevice


ROOT = Path(__file__).resolve().parents[1]


def test_installer_copies_backend_and_is_idempotent(tmp_path: Path) -> None:
    (tmp_path / "configuration.yaml").write_text("default_config:\n")
    device = PoolDevice(
        key="blue:1",
        brand="blue_connect",
        name="Blue Connect",
        device_id="1",
        entities={"temperature": "sensor.pool_temperature", "ph": "sensor.pool_ph"},
    )
    installer = Installer(ROOT, tmp_path, "2.0.0-rc28.3")
    with patch.object(installer, "_discover_devices", return_value=([device], "registry")), patch(
        "ha_pool_dashboard.installer.detect_weather_entities", return_value={}
    ):
        first = installer.install("ocean")
        second = installer.install("ocean")

    configuration = (tmp_path / "configuration.yaml").read_text()
    assert configuration.count("ha_pool_dashboard:") == 1
    assert (tmp_path / "custom_components" / "ha_pool_dashboard" / "manifest.json").exists()
    assert (tmp_path / "custom_components" / "ha_pool_dashboard" / "services.yaml").exists()
    assert (tmp_path / "www" / "ha-pool-dashboard" / "pool-dashboard.js").exists()
    assert first["scheduler_configured"] is True
    assert second["scheduler_configured"] is True
