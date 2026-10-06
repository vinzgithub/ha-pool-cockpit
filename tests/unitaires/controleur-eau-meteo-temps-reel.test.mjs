import test from "node:test";
import assert from "node:assert/strict";
import { construireEntreesEauMeteoDepuisHomeAssistant } from "../../src/adaptateurs/home-assistant/construire-entrees-eau-meteo.js";
import { calculerScoreEauMeteo } from "../../src/intelligence/eau-meteo/calculer-score-eau-meteo.js";
import { calculerConfianceCapteurs } from "../../src/intelligence/confiance-capteurs/calculer-confiance-capteurs.js";
import { evaluerHeuresCreuses } from "../../src/intelligence/optimisation-energetique/evaluer-heures-creuses.js";
import { detecterSaison } from "../../src/intelligence/saisons/detecter-saison.js";
import { evaluerPac } from "../../src/intelligence/pac/evaluer-pac.js";
import { evaluerModeLocation } from "../../src/intelligence/mode-location/evaluer-mode-location.js";

globalThis.construireEntreesEauMeteoDepuisHomeAssistant = construireEntreesEauMeteoDepuisHomeAssistant;
globalThis.calculerScoreEauMeteo = calculerScoreEauMeteo;
globalThis.calculerConfianceCapteurs = calculerConfianceCapteurs;
globalThis.evaluerHeuresCreuses = evaluerHeuresCreuses;
globalThis.detecterSaison = detecterSaison;
globalThis.evaluerPac = evaluerPac;
globalThis.evaluerModeLocation = evaluerModeLocation;
const { evaluerRecommandationEauMeteoTempsReel } = await import("../../src/controleurs/evaluer-recommandation-eau-meteo-temps-reel.js");

const hass = { states: {} };

test("retourne null lorsque la fonctionnalité est désactivée", () => {
  assert.equal(evaluerRecommandationEauMeteoTempsReel({ actif: false }), null);
});

test("convertit les vigilances jaune, orange et rouge", () => {
  for (const [levelKey, attendu] of [["yellow", "jaune"], ["orange", "orange"], ["red", "rouge"]]) {
    const evaluation = evaluerRecommandationEauMeteoTempsReel({ actif: true, hass, temperatureEauC: 30, alerteMeteo: { levelKey }, maintenant: new Date("2026-07-28T10:00:00Z") });
    assert.equal(evaluation.donneesUtilisees.niveauCanicule, attendu);
  }
});

test("traite la couverture absente comme inconnue et non bloquante", () => {
  const evaluation = evaluerRecommandationEauMeteoTempsReel({ actif: true, hass, configurationCarte: {}, temperatureEauC: 29, alerteMeteo: null });
  assert.equal(evaluation.donneesUtilisees.couvertureFermee, null);
  assert.equal(evaluation.resultatMoteur.diagnostics.valide, true);
  const regle = evaluation.resultatMoteur.decomposition.find((item) => item.identifiant === "couverture");
  assert.equal(regle.applicable, false);
  assert.match(regle.explication, /couverture inconnu/i);
});

test("température absente, unknown ou unavailable rend la recommandation indisponible", () => {
  for (const temperatureEauC of [null, "unknown", "unavailable", undefined]) {
    const evaluation = evaluerRecommandationEauMeteoTempsReel({ actif: true, hass, temperatureEauC, alerteMeteo: null });
    assert.equal(evaluation.resultatMoteur.diagnostics.valide, false);
    assert.equal(evaluation.resultatMoteur.score, null);
  }
});

test("ne lit jamais hass.callService", () => {
  const hassPiege = { states: {}, get callService() { throw new Error("callService ne doit pas être lu"); } };
  assert.doesNotThrow(() => evaluerRecommandationEauMeteoTempsReel({ actif: true, hass: hassPiege, temperatureEauC: 28, alerteMeteo: { levelKey: "yellow" } }));
});

