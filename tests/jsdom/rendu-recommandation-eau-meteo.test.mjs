import test from "node:test";
import assert from "node:assert/strict";
import { creerHtmlRecommandationEauMeteo, rendreRecommandationEauMeteo } from "../../src/interface/recommandation-eau-meteo/rendre-recommandation-eau-meteo.js";

const resultatValide = Object.freeze({
  score: 65,
  niveau: Object.freeze({ identifiant: "renforce", libelle: "Filtration renforcée" }),
  decomposition: Object.freeze([
    Object.freeze({ identifiant: "base", applicable: true, points: 20, explication: "Base" }),
    Object.freeze({ identifiant: "temperature_eau", applicable: true, points: 30, explication: "Eau à 30,0 °C : risque biologique accru." }),
    Object.freeze({ identifiant: "canicule", applicable: true, points: 15, explication: "Vigilance canicule orange." }),
    Object.freeze({ identifiant: "couverture", applicable: false, points: 0, explication: "État de la couverture inconnu — aucun ajustement appliqué." }),
  ]),
  diagnostics: Object.freeze({ valide: true, versionConfiguration: "water-weather-v1-draft" }),
});
const evaluationValide = Object.freeze({
  resultatMoteur: resultatValide,
  donneesUtilisees: Object.freeze({ temperatureEauC: 30, niveauCanicule: "orange", couvertureFermee: null }),
  saison: Object.freeze({ applicable: true, identifiant: "ete", libelle: "Été", contributionScore: 0, explication: "Saison météorologique : Été — information uniquement, aucun ajustement automatique." }),
  modeLocation: Object.freeze({ applicable: true, mode: "sejour_en_cours", libelle: "Séjour en cours", contributionScore: 0, explication: "Mode Location actif — fréquentation potentiellement accrue, information uniquement." }),
  calculeA: "2026-07-28T12:34:56.000Z",
});

test("affiche score, niveau, détail, données et heure fournis", () => {
  const html = creerHtmlRecommandationEauMeteo(evaluationValide);
  assert.match(html, /65/);
  assert.match(html, /Filtration renforcée/);
  assert.match(html, /Eau à 30,0 °C/);
  assert.match(html, /Vigilance canicule orange/);
  assert.match(html, /État de la couverture inconnu/);
  assert.match(html, /Non applicable/);
  assert.match(html, /water-weather-v1-draft/);
  assert.match(html, /Données utilisées/);
  assert.match(html, /couverture Inconnue/);
  assert.match(html, /Saison météorologique : Été/);
  assert.match(html, /Mode Location actif/);
});

test("affiche le message d’indisponibilité sans score partiel", () => {
  const html = creerHtmlRecommandationEauMeteo({
    resultatMoteur: { score: null, scorePartiel: 35, diagnostics: { valide: false, versionConfiguration: "water-weather-v1-draft", messageIndisponibilite: "Recommandation indisponible — donnée manquante : température de l’eau." } },
    donneesUtilisees: { temperatureEauC: null, niveauCanicule: "aucune", couvertureFermee: null },
    saison: Object.freeze({ applicable: true, identifiant: "ete", libelle: "Été", contributionScore: 0, explication: "Saison météorologique : Été — information uniquement, aucun ajustement automatique." }),
  calculeA: "2026-07-28T12:34:56.000Z",
  });
  assert.match(html, /Recommandation indisponible/);
  assert.doesNotMatch(html, />35</);
  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
});

test("le rendu injecte uniquement le HTML dérivé de l’évaluation reçue", () => {
  const conteneur = { innerHTML: "" };
  rendreRecommandationEauMeteo({ conteneur, evaluation: evaluationValide });
  assert.equal(conteneur.innerHTML, creerHtmlRecommandationEauMeteo(evaluationValide));
});

test("échappe explicitement le libellé du niveau", () => {
  const libelleDangereux = '<script>alert("niveau")</script> "double" \'simple\' & suite';
  const html = creerHtmlRecommandationEauMeteo({ ...evaluationValide, resultatMoteur: { ...resultatValide, niveau: { identifiant: "test", libelle: libelleDangereux } } });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;alert\(&quot;niveau&quot;\)&lt;\/script&gt; &quot;double&quot; &#039;simple&#039; &amp; suite/);
});

test("retourne une chaîne vide sans évaluation", () => assert.equal(creerHtmlRecommandationEauMeteo(null), ""));
