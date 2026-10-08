# Architecture

Pool Cockpit is split into a Python/Home Assistant backend and a modular JavaScript frontend.

## Backend

The backend is composed of two main parts:

- `ha_pool_dashboard/` — discovery, installation, dashboard generation and supporting Python logic.
- `home_assistant/custom_components/ha_pool_dashboard/` — Home Assistant custom integration, services, scheduling, treatment journal and optional Gemini backend.

## Frontend

The frontend source is maintained in:

- `src/` — business logic, controllers and interface modules.
- `frontend/pool-dashboard.template.js` — dashboard template.
- `frontend/dist/` — generated distribution bundle and visual assets.

The file:

`frontend/dist/pool-dashboard.js`

is a generated artifact and must not be edited manually.

## Build

The frontend build is reproducible.

The canonical flow is:

`src/ + frontend/pool-dashboard.template.js → frontend/dist/pool-dashboard.js`

The bundle is generated with:

    npm run build

The committed bundle can be checked against its sources with:

    npm run build:check

## Main frontend areas

- `src/moteur/` — core calculation engines.
- `src/programmation/` — scheduling and priority logic.
- `src/pac/` — heat-pump safety and commands.
- `src/traitement/` — treatment calculations and journal logic.
- `src/intelligence/` — contextual analysis and recommendations.
- `src/interface/` — presentation and interaction components.
- `src/adaptateurs/` — Home Assistant integration adapters.

## Separation of responsibilities

Business-logic modules are designed to remain independent from the DOM and Home Assistant whenever possible.

Equipment control, persistence and Home Assistant service calls remain isolated at integration boundaries.

The generated distribution bundle is the deployable frontend artifact.

## Testing

The project includes:

- JavaScript unit and runtime tests.
- Build reproducibility tests.
- Python backend tests.
- Static package-integrity tests.
- Smoke tests.

See `TESTING.md` for details.

## Device identity

Each measurement device uses a stable backend-generated identity.

The device brand, such as Blue Connect or Flipr, is not used as the unique identifier.
