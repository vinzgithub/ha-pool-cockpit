<div align="center">

# 🌊 Pool Cockpit V4.1.0

### Your pool. One elegant cockpit.

**Monitoring · Advice · Measurements · Equipment · Planning · History**

**English** · [**Français**](README.fr.md)

![Version](https://img.shields.io/badge/version-4.1.0-126caa) ![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Core%20%2F%20Docker-41BDF5) ![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial-0d355d)

![Pool Cockpit promotional illustration](docs/images/v4-rc1/hero-en.webp)

<sub>Promotional artwork and screenshots below date from the early V4 RC1. The released V4.1.0 interface has since evolved.</sub>

</div>

## What is Pool Cockpit?

**Pool Cockpit** is a six-view Home Assistant dashboard for monitoring swimming pool water, understanding measurements, viewing connected equipment and managing schedules. V4.1.0 ships as a **complete installation**, not as a demo-only patch or an extension that requires a previously installed V4.

**The main addition in V4.1.0 is the Real / Demonstration selector.**

- **Real pool:** your configured Home Assistant entities only; no simulated measurements are presented as real. Configured installations open in Real mode by default.
- **Demonstration:** explore the interface using explicitly labelled fictional sensors, weather, camera and equipment controls. Demo actions never operate real equipment.
- **No configured devices:** the fresh installation opens in Demonstration mode. Choosing Real pool shows a setup message instead of an empty grey screen.

## Screenshots

The following **historical RC1 screenshots** illustrate the six-view concept; they are not final V4.1.0 screenshots.

![Historical overview (RC1)](docs/images/v4-rc1/overview.webp)

| Advice | Measurement devices |
|:---:|:---:|
| ![Historical RC1 advice](docs/images/v4-rc1/advice.webp) | ![Historical RC1 measurements](docs/images/v4-rc1/measurements.webp) |

| Equipment | Planning |
|:---:|:---:|
| ![Historical RC1 equipment](docs/images/v4-rc1/equipment.webp) | ![Historical RC1 planning](docs/images/v4-rc1/planning.webp) |

## Features

- **Six sections:** Overview, Advice, Measurements, Equipment, Planning and History.
- **Water measurements:** temperature, pH, ORP and other readings when supplied by Home Assistant.
- **Device association:** configure compatible monitoring devices and available entities.
- **Equipment:** view filtration, heat pump and lighting status; enable real controls only after validating your mappings and safeguards.
- **Schedules and history:** explore available plans, measurements and trends.
- **Visual interface:** Ocean theme, four theme choices, nine language options and responsive layouts.
- **Real / Demo isolation:** fictional data and controls do not affect real equipment or replace real device settings.

Some older V3 strings and hardware-specific integrations may still need adjustment on individual installations.

## Install V4.1.0 from Git

**Validated:** Home Assistant Core / Docker on a new, sensor-free Home Assistant instance, with access to the actual host-side configuration directory. Python 3 and Git are required on the machine running the installer. **Back up Home Assistant before installation.** This is *not* a HACS installation and *not* an automated V3 migration.

```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
python3 install_v41.py --config /path/to/homeassistant/config --dry-run
python3 install_v41.py --config /path/to/homeassistant/config --yes
```

Replace `/path/to/homeassistant/config` with **the real directory on the machine running Python**, containing `configuration.yaml`. For a Docker container, the directory on the host often differs from `/config` inside Home Assistant.

- `--dry-run` checks compatibility **without writing files**.
- `--yes` explicitly authorizes installation; it creates a dated backup of the existing configuration.
- The installer installs the V4 frontend, backend, demo overlay, assets and the **Piscine** sidebar dashboard.
- **Validate the Home Assistant configuration** using your setup's supported check, then restart Home Assistant manually and refresh the browser.
- Open **Piscine** and choose **Real pool** or **Demonstration**.

The installer refuses existing incompatible Lovelace setups, existing Pool Cockpit files and unsupported paths rather than forcibly overwriting them. It does not automatically restart Home Assistant.

### Upgrade from an eligible V4.0.0 installation

For an **official, unmodified, recognized V4.0.0 installation only**:

```bash
python3 install_v41.py --config /path/to/homeassistant/config --upgrade --dry-run
python3 install_v41.py --config /path/to/homeassistant/config --upgrade --yes
```

The compatibility check rejects modified or unsupported V4 installations. It preserves the existing V4 bundle, backend and custom dashboard configuration. Make a full backup first; review the upgrade and rollback details before proceeding.

### Download the release ZIP

Prefer a packaged archive? Download the ZIP and SHA-256 checksum from the [**V4.1.0 release**](https://github.com/vinzgithub/ha-pool-cockpit/releases/tag/v4.1.0). Verify the checksum and archive's internal `SHA256SUMS` before running the same installer.

📖 [Complete V4.1.0 installation, upgrade and rollback guide](release/v4.1.0/INSTALLATION.md) · [Release notes](docs/releases/V4.1.0.md)

## Backups, limitations and security

- **Backups:** installer snapshots are saved in `.pool_cockpit_backups/`; keep a separate full Home Assistant backup. Restoring YAML alone is **not** a complete uninstall.
- **V3:** no automatic V3 migration. Historical source remains on [`old-v3`](https://github.com/vinzgithub/ha-pool-cockpit/tree/old-v3).
- **Other installations:** Home Assistant OS/Supervised without writable access to the configuration directory is not covered by this automated installer.
- **Privacy:** do not publish Home Assistant credentials, device IDs, tokens or sensitive telemetry.
- **Safety:** Pool Cockpit is not a substitute for physical interlocks, safety devices or pool maintenance. Verify every real equipment command before use.

**License:** [PolyForm Noncommercial 1.0.0](LICENSE). Commercial use is governed by the license terms.

---

<div align="center"><sub>Pool Cockpit V4.1.0 · Home Assistant · Your pool. One elegant cockpit.</sub></div>
