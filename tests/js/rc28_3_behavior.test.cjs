const test = require('node:test');
const assert = require('node:assert/strict');
const {
  loadBundle,
  state,
  defaultDevices,
  buildCard,
} = require('./bundle_harness.cjs');

const runtime = loadBundle();

function currentIso(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString();
}

function completeStates({ fliprOrp = 710, blueOrp = 710, fliprTime = currentIso(), blueTime = currentIso() } = {}) {
  return {
    'sensor.fp': state('7.20', { unit: '', lastUpdated: fliprTime }),
    'sensor.fo': state(fliprOrp, { unit: 'mV', lastUpdated: fliprTime }),
    'sensor.ft': state('28.0', { unit: '°C', lastUpdated: fliprTime }),
    'sensor.fl': state(fliprTime, { lastUpdated: fliprTime }),
    'sensor.fs': state('idle', { lastUpdated: fliprTime }),
    'button.fa': state('unknown', { lastUpdated: fliprTime }),
    'sensor.bp': state('7.30', { unit: '', lastUpdated: blueTime }),
    'sensor.bo': state(blueOrp, { unit: 'mV', lastUpdated: blueTime }),
    'sensor.bt': state('29.0', { unit: '°C', lastUpdated: blueTime }),
    'sensor.bl': state(blueTime, { lastUpdated: blueTime }),
    'sensor.bs': state('idle', { lastUpdated: blueTime }),
    'button.ba': state('unknown', { lastUpdated: blueTime }),
  };
}

function comparisonForOrpDelta(delta) {
  const card = buildCard(runtime, {
    states: completeStates({ fliprOrp: 700 + delta, blueOrp: 700 }),
  });
  return card.comparisonRows().find((row) => row.metric === 'orp');
}

function installCapturedTimers() {
  let nextId = 1;
  const timers = new Map();
  runtime.sandbox.setTimeout = (fn, delay = 0) => {
    const id = nextId++;
    timers.set(id, { fn, delay });
    return id;
  };
  runtime.sandbox.clearTimeout = (id) => timers.delete(id);
  return {
    timers,
    runDelay(delay) {
      const found = [...timers.entries()].find(([, timer]) => timer.delay === delay);
      assert.ok(found, `minuteur ${delay} ms attendu`);
      const [id, timer] = found;
      timers.delete(id);
      timer.fn();
    },
  };
}

test('la confiance vaut 100 % avec une seule source volontairement active et complète', () => {
  assert.equal(runtime.smartConfidence([], 1, 1, 1), 100);

  const card = buildCard(runtime, {
    states: completeStates(),
    measurementSources: { flipr: false, blue_connect: true },
  });
  const aggregated = card.aggregateHealth();
  const comparisons = card.comparisonRows();
  const confidence = runtime.smartConfidence(
    comparisons,
    aggregated.usableCount,
    aggregated.activeCount,
    aggregated.completeCount,
  );

  assert.equal(aggregated.activeCount, 1);
  assert.equal(aggregated.completeCount, 1);
  assert.equal(confidence, 100);
  card.render();
  assert.match(
    card.shadowRoot.innerHTML,
    /<small>Confiance<\/small><strong>100%<\/strong><em>1 source valide<\/em>/,
  );
});

test('la confiance baisse seulement lorsqu’une source activée est incomplète', () => {
  assert.equal(runtime.smartConfidence([], 2, 2, 1), 70);
  assert.equal(runtime.smartConfidence([], 0, 0, 0), 0);
});

test('la tolérance ORP produit les niveaux attendus', () => {
  assert.deepEqual(
    Object.fromEntries([100, 200, 250, 301].map((delta) => {
      const row = comparisonForOrpDelta(delta);
      return [delta, { good: row.good, severity: row.severity, penalty: row.confidencePenalty }];
    })),
    {
      100: { good: true, severity: 'coherent', penalty: 0 },
      200: { good: true, severity: 'acceptable', penalty: 0 },
      250: { good: false, severity: 'watch', penalty: 8 },
      301: { good: false, severity: 'critical', penalty: 20 },
    },
  );
});

