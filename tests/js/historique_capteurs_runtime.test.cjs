const test = require("node:test");
const assert = require("node:assert/strict");
const { loadBundle, buildCard } = require("./bundle_harness.cjs");

const runtime = loadBundle();
const methodes = ["bucketSeries", "mergeDeviceHistory", "idealRange", "historySourceLabel", "sparkline", "loadHistory"];

test("étape 22 conserve les vrais points d'entrée historiques dans le bundle", () => {
  const proto = Object.getOwnPropertyNames(runtime.PoolDashboardCard.prototype);
  for (const methode of methodes) assert.ok(proto.includes(methode), `méthode réelle absente: ${methode}`);
});

test("les façades historiques conservent les calculs et le rendu sans commande HA", () => {
  const card = buildCard(runtime);
  let callService = 0, callWS = 0;
  card._hass.callService = async () => { callService += 1; };
  card._hass.callWS = async () => { callWS += 1; return {}; };
  const h = 60 * 60 * 1000;
  assert.deepEqual(JSON.parse(JSON.stringify(card.bucketSeries([
    { timestamp: h + 1, value: 20 },
    { timestamp: h + 2, value: 24 },
  ]))), [{ timestamp: h, value: 22 }]);
  card._history = { ph: [
    { timestamp: 1, value: 7.2, sources: [{ name: "Flipr", value: 7.2 }] },
    { timestamp: 2, value: 7.4, sources: [{ name: "Flipr", value: 7.4 }] },
  ] };
  const html = card.sparkline("ph", "pH", "");
  assert.match(html, /<div class=chart-source>Flipr<\/div>/);
  assert.match(html, /\+0\.20 /);
  assert.equal(callService, 0);
  assert.equal(callWS, 0);
});

test("le message d'erreur historique reste détectable comportementalement", () => {
  const card = buildCard(runtime);
  card._history = { ph: [] };
  card._historyLoading = false;
  card._historyError = true;
  assert.match(card.sparkline("ph", "pH", ""), /Historique indisponible/);
});
