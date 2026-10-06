import test from "node:test";
import assert from "node:assert/strict";
import { calculerScoreEauMeteo, CONFIGURATION_EAU_METEO_PAR_DEFAUT } from "../../src/intelligence/eau-meteo/index.js";
import { FONCTIONNALITES } from "../../src/configuration/fonctionnalites.js";

test("le moteur expérimental reste désactivé par défaut", () => {
  assert.equal(FONCTIONNALITES.moteurEauMeteoV1, false);
});

test("la configuration est explicitement une version brouillon à valider", () => {
  assert.equal(CONFIGURATION_EAU_METEO_PAR_DEFAUT.versionConfiguration, "water-weather-v1-draft");
});

test("eau à 30 °C et canicule orange produisent le score et les explications attendus", () => {
  const resultat = calculerScoreEauMeteo({
    temperatureEauC: 30,
    niveauCanicule: "orange",
    couvertureFermee: false,
  });

  assert.equal(resultat.diagnostics.valide, true);
  assert.equal(resultat.score, 65);
  assert.equal(resultat.niveau.identifiant, "renforce");
  assert.ok(resultat.explications.includes("Eau à 30.0 °C : risque biologique accru, filtration fortement renforcée."));
  assert.ok(resultat.explications.includes("Vigilance canicule orange : charge thermique élevée."));
});

test("une couverture fermée réduit légèrement le score avec une eau normale", () => {
  const resultat = calculerScoreEauMeteo({
    temperatureEauC: 25,
    niveauCanicule: "aucune",
    couvertureFermee: true,
  });
  const couverture = resultat.decomposition.find((regle) => regle.identifiant === "couverture");
  assert.equal(couverture.points, -5);
  assert.equal(resultat.score, 25);
});

test("la réduction liée à la couverture est annulée quand l'eau est très chaude", () => {
  const resultat = calculerScoreEauMeteo({
    temperatureEauC: 31,
    niveauCanicule: "aucune",
    couvertureFermee: true,
  });
  const couverture = resultat.decomposition.find((regle) => regle.identifiant === "couverture");
  assert.equal(couverture.points, 0);
  assert.match(couverture.explication, /réduction annulée/);
});

test("une couverture inconnue n'invalide pas la recommandation", () => {
  const resultat = calculerScoreEauMeteo({
    temperatureEauC: 26,
    niveauCanicule: "jaune",
    couvertureFermee: null,
  });
  assert.equal(resultat.diagnostics.valide, true);
  assert.deepEqual(resultat.diagnostics.donneesOptionnellesManquantes, ["ph", "redoxMv", "couvertureFermee"]);
});

test("une température manquante rend la recommandation indisponible et masque le score", () => {
  const resultat = calculerScoreEauMeteo({
    temperatureEauC: null,
    niveauCanicule: "orange",
    couvertureFermee: false,
  });
  assert.equal(resultat.diagnostics.valide, false);
  assert.equal(resultat.score, null);
  assert.equal(resultat.niveau, null);
  assert.equal(resultat.recommandation, null);
  assert.equal(resultat.scorePartiel, 35);
  assert.equal(resultat.diagnostics.messageIndisponibilite, "Recommandation indisponible — donnée manquante : température de l’eau.");
});

test("le score est toujours borné entre 0 et 100", () => {
  const configuration = {
    ...CONFIGURATION_EAU_METEO_PAR_DEFAUT,
    score: { ...CONFIGURATION_EAU_METEO_PAR_DEFAUT.score, base: 90 },
  };
  const resultat = calculerScoreEauMeteo({
    temperatureEauC: 40,
    niveauCanicule: "rouge",
    couvertureFermee: false,
  }, configuration);
  assert.equal(resultat.score, 100);
});

test("un pH absent reste optionnel et ajoute zéro point", () => {
  const resultat = calculerScoreEauMeteo({ temperatureEauC: 26, ph: null, niveauCanicule: "aucune", couvertureFermee: false });
  const regle = resultat.decomposition.find((item) => item.identifiant === "ph");
  assert.equal(resultat.diagnostics.valide, true);
  assert.equal(regle.applicable, false);
  assert.equal(regle.points, 0);
  assert.ok(resultat.diagnostics.donneesOptionnellesManquantes.includes("ph"));
});

test("le pH applique uniquement les contributions configurées", () => {
  const cas = [[6.9,15],[7.1,5],[7.2,0],[7.4,0],[7.6,0],[7.7,10],[7.9,20]];
  for (const [ph, points] of cas) {
    const resultat = calculerScoreEauMeteo({ temperatureEauC: 20, ph, niveauCanicule: "aucune", couvertureFermee: false });
    const regle = resultat.decomposition.find((item) => item.identifiant === "ph");
    assert.equal(regle.points, points, `pH ${ph}`);
  }
});

test("un pH unknown ou unavailable est normalisé comme absent", () => {
  for (const ph of ["unknown", "unavailable", undefined, ""]) {
    const resultat = calculerScoreEauMeteo({ temperatureEauC: 25, ph, niveauCanicule: "aucune", couvertureFermee: false });
    assert.equal(resultat.diagnostics.valide, true);
    assert.equal(resultat.decomposition.find((item) => item.identifiant === "ph").applicable, false);
  }
});


test("un Redox absent reste optionnel et ajoute zéro point", () => {
  const resultat = calculerScoreEauMeteo({ temperatureEauC: 26, ph: 7.4, redoxMv: null, niveauCanicule: "aucune", couvertureFermee: false });
  const regle = resultat.decomposition.find((item) => item.identifiant === "redox");
  assert.equal(resultat.diagnostics.valide, true);
  assert.equal(regle.applicable, false);
  assert.equal(regle.points, 0);
  assert.ok(resultat.diagnostics.donneesOptionnellesManquantes.includes("redoxMv"));
});

test("le Redox applique les contributions V0 configurées", () => {
  const cas = [[500,25],[549,25],[550,15],[649,15],[650,5],[679,5],[680,0],[780,0],[850,0],[900,0]];
  for (const [redoxMv, points] of cas) {
    const resultat = calculerScoreEauMeteo({ temperatureEauC: 20, ph: 7.4, redoxMv, niveauCanicule: "aucune", couvertureFermee: false });
    const regle = resultat.decomposition.find((item) => item.identifiant === "redox");
    assert.equal(regle.points, points, `Redox ${redoxMv} mV`);
  }
});

test("un Redox unknown ou unavailable est normalisé comme absent", () => {
  for (const redoxMv of ["unknown", "unavailable", undefined, ""]) {
    const resultat = calculerScoreEauMeteo({ temperatureEauC: 25, ph: 7.4, redoxMv, niveauCanicule: "aucune", couvertureFermee: false });
    assert.equal(resultat.diagnostics.valide, true);
    assert.equal(resultat.decomposition.find((item) => item.identifiant === "redox").applicable, false);
  }
});

test("un Redox élevé informe sans augmenter la filtration", () => {
  const resultat = calculerScoreEauMeteo({ temperatureEauC: 25, ph: 7.4, redoxMv: 900, niveauCanicule: "aucune", couvertureFermee: false });
  const regle = resultat.decomposition.find((item) => item.identifiant === "redox");
  assert.equal(regle.points, 0);
  assert.match(regle.explication, /traitement/);
});
