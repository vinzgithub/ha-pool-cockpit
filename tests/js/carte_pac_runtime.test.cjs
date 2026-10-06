const test = require("node:test");
const assert = require("node:assert/strict");
const { loadBundle, buildCard, state } = require("./bundle_harness.cjs");

test("étape 12 rend réellement la carte PAC de simulation avec le cadran et la température bassin", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card.aggregate = () => ({ number: 27.1 });
  const modele = card.rc30PacModel(card._rc27Control.pac);
  const html = card.rc30RenderPacCard(modele);
  assert.match(html, /<h3>PAC Polytropic<\/h3><b>Simulation<\/b>/);
  assert.match(html, /data-rc30-pac-gauge role=slider/);
  assert.match(html, /Eau bassin 27,1 °C/);
  assert.match(html, /data-rc30-pac-sim="on">Démarrer/);
  assert.match(html, /data-rc30-pac-sim="off">Arrêter/);
});

test("étape 12 rend réellement une PAC raccordée avec mode, énergie et défauts issus des entités", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime, {
    states: {
      "switch.pac": state("on"),
      "number.pac_consigne": state("29"),
      "sensor.pac_in": state("27.9"),
      "sensor.pac_out": state("29.1"),
      "select.pac_mode": state("Heating + Eco"),
      "sensor.pac_air": state("24.6"),
      "sensor.pac_ipm": state("42"),
      "sensor.pac_v": state("231"),
      "sensor.pac_a": state("3.8"),
      "sensor.pac_w": state("812"),
      "sensor.pac_kwh": state("123.4"),
      "sensor.pac_day": state("4.56"),
      "sensor.pac_month": state("88.8"),
      "binary_sensor.pac_hp": state("off"),
      "binary_sensor.pac_lp": state("off"),
      "binary_sensor.pac_flow": state("on"),
      "sensor.pac_code": state("0"),
      "binary_sensor.pac_fault": state("off"),
      "binary_sensor.pac_com": state("on"),
    },
  });
  card._rc27Control.pac = {
    ...card._rc27Control.pac,
    command_entity: "switch.pac",
    setpoint_entity: "number.pac_consigne",
    inlet_temperature_entity: "sensor.pac_in",
    outlet_temperature_entity: "sensor.pac_out",
    mode_entity: "select.pac_mode",
    ambient_temperature_entity: "sensor.pac_air",
    ipm_temperature_entity: "sensor.pac_ipm",
    voltage_entity: "sensor.pac_v",
    current_entity: "sensor.pac_a",
    power_entity: "sensor.pac_w",
    energy_entity: "sensor.pac_kwh",
    daily_energy_entity: "sensor.pac_day",
    monthly_energy_entity: "sensor.pac_month",
    high_pressure_entity: "binary_sensor.pac_hp",
    low_pressure_entity: "binary_sensor.pac_lp",
    water_flow_entity: "binary_sensor.pac_flow",
    compressor_fault_code_entity: "sensor.pac_code",
    fault_entity: "binary_sensor.pac_fault",
    communication_entity: "binary_sensor.pac_com",
  };
  card.aggregate = () => ({ number: 27.1 });
  const html = card.rc30RenderPacCard(card.rc30PacModel(card._rc27Control.pac));
  assert.match(html, /<b>En marche<\/b>/);
  assert.match(html, /Chauffage · Eco/);
  assert.match(html, /4,56 kWh aujourd’hui · 88,8 kWh ce mois · 123,4 kWh total/);
  assert.match(html, /off · off · on/);
  assert.match(html, /0 · off · on/);
});

test("étape 12 garde la carte PAC entre pompe et éclairage dans le rendu réel", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  const modele = runtime.rc24TreatmentModel(card._treatmentProfile, {
    ph: 7.3,
    temperature: 27.1,
    history: [],
    weatherAlert: { available: false, alerts: [] },
  });
  const adaptive = {
    hours: 14,
    hydraulicHours: 2,
    scheduleLabel: "08:30 → 22:30",
    seasonInfo: { libelle: "Été" },
    context: "test",
    water: 27.1,
    air: 24,
    heatAlert: false,
    coldAlert: false,
    weatherAlert: {},
    periods: [{ enabled: true, start: "08:30", end: "22:30" }],
    weekdays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    signature: "carte-pac",
  };
  const html = card.renderRc27Section(modele, adaptive);
  const pompe = html.indexOf("<h3>Pompe de filtration</h3>");
  const pac = html.indexOf("<h3>PAC Polytropic</h3>");
  const lumiere = html.indexOf("<h3>Éclairage piscine</h3>");
  assert.ok(pompe >= 0 && pac > pompe && lumiere > pac);
});

test("étape 12 conserve la priorité visuelle défaut PAC sur l'état de marche", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime, {
    states: {
      "switch.pac": state("on"),
      "sensor.pac_fault": state("E03"),
    },
  });
  card._rc27Control.pac = {
    ...card._rc27Control.pac,
    command_entity: "switch.pac",
    fault_entity: "sensor.pac_fault",
  };
  const html = card.rc30RenderPacCard(card.rc30PacModel(card._rc27Control.pac));
  assert.match(html, /rc30-pac-gauge--fault/);
});

test("PAC master affiche immédiatement le mode demandé en attendant le retour Remote HA", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime, {
    states: {
      "select.pac_mode": state("Heating + Boost", { attributes: { options: ["Heating + Boost", "Heating + Smart"] } }),
    },
  });
  card._rc27Control.pac = {
    ...card._rc27Control.pac,
    mode_entity: "select.pac_mode",
  };
  card._rc30PacPendingMode = { option: "Heating + Smart", startedAt: Date.now() };
  card.aggregate = () => ({ number: 27.1 });
  const html = card.rc30RenderPacCard(card.rc30PacModel(card._rc27Control.pac));
  assert.match(html, /<b>Mode en cours…<\/b>/);
  assert.match(html, /Pilotage \/ mode PAC · confirmation en cours/);
  assert.match(html, /Chauffage · Smart/);
  assert.doesNotMatch(html, /Chauffage · Boost<\/b>/);
});