test('les mesures espacées de plus de 60 minutes ne sont pas comparées', () => {
  const card = buildCard(runtime, {
    states: completeStates({ fliprTime: currentIso(-121), blueTime: currentIso() }),
  });
  assert.equal(card.comparisonRows().length, 0);
  assert.equal(card._comparisonMeta.state, 'time_gap');
  assert.ok(card._comparisonMeta.timeGapMinutes > 60);
});

test('le barème pH est progressif et conserve 7,20–7,50 à 100 %', () => {
  assert.equal(runtime.rc28PhAssessment(7.20).score, 100);
  assert.equal(runtime.rc28PhAssessment(7.50).score, 100);
  assert.equal(runtime.rc28PhAssessment(7.05).label, 'À surveiller');
  assert.equal(runtime.rc28PhAssessment(6.75).label, 'Correction prioritaire');
});

test('la performance de filtration calcule les volumes et renouvellements réels', () => {
  const card = buildCard(runtime, { states: completeStates() });
  card._treatmentProfile = { ...card._treatmentProfile, volume_m3: 16, pump_flow_m3h: 10 };
  card._filtrationStats = { available: true, hours: 8.5, running: true };
  const perf = card.filtrationPerformance({ filtrationHours: 10 });

  assert.equal(perf.actual, true);
  assert.equal(perf.filtered, 85);
  assert.equal(perf.turnovers, 85 / 16);
  assert.equal(perf.progress, 85);
  assert.equal(perf.renewalHours, 1.6);

  const html = card.renderFiltrationSection({ filtrationHours: 10 });
  assert.match(html, /8 h 30/);
  assert.match(html, /85 m³/);
  assert.match(html, /5\.3 volumes/);
});

test('le mode ponctuel ne propose pas d’entretien hebdomadaire sans urgence', () => {
  const profile = runtime.rc24SanitizeTreatmentProfile({
    ...runtime.RC24_DEFAULT_TREATMENT,
    volume_m3: 16,
    sanitizer_level: '',
    treatment: 'bromine',
  });
  const model = runtime.rc24TreatmentModel(profile, {
    ph: 7.3,
    temperature: 27,
    history: [],
    weatherAlert: { available: false, alerts: [] },
  });
  const weekly = model.actions.find((action) => action.kind === 'bromine_weekly');

  assert.equal(weekly, undefined);
  assert.equal(model.sanitizerAdvice.title, 'Brome lent : traitement de fond');
  assert.match(model.sanitizerAdvice.detail, /aucun rappel hebdomadaire/);
});

test('le mode conseillé affiche une proposition sans modifier la plage permanente', () => {
  const card = buildCard(runtime, { states: completeStates() });
  card._rc27Control.pump = {
    ...card._rc27Control.pump,
    mode: 'automatic',
    entity_id: 'switch.pump',
    periods: [
      { enabled: true, start: '08:00', end: '21:30' },
      { enabled: false, start: '00:00', end: '00:00' },
      { enabled: false, start: '00:00', end: '00:00' },
    ],
    base_scheduled_hours: 13.5,
    scheduled_hours: 13.5,
    base_next_boundary: currentIso(120),
    next_boundary: currentIso(120),
    proposed_end: '00:00',
    proposed_extension_minutes: 150,
    extension_status: 'none',
  };
  card._hass.states['switch.pump'] = state('on');
  const baseModel = card.treatmentModel(card.aggregateHealth(), { available: false, alerts: [] });
  const html = card.renderRc27Section({ ...baseModel, filtrationHours: 16 });

  assert.match(html, /Prolongation proposée/);
  assert.match(html, /Il manque 2 h 30/);
  assert.match(html, /fin proposée 00:00/);
  assert.match(html, /data-rc282-extension=approve/);
  assert.match(html, /data-rc282-extension=ignore/);
});

test('un appareil désactivé pour les calculs peut toujours lancer une analyse', async () => {
  const card = buildCard(runtime, {
    states: completeStates(),
    measurementSources: { flipr: false, blue_connect: true },
  });
  card.render = () => {};
  const calls = [];
  card._hass.callService = async (...args) => calls.push(args);
  installCapturedTimers();

  const result = await card.analyze(card.config.devices[0], 0);

  assert.equal(result, true);
  assert.equal(calls[0][0], 'button');
  assert.equal(calls[0][1], 'press');
  assert.equal(calls[0][2].entity_id, 'button.fa');
  assert.equal(card.analysisBusy(0), true);
});

