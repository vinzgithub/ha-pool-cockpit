const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBundle, buildCard } = require('./bundle_harness.cjs');

const runtime = loadBundle();

const entry = (date, kind, overrides = {}) => ({
  date,
  kind,
  product: 'Produit',
  dose_amount: 10,
  dose_unit: 'g',
  detail: 'Détail',
  ...overrides,
});

test('étape 8 fusionne réellement backend + miroir local puis remonte le résultat au backend', async () => {
  const calls = [];
  const backend = entry('2026-09-04T10:00:00Z', 'maintenance_filter');
  const local = entry('2026-09-05T10:00:00Z', 'ph_plus');
  const card = buildCard(runtime, {states:{}});
  card._treatmentHistory = [local];
  card._connected = false;
  card._hass.callWS = async payload => {
    calls.push(payload);
    if (payload.type === 'ha_pool_dashboard/get_treatment_history') return {history:[backend]};
    if (payload.type === 'ha_pool_dashboard/save_treatment_history') return {history:payload.history};
    return {};
  };

  await card.syncTreatmentHistoryFromBackend();

  assert.deepEqual(JSON.parse(JSON.stringify(card._treatmentHistory)), [local, backend]);
  assert.equal(card._treatmentJournalSynced, true);
  assert.deepEqual(calls.map(item => item.type), [
    'ha_pool_dashboard/get_treatment_history',
    'ha_pool_dashboard/save_treatment_history',
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(calls[1].history)), [local, backend]);
});

test('étape 8 ne réécrit pas le backend lorsque son journal est déjà identique', async () => {
  const calls = [];
  const history = [entry('2026-09-05T10:00:00Z', 'ph_plus')];
  const card = buildCard(runtime, {states:{}});
  card._treatmentHistory = history;
  card._connected = false;
  card._hass.callWS = async payload => {
    calls.push(payload);
    if (payload.type === 'ha_pool_dashboard/get_treatment_history') return {history};
    return {};
  };

  await card.syncTreatmentHistoryFromBackend();

  assert.equal(card._treatmentJournalSynced, true);
  assert.deepEqual(calls.map(item => item.type), ['ha_pool_dashboard/get_treatment_history']);
});

test('étape 8 garde le miroir local utilisable lorsque le backend du journal est indisponible', async () => {
  const local = [entry('2026-09-05T10:00:00Z', 'ph_plus')];
  const card = buildCard(runtime, {states:{}});
  card._treatmentHistory = local;
  card._connected = false;
  card._hass.callWS = async () => { throw new Error('backend indisponible'); };

  await card.syncTreatmentHistoryFromBackend();

  assert.deepEqual(JSON.parse(JSON.stringify(card._treatmentHistory)), local);
  assert.equal(card._treatmentJournalSynced, false);
  assert.equal(card._treatmentJournalLoading, false);
});

test('étape 8 persistTreatmentHistory déduplique avant le save WebSocket historique', async () => {
  const calls = [];
  const a = entry('2026-09-05T10:00:00Z', 'ph_plus');
  const card = buildCard(runtime, {states:{}});
  card._treatmentHistory = [a, {...a}];
  card._hass.callWS = async payload => { calls.push(payload); return {history:payload.history}; };

  card.persistTreatmentHistory();
  await new Promise(resolve => setTimeout(resolve, 0));

  assert.equal(card._treatmentHistory.length, 1);
  assert.equal(card._treatmentJournalSynced, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].type, 'ha_pool_dashboard/save_treatment_history');
  assert.equal(calls[0].history.length, 1);
});

test('étape 8 conserve la déduplication historique exposée par le bundle', () => {
  const a = entry('2026-09-05T10:00:00Z', 'ph_plus');
  const b = entry('2026-09-04T10:00:00Z', 'maintenance_filter');
  const merged = runtime.rc24MergeTreatmentHistories([a], [a, b]);
  assert.deepEqual(JSON.parse(JSON.stringify(merged)), [a, b]);
});
