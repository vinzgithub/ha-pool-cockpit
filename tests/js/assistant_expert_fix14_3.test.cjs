const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const template = fs.readFileSync(path.join(root, "frontend/pool-dashboard.template.js"), "utf8");
const moduleSource = fs.readFileSync(path.join(root, "src/interface/assistant-expert/assistant-expert.js"), "utf8");
const coquilleSource = fs.readFileSync(path.join(root, "src/interface/coquille-rendu.js"), "utf8");

const { loadBundle, state, buildCard } = require("./bundle_harness.cjs");

test("FIX14.3 ajoute un accès discret à l'Assistant Expert depuis Conseils intelligents", () => {
  const renduSource = template + "\n" + coquilleSource;
  assert.match(renduSource, /data-assistant-expert-open/);
  assert.match(renduSource, /Analyse expert/);
  assert.match(renduSource, /data-assistant-expert-modal/);
});

test("FIX14.3.2 garde l'Assistant Expert strictement en lecture seule", () => {
  assert.doesNotMatch(moduleSource, /callService|callWS|turn_on|turn_off|set_value|select_option/);
  assert.match(moduleSource, /aucune commande automatique/i);
});

test("FIX14.3.2 retire les seuils métier propres à assistantExpertConclusion", () => {
  const debut = moduleSource.indexOf("function assistantExpertConclusion");
  const fin = moduleSource.indexOf("export function construireModeleAssistantExpert", debut);
  const conclusionSource = moduleSource.slice(debut, fin);
  assert.doesNotMatch(conclusionSource, /score\s*[<>]=?/i);
  assert.doesNotMatch(conclusionSource, /0\.24|85|70/);
  assert.doesNotMatch(conclusionSource, /heuresRecommandees|heuresCourantes/);
  assert.match(conclusionSource, /contexte\.conclusions/);
});

test("FIX14.3.2 ne rappelle plus le moteur adaptatif depuis rc30AssistantExpertModel", () => {
  const debut = template.indexOf("rc30AssistantExpertModel(");
  const fin = template.indexOf("rc30ApplyAssistantExpertState", debut);
  const modelSource = template.slice(debut, fin);
  assert.doesNotMatch(modelSource, /rc30AdaptiveRecommendation\s*\(/);
  assert.match(modelSource, /adaptiveRecommendation/);
});

test("FIX14.3.2 distingue réellement saison astronomique et profil de référence", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control.seasonal_profiles = {
    ...card._rc27Control.seasonal_profiles,
    current: "summer",
    source: "custom",
    follow_astronomical: false,
  };
  const modele = card.rc30AssistantExpertModel({
    aggregated: { result: { score: 90, suspended: false }, temperature: { number: 27.1 }, ph: { number: 7.31 }, orp: { number: 756 } },
    smart: { label: "Eau équilibrée", message: "Aucune action urgente." },
    confidence: 88,
    comparisons: [],
    weather: { available: false },
    weatherAlert: { available: false, active: false },
    treatmentModel: { summary: "RAS", confidence: { label: "Bonne" }, filtrationAdvice: "Filtration indicative." },
    adaptiveRecommendation: { seasonInfo: { libelle: "Automne" }, scheduleLabel: "08:30 → 21:30", hours: 13, hydraulicHours: 2, context: "Contexte déjà calculé" },
    smartAdviceLines: [],
  });
  assert.equal(modele.filtration.saisonAstronomique, "Automne");
  assert.match(modele.filtration.profilReference, /Été/);
});