test('le minuteur d’analyse débloque le bouton après 90 secondes sans nouvelle mesure', async () => {
  const card = buildCard(runtime, { states: completeStates() });
  card.render = () => {};
  card._hass.callService = async () => {};
  const clock = installCapturedTimers();

  await card.analyze(card.config.devices[0], 0);
  clock.runDelay(90_000);

  assert.equal(card._analysisProgress[0].phase, 'error');
  assert.equal(card._analysisProgress[0].label, 'Analyse non terminée');
  assert.equal(card.analysisBusy(0), false);
});

test('une nouvelle date de mesure termine l’analyse et annule le minuteur', async () => {
  const card = buildCard(runtime, { states: completeStates() });
  card.render = () => {};
  card._hass.callService = async () => {};
  const clock = installCapturedTimers();

  await card.analyze(card.config.devices[0], 0);
  card._hass.states['sensor.fl'] = state(currentIso(1));
  card.reconcileAnalysisProgress();

  assert.equal(card._analysisProgress[0].phase, 'done');
  assert.equal(card.analysisBusy(0), false);
  assert.equal([...clock.timers.values()].some((timer) => timer.delay === 90_000), false);
});

test('une erreur de service est exposée immédiatement et ne laisse pas le bouton bloqué', async () => {
  const card = buildCard(runtime, { states: completeStates() });
  card.render = () => {};
  card._hass.callService = async () => { throw new Error('service unavailable'); };
  installCapturedTimers();
  const previousError = runtime.sandbox.console.error;
  runtime.sandbox.console.error = () => {};

  const result = await card.analyze(card.config.devices[0], 0);
  runtime.sandbox.console.error = previousError;

  assert.equal(result, false);
  assert.equal(card._analysisProgress[0].phase, 'error');
  assert.equal(card._analysisProgress[0].label, 'Échec du lancement');
  assert.equal(card.analysisBusy(0), false);
});

