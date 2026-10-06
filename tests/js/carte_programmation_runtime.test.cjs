const test = require("node:test");
const assert = require("node:assert/strict");
const { loadBundle, buildCard } = require("./bundle_harness.cjs");

function recommandationFixe(overrides = {}) {
  return {
    hours: 14,
    hydraulicHours: 2,
    scheduleLabel: "08:30 → 22:30",
    seasonInfo: { libelle: "Été" },
    context: "Conditions cohérentes avec la base de profil",
    water: 27.1,
    air: 24,
    heatAlert: false,
    coldAlert: false,
    weatherAlert: {},
    periods: [{ enabled: true, start: "08:30", end: "22:30" }],
    weekdays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    signature: "programmation-runtime",
    ...overrides,
  };
}

test("étape 19 rend réellement l'éditeur pompe avec le mode conseillé et ses sélecteurs", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control.coordination.role = "master";
  card._rc27Control.pump.mode = "automatic";
  card._rc27Control.pump.weekdays = ["mon", "wed", "fri"];
  card._rc27Control.pump.periods = [
    { enabled: true, start: "08:30", end: "12:00" },
    { enabled: true, start: "14:00", end: "18:30" },
    { enabled: false, start: "00:00", end: "00:00" },
  ];
  const html = card.rc27ScheduleEditor("pump", "Programmation de la pompe");
  assert.match(html, /Programmation de la pompe/);
  assert.match(html, /Conseillé avec validation/);
  assert.match(html, /value=automatic selected/);
  assert.match(html, /pump\.energy_entity/);
  assert.match(html, /class="is-active" data-rc27-weekday="mon"/);
});

test("étape 19 verrouille réellement l'éditeur éclairage sur un satellite", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control.coordination = {
    role: "satellite",
    site_name: "Site B",
    peer_name: "Site A & <Nord>",
    allow_satellite_manual: true,
  };
  card._rc27Control.light.mode = "program";
  card._rc27Control.light.auto_off_minutes = 45;
  const html = card.rc27ScheduleEditor("light", "Programmation de l’éclairage");
  assert.match(html, /is-satellite-locked/);
  assert.match(html, /Site A &amp; &lt;Nord&gt;/);
  assert.match(html, /light\.auto_off_minutes/);
  assert.match(html, /value="45" disabled/);
  assert.match(html, /Cette instance n’exécute aucune plage horaire/);
});

test("étape 19 rend réellement les trois priorités personnalisé/adaptatif/suspendu", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  const control = card._rc27Control;
  control.coordination.role = "master";
  const expected = [
    ["custom", "Programmation personnalisée prioritaire", "Reprendre le programme adaptatif"],
    ["adaptive", "Programme adaptatif actif", "Suspendre l’adaptatif"],
    ["suspended", "Programme adaptatif suspendu", "Reprendre l’adaptatif"],
  ];
  for (const [source, label, action] of expected) {
    control.seasonal_profiles.source = source;
    control.seasonal_profiles.current = "summer";
    control.seasonal_profiles.follow_astronomical = source === "adaptive";
    const html = card.rc30SeasonalProfileCard(control, {}, recommandationFixe());
    assert.match(html, new RegExp(label));
    assert.match(html, new RegExp(action));
  }
});

test("étape 19 conserve la recommandation indicative dans le rendu réel de la section pilotage", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control.coordination.role = "master";
  card._rc27Control.seasonal_profiles.source = "adaptive";
  card._rc27Control.seasonal_profiles.current = "summer";
  card._rc27Control.seasonal_profiles.follow_astronomical = true;
  const model = runtime.rc24TreatmentModel(card._treatmentProfile, {
    ph: 7.3,
    temperature: 27.1,
    history: [],
    weatherAlert: { available: false, alerts: [] },
  });
  const html = card.renderRc27Section(model, recommandationFixe());
  assert.match(html, /Recommandation adaptative indicative maintenant/);
  assert.match(html, /08:30 → 22:30/);
  assert.match(html, /Programmation de la pompe/);
  assert.match(html, /Programmation de l’éclairage/);
});
