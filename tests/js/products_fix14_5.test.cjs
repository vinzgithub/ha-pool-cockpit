const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBundle, buildCard } = require('./bundle_harness.cjs');

const runtime = loadBundle();

function context(overrides = {}) {
  return {
    ph: 7.3,
    temperature: 27,
    history: [],
    weatherAlert: { available: false, alerts: [] },
    ...overrides,
  };
}

test('FIX14.5 référence les quatre contre-étiquettes vérifiées', () => {
  assert.equal(runtime.RC24_PRODUCTS.axton_ph_plus_powder.dosePer10m3Per01, 100);
  assert.match(runtime.RC24_PRODUCTS.axton_ph_plus_powder.note, /0,1/);
  assert.equal(runtime.RC24_PRODUCTS.sunval_bromine_activator.weeklyPer10m3, 100);
  assert.equal(runtime.RC24_PRODUCTS.sunval_bromine_activator.shockPer10m3, 250);
  assert.equal(runtime.RC24_PRODUCTS.bayrol_desalgin_classic.weeklyPer10m3, 50);
  assert.equal(runtime.RC24_PRODUCTS.piscimar_grease_killer.initialPer100m3, 750);
  assert.equal(runtime.RC24_PRODUCTS.piscimar_grease_killer.weeklyPer100m3, 350);
});

test('FIX14.5.2 garde les produits complémentaires en mode ponctuel par défaut', () => {
  const base = runtime.rc24SanitizeTreatmentProfile({
    ...runtime.RC24_DEFAULT_TREATMENT,
    volume_m3: 15.6,
    sanitizer_level: 2,
    treatment: 'bromine',
    algaecide_product: 'bayrol_desalgin_classic',
    degreaser_product: 'piscimar_grease_killer',
  });
  assert.equal(base.supplemental_products_mode, 'on_demand');
  const model = runtime.rc24TreatmentModel(base, context());
  assert.equal(model.actions.some(a => a.kind === 'bromine_weekly'), false);
  assert.equal(model.actions.some(a => a.kind === 'desalgin_weekly'), false);
  assert.equal(model.actions.some(a => a.kind.startsWith('grease_killer_')), false);
  assert.match(model.sanitizerAdvice.detail, /aucun rappel hebdomadaire/);
  assert.match(model.supplementalAdvice.map(x => x.detail).join(' '), /Mode ponctuel \/ urgence/);
});

test('FIX14.5.2 conserve le protocole fabricant uniquement après choix explicite', () => {
  const profile = runtime.rc24SanitizeTreatmentProfile({
    ...runtime.RC24_DEFAULT_TREATMENT,
    volume_m3: 15.6,
    sanitizer_level: 2,
    treatment: 'bromine',
    algaecide_product: 'bayrol_desalgin_classic',
    degreaser_product: 'piscimar_grease_killer',
    supplemental_products_mode: 'manufacturer_schedule',
  });
  const model = runtime.rc24TreatmentModel(profile, context());
  const weekly = model.actions.find(a => a.kind === 'bromine_weekly');
  const desalgin = model.actions.find(a => a.kind === 'desalgin_weekly');
  const grease = model.actions.find(a => a.kind === 'grease_killer_initial');
  assert.ok(weekly);
  assert.ok(desalgin);
  assert.equal(desalgin.dose_ml, 80);
  assert.ok(grease);
  assert.equal(grease.dose_ml, 115);
});

test('FIX14.5.2 propose encore le choc en mode ponctuel si eau verte', () => {
  const profile = runtime.rc24SanitizeTreatmentProfile({
    ...runtime.RC24_DEFAULT_TREATMENT,
    volume_m3: 16,
    sanitizer_level: 1.5,
    treatment: 'bromine',
    water_condition: 'green',
    supplemental_products_mode: 'on_demand',
  });
  const model = runtime.rc24TreatmentModel(profile, context());
  const shock = model.actions.find(a => a.kind === 'bromine_shock');
  assert.ok(shock);
  assert.equal(shock.dose_g, 400);
  assert.equal(model.actions.some(a => a.kind === 'bromine_weekly'), false);
});

test('FIX14.5 bloque Grease Killer sans mesure de désinfectant compatible', () => {
  const profile = runtime.rc24SanitizeTreatmentProfile({
    ...runtime.RC24_DEFAULT_TREATMENT,
    volume_m3: 15.6,
    sanitizer_level: 3.2,
    treatment: 'bromine',
    degreaser_product: 'piscimar_grease_killer',
    supplemental_products_mode: 'manufacturer_schedule',
  });
  const model = runtime.rc24TreatmentModel(profile, context());
  assert.equal(model.actions.some(a => a.kind.startsWith('grease_killer_')), false);
  assert.match(model.supplementalAdvice.map(x => x.detail).join(' '), /≤ 3 mg\/L/);
});