test("FIX14.3.2 transmet réellement les écarts Blue Connect/Flipr déjà calculés", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._comparisonMeta = { state: "ready", detail: "Comparables", a: { name: "Blue Connect" }, b: { name: "Flipr" }, timeGapMinutes: 2 };
  const modele = card.rc30AssistantExpertModel({
    aggregated: { result: { score: 90, suspended: false }, temperature: { number: 27.1 }, ph: { number: 7.31 }, orp: { number: 756 } },
    smart: { label: "Eau équilibrée", message: "Aucune action urgente." },
    confidence: 88,
    comparisons: [
      { metric: "temperature", label: "Température", delta: 0.1, unit: "°C", statusLabel: "Cohérent" },
      { metric: "ph", label: "pH", delta: 0.01, unit: "", statusLabel: "Cohérent" },
      { metric: "orp", label: "ORP", delta: 42, unit: "mV", statusLabel: "Cohérent" },
    ],
    weather: { available: false },
    weatherAlert: { available: false, active: false },
    treatmentModel: { summary: "RAS", confidence: { label: "Bonne" }, filtrationAdvice: "Filtration indicative." },
    adaptiveRecommendation: { seasonInfo: { libelle: "Été" }, scheduleLabel: "08:30 → 21:30", hours: 13, hydraulicHours: 2, context: "Contexte déjà calculé" },
    smartAdviceLines: [],
  });
  assert.deepEqual(
    modele.comparaison.ecarts.map(({ metrique, valeur, statut }) => ({ metrique, valeur, statut })),
    [
      { metrique: "temperature", valeur: 0.1, statut: "Cohérent" },
      { metrique: "ph", valeur: 0.01, statut: "Cohérent" },
      { metrique: "orp", valeur: 42, statut: "Cohérent" },
    ],
  );
});

test("FIX14.3 ferme la popup sans modifier le moteur", () => {
  assert.match(template, /rc30OpenAssistantExpert/);
  assert.match(template, /rc30CloseAssistantExpert/);
  assert.match(template, /data-assistant-expert-close/);
});

test("FIX14.3.2 rend réellement la popup, les écarts et conserve les horaires", () => {
  const runtime = loadBundle();
  const now = new Date().toISOString();
  const card = buildCard(runtime, {
    states: {
      "sensor.fp": state("7.31", { lastUpdated: now }),
      "sensor.fo": state("756", { unit: "mV", lastUpdated: now }),
      "sensor.ft": state("27.1", { unit: "°C", lastUpdated: now }),
      "sensor.fl": state(now, { lastUpdated: now }),
      "sensor.fs": state("idle", { lastUpdated: now }),
      "button.fa": state("unknown", { lastUpdated: now }),
      "sensor.bp": state("7.32", { lastUpdated: now }),
      "sensor.bo": state("760", { unit: "mV", lastUpdated: now }),
      "sensor.bt": state("27.2", { unit: "°C", lastUpdated: now }),
      "sensor.bl": state(now, { lastUpdated: now }),
      "sensor.bs": state("idle", { lastUpdated: now }),
      "button.ba": state("unknown", { lastUpdated: now }),
    },
  });
  card._rc27Control.pump.periods = [
    { enabled: true, start: "08:30", end: "21:30" },
    { enabled: false, start: "00:00", end: "00:00" },
    { enabled: false, start: "00:00", end: "00:00" },
  ];
  card.render();

  assert.match(card.shadowRoot.innerHTML, /data-assistant-expert-modal/);
  assert.match(card.shadowRoot.innerHTML, /Assistant Expert Piscine/);
  assert.match(card.shadowRoot.innerHTML, /08:30 → 21:30/);
  assert.match(card.shadowRoot.innerHTML, /Saison astronomique/);
  assert.match(card.shadowRoot.innerHTML, /Profil de référence/);
  assert.match(card.shadowRoot.innerHTML, /Δ Température/);
  assert.match(card.shadowRoot.innerHTML, /Δ pH/);
  assert.match(card.shadowRoot.innerHTML, /Δ ORP/);
  assert.match(card.shadowRoot.innerHTML, /aucune commande Home Assistant/i);
  assert.equal(card._rc27Control.pump.periods[0].end, "21:30");
});

