import test from "node:test";
import assert from "node:assert/strict";
import { evaluerModeLocation } from "../../src/intelligence/mode-location/evaluer-mode-location.js";

test("mode location non configuré reste non applicable", () => {
  const r = evaluerModeLocation({ hass: { states: {} }, configuration: {} });
  assert.equal(r.applicable, false);
  assert.equal(r.contributionScore, 0);
  assert.match(r.explication, /non configuré/i);
});

test("configuration booléenne active un séjour en cours", () => {
  const r = evaluerModeLocation({ configuration: { mode_location: true } });
  assert.equal(r.mode, "sejour_en_cours");
  assert.equal(r.contributionScore, 0);
});

test("reconnaît arrivée, séjour, départ et maison vide", () => {
  const cas = [
    ["arrivee", "arrivee_aujourdhui"],
    ["sejour_en_cours", "sejour_en_cours"],
    ["depart", "depart_aujourdhui"],
    ["vacant", "inactive"],
  ];
  for (const [valeur, attendu] of cas) {
    const r = evaluerModeLocation({ configuration: { mode_location: valeur } });
    assert.equal(r.mode, attendu);
    assert.equal(r.applicable, true);
  }
});

test("lit une entité dédiée sans écrire dans Home Assistant", () => {
  const hass = { states: { "input_select.mode_location": { state: "depart", attributes: {} } } };
  const r = evaluerModeLocation({ hass, configuration: { location_entity: "input_select.mode_location" } });
  assert.equal(r.mode, "depart_aujourdhui");
  assert.equal(r.source, "input_select.mode_location");
});

test("entité absente, unknown ou unavailable reste non applicable", () => {
  for (const state of [undefined, "unknown", "unavailable"]) {
    const states = state === undefined ? {} : { "input_select.mode_location": { state, attributes: {} } };
    const r = evaluerModeLocation({ hass: { states }, configuration: { location_entity: "input_select.mode_location" } });
    assert.equal(r.applicable, false);
    assert.equal(r.contributionScore, 0);
  }
});

test("une valeur non reconnue reste explicite et non applicable", () => {
  const hass = { states: { "input_select.mode_location": { state: "mystere", attributes: {} } } };
  const r = evaluerModeLocation({ hass, configuration: { location_entity: "input_select.mode_location" } });
  assert.equal(r.applicable, false);
  assert.match(r.explication, /non reconnu/i);
});

test("ne lit jamais hass.callService", () => {
  const hass = { states: {}, get callService() { throw new Error("interdit"); } };
  assert.doesNotThrow(() => evaluerModeLocation({ hass, configuration: {} }));
});
