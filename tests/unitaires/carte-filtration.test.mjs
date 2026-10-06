import test from "node:test";
import assert from "node:assert/strict";
import {
  formaterDureeHeures,
  calculerPerformanceCarteFiltration,
  rendreCarteFiltration,
} from "../../src/interface/carte-filtration.js";

test("formate la durée historique sans inventer de borne haute", () => {
  assert.equal(formaterDureeHeures(2.5), "2 h 30");
  assert.equal(formaterDureeHeures(24.25), "24 h 15");
  assert.equal(formaterDureeHeures(null), "—");
  assert.equal(formaterDureeHeures(Number.NaN), "—");
  assert.equal(formaterDureeHeures(-2), "0 h 00");
});

test("priorise l'historique réel du jour sur le programme prévu", () => {
  const resultat = calculerPerformanceCarteFiltration({
    profilTraitement: { volume_m3: 16, pump_flow_m3h: 10 },
    statistiquesFiltration: { available: true, hours: 7.5, running: true },
    controle: { pump: { scheduled_hours: 12, recommended_hours: 11 } },
    modele: { filtrationHours: 10 },
  });
  assert.deepEqual(resultat, {
    flow: 10,
    volume: 16,
    hours: 7.5,
    filtered: 75,
    turnovers: 4.6875,
    targetHours: 10,
    targetTurnovers: 6.25,
    progress: 75,
    renewalHours: 1.6,
    actual: true,
    source: "Historique réel du jour",
    running: true,
  });
});

test("utilise le programme prévu quand l'historique réel est indisponible", () => {
  const resultat = calculerPerformanceCarteFiltration({
    profilTraitement: { volume_m3: "15.6", pump_flow_m3h: "8.5" },
    statistiquesFiltration: { available: false, hours: 9, running: false },
    controle: { pump: { scheduled_hours: 6, recommended_hours: 8 } },
    modele: {},
  });
  assert.equal(resultat.hours, 6);
  assert.equal(resultat.actual, false);
  assert.equal(resultat.source, "Programme prévu");
  assert.equal(resultat.flow, 8.5);
  assert.equal(resultat.volume, 15.6);
  assert.equal(resultat.targetHours, 8);
});

test("conserve les replis historiques 10 m3/h et 16 m3 pour les valeurs nulles ou nulles numériquement", () => {
  for (const valeur of [null, "", 0, "0", "invalide"]) {
    const resultat = calculerPerformanceCarteFiltration({
      profilTraitement: { volume_m3: valeur, pump_flow_m3h: valeur },
      statistiquesFiltration: null,
      controle: { pump: { scheduled_hours: 1 } },
      modele: { filtrationHours: 1 },
    });
    assert.equal(resultat.flow, 10);
    assert.equal(resultat.volume, 16);
    assert.equal(resultat.renewalHours, 1.6);
  }
});

test("la recommandation du modèle reste prioritaire sur le repli historique du contrôle", () => {
  const resultat = calculerPerformanceCarteFiltration({
    profilTraitement: { volume_m3: 16, pump_flow_m3h: 10 },
    statistiquesFiltration: { available: false },
    controle: { pump: { scheduled_hours: 5, recommended_hours: 20 } },
    modele: { filtrationHours: 4 },
  });
  assert.equal(resultat.targetHours, 4);
  assert.equal(resultat.progress, 100);
});

test("retourne une durée indisponible et 0 pourcent lorsqu'aucune durée n'existe", () => {
  const resultat = calculerPerformanceCarteFiltration({
    profilTraitement: { volume_m3: 16, pump_flow_m3h: 10 },
    statistiquesFiltration: undefined,
    controle: { pump: { scheduled_hours: 0, recommended_hours: 0 } },
    modele: {},
  });
  assert.equal(resultat.hours, null);
  assert.equal(resultat.targetHours, null);
  assert.equal(resultat.progress, 0);
  assert.equal(resultat.source, "Durée indisponible");
});

test("borne uniquement la progression visuelle à 100 pourcent", () => {
  const resultat = calculerPerformanceCarteFiltration({
    profilTraitement: { volume_m3: 16, pump_flow_m3h: 10 },
    statistiquesFiltration: { available: true, hours: 13 },
    controle: { pump: {} },
    modele: { filtrationHours: 10 },
  });
  assert.equal(resultat.hours, 13);
  assert.equal(resultat.targetHours, 10);
  assert.equal(resultat.progress, 100);
});

test("rend le HTML historique sans recalculer la durée métier", () => {
  const html = rendreCarteFiltration({
    modele: { filtrationHours: 10 },
    profilTraitement: { volume_m3: 16, pump_flow_m3h: 10 },
    statistiquesFiltration: { available: true, hours: 10, running: true },
    controle: { pump: { scheduled_hours: 8, recommended_hours: 12 } },
    classeSection: "rc271-collapsible",
    attributsEntete: 'data-rc271-toggle="filtration" role="button" tabindex="0" aria-expanded="true"',
    chevronHtml: '<span class=rc271-chevron aria-hidden=true>⌄</span>',
  });
  assert.match(html, /Objectif atteint/);
  assert.match(html, /10 h 00/);
  assert.match(html, /100 %/);
  assert.match(html, /Pompe en marche/);
  assert.match(html, /Historique réel du jour/);
  assert.match(html, /data-rc271-toggle="filtration"/);
});

test("reste pure : aucun accès à hass, document ou window", () => {
  const anciens = new Map();
  for (const nom of ["hass", "document", "window"]) {
    anciens.set(nom, Object.getOwnPropertyDescriptor(globalThis, nom));
    Object.defineProperty(globalThis, nom, {
      configurable: true,
      get() { throw new Error(`Accès interdit à ${nom}`); },
    });
  }
  try {
    const resultat = calculerPerformanceCarteFiltration({
      profilTraitement: { volume_m3: 16, pump_flow_m3h: 10 },
      statistiquesFiltration: { available: true, hours: 2 },
      controle: { pump: {} },
      modele: { filtrationHours: 4 },
    });
    assert.equal(resultat.progress, 50);
    assert.match(rendreCarteFiltration({
      modele: { filtrationHours: 4 },
      profilTraitement: { volume_m3: 16, pump_flow_m3h: 10 },
      statistiquesFiltration: { available: true, hours: 2 },
      controle: { pump: {} },
    }), /50 %/);
  } finally {
    for (const [nom, descripteur] of anciens) {
      if (descripteur) Object.defineProperty(globalThis, nom, descripteur);
      else delete globalThis[nom];
    }
  }
});