test("FIX14.3.2 calcule la recommandation adaptative une seule fois par render principal", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  const original = card.rc30AdaptiveRecommendation.bind(card);
  let appels = 0;
  card.rc30AdaptiveRecommendation = (...args) => {
    appels += 1;
    return original(...args);
  };
  card.render();
  assert.equal(appels, 1);
});

test("FIX14.3.1 conserve la popup ouverte après reconstruction du DOM", () => {
  const runtime = loadBundle();
  const card = new runtime.PoolDashboardCard();
  const rootShadow = card.attachShadow({ mode: "open" });
  const trigger1 = new runtime.sandbox.Element();
  const modal1 = new runtime.sandbox.Element();
  modal1.hidden = true;
  rootShadow.register("[data-assistant-expert-open]", trigger1);
  rootShadow.register("[data-assistant-expert-modal]", modal1);

  card.rc30OpenAssistantExpert(trigger1);
  assert.equal(card._rc30ExpertOpen, true);
  assert.equal(modal1.hidden, false);

  const trigger2 = new runtime.sandbox.Element();
  const modal2 = new runtime.sandbox.Element();
  modal2.hidden = true;
  rootShadow.register("[data-assistant-expert-open]", trigger2);
  rootShadow.register("[data-assistant-expert-modal]", modal2);
  card.rc30ApplyAssistantExpertState();

  assert.equal(card._rc30ExpertOpen, true);
  assert.equal(modal2.hidden, false);
  assert.equal(card._rc30ExpertReturnFocus, trigger2);

  card.rc30CloseAssistantExpert();
  assert.equal(card._rc30ExpertOpen, false);
  assert.equal(modal2.hidden, true);
});

test("FIX14.3.1 réapplique l'état de la popup après chaque render", () => {
  assert.match(template, /rc30ApplyAssistantExpertState\(\{focus:Boolean\(this\._rc30ExpertOpen\)\}\)/);
});


test("FIX14.4.1 conserve la position de l'ascenseur de la popup après reconstruction du DOM", () => {
  const runtime = loadBundle();
  const card = new runtime.PoolDashboardCard();
  const rootShadow = card.attachShadow({ mode: "open" });
  const trigger1 = new runtime.sandbox.Element();
  const modal1 = new runtime.sandbox.Element();
  const panel1 = new runtime.sandbox.Element();
  panel1.scrollTop = 437;
  modal1.querySelector = selector => selector === ".rc30-expert-modal__panel" ? panel1 : null;
  rootShadow.register("[data-assistant-expert-open]", trigger1);
  rootShadow.register("[data-assistant-expert-modal]", modal1);
  rootShadow.register(".rc30-expert-modal__panel", panel1);

  card._rc30ExpertOpen = true;
  card.rc30CaptureAssistantExpertScroll();
  assert.equal(card._rc30ExpertScrollTop, 437);

  const trigger2 = new runtime.sandbox.Element();
  const modal2 = new runtime.sandbox.Element();
  const panel2 = new runtime.sandbox.Element();
  panel2.scrollTop = 0;
  modal2.querySelector = selector => selector === ".rc30-expert-modal__panel" ? panel2 : null;
  rootShadow.register("[data-assistant-expert-open]", trigger2);
  rootShadow.register("[data-assistant-expert-modal]", modal2);
  rootShadow.register(".rc30-expert-modal__panel", panel2);

  card.rc30ApplyAssistantExpertState();
  assert.equal(panel2.scrollTop, 437);
  assert.equal(card._rc30ExpertOpen, true);
});

test("FIX14.4.1 capture l'ascenseur avant le innerHTML du render principal", () => {
  const renderStart = template.indexOf("  rc285EvaluationEauMeteo()");
  const capture = template.indexOf("this.rc30CaptureAssistantExpertScroll();", renderStart);
  const reconstruction = template.indexOf("this.shadowRoot.innerHTML=", renderStart);
  assert.ok(capture > renderStart);
  assert.ok(reconstruction > capture);
});
