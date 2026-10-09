<div align="center">

# 🏊 Pool Cockpit

### A modern Home Assistant dashboard for smarter pool monitoring

**Water quality · Filtration · Heating · Lighting · Cameras · Scheduling**

<br>

<img src="docs/images/dashboard-overview.png"
     alt="Pool Cockpit dashboard overview"
     width="100%">

<br><br>

**Designed for Home Assistant · Local-first · Responsive · Open source for non-commercial use**

</div>

---

## ✨ Your pool. One cockpit.

Pool Cockpit turns Home Assistant into a clear and modern control center for your pool.

Instead of jumping between sensors, entities and dashboards, Pool Cockpit brings the essential information together in one interface: water measurements, pool equipment, scheduling and treatment guidance.

The goal is simple: **understand the state of your pool at a glance.**

---

## 🌊 See what matters instantly

<table>
<tr>
<td width="50%" valign="top">

### 🧪 Water treatment

<img src="docs/images/treatment.png"
     alt="Pool Cockpit water treatment">

Monitor the information that matters for water balance and treatment from a single view.

</td>
<td width="50%" valign="top">

### 📡 Measurement devices

<img src="docs/images/measurement-devices.png"
     alt="Pool Cockpit measurement devices">

Keep an eye on connected measurement devices and their current availability.

</td>
</tr>
</table>

---

## ⚙️ Pool equipment at a glance

<table>
<tr>
<td width="50%" valign="top">

### 💧 Filtration

<img src="docs/images/filtration.png"
     alt="Pool Cockpit filtration">

Monitor filtration status and operation, including the filtration pump when exposed in Home Assistant.

</td>
<td width="50%" valign="top">

### 🔥 Heat pump

<img src="docs/images/heat-pump.png"
     alt="Pool Cockpit heat pump">

Keep heat-pump status and controls visible alongside the rest of your pool equipment.

</td>
</tr>
</table>

Pool Cockpit can also surface other compatible Home Assistant equipment — such as **pool lighting** and **camera views** — when those entities are available.

---

## 🗓️ Plan instead of guessing

<img src="docs/images/scheduling.png"
     alt="Pool Cockpit scheduling"
     width="100%">

Pool Cockpit brings scheduling information into the same interface so that monitoring and operation stay easy to understand.

---

## 🚀 Built for Home Assistant

Pool Cockpit is designed to feel at home inside Home Assistant rather than looking like an external application pasted on top of it.

### Highlights

- **Modern dashboard UI** designed specifically for pool monitoring
- **Water measurements** including temperature, pH, ORP and conductivity when available
- **Measurement-device visibility** and confidence information
- **Filtration monitoring**
- **Pool equipment integration** — filtration pump, heat pump, lighting and camera views when available
- **Scheduling views**
- **Treatment-oriented information**
- **Responsive interface** for different screen sizes
- **Graceful unavailable states** when measurements are temporarily missing
- **Automatic Lovelace setup** during installation
- **Local-first architecture**

---

## 🎨 Designed to stay readable

Pool conditions are not always perfect — and sensors are not always available.

Pool Cockpit is designed to remain useful even when measurements disappear temporarily. Missing values are presented clearly instead of being confused with real measurements such as `0%`.

The interface adapts its presentation so the dashboard remains clean, balanced and easy to read.

---

## 📦 Installation

Pool Cockpit includes an installer that prepares the required Home Assistant dashboard resources and Lovelace configuration.

After installation, Pool Cockpit appears as its own dashboard inside Home Assistant.

> Before installing or upgrading, always keep a backup of your Home Assistant configuration.

---

## 🔌 Measurement sources

Pool Cockpit works with Home Assistant entities and can aggregate compatible pool measurement data exposed by integrations.

Typical measurements include:

| Measurement | Example |
|---|---|
| 🌡️ Water temperature | °C |
| 🧪 pH | pH |
| ⚡ ORP | mV |
| 💧 Conductivity | µS/cm |
| 🧂 Salinity | when available |
| 🔋 Battery | when available |
| 📶 Connectivity | when available |

The dashboard is designed so that unavailable measurements do not break the overall presentation.

---

## 🏠 Built around Home Assistant

Pool Cockpit does not try to replace Home Assistant.

It provides a dedicated pool-oriented interface on top of your existing Home Assistant environment, while keeping the underlying entities, automations and integrations under your control.

---

## 📸 Gallery

<table>
<tr>
<td width="50%">
<img src="docs/images/dashboard-overview.png" alt="Dashboard overview">
</td>
<td width="50%">
<img src="docs/images/treatment.png" alt="Water treatment">
</td>
</tr>
<tr>
<td align="center"><b>Dashboard overview</b></td>
<td align="center"><b>Water treatment</b></td>
</tr>

<tr>
<td width="50%">
<img src="docs/images/filtration.png" alt="Filtration">
</td>
<td width="50%">
<img src="docs/images/heat-pump.png" alt="Heat pump">
</td>
</tr>
<tr>
<td align="center"><b>Filtration</b></td>
<td align="center"><b>Heat pump</b></td>
</tr>

<tr>
<td width="50%">
<img src="docs/images/measurement-devices.png" alt="Measurement devices">
</td>
<td width="50%">
<img src="docs/images/scheduling.png" alt="Scheduling">
</td>
</tr>
<tr>
<td align="center"><b>Measurement devices</b></td>
<td align="center"><b>Scheduling</b></td>
</tr>
</table>

---

## 🛡️ License & copyright

**Copyright © 2026 Vincent Fournet.**

The source code is licensed under the **PolyForm Noncommercial License 1.0.0**.

See:

- [LICENSE](LICENSE)
- [NOTICE](NOTICE)
- [Commercial licensing](COMMERCIAL-LICENSE.md)

### Commercial use

The public license does **not** grant commercial-use rights.

Commercial use, resale, paid redistribution, inclusion in a commercial product or service, or other commercial exploitation requires a separate written license from Vincent Fournet.

**Access to the public source code does not grant a commercial license.**

---

## ℹ️ Disclaimer

Pool Cockpit is an independent project for Home Assistant.

Home Assistant and other product or company names mentioned by this project remain the property of their respective owners.

---

<div align="center">

### 🏊 Pool Cockpit

**A clearer view of your pool.**

Copyright © 2026 Vincent Fournet

</div>
