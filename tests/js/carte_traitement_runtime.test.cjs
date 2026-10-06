const test = require("node:test");
const assert = require("node:assert/strict");
const { loadBundle, buildCard } = require("./bundle_harness.cjs");

function modele(runtime, card, overrides = {}) {
  return runtime.rc24TreatmentModel(card._treatmentProfile, {
    ph: 7.3,
    temperature: 27.1,
    orp: 720,
    orpTrend: "stable",
    history: card._treatmentHistory || [],
    weatherAlert: { available: false, alerts: [] },
    lastAnalysis: "2026-09-01T10:00:00.000Z",
    ...overrides,
  });
}

test("étape 15 rend réellement la carte Traitement depuis le modèle déterministe existant", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  const html = card.renderTreatmentSection(modele(runtime, card));
  assert.match(html, /<h2>Traitement & dosage<\/h2>/);
  assert.match(html, /Profil du bassin/);
  assert.match(html, /Conseil calculé/);
  assert.match(html, /Ponctuel \/ urgence · aucun rappel hebdomadaire/);
  assert.match(html, /data-treatment-action="0"/);
  assert.doesNotMatch(html, /Confirmer l’ajout fabricant/);
});

test("étape 15 conserve réellement les panneaux produits/maintenance ouverts dans le rendu", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._treatmentDetailsState = { products: true, maintenance: true };
  const html = card.renderTreatmentSection(modele(runtime, card));
  assert.match(html, /data-treatment-details=products open>/);
  assert.match(html, /data-treatment-details=maintenance open>/);
});

test("étape 15 conserve réellement le journal et les actions déjà calculées sans les exécuter", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._treatmentHistory = [{
    date: "2026-09-01T10:15:00.000Z",
    kind: "sanitizer_measurement",
    treatment: "bromine",
    sanitizer_level: 2.2,
    product: "Mesure manuelle",
    detail: "Mesure brome",
  }];
  const model = modele(runtime, card, { history: card._treatmentHistory });
  model.actions = [{ kind: "maintenance_filter", label: "J’ai fait le contre-lavage", manualConfirmation: false }];
  const html = card.renderTreatmentSection(model);
  assert.match(html, /data-treatment-action="0"/);
  assert.match(html, /🧹/);
  assert.match(html, /Mesure brome : 2\.2 mg\/L/);
  assert.equal(card._treatmentHistory.length, 1);
});

test("étape 15 conserve le rendu chlore sans proposer de dosage de galet", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._treatmentProfile = runtime.rc24SanitizeTreatmentProfile({
    ...card._treatmentProfile,
    treatment: "chlorine",
  });
  const html = card.renderTreatmentSection(modele(runtime, card));
  assert.match(html, /Le réglage chlore est calculé depuis la mesure manuelle/);
  assert.match(html, /Aucun dosage de galet n’est proposé/);
  assert.doesNotMatch(html, /Activateur \/ produit choc/);
});
