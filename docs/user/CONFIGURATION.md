# Configuration

Pool Cockpit automatically discovers compatible pool analyzers and generates a Home Assistant dashboard configuration.

## Compatible analyzer families

Automatic discovery currently recognizes:

- Blue Connect;
- Blueriiot;
- Zodiac-compatible Blue Connect devices;
- Flipr.

The analyzer must already exist in Home Assistant before running the Pool Cockpit installer.

## Automatic entity discovery

Pool Cockpit reads the Home Assistant entity and device registries.

For each compatible analyzer, it tries to identify useful entities such as:

- water temperature;
- pH;
- ORP / redox;
- conductivity;
- salinity;
- free chlorine;
- battery level;
- Bluetooth signal strength;
- Bluetooth connection status;
- last analysis time;
- manual analysis button or script.

Detection uses several signals, including:

- entity name;
- entity ID;
- device information;
- device class;
- measurement unit.

Disabled Home Assistant entities are ignored.

## Diagnostic mode

Before installation, you can inspect what Pool Cockpit detects:

    python3 install_pool_dashboard.py --config /config --theme ocean --dry-run --diagnostic

Diagnostic mode displays the selected entities and the reasons used to match them.

No file is modified when `--dry-run` is used.

## Generated dashboard

During installation, Pool Cockpit generates:

    /config/pool-dashboard.yaml

The generated dashboard contains one Pool Cockpit card and the compatible analyzers discovered in Home Assistant.

Example structure:

    title: Piscine
    views:
      - title: Piscine
        path: overview
        icon: mdi:pool
        type: panel
        cards:
          - type: custom:pool-dashboard-card
            visual_theme: ocean
            title: Ma Piscine
            devices:
              - key: ...
                name: ...
                brand: blue_connect
                entities:
                  temperature: sensor.example_temperature
                  ph: sensor.example_ph
                  orp: sensor.example_orp

The exact entities depend on the devices available in your Home Assistant installation.

## Themes

The visual theme is selected during installation.

Available values are:

- `ocean` — immersive blue interface;
- `sky` — light interface;
- `night` — dark interface;
- `auto` — follows the current visual context.

Example:

    python3 install_pool_dashboard.py --config /config --theme night --yes

The default theme used by `install.sh` is `ocean`.

## Multiple analyzers

Pool Cockpit can discover more than one compatible analyzer.

Each device receives its own stable identifier and its own entity mapping.

The analyzer brand is not used as the unique device identifier, allowing multiple devices of the same family to coexist.

## Weather data

Pool Cockpit can include compatible weather entities when they are detected during installation.

Detected weather entities are automatically added to the generated dashboard configuration.

If no compatible weather data is available, the dashboard can still be generated and used.

## Re-running the installer

The installer can be run again after adding or changing entities.

Before applying changes, use:

    python3 install_pool_dashboard.py --config /config --theme ocean --dry-run --diagnostic

A normal installation regenerates `pool-dashboard.yaml`, so manual changes made directly to that generated file may be overwritten.

A backup is created before installation.

## Previous installation fallback

If automatic discovery temporarily finds no device, Pool Cockpit can reuse device information stored by a previous installation.

The installation metadata is stored in:

    /config/.ha_pool_dashboard_install.json

This fallback helps preserve an existing configuration when registry discovery is temporarily unavailable.

## When an entity is not detected

Check that:

1. the entity is enabled in Home Assistant;
2. the analyzer is associated with a recognizable Blue Connect, Blueriiot, Zodiac or Flipr device;
3. the entity has an appropriate name, device class or measurement unit;
4. diagnostic mode reports the expected analyzer.

Use:

    python3 install_pool_dashboard.py --config /config --theme ocean --dry-run --diagnostic

If necessary, review the generated detection information before performing another installation.
