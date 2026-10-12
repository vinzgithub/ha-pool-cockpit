<div align="center">

# 🌊 Pool Cockpit V4 — Release Candidate 1

**Your pool. One elegant cockpit.**  
*A modern Home Assistant dashboard for smarter pool monitoring, analysis and control.*

[**English**](README.md) · [**Français**](README.fr.md)

![Release Candidate](https://img.shields.io/badge/release-v4.0.0--rc.1-177ed7) ![Home Assistant](https://img.shields.io/badge/Home%20Assistant-dashboard-41BDF5) ![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial-0d355d)

![Pool Cockpit V4 promotional hero](docs/images/v4-rc1/hero-en.webp)

<sub>Promotional illustration inspired by the V4 interface; see actual screenshots below.</sub>

</div>

## See the real interface

The Ocean interface brings water quality, recommendations, monitoring and equipment control into seven connected views. The following images are **real application screenshots**, not generated marketing renders.

### Overview

![Actual V4 Overview dashboard](docs/images/v4-rc1/overview.webp)

### Water · Advice · Measurements

| Water quality | Contextual advice |
|:---:|:---:|
| ![V4 Water screen](docs/images/v4-rc1/water.webp) | ![V4 Advice screen](docs/images/v4-rc1/advice.webp) |

![V4 measurement sources and status](docs/images/v4-rc1/measurements.webp)

### Equipment · Planning

| Equipment controls | Scheduling |
|:---:|:---:|
| ![V4 Equipment screen](docs/images/v4-rc1/equipment.webp) | ![V4 Planning screen](docs/images/v4-rc1/planning.webp) |

**History** is also one of the seven V4 views; an up-to-date screenshot will be added after final validation.

## What V4 offers

- **Ocean-inspired UI:** immersive background, translucent surfaces and consistent typography.
- **Water awareness:** temperature, pH, ORP, confidence and contextual status.
- **Compact quick controls:** pump, heat pump and pool lighting, subject to existing safety rules.
- **Actionable advice:** measurements, recommendations and maintenance prompts.
- **Analysis feedback:** contextual progress states without fabricated completion percentages.
- **Nine language options:** French, English, German, Spanish, Brazilian Portuguese, Italian, Dutch, Japanese and Simplified Chinese. Translation coverage is still being refined.
- **Responsive layout:** desktop and mobile views.

## Installation — V4 RC1

> **Pre-release.** V3 remains the stable edition on `main`. The V4 RC1 artifact is available only on `release/v4-rc1` and requires an existing compatible Pool Cockpit / Home Assistant setup.

1. Open `release/v4-rc1/` on the RC1 branch. Verify the frontend `pool-dashboard-v4-test.js` SHA-256:

   ```text
   49a5faf55bc3850232b97c996832c7cf85a94cdea253c802c8011edfeb13578c
   ```

2. Back up the existing **V4 test** JS resource, then install the RC1 JS and `pool-cockpit-v4-logo.png` into `/config/www/ha-pool-dashboard/` (or the equivalent host-side directory). Do **not** replace the V3 resource.
3. In Home Assistant Lovelace resources, select **JavaScript module**:

   ```text
   /local/ha-pool-dashboard/pool-dashboard-v4-test.js?v=v4.0.0-rc.1
   ```

4. Refresh your browser and validate the configured entities and equipment commands. Restore your previous V4 JS backup to roll back.

## Release status and safety

The RC1 JavaScript artifact differs from the source-generated `frontend/dist/pool-dashboard.js`. Full source reconciliation, translations of some dynamic V3 texts and end-to-end hardware testing remain open before the stable V4 release. This preview does not replace Home Assistant automations or safety interlocks.

Avoid publishing Home Assistant tokens, secrets, credentials or identifiable live telemetry. Promotional images are illustrative, not functional guarantees.

**License:** PolyForm Noncommercial 1.0.0.  
**[V3 stable branch](https://github.com/vinzgithub/ha-pool-cockpit/tree/main)** · **[V4 RC1 release](https://github.com/vinzgithub/ha-pool-cockpit/releases/tag/v4.0.0-rc.1)**
