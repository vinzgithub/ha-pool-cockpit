from pathlib import Path
from unittest.mock import patch

from ha_pool_dashboard.installer import Installer


def test_plan_defines_weather(tmp_path: Path) -> None:
    with patch("ha_pool_dashboard.installer.DiscoveryEngine.discover", return_value=[]), \
         patch("ha_pool_dashboard.installer.detect_weather_entities", return_value={"weather": "weather.maison"}):
        result = Installer(tmp_path, tmp_path, "test").plan("ocean")

    assert result["theme"] == "ocean"
    assert result["devices"] == []
    assert result["weather"] == {"weather": "weather.maison"}
