const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBundle } = require('./bundle_harness.cjs');

test('le bundle utilise les doses extraites sans changer les actions visibles à 15,6 m³', () => {
  const runtime = loadBundle();
  const profile = runtime.rc24SanitizeTreatmentProfile({
    ...runtime.RC24_DEFAULT_TREATMENT,
    volume_m3: 15.6,
    treatment: 'bromine',
    ph_plus_product: 'axton_ph_plus_powder',
    sanitizer_product: 'sunval_bromine_activator',
    water_condition: 'green',
    supplemental_products_mode: 'on_demand',
  });
  const model = runtime.rc24TreatmentModel(profile, { ph: 7.2, temperature: 28, history: [] });
  const choc = model.actions.find((action) => action.kind === 'bromine_shock');
  assert.equal(choc.dose_amount, 390);
  assert.equal(model.actions.some((action) => action.kind === 'bromine_weekly'), false);

  const correction = runtime.rc24TreatmentModel(profile, { ph: 6.9, temperature: 28, history: [] });
  const phPlus = correction.actions.find((action) => action.kind === 'ph_plus');
  assert.equal(phPlus.dose_amount, 155);
  assert.equal(phPlus.product, 'AXTON pH+ poudre');
});

test('le protocole fabricant conserve Desalgin et Grease Killer avec les doses historiques', () => {
  const runtime = loadBundle();
  const profile = runtime.rc24SanitizeTreatmentProfile({
    ...runtime.RC24_DEFAULT_TREATMENT,
    volume_m3: 15.6,
    treatment: 'bromine',
    sanitizer_level: 2,
    algaecide_product: 'bayrol_desalgin_classic',
    degreaser_product: 'piscimar_grease_killer',
    supplemental_products_mode: 'manufacturer_schedule',
  });
  const model = runtime.rc24TreatmentModel(profile, { ph: 7.3, temperature: 28, history: [] });
  assert.equal(model.actions.find((action) => action.kind === 'desalgin_weekly').dose_amount, 80);
  assert.equal(model.actions.find((action) => action.kind === 'grease_killer_initial').dose_amount, 115);
});
