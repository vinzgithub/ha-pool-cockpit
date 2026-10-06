# Pool Cockpit for Home Assistant

**Pool Cockpit** is an advanced swimming-pool monitoring, analytics and control dashboard for Home Assistant.

It brings water measurements, filtration, heat-pump control, energy monitoring and contextual recommendations into a single responsive interface.

> Copyright © 2026 Vincent Fournet<br>
> Licensed for non-commercial use under the PolyForm Noncommercial License 1.0.0.

## Features

- Pool temperature monitoring
- pH and ORP monitoring
- Conductivity monitoring
- Historical sensor trends
- Filtration monitoring and scheduling
- Seasonal filtration profiles
- Heat-pump monitoring and control
- Energy monitoring
- Blue Connect support
- Weather-aware recommendations
- Sensor confidence and comparison
- Treatment journal
- Responsive Home Assistant interface
- Optional master / satellite coordination between two Home Assistant sites

## Architecture

Main directories:

- `src/` — dashboard source modules and business logic
- `frontend/` — dashboard template and generated distribution bundle
- `home_assistant/custom_components/ha_pool_dashboard/` — Home Assistant backend integration
- `ha_pool_dashboard/` — Python package and installation helpers
- `tests/` — JavaScript and Python automated tests
- `outils/` — bundle generation tools
- `docs/` — architecture, testing and design documentation

The generated dashboard bundle is:

`frontend/dist/pool-dashboard.js`

## Development

JavaScript tests:

    npm ci
    npm test
    npm run test:smoke

Python tests:

    python -m pytest

The build system verifies that the committed distribution bundle matches the source code.

## License

Pool Cockpit is **source-available for non-commercial use**.

Copyright © 2026 Vincent Fournet.

The source code is licensed under the **PolyForm Noncommercial License 1.0.0**.

See:

- `LICENSE` — full public license
- `NOTICE` — copyright notice
- `COMMERCIAL-LICENSE.md` — commercial licensing information

### Commercial use

The public license does **not** grant commercial-use rights.

Commercial use, resale, paid redistribution, inclusion in a commercial
product or service, or other commercial exploitation requires a separate
written license from Vincent Fournet.

Access to the public source code does not grant a commercial license.

## Disclaimer

Pool Cockpit is an independent project for Home Assistant.

Home Assistant and other product or company names mentioned by this
project remain the property of their respective owners.
