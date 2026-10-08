import pytest

from ha_pool_dashboard.installer import ensure_lovelace_yaml


def test_lovelace_is_added_to_fresh_configuration_and_is_idempotent() -> None:
    initial = "default_config:\n"

    installed = ensure_lovelace_yaml(initial, "3.0.0")

    assert "lovelace:" in installed
    assert "  mode: storage" in installed
    assert "  resource_mode: yaml" in installed
    assert "    - url: /local/ha-pool-dashboard/pool-dashboard.js?v=3.0.0" in installed
    assert "    pool-cockpit:" in installed
    assert "      mode: yaml" in installed
    assert "      title: Piscine" in installed
    assert "      show_in_sidebar: true" in installed
    assert "      filename: pool-dashboard.yaml" in installed

    assert ensure_lovelace_yaml(installed, "3.0.0") == installed


def test_lovelace_preserves_existing_resource_and_dashboard() -> None:
    initial = """default_config:

lovelace:
  mode: storage
  resource_mode: yaml
  resources:
    - url: /local/example-card.js
      type: module
  dashboards:
    existing-dashboard:
      mode: yaml
      title: Existing
      show_in_sidebar: true
      filename: existing.yaml
"""

    installed = ensure_lovelace_yaml(initial, "3.0.0")

    assert "/local/example-card.js" in installed
    assert "existing-dashboard:" in installed
    assert "filename: existing.yaml" in installed

    assert installed.count("/local/ha-pool-dashboard/pool-dashboard.js") == 1
    assert installed.count("pool-cockpit:") == 1
    assert installed.count("resource_mode: yaml") == 1


def test_lovelace_updates_existing_pool_cockpit_resource_version() -> None:
    initial = """lovelace:
  mode: storage
  resource_mode: yaml
  resources:
    - url: /local/ha-pool-dashboard/pool-dashboard.js?v=2.9.0
      type: module
  dashboards:
    pool-cockpit:
      mode: yaml
      title: Piscine
      icon: mdi:pool
      show_in_sidebar: true
      filename: pool-dashboard.yaml
"""

    installed = ensure_lovelace_yaml(initial, "3.0.0")

    assert "?v=2.9.0" not in installed
    assert installed.count(
        "/local/ha-pool-dashboard/pool-dashboard.js?v=3.0.0"
    ) == 1
    assert installed.count("pool-cockpit:") == 1


def test_lovelace_refuses_incompatible_resource_mode() -> None:
    initial = """lovelace:
  mode: storage
  resource_mode: storage
"""

    with pytest.raises(RuntimeError, match="resource_mode incompatible"):
        ensure_lovelace_yaml(initial, "3.0.0")