test("transmet la mesure pH réelle au moteur sans la rendre critique", () => {
  const evaluation = evaluerRecommandationEauMeteoTempsReel({ actif: true, hass, temperatureEauC: 26, ph: 7.85, alerteMeteo: null });
  assert.equal(evaluation.donneesUtilisees.ph, 7.85);
  assert.equal(evaluation.resultatMoteur.diagnostics.valide, true);
  assert.equal(evaluation.resultatMoteur.decomposition.find((item) => item.identifiant === "ph").points, 20);
});


test("transmet la mesure Redox réelle au moteur sans la rendre critique", () => {
  const evaluation = evaluerRecommandationEauMeteoTempsReel({ actif: true, hass, temperatureEauC: 26, ph: 7.4, redoxMv: 620, alerteMeteo: null });
  assert.equal(evaluation.donneesUtilisees.redoxMv, 620);
  assert.equal(evaluation.resultatMoteur.diagnostics.valide, true);
  assert.equal(evaluation.resultatMoteur.decomposition.find((item) => item.identifiant === "redox").points, 15);
});


test("calcule la confiance sans modifier le score", () => {
  const observationsCapteurs = [{ identifiant: "flipr", libelle: "Flipr", temperatureEauC: 28, ph: 7.4, redoxMv: 700 }];
  const evaluation = evaluerRecommandationEauMeteoTempsReel({ actif: true, hass, temperatureEauC: 28, ph: 7.4, redoxMv: 700, observationsCapteurs });
  assert.equal(evaluation.confianceCapteurs.confiance, 100);
  assert.equal(evaluation.resultatMoteur.score, 40);
});


test("évalue les heures creuses configurées sans modifier le score", () => {
  const configurationCarte = { optimisation_energetique: { heures_creuses: [{ debut: "02:00", fin: "07:00" }, { debut: "14:20", fin: "16:20" }] } };
  const evaluation = evaluerRecommandationEauMeteoTempsReel({ actif: true, hass, configurationCarte, temperatureEauC: 28, ph: 7.4, redoxMv: 700, maintenant: new Date(2026, 6, 28, 14, 45) });
  assert.equal(evaluation.optimisationEnergetique.active, true);
  assert.equal(evaluation.optimisationEnergetique.contributionScore, 0);
  assert.equal(evaluation.resultatMoteur.score, 40);
});


test("détecte la saison sans modifier le score", () => {
  const evaluation = evaluerRecommandationEauMeteoTempsReel({ actif: true, hass, temperatureEauC: 28, ph: 7.4, redoxMv: 700, maintenant: new Date(2026, 6, 28, 14, 45) });
  assert.equal(evaluation.saison.identifiant, "ete");
  assert.equal(evaluation.saison.contributionScore, 0);
  assert.equal(evaluation.resultatMoteur.score, 40);
});


test("évalue la PAC configurée sans modifier le score", () => {
  const hassPac = { states: { "climate.pac_piscine": { state: "heat", attributes: { hvac_action: "heating", current_temperature: 27.8, temperature: 28.5 } } } };
  const evaluation = evaluerRecommandationEauMeteoTempsReel({ actif: true, hass: hassPac, configurationCarte: { pac_entity: "climate.pac_piscine" }, temperatureEauC: 28, ph: 7.4, redoxMv: 700 });
  assert.equal(evaluation.pac.chauffe, true);
  assert.equal(evaluation.pac.contributionScore, 0);
  assert.equal(evaluation.resultatMoteur.score, 40);
});


test("évalue le mode Location sans modifier le score", () => {
  const evaluation = evaluerRecommandationEauMeteoTempsReel({ actif: true, hass, configurationCarte: { mode_location: "sejour_en_cours" }, temperatureEauC: 28, ph: 7.4, redoxMv: 700 });
  assert.equal(evaluation.modeLocation.mode, "sejour_en_cours");
  assert.equal(evaluation.modeLocation.contributionScore, 0);
  assert.equal(evaluation.resultatMoteur.score, 40);
});
