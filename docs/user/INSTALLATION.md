# Installation

This guide explains how to install Pool Cockpit on an existing Home Assistant installation.

## Requirements

Pool Cockpit expects:

- a working Home Assistant installation;
- Python 3 available in the environment used to run the installer;
- at least one compatible pool analyzer already present in Home Assistant;
- access to the Home Assistant configuration directory.

Supported analyzer families currently include:

- Blue Connect / Blueriiot / Zodiac;
- Flipr.

The installer discovers compatible entities directly from the Home Assistant entity and device registries.

## Recommended first step: dry run

Before installing anything, run a simulation:

    python3 install_pool_dashboard.py --config /config --theme ocean --dry-run --diagnostic

This does not modify any file.

It displays:

- detected pool analyzers;
- detected entities;
- selected theme;
- detected weather entities;
- diagnostic matching information.

If your Home Assistant configuration is not located in `/config`, replace it with the appropriate path.

## Available themes

Pool Cockpit provides four visual themes:

- `ocean`
- `sky`
- `night`
- `auto`

Example:

    python3 install_pool_dashboard.py --config /config --theme sky --dry-run

## Installation

Once the dry run looks correct:

    python3 install_pool_dashboard.py --config /config --theme ocean --yes

If the Home Assistant configuration directory is `/config`, you can also use:

    ./install.sh

The helper script automatically uses `/config` when available, selects the `ocean` theme and confirms the installation.

## What the installer changes

Before modifying the installation, Pool Cockpit creates a backup.

The installer then:

1. copies the frontend to `/config/www/ha-pool-dashboard/`;
2. installs the custom component in `/config/custom_components/ha_pool_dashboard/`;
3. generates `/config/pool-dashboard.yaml`;
4. ensures that `ha_pool_dashboard:` exists in `configuration.yaml`;
5. stores installation information in `/config/.ha_pool_dashboard_install.json`.

## Backup

Backups are created automatically under:

    /config/backups/ha-pool-dashboard-YYYYMMDD-HHMMSS/

## After installation

Restart Home Assistant.

Pool Cockpit automatically configures the Lovelace resource and adds a **Piscine** dashboard to the Home Assistant sidebar.

The frontend resource is available at:

    /local/ha-pool-dashboard/pool-dashboard.js

The generated dashboard configuration is stored in:

    /config/pool-dashboard.yaml

No manual Lovelace resource registration is required for a standard installation.

## Device detection

Pool Cockpit can detect measurements including:

- water temperature;
- pH;
- ORP / redox;
- conductivity;
- salinity;
- free chlorine;
- battery level;
- Bluetooth signal and status;
- last analysis time;
- manual analysis action.

At least one significant water-quality measurement must be detected for a device to be considered usable.

## Troubleshooting detection

If no analyzer is detected, run:

    python3 install_pool_dashboard.py --config /config --theme ocean --dry-run --diagnostic

Check that your Blue Connect, Blueriiot, Zodiac or Flipr entities are already visible and enabled in Home Assistant.

If no compatible analyzer is detected, Pool Cockpit stops the installation rather than generating an empty dashboard.
