# Pool Cockpit for Home Assistant

**Pool Cockpit** is an advanced swimming-pool monitoring and management dashboard for Home Assistant.

It brings water measurements, filtration performance, scheduling, heat-pump monitoring, treatment guidance, weather context and equipment status into a single responsive interface.

![Pool Cockpit dashboard overview](docs/images/dashboard-overview.png)

> Copyright © 2026 Vincent Fournet
> Source-available for non-commercial use under the PolyForm Noncommercial License 1.0.0.

## Highlights

- Water temperature, pH and ORP monitoring
- Conductivity, salinity and free-chlorine support
- Blue Connect / Blueriiot / Zodiac and Flipr discovery
- Multi-analyzer comparison and confidence indicators
- Filtration performance and daily target tracking
- Seasonal and adaptive filtration scheduling
- Heat-pump monitoring with protected control interface
- Energy monitoring
- Weather-aware recommendations
- Pool treatment and dosage workspace
- Maintenance and treatment journal
- Expert contextual summary
- Responsive desktop and mobile interface
- Optional coordination between two Home Assistant instances

## Dashboard

Pool Cockpit is designed as a single visual cockpit for the pool.

The interface includes dedicated sections for:

- measurement devices;
- filtration performance;
- scheduling and equipment actions;
- heat pump;
- treatment and dosage;
- contextual recommendations.

See the full interface guide:

[Dashboard documentation](docs/user/DASHBOARD.md)

## Quick start

Pool Cockpit automatically discovers compatible pool analyzers already registered in Home Assistant.

Before installation, run a diagnostic dry run:

    python3 install_pool_dashboard.py --config /config --theme ocean --dry-run --diagnostic

Then install:

    python3 install_pool_dashboard.py --config /config --theme ocean --yes

On systems where the Home Assistant configuration directory is `/config`, the helper script can also be used:

    ./install.sh

Restart Home Assistant after installation.

## Documentation

### User documentation

- [Installation](docs/user/INSTALLATION.md)
- [Configuration](docs/user/CONFIGURATION.md)
- [Dashboard guide](docs/user/DASHBOARD.md)

### Developer documentation

- [Architecture](docs/developer/ARCHITECTURE.md)
- [Design system](docs/developer/DESIGN_SYSTEM.md)
- [Business rules](docs/developer/REGLES_METIER.md)
- [Testing](docs/developer/TESTING.md)
- [Roadmap](docs/developer/ROADMAP.md)

## Compatible analyzers

Automatic discovery currently supports analyzer families identified as:

- Blue Connect
- Blueriiot
- Zodiac-compatible Blue Connect devices
- Flipr

Pool Cockpit reads the Home Assistant entity and device registries and maps the measurements exposed by compatible devices.

## Themes

Four visual themes are available:

- `ocean`
- `sky`
- `night`
- `auto`

The default theme used by `install.sh` is `ocean`.

## Safety

Pool Cockpit provides monitoring, calculations and contextual recommendations based on Home Assistant data and local configuration.

Treatment recommendations must always be checked against the actual pool conditions and the instructions printed on the products being used.

Equipment controls may be protected or unavailable depending on the configuration and safety rules of the installation.

## License

Pool Cockpit is **source-available for non-commercial use**.

Copyright © 2026 Vincent Fournet.

The source code is licensed under the **PolyForm Noncommercial License 1.0.0**.

See:

- [LICENSE](LICENSE)
- [NOTICE](NOTICE)
- [Commercial licensing](COMMERCIAL-LICENSE.md)

### Commercial use

The public license does **not** grant commercial-use rights.

Commercial use, resale, paid redistribution, inclusion in a commercial product or service, or other commercial exploitation requires a separate written license from Vincent Fournet.

Access to the public source code does not grant a commercial license.

## Disclaimer

Pool Cockpit is an independent project for Home Assistant.

Home Assistant and other product or company names mentioned by this project remain the property of their respective owners.