test('FIX14.5 propose 55 ml de Grease Killer en entretien après une semaine', () => {
  const profile = runtime.rc24SanitizeTreatmentProfile({
    ...runtime.RC24_DEFAULT_TREATMENT,
    volume_m3: 15.6,
    sanitizer_level: 2,
    treatment: 'bromine',
    degreaser_product: 'piscimar_grease_killer',
    supplemental_products_mode: 'manufacturer_schedule',
  });
  const old = new Date(Date.now() - 8 * 86400000).toISOString();
  const model = runtime.rc24TreatmentModel(profile, context({history:[{date:old,kind:'grease_killer_initial'}]}));
  const grease = model.actions.find(a => a.kind === 'grease_killer_weekly');
  assert.ok(grease);
  assert.equal(grease.dose_ml, 55);
});

test('FIX14.5 fusionne le journal local et le journal Home Assistant sans doublon', () => {
  const a = {date:'2026-09-05T10:00:00Z',kind:'ph_plus',product:'AXTON',dose_amount:155,dose_unit:'g',detail:'Palier'};
  const b = {date:'2026-09-04T10:00:00Z',kind:'bromine_weekly',product:'Sunval',dose_amount:155,dose_unit:'g',detail:'Entretien'};
  const merged = runtime.rc24MergeTreatmentHistories([a],[a,b]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].kind, 'ph_plus');
});

test('FIX14.5 utilise les WebSocket HA dédiés au journal persistant', async () => {
  const calls = [];
  const card = buildCard(runtime, {states:{}});
  card._hass.callWS = async payload => {
    calls.push(payload);
    if (payload.type === 'ha_pool_dashboard/get_treatment_history') return {history:[]};
    if (payload.type === 'ha_pool_dashboard/save_treatment_history') return {history:payload.history};
    return {};
  };
  card._treatmentHistory = [{date:'2026-09-05T10:00:00Z',kind:'maintenance_filter',product:'Entretien'}];
  await card.syncTreatmentHistoryFromBackend();
  assert.ok(calls.some(c => c.type === 'ha_pool_dashboard/get_treatment_history'));
  assert.ok(calls.some(c => c.type === 'ha_pool_dashboard/save_treatment_history'));
});


test('FIX14.5.2 présente le brome lent comme traitement de fond en mode ponctuel', () => {
  const profile = runtime.rc24SanitizeTreatmentProfile({
    ...runtime.RC24_DEFAULT_TREATMENT,
    volume_m3: 16,
    sanitizer_level: '',
    treatment: 'bromine',
  });
  const model = runtime.rc24TreatmentModel(profile, context());
  assert.equal(model.sanitizerAdvice.title, 'Brome lent : traitement de fond');
  assert.match(model.sanitizerAdvice.detail, /160 g/);
  assert.match(model.sanitizerAdvice.detail, /400 g/);
  assert.match(model.sanitizerAdvice.detail, /aucun bouton d’ajout/);
  assert.equal(model.actions.some(a => a.kind === 'bromine_weekly'), false);
});


test('FIX14.5.3 conserve ouverts les deux menus du profil pendant les re-rendus', async () => {
  const card = buildCard(runtime, {states:{}});
  card._treatmentDetailsState = {products:true, maintenance:true};
  const profile = runtime.rc24SanitizeTreatmentProfile({...runtime.RC24_DEFAULT_TREATMENT, treatment:'bromine'});
  card._treatmentProfile = profile;
  const model = runtime.rc24TreatmentModel(profile, context());
  const html = card.renderTreatmentSection(model);
  assert.match(html, /data-treatment-details=products open/);
  assert.match(html, /data-treatment-details=maintenance open/);

  const products = new runtime.sandbox.Element();
  products.dataset.treatmentDetails = 'products';
  products.open = true;
  const maintenance = new runtime.sandbox.Element();
  maintenance.dataset.treatmentDetails = 'maintenance';
  maintenance.open = false;
  card.shadowRoot.register('[data-treatment-details]', [products, maintenance]);
  card.bindTreatmentControls();
  await products.dispatch('toggle');
  await maintenance.dispatch('toggle');
  assert.equal(card._treatmentDetailsState.products, true);
  assert.equal(card._treatmentDetailsState.maintenance, false);

  const second = buildCard(runtime, {states:{}});
  assert.equal(second._treatmentDetailsState.products, true);
  assert.equal(second._treatmentDetailsState.maintenance, false);
});
