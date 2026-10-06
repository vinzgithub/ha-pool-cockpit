const test = require("node:test");
const assert = require("node:assert/strict");
const { loadBundle, buildCard } = require("./bundle_harness.cjs");

function modeleMinimal(runtime, card) {
  return runtime.rc24TreatmentModel(card._treatmentProfile, {
    ph: 7.3,
    temperature: 27.1,
    history: [],
    weatherAlert: { available: false, alerts: [] },
  });
}

function recommandationFixe() {
  return {
    hours: 14,
    hydraulicHours: 2,
    scheduleLabel: "08:30 → 22:30",
    seasonInfo: { libelle: "Été" },
    context: "test coordination",
    water: 27.1,
    air: 24,
    heatAlert: false,
    coldAlert: false,
    weatherAlert: {},
    periods: [{ enabled: true, start: "08:30", end: "22:30" }],
    weekdays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    signature: "coordination-runtime",
  };
}

test("étape 17 rend réellement la carte maître avec les noms configurés", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control.coordination = {
    role: "master",
    site_name: "Site A",
    peer_name: "Site B",
    allow_satellite_manual: true,
  };
  const html = card.rc30CoordinationCard(card._rc27Control);
  assert.match(html, /Site A · maître de programmation/);
  assert.match(html, /MAÎTRE/);
  assert.match(html, /coordination\.role/);
});

test("étape 17 rend réellement la carte satellite avec la permission manuelle décochée", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control.coordination = {
    role: "satellite",
    site_name: "Site B",
    peer_name: "Site A",
    allow_satellite_manual: false,
  };
  const html = card.rc30CoordinationCard(card._rc27Control);
  assert.match(html, /Site B · satellite/);
  assert.match(html, /Le maître attendu est Site A/);
  assert.doesNotMatch(html, /coordination\.allow_satellite_manual" checked/);
});

test("étape 17 conserve réellement l'échappement des noms dans le bundle", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control.coordination = {
    role: "satellite",
    site_name: "<Site B>",
    peer_name: 'Site A & "Nord"',
    allow_satellite_manual: true,
  };
  const html = card.rc30CoordinationCard(card._rc27Control);
  assert.match(html, /&lt;Site B&gt; · satellite/);
  assert.match(html, /Site A &amp; &quot;Nord&quot;/);
});

test("étape 17 conserve la carte coordination dans le rendu réel de la section pilotage", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control.coordination = {
    role: "master",
    site_name: "Site A",
    peer_name: "Site B",
    allow_satellite_manual: true,
  };
  const html = card.renderRc27Section(modeleMinimal(runtime, card), recommandationFixe());
  assert.match(html, /Architecture double Home Assistant/);
  assert.match(html, /Site A · maître de programmation/);
  assert.ok(html.indexOf("Architecture double Home Assistant") > html.indexOf("Éclairage piscine"));
});
