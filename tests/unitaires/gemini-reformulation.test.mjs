import test from "node:test";
import assert from "node:assert/strict";
import {
  construirePayloadGemini,
  creerHtmlBlocGemini,
  signaturePayloadGemini,
} from "../../src/interface/gemini/gemini-reformulation.js";

const modele = {
  general: { libelle: "Eau équilibrée", message: "Aucune action urgente n’est nécessaire." },
  eau: { temperature: 27.6, ph: 7.52, orp: 616, confiance: 90 },
  meteo: { disponible: true, temperature: 22.5, condition: "Partiellement nuageux", vigilance: "Aucune vigilance" },
  comparaison: { etat: "time_gap", detail: "Les relevés sont espacés de 864 minutes.", sourceA: "Blue Connect", sourceB: "Flipr", ecartMinutes: 864, ecarts: [] },
  filtration: {
    programme: { identifiant: "custom", libelle: "Programmation personnalisée prioritaire", detail: "Les horaires saisis restent prioritaires." },
    horaireCourant: "08:30 → 21:30", heuresCourantes: 13,
    horaireRecommande: "08:30 → 22:30", heuresRecommandees: 14,
    plancherHydraulique: 2, saisonAstronomique: "Été", profilReference: "Été · saison de baignade",
    contexte: "Conditions cohérentes avec la base de profil", prolongation: "Aucune prolongation ponctuelle active",
  },
  traitement: { resume: "Protocole fabricant hebdomadaire : 160 g", confiance: "Fiabilité moyenne" },
  pac: { configuree: false, etat: "État indisponible", ecrituresVerrouillees: true },
  conclusion: "Aucune action urgente n’est nécessaire. Comparaison suspendue : les relevés sont espacés de 864 minutes.",
};

test("FIX14.4 construit un payload Gemini uniquement depuis le modèle Assistant Expert", () => {
  const payload = construirePayloadGemini(modele);
  assert.equal(payload.schema_version, "1.0");
  assert.equal(payload.water.temperature_c, 27.6);
  assert.equal(payload.filtration.applied_hours, 13);
  assert.equal(payload.filtration.adaptive_hours, 14);
  assert.equal(payload.filtration.astronomical_season, "Été");
  assert.equal(payload.filtration.reference_profile, "Été · saison de baignade");
  assert.equal(payload.deterministic_conclusion, modele.conclusion);
  assert.doesNotMatch(JSON.stringify(payload), /hass\.states|callService|api[_-]?key/i);
});

test("FIX14.4 produit une signature stable pour invalider une reformulation devenue obsolète", () => {
  const payload = construirePayloadGemini(modele);
  assert.equal(signaturePayloadGemini(payload), signaturePayloadGemini(payload));
  const changed = construirePayloadGemini({ ...modele, eau: { ...modele.eau, ph: 7.53 } });
  assert.notEqual(signaturePayloadGemini(payload), signaturePayloadGemini(changed));
});

test("le cadre Gemini reste optionnel et explicite sur la lecture seule", () => {
  const html = creerHtmlBlocGemini({ statut: "idle" });
  assert.match(html, /Reformulation Gemini/);
  assert.match(html, /backend Home Assistant/);
  assert.match(html, /Générer l'explication/);
  assert.doesNotMatch(html, /callService|turn_on|turn_off|set_value|select_option/);
});

test("la réponse Gemini est échappée avant affichage", () => {
  const html = creerHtmlBlocGemini({ statut: "ready", texte: '<script>alert("x")</script>' });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
