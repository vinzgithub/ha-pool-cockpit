import test from "node:test";
import assert from "node:assert/strict";
import { rendreCarteCapteur, rendreSectionCapteurs } from "../../src/interface/carte-capteurs.js";

const icones = Object.freeze({ battery: "<b>B</b>", bluetooth: "<b>BT</b>", calendar: "<b>C</b>", flask: "<b>F</b>" });

function entree(overrides = {}) {
  return {
    index: 1,
    nom: "Blue Connect",
    marque: "blue_connect",
    actif: true,
    recent: true,
    synchronisation: "Synchronisé il y a 4 min",
    temperature: { value: "27.10", unit: "°C" },
    tendance: { direction: "stable", label: "Stable" },
    jaugePhHtml: "<pool-gauge data-p=ph></pool-gauge>",
    jaugeOrpHtml: "<pool-gauge data-p=orp></pool-gauge>",
    mesureSpecifique: null,
    statutAnalyse: { phase: "idle", label: "En attente", progress: 0, detail: "Disponible" },
    batterie: { value: "82", unit: "%" },
    bluetooth: { value: "-61", unit: "dBm" },
    derniereAnalyse: "06 sept. 19:00",
    analyseDisponible: true,
    analyseOccupee: false,
    anomalies: [],
    icones,
    ...overrides,
  };
}

test("rend une carte active et récente sans recalculer ses valeurs", () => {
  const html = rendreCarteCapteur(entree());
  assert.match(html, /Blue Connect/);
  assert.match(html, /blue connect/);
  assert.match(html, /style="--delay:80ms"/);
  assert.match(html, /27\.10<small>°C<\/small>/);
  assert.match(html, /trend stable">Stable/);
  assert.match(html, /Synchronisé il y a 4 min/);
  assert.match(html, /data-device-toggle="1" aria-pressed="true" title="Désactiver Blue Connect"/);
  assert.match(html, /data-i="1"/);
});

test("un appareil désactivé garde la note historique et masque les anomalies", () => {
  const html = rendreCarteCapteur(entree({ actif: false, anomalies: ["pH improbable"] }));
  assert.match(html, /device-card is-disabled/);
  assert.match(html, /Désactivé pour HA Pool/);
  assert.match(html, /Ignoré par HA Pool · historique Home Assistant conservé/);
  assert.doesNotMatch(html, /pH improbable/);
  assert.match(html, /aria-pressed="false" title="Activer Blue Connect"/);
});

test("une mesure ancienne conserve la classe stale et la tendance Hors calcul", () => {
  const html = rendreCarteCapteur(entree({ recent: false, tendance: { direction: "up", label: "Hausse" } }));
  assert.match(html, /is-stale/);
  assert.match(html, /trend up">Hors calcul/);
  assert.doesNotMatch(html, />Hausse<\/em>/);
});

test("rend la mesure spécifique avec le pourcentage déjà préparé", () => {
  const html = rendreCarteCapteur(entree({
    mesureSpecifique: { label: "Conductivité", value: "1210", unit: "µS/cm", percent: 60.5 },
  }));
  assert.match(html, /Conductivité/);
  assert.match(html, /1210 µS\/cm/);
  assert.match(html, /width:60\.5%/);
});

test("conserve les icônes et pourcentages des états d'analyse historiques", () => {
  const cas = [
    ["done", "✓", "100%"],
    ["error", "!", "100%"],
    ["disabled", "○", ""],
    ["idle", "●", ""],
    ["analyzing", "⚗", "58%"],
    ["sync", "↻", "82%"],
  ];
  for (const [phase, icone, pourcentage] of cas) {
    const html = rendreCarteCapteur(entree({ statutAnalyse: { phase, label: phase, progress: Number.parseInt(pourcentage, 10) || 0, detail: "detail" } }));
    assert.match(html, new RegExp(`device-analysis-status__icon>${icone.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}<`));
    if (pourcentage) assert.match(html, new RegExp(`device-analysis-status__percent>${pourcentage.replace("%", "\\%")}`));
    else assert.match(html, /device-analysis-status__percent><\/span>/);
  }
});

test("le bouton d'analyse conserve son verrou aria-busy et peut être absent", () => {
  const occupe = rendreCarteCapteur(entree({ analyseOccupee: true }));
  assert.match(occupe, /data-i="1" disabled aria-busy=true/);
  assert.match(occupe, /Analyse en cours…/);
  const absent = rendreCarteCapteur(entree({ analyseDisponible: false }));
  assert.doesNotMatch(absent, /data-i=/);
  assert.doesNotMatch(absent, /Lancer une analyse/);
});

test("rend les anomalies déjà détectées sans en déduire de nouvelles", () => {
  const html = rendreCarteCapteur(entree({ anomalies: ["pH improbable", "Bluetooth faible"] }));
  assert.match(html, /⚠ pH improbable · Bluetooth faible/);
});

test("la section garde le comptage singulier/pluriel et les fragments de repli", () => {
  const singulier = rendreSectionCapteurs({
    sourceLabel: "Mesures consolidées : Blue Connect uniquement",
    nombreActifs: 1,
    nombreTotal: 2,
    cartesHtml: "<section>CARTE</section>",
    classeSection: "is-collapsed",
    attributsEntete: "role=button aria-expanded=false",
    chevronHtml: "<span>›</span>",
  });
  assert.match(singulier, /1 actif sur 2/);
  assert.doesNotMatch(singulier, /1 actifs/);
  assert.match(singulier, /is-collapsed/);
  assert.match(singulier, /aria-expanded=false/);
  assert.match(singulier, /<section>CARTE<\/section>/);

  const pluriel = rendreSectionCapteurs({ sourceLabel: "Deux sources", nombreActifs: 2, nombreTotal: 2, cartesHtml: "" });
  assert.match(pluriel, /2 actifs sur 2/);
});

test("SEC-000 : les entrées hostiles HA, DOM et stockage ne sont jamais lues", () => {
  const donnees = entree();
  for (const nom of ["hass", "callService", "callWS", "document", "window", "localStorage"]) {
    Object.defineProperty(donnees, nom, { get() { throw new Error(`lecture interdite: ${nom}`); } });
  }
  assert.doesNotThrow(() => rendreCarteCapteur(donnees));

  const section = { sourceLabel: "Source", nombreActifs: 1, nombreTotal: 1, cartesHtml: "" };
  Object.defineProperty(section, "hass", { get() { throw new Error("lecture hass interdite"); } });
  assert.doesNotThrow(() => rendreSectionCapteurs(section));
});

test("une entrée structurellement invalide n'est pas réparée silencieusement", () => {
  assert.throws(() => rendreCarteCapteur(entree({ marque: null })), TypeError);
  assert.throws(() => rendreCarteCapteur(entree({ statutAnalyse: null })), TypeError);
});
