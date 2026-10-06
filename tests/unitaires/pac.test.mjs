import test from "node:test";
import assert from "node:assert/strict";
import { evaluerPac } from "../../src/intelligence/pac/evaluer-pac.js";

test("PAC non configurée reste non applicable", () => {
  const r = evaluerPac({ hass: { states: {} } });
  assert.equal(r.applicable, false);
  assert.equal(r.contributionScore, 0);
  assert.match(r.explication, /non configurée/i);
});

test("PAC absente, unknown ou unavailable reste non applicable", () => {
  for (const state of [undefined, "unknown", "unavailable"]) {
    const states = state === undefined ? {} : { "climate.pac_piscine": { state, attributes: {} } };
    const r = evaluerPac({ hass: { states }, identifiantEntite: "climate.pac_piscine" });
    assert.equal(r.applicable, false);
    assert.equal(r.contributionScore, 0);
  }
});

test("détecte une PAC climate en chauffe avec températures", () => {
  const hass = { states: { "climate.pac_piscine": { state: "heat", attributes: { hvac_action: "heating", current_temperature: 27.8, temperature: 28.5 } } } };
  const r = evaluerPac({ hass, identifiantEntite: "climate.pac_piscine" });
  assert.equal(r.applicable, true);
  assert.equal(r.active, true);
  assert.equal(r.chauffe, true);
  assert.equal(r.temperatureActuelleC, 27.8);
  assert.equal(r.temperatureConsigneC, 28.5);
  assert.equal(r.contributionScore, 0);
  assert.match(r.explication, /en chauffe/i);
});

test("détecte une PAC arrêtée", () => {
  const hass = { states: { "climate.pac_piscine": { state: "off", attributes: { current_temperature: 28, temperature: 28.5 } } } };
  const r = evaluerPac({ hass, identifiantEntite: "climate.pac_piscine" });
  assert.equal(r.active, false);
  assert.equal(r.chauffe, false);
  assert.match(r.explication, /à l’arrêt/i);
});

test("ne lit jamais hass.callService", () => {
  const hass = { states: {}, get callService() { throw new Error("interdit"); } };
  assert.doesNotThrow(() => evaluerPac({ hass, identifiantEntite: "climate.pac_piscine" }));
});
