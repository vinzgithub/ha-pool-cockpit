const test = require("node:test");
const assert = require("node:assert/strict");
const { loadBundle, buildCard, state } = require("./bundle_harness.cjs");

function appareil(nom = "Blue Connect", key = "blue") {
  return {
    key,
    name: nom,
    brand: "blue_connect",
    entities: {
      ph: `sensor.${key}_ph`,
      orp: `sensor.${key}_orp`,
      temperature: `sensor.${key}_temp`,
      conductivity: `sensor.${key}_conductivity`,
      battery: `sensor.${key}_battery`,
      bluetooth_signal: `sensor.${key}_bluetooth`,
      last_analysis: `sensor.${key}_last`,
      start_analysis: `button.${key}_analyse`,
      analysis_status: `sensor.${key}_status`,
    },
  };
}

function etats(key = "blue", { last = new Date().toISOString(), ph = 7.31, status = "ready" } = {}) {
  return {
    [`sensor.${key}_ph`]: state(ph),
    [`sensor.${key}_orp`]: state(712, { unit: "mV" }),
    [`sensor.${key}_temp`]: state(27.4, { unit: "°C" }),
    [`sensor.${key}_conductivity`]: state(1234, { unit: "µS/cm" }),
    [`sensor.${key}_battery`]: state(84, { unit: "%" }),
    [`sensor.${key}_bluetooth`]: state(-63, { unit: "dBm" }),
    [`sensor.${key}_last`]: state(last),
    [`sensor.${key}_status`]: state(status),
    [`button.${key}_analyse`]: state("unknown"),
  };
}

test("étape 16 rend réellement une carte capteur active depuis les lectures du bundle", () => {
  const runtime = loadBundle();
  const device = appareil();
  const card = buildCard(runtime, { devices: [device], states: etats() });
  const html = card.deviceCard(device, 0);
  assert.match(html, /<h2>Blue Connect<\/h2>/);
  assert.match(html, /blue connect/);
  assert.match(html, /27\.4<small>°C<\/small>/);
  assert.match(html, /Conductivité/);
  assert.match(html, /1234 µS\/cm/);
  assert.match(html, /Batterie<strong>84 %/);
  assert.match(html, /Bluetooth<strong>-63 dBm/);
  assert.match(html, /data-device-toggle="0" aria-pressed="true"/);
  assert.match(html, /data-i="0"/);
});

test("étape 16 conserve réellement la désactivation d'une source et sa note dédiée", () => {
  const runtime = loadBundle();
  const device = appareil();
  const card = buildCard(runtime, {
    devices: [device],
    states: etats("blue", { ph: 9.2 }),
    measurementSources: { blue: false },
  });
  const html = card.deviceCard(device, 0);
  assert.match(html, /device-card is-disabled/);
  assert.match(html, /Désactivé pour HA Pool/);
  assert.match(html, /device-analysis-status is-disabled/);
  assert.match(html, /Ignoré par HA Pool · historique Home Assistant conservé/);
  assert.doesNotMatch(html, /pH improbable/);
});

test("étape 16 conserve réellement l'état stale/offline d'une mesure ancienne", () => {
  const runtime = loadBundle();
  const device = appareil();
  const card = buildCard(runtime, {
    devices: [device],
    states: etats("blue", { last: "2020-01-01T00:00:00.000Z" }),
  });
  const html = card.deviceCard(device, 0);
  assert.match(html, /is-stale/);
  assert.match(html, /device-analysis-status is-offline/);
  assert.match(html, /Donnée trop ancienne/);
  assert.match(html, /Hors calcul/);
});

test("étape 16 rend réellement la section appareils avec le comptage et l'ordre historiques", () => {
  const runtime = loadBundle();
  const first = appareil("Blue Connect", "blue");
  const second = appareil("Flipr", "flipr");
  const card = buildCard(runtime, {
    devices: [first, second],
    states: { ...etats("blue"), ...etats("flipr") },
    measurementSources: { blue: true, flipr: false },
  });
  card.render();
  const html = card.shadowRoot.innerHTML;
  assert.match(html, /data-rc271-section=devices/);
  assert.match(html, /Mes appareils de mesure/);
  assert.match(html, /1 actif sur 2/);
  const blueIndex = html.indexOf("<h2>Blue Connect</h2>");
  const fliprIndex = html.indexOf("<h2>Flipr</h2>");
  assert.ok(blueIndex >= 0 && fliprIndex > blueIndex);
});
