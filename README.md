<div align="center">

<img src="release/assets/pool-cockpit-v4-logo.png" alt="Pool Cockpit" width="128" />

# Pool Cockpit V4

### Your pool. One elegant cockpit.

**A premium Home Assistant experience for monitoring, understanding and controlling your pool.**

![Status](https://img.shields.io/badge/status-release%20candidate-0d7ddc?style=flat-square) ![Version](https://img.shields.io/badge/version-v4.0.0--rc.1-083657?style=flat-square) ![Home Assistant](https://img.shields.io/badge/platform-Home%20Assistant-41BDF5?style=flat-square) ![Languages](https://img.shields.io/badge/languages-9-0f766e?style=flat-square)

*Designed for clarity. Built around real pool telemetry.*

</div>

---

## A new perspective on your pool

Pool Cockpit V4 brings a redesigned, responsive interface to Home Assistant. Instead of navigating a collection of raw entities, you get an integrated cockpit built around water condition, relevant advice, measurement sources, equipment and scheduling.

> **Release Candidate 1 — not a stable release.** The V4 interface is ready for release-candidate testing; full end-to-end validation, translations of some dynamic V3 messages and hardware-specific behavior still require verification.

## Explore V4

| Space | Purpose |
| :--- | :--- |
| **Overview** | Water status, essential indicators, global score, analysis progress, quick actions and weather |
| **Water** | Core water-quality metrics and expert insight |
| **Advice** | Contextual recommendations and next actions |
| **Measurements** | Sources, health, freshness and monitoring details |
| **Equipment** | Detailed pump, heat pump and lighting controls |
| **Planning** | Equipment schedules and operational configuration |
| **History** | Trends, charts and historical readings |

### Designed for the everyday

- **Ocean-inspired visual system** — refined translucent cards, consistent branding, coherent typography and responsive layouts.
- **Glanceable quick controls** — compact circular actions for pump, heat pump and lighting with state feedback; existing safety rules and command handlers remain authoritative.
- **Analysis feedback** — contextual status and a discreet progress indicator; no invented percentage of completion.
- **Nine interface languages** — French, English, German, Spanish, Brazilian Portuguese, Italian, Dutch, Japanese and Simplified Chinese. *Translation coverage is still being refined during RC testing.*
- **Native Home Assistant integration** — uses your configured entities and installed backend; this front-end package does not replace your existing automation logic.

## RC1 installation

> **Release Candidate — frontend preview.**
> Requires an existing compatible Pool Cockpit installation.
> The stable V3 dashboard must remain unchanged.

The tested V4 frontend is available in `release/v4-rc1/`.

### Included files

- `pool-dashboard-v4-test.js` — V4 RC1 frontend bundle.
- `pool-cockpit-v4-logo.png` — official dashboard logo.

### Verify integrity

Run `sha256sum release/v4-rc1/*`.

Expected JavaScript SHA-256:
`49a5faf55bc3850232b97c996832c7cf85a94cdea253c802c8011edfeb13578c`

### Install

Back up the existing V4 test resource before replacing it.

Destination: `/home/homeassistant/config/www/ha-pool-dashboard/`

Copy the JavaScript bundle and logo from `release/v4-rc1/`
to this destination.

Configure Lovelace resource type as **JavaScript module**.

Resource URL:
`/local/ha-pool-dashboard/pool-dashboard-v4-test.js?v=v4.0.0-rc.1`

Refresh the browser and validate the V4 dashboard.

**Rollback:** restore the previous V4 test JavaScript.
Never replace the stable V3 resource.

> The RC1 frontend and the repository's source-built bundle
> are currently distinct artifacts. Source reconciliation is
> required before the final V4 release.

## Reliability and safety

V4 is an interface layer, not a replacement for Home Assistant's authority over device state. Pump, heat-pump and lighting operations must continue to follow the pre-existing command handlers, device states and safety guards. Before enabling hardware controls, validate every entity mapping and test stop/start behavior locally.

**Never commit** tokens, HA secrets, `secrets.yaml`, device credentials, personal telemetry exports or environment-specific private configuration.

## RC1 known limitations

- Some dynamic domain-specific text inherited from the V3 engine may remain untranslated.
- Nine-locale catalog checks confirm key presence, **not** complete translation quality.
- Automated syntax/integrity checks do not replace functional tests across all pages, themes, browsers and devices.
- The bundle is a release artifact; the original modular source tree is **not** included in this distribution.

## Project principles

**Clarity over clutter.** Real data over simulated status. Safety over convenience. Progressive improvement without destabilizing a working installation.

---

<div align="center"><sub>Pool Cockpit V4 • Release Candidate 1 • Built for Home Assistant</sub></div>
