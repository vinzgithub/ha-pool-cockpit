import test from "node:test";
import assert from "node:assert/strict";
import { calculerConfianceCapteurs } from "../../src/intelligence/confiance-capteurs/calculer-confiance-capteurs.js";

test("aucune source rend la confiance indisponible", () => {
  const resultat = calculerConfianceCapteurs([]);
  assert.equal(resultat.confiance, null);
  assert.equal(resultat.nombreSources, 0);
});

test("une seule source active affiche une confiance de 100 %", () => {
  const resultat = calculerConfianceCapteurs([{ identifiant: "flipr", libelle: "Flipr", temperatureEauC: 28.2, ph: 7.4, redoxMv: 720 }]);
  assert.equal(resultat.confiance, 100);
  assert.equal(resultat.niveau, "source_unique");
  assert.match(resultat.explication, /Flipr/);
});

test("deux sources proches donnent une confiance élevée", () => {
  const resultat = calculerConfianceCapteurs([
    { identifiant: "flipr", temperatureEauC: 28.2, ph: 7.40, redoxMv: 720 },
    { identifiant: "blue", temperatureEauC: 28.4, ph: 7.44, redoxMv: 740 },
  ]);
  assert.ok(resultat.confiance >= 85);
  assert.equal(resultat.nombreSources, 2);
});

test("des sources fortement divergentes abaissent la confiance", () => {
  const resultat = calculerConfianceCapteurs([
    { identifiant: "flipr", temperatureEauC: 27, ph: 7.1, redoxMv: 550 },
    { identifiant: "blue", temperatureEauC: 31, ph: 7.9, redoxMv: 900 },
  ]);
  assert.ok(resultat.confiance < 60);
  assert.equal(resultat.niveau, "faible");
});

test("les valeurs invalides ne créent pas de fausse source", () => {
  const resultat = calculerConfianceCapteurs([{ identifiant: "vide", ph: "unknown" }]);
  assert.equal(resultat.nombreSources, 0);
});