test('le rendu mobile utilise un seul contrôle compact activé/désactivé par appareil', () => {
  const card = buildCard(runtime, {
    states: completeStates(),
    measurementSources: { flipr: false, blue_connect: true },
  });
  const active = card.deviceCard(card.config.devices[1], 1);
  const disabled = card.deviceCard(card.config.devices[0], 0);

  assert.equal((active.match(/class="rc28-device-toggle/g) || []).length, 1);
  assert.equal((disabled.match(/class="rc28-device-toggle/g) || []).length, 1);
  assert.match(active, /data-device-toggle="1"/);
  assert.match(active, /Activé/i);
  assert.match(disabled, /data-device-toggle="0"/);
  assert.match(disabled, /Désactivé/i);
});


test('deux appareils Blue Connect de même famille conservent des états indépendants', async () => {
  const devices = [
    { key: 'blue_remote', name: 'Blue Connect Plus distant', brand: 'blue_connect', entities: { ph: 'sensor.bp', orp: 'sensor.bo', temperature: 'sensor.bt' } },
    { key: 'blue_local', name: 'Blue Connect Silver local', brand: 'blue_connect', entities: { ph: 'sensor.lp', orp: 'sensor.lo', temperature: 'sensor.lt' } },
  ];
  const card = buildCard(runtime, {
    devices,
    states: {
      'sensor.bp': state('7.25'), 'sensor.bo': state('738'), 'sensor.bt': state('27.5'),
      'sensor.lp': state('7.10'), 'sensor.lo': state('650'), 'sensor.lt': state('28.0'),
    },
    measurementSources: { blue_remote: true, blue_local: false },
  });

  assert.equal(card.deviceEnabled(devices[0], 0), true);
  assert.equal(card.deviceEnabled(devices[1], 1), false);

  let saved;
  card.saveRc27Control = async (next) => { saved = next; card._rc27Control = next; };
  await card.toggleMeasurementDevice(0);

  assert.equal(saved.measurement_sources.blue_remote, false);
  assert.equal(saved.measurement_sources.blue_local, false);
  assert.equal(card.deviceEnabled(devices[0], 0), false);
  assert.equal(card.deviceEnabled(devices[1], 1), false);
});

test('la migration de l’ancien état partagé permet d’activer un seul Blue Connect', async () => {
  const devices = [
    { key: 'blue_remote', name: 'Blue Connect Plus distant', brand: 'blue_connect', entities: { ph: 'sensor.bp' } },
    { key: 'blue_local', name: 'Blue Connect Silver local', brand: 'blue_connect', entities: { ph: 'sensor.lp' } },
  ];
  const card = buildCard(runtime, {
    devices,
    states: { 'sensor.bp': state('7.25'), 'sensor.lp': state('7.10') },
    measurementSources: { blue_connect: false },
  });

  assert.equal(card.deviceEnabled(devices[0], 0), false);
  assert.equal(card.deviceEnabled(devices[1], 1), false);

  card.saveRc27Control = async (next) => { card._rc27Control = next; };
  await card.toggleMeasurementDevice(0);

  assert.equal(card.deviceEnabled(devices[0], 0), true);
  assert.equal(card.deviceEnabled(devices[1], 1), false);
});

test('un helper partagé par erreur est ignoré pour éviter de coupler deux appareils', () => {
  const devices = [
    { key: 'blue_remote', name: 'Blue distant', brand: 'blue_connect', enabled_entity: 'input_boolean.blue_enabled', entities: { ph: 'sensor.bp' } },
    { key: 'blue_local', name: 'Blue local', brand: 'blue_connect', enabled_entity: 'input_boolean.blue_enabled', entities: { ph: 'sensor.lp' } },
  ];
  const card = buildCard(runtime, {
    devices,
    states: {
      'sensor.bp': state('7.25'),
      'sensor.lp': state('7.10'),
      'input_boolean.blue_enabled': state('off'),
    },
    measurementSources: { blue_remote: true, blue_local: false },
  });

  assert.equal(card.deviceEnabledEntity(devices[0]), '');
  assert.equal(card.deviceEnabledEntity(devices[1]), '');
  assert.equal(card.deviceEnabled(devices[0], 0), true);
  assert.equal(card.deviceEnabled(devices[1], 1), false);
});

test('FIX14.2 utilise un plancher hydraulique d’un renouvellement théorique', () => {
  const profile = runtime.rc24SanitizeTreatmentProfile({
    ...runtime.RC24_DEFAULT_TREATMENT,
    volume_m3: 16,
    pump_flow_m3h: 10,
  });
  const model = runtime.rc24TreatmentModel(profile, {
    ph: 7.3,
    temperature: null,
    history: [],
    weatherAlert: { available: false, alerts: [] },
  });
  assert.equal(model.hydraulicHours, 2);
  assert.equal(model.filtrationHours, 2);
  assert.match(model.filtrationAdvice, /1 renouvellement théorique/);
  assert.match(model.filtrationAdvice, /recommandation indicative/);
});


test('un clic réel sur Valider aujourd’hui envoie uniquement l’action one-shot au backend', async () => {
  const { FakeElement } = require('./bundle_harness.cjs');
  const card = buildCard(runtime, { states: completeStates() });
  card._rc27Control = runtime.rc27SanitizeControl({
    ...card._rc27Control,
    backend_available: true,
    pump: {
      ...card._rc27Control.pump,
      mode: 'automatic',
      extension: { date: '', status: 'none', target_hours: 0, minutes: 0 },
    },
  });
  const valider = new FakeElement();
  valider.dataset.rc282Extension = 'approve';
  card.shadowRoot.register('[data-rc282-extension]', [valider]);
  const appels = [];
  card._hass.callWS = async (requete) => {
    appels.push(requete);
    return {
      ...card._rc27Control,
      pump: {
        ...card._rc27Control.pump,
        extension: { date: '2026-07-25', status: 'approved', target_hours: 16, minutes: 150 },
      },
    };
  };
  card.render = () => {};
  card.bindRc27Controls();

  await valider.click();

  assert.deepEqual(JSON.parse(JSON.stringify(appels)), [
    { type: 'ha_pool_dashboard/extension', action: 'approve' },
  ]);
  assert.equal(card._rc27Control.pump.extension.status, 'approved');
  assert.equal(card._rc27Control.pump.extension.minutes, 150);
});
