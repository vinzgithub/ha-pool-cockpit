<div align="center">

# 🌊 Pool Cockpit

### Your pool, one cockpit. Spring, summer, autumn and winter.

**Water readings · Smart filtration · Treatment · Heat pumps · Weather · Advice · Planning**

[**English**](README.md) · [**🇫🇷 Français**](README.fr.md)

![Release](https://img.shields.io/badge/release-v4.3.0-136caa) ![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Core%20%2F%20Docker-41BDF5) ![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial-0d355d)

![Pool Cockpit promotional artwork — Ocean theme](docs/images/v4.2.0/pool-cockpit-v4.2-hero.webp)

<sub>The original Pool Cockpit promotional artwork, preserved as part of the project's visual identity. Actual V4.3.0 screenshots appear in the gallery below.</sub>

**[All features](#all-features-explained-simply)** · **[Four seasons](#one-pool-four-seasons)** · **[Screenshots](#take-a-look)** · **[Get started](#get-started-in-three-steps)**

</div>

---

## Your pool deserves one simple dashboard

Pool equipment often lives in different apps: one for water quality, one for filtration and one for the heat pump. **Pool Cockpit brings monitoring, guidance and scheduling together in Home Assistant, throughout the year.**

**In spring**, get the pool ready. **In summer**, keep an eye on water and filtration. **In autumn**, adapt the schedule as the water cools. **In winter**, monitor active wintering if you choose to use it.

> **New to Home Assistant?** Think of Home Assistant as the hub that talks to your connected devices. Pool Cockpit is the friendly dashboard that helps you understand their information. It does not replace their integrations.

### What can I see?

| Section | What it tells you |
| --- | --- |
| 🏠 **Overview** | Is everything okay with my pool? |
| 💡 **Advice** | What should I pay attention to today? |
| 🧪 **Measurements** | What are my water temperature, pH and ORP readings, when available? |
| ⚙️ **Equipment** | What are my pump, heat pump and connected probes doing? |
| 📅 **Planning** | When is filtration scheduled, and how does that compare with the recommendation? |
| 🕘 **History** | What changed, and when? |

What you see depends on the devices and entities configured in your Home Assistant installation.

## One pool, four seasons

Pool Cockpit is **not a winter-only application**. Its everyday features remain at the heart of the project.

| Season | What you can do |
| :--- | :--- |
| 🌱 **Spring** | Check new readings after restarting your sensors, inspect pump and heat-pump status and adjust filtration periods. |
| ☀️ **Summer** | Monitor temperature, pH and ORP, review filtration guidance, log treatments and consider weather and reported bathing activity. |
| 🍂 **Autumn** | Compare the recommendation with your schedule, adjust as water cools and prepare equipment for seasonal shutdown. |
| ❄️ **Winter** | If appropriate, select active wintering, mark devices winterized and monitor cold-weather risks with a suitable local sensor. |

A **seasonal profile is a reference, not an automatic universal duration**. Water temperature, usable data and the configured operating context also matter. User choices and safety interlocks remain important.

## All features explained simply

### 🧪 Water readings — know what's happening in the pool

Pool Cockpit can display **water temperature, pH and ORP/redox**, plus available information such as conductivity, salinity or free chlorine. With supported Home Assistant entities, it also shows multiple analyzers, last readings, data freshness, trends and available connection or battery details.

**Analyzer families:** Blue Connect, Blueriiot, compatible Zodiac devices and Flipr can be discovered when they are already configured in Home Assistant. A manual analysis action may be offered if supported.

*Example:* after restarting your probe in spring, check that a genuinely new reading has arrived.

### 🔄 Filtration — understand recommendations and performance

Compare **recommended**, **scheduled** and, when observable, **actually running** filtration times. Depending on your settings, the dashboard also offers estimates of **filtered volume** and **pool-water turnover**, based on configured pool volume and nominal flow — these are not physical flow measurements without a flow sensor.

Recommendations consider suitable available inputs such as water temperature, season and operating context. When temperature readings are missing or stale, the engine uses a cautious fallback rather than treating an old reading as current.

*Example:* hot summer water may lead to longer recommended filtration; as the water cools, the recommendation may decrease.

### 📅 Planning — adapt automatically or stay in control

- **Adaptive scheduling:** proposes appropriate periods using configured rules.
- **Custom schedule:** edit days and hours; later calculations do not silently overwrite your choices.
- **Suspended adaptive mode:** retain existing periods until you explicitly resume.
- **One-off extension:** add filtration time without rewriting the permanent schedule.
- **Manual pump override:** available with correctly mapped equipment and safety controls, with an explicit return to scheduled operation.
- **Seasonal reference profiles:** spring, summer, autumn and winter, alongside water-temperature and context-based advice.

*Example:* after a particularly busy swimming day, temporarily extend filtration while keeping your regular weekly plan.

### 🧴 Water treatment and dosage — practical maintenance guidance

The **Treatment & Dosage** workspace uses your configured pool profile: volume, disinfectant type, available measurements, visual water condition, reported bathing activity and other settings. It can provide indicative dosage information for chlorine or bromine, pH products and supplementary products, with TAC/hardness inputs when applicable.

Keep a **treatment journal** to record what you have done. Supplementary product schedules may be on-demand or based on an explicitly selected manufacturer protocol.

**No chemical product is dispensed automatically.** Always validate quantities against real water tests, product instructions and your pool conditions.

### 🌡️ Heat pumps — Polytropic reference, other models possible

The heat-pump display was developed around a **reference installation using a Polytropic heat pump connected to Home Assistant**. It uses **mapped Home Assistant entities** to show information such as operating state, temperature setpoint, available modes, inlet/outlet temperatures, communication and fault data.

**Other brands may also be usable** if a Home Assistant integration provides equivalent entities. Compatibility is assessed **model by model**; Pool Cockpit does not automatically discover or certify every heat pump.

**Safety:** heat-pump write commands remain **locked in the public V4.3.0 release**. Being able to monitor the unit does not imply you can start it or change its setpoint.

### 🌦️ Weather, warnings and everyday advice

Where compatible Home Assistant entities exist, Pool Cockpit can show **weather information and Météo-France alerts**. Context-aware advice can use available measurements, temperature, reported usage or water condition. Remote weather is never a substitute for local frost-safety measurement.

### 📈 History and the Pool Expert Assistant

Review available trends, activity information and the **treatment journal**. The **Pool Expert Assistant** explains conclusions already computed by the application's rules for filtration, treatment, weather or the heat pump. Optional AI reformulation, if configured, **does not determine dosages or control devices**.

### 🎨 Interface, themes, languages and demo mode

The dashboard includes **Overview, Advice, Measurements, Equipment, Planning and History**, with responsive layouts, multiple languages and themes including Ocean.

- **Real mode:** displays information from your configured Home Assistant entities.
- **Demonstration mode:** explore using fictional values, with no impact on physical devices.
- **Master/satellite coordination:** optional advanced configuration; unnecessary for a standard single-pool setup.

### ❄️ Active wintering — the V4.3.0 addition

Switch between **Normal, Active Wintering and Maintenance**, retain your previous schedule and mark devices winterized independently. Optional frost monitoring may **request circulation** when a suitable local sensor signals cold conditions, subject to hydraulic safety interlocks.

Frost monitoring is **disabled by default following migration**. It cannot replace autonomous physical freeze protection when power, Home Assistant, pumps or water flow fail. [Read the wintering and safety guide](release/v4.3.0/README.md).


## ✨ What's specifically new in V4.3.0?

**All spring, summer and autumn functionality remains available.** This release mainly adds:

- Explicit **Normal, Active Wintering and Maintenance** modes, with confirmation and schedule preservation.
- Configurable **local frost monitoring**, adjustable thresholds and safety priorities.
- Clearer distinction between device availability, requested operation, observed operation and flow verification (only with a flow sensor).
- More compact **Overview / Equipment** status cards and clearer **Planning** timelines.
- A safer, simpler installer for fresh installations and recognized V4.2.1 upgrades.

**Important:** software frost monitoring is not an independent hardware freeze-protection system. [Read the full safety limitations](release/v4.3.0/README.md).

## Take a look

These are genuine V4.3.0 browser captures from the isolated test setup using **simulated devices**.

| Overview — calm, at-a-glance status | Planning — understand scheduled vs. observed filtration |
| :---: | :---: |
| ![V4.3.0 Overview](release/v4.3.0/visuals/after-overview-1440.webp) | ![V4.3.0 Planning](release/v4.3.0/visuals/after-planning-1440.webp) |

| Equipment — each device has its own status | Mobile — the same cockpit on smaller screens |
| :---: | :---: |
| ![V4.3.0 Equipment](release/v4.3.0/visuals/after-equipment-1440.webp) | ![V4.3.0 Mobile overview](release/v4.3.0/visuals/after-overview-390.webp) |

The Ocean theme is shown here. Other themes and language options are available. See the [V4.3.0 design review](release/v4.3.0/UX_REVIEW.md) for more screenshots.

## 🏊 Real pool or 🎮 Demonstration?

| | Real pool | Demonstration |
| --- | --- | --- |
| **Need physical pool hardware?** | Yes, to display real readings | No |
| **Need Home Assistant?** | Yes | Yes |
| **Where does the data come from?** | Your configured HA entities | Fictional sample values |
| **Can demo controls operate equipment?** | Not applicable | **Never** |

**Real mode** uses information from compatible Home Assistant integrations. For example, the independent [Blue Connect Local](https://github.com/Adrien40/ha-blue-connect-local) and [Flipr Local](https://github.com/Adrien40/ha-flipr-local) integrations may supply data for their respective devices. They are **not included in Pool Cockpit**, and you do not need them unless you own the hardware.

**Demonstration mode** is a safe way to discover the dashboard before connecting any equipment. It does not pretend to provide real frost protection.

## Get started in three steps

Pool Cockpit V4.3.0 supports **Home Assistant Core / Docker** installations where you can access the directory containing `configuration.yaml`. You need Python 3, Git and a full Home Assistant backup. It is **not installed through HACS**.

**1. Get the project**

```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
```

**2. Check the installation — without changing anything**

```bash
sh install.sh --config /path/to/homeassistant/config --dry-run
```

**3. Back up Home Assistant, stop it, and install**

```bash
sh install.sh --config /path/to/homeassistant/config --yes
```

Then **restart Home Assistant manually** and refresh your browser. Look for the **Piscine / Pool Cockpit** dashboard.

The installer recognizes either a **fresh installation** or an **official V4.2.1 installation**. It makes a dated backup before changing existing files, preserves your settings, and refuses unfamiliar or modified installations instead of overwriting them. It does **not** stop or restart Home Assistant itself.

**Already running another version, or using Home Assistant OS?** Read the [installation, compatibility and rollback guide](docs/user/INSTALLATION.md) before doing anything.

## Three real-life examples

**🌱 Spring:** after reopening your pool, check fresh measurements, pump availability and your new filtration timetable.

**☀️ Summer:** after several hot, busy days, review the suggested filtration duration, adjust your schedule if needed and record the treatment used.

**❄️ Winter:** if active wintering is appropriate, confirm a seasonal timetable and monitor warnings. Frost monitoring depends on a reliable local sensor and functioning physical safeguards.

## Frequently asked questions

<details>
<summary><strong>Will Pool Cockpit replace my existing Home Assistant setup?</strong></summary>

No. On a recognized V4.2.1 upgrade, it preserves your dashboard configuration and Pool Cockpit data. A versioned backup is created first. Because V4.3.0 also updates the Python integration and storage schema, use the installer and follow the documented stop/restart procedure.

</details>

<details>
<summary><strong>Do I need a Blue Connect, Flipr, or a heat pump?</strong></summary>

No. Those devices are optional. Use the entities your own compatible Home Assistant integrations provide. You can also explore without hardware in Demonstration mode.

</details>

<details>
<summary><strong>Does activating winter mode guarantee my pool will not freeze?</strong></summary>

No. A shorter daily filtration period alone does not guarantee frost protection. The optional software frost feature also depends on a real local sensor, working Home Assistant, power, pump and safe water circulation. A suitably installed physical protection system and manufacturer instructions remain important.

</details>

<details>
<summary><strong>How do I undo a V4.3.0 upgrade?</strong></summary>

Stop Home Assistant first. The installer records a dated backup path and provides a `--rollback` option. **Restore the JavaScript, Python backend and storage together**, not only one part. See the [rollback instructions](docs/user/INSTALLATION.md).

</details>

## Further reading

**[Full feature guide](docs/user/DASHBOARD.md)** · **[GitHub Releases](https://github.com/vinzgithub/ha-pool-cockpit/releases)** · **[V4.3.0 wintering guide](release/v4.3.0/README.md)** · **[Installation and rollback](docs/user/INSTALLATION.md)** · **[Tests and limitations](release/v4.3.0/TEST_REPORT.md)** · **[French documentation](README.fr.md)**

**Privacy and safety:** keep Home Assistant credentials and private device identifiers out of issues and screenshots. Pool Cockpit is not a substitute for professional pool maintenance, electrical protection or physical hydraulic interlocks. Real equipment commands must be checked against your installation.

**License:** [PolyForm Noncommercial 1.0.0](LICENSE). Commercial use is subject to its terms.

---

<div align="center">
<sub>🌊 Pool Cockpit V4.3.0 · Home Assistant · A simpler way to understand your pool.</sub>
</div>
