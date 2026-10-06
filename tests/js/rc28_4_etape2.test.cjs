const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBundle, buildCard, state } = require('./bundle_harness.cjs');
const runtime = loadBundle();

function statesComplets() {
  const now = new Date().toISOString();
  return {
    'sensor.fp': state('7.2', { lastUpdated: now }), 'sensor.fo': state('710', { lastUpdated: now }), 'sensor.ft': state('30', { lastUpdated: now }), 'sensor.fl': state(now, { lastUpdated: now }), 'sensor.fs': state('idle', { lastUpdated: now }), 'button.fa': state('unknown', { lastUpdated: now }),
    'sensor.bp': state('7.3', { lastUpdated: now }), 'sensor.bo': state('720', { lastUpdated: now }), 'sensor.bt': state('30', { lastUpdated: now }), 'sensor.bl': state(now, { lastUpdated: now }), 'sensor.bs': state('idle', { lastUpdated: now }), 'button.ba': state('unknown', { lastUpdated: now }),
  };
}

test('le flag expérimental reste désactivé par défaut', () => assert.equal(runtime.FONCTIONNALITES_EXPERIMENTALES.moteurEauMeteoV1, false));

test('le composant n’est pas injecté lorsque le flag est false', () => {
  const card = buildCard(runtime, { states: statesComplets() });
  card.render();
  assert.doesNotMatch(card.shadowRoot.innerHTML, /data-eau-meteo-experimental/);
});

test('le composant apparaît lorsque le flag est explicitement activé', () => {
  const card = buildCard(runtime, { states: statesComplets() });
  card.config.fonctionnalites_experimentales = { moteurEauMeteoV1: true };
  card.render();
  assert.match(card.shadowRoot.innerHTML, /data-eau-meteo-experimental/);
  assert.match(card.shadowRoot.innerHTML, /Assistant Eau \+ Météo/);
  assert.match(card.shadowRoot.innerHTML, /Filtration renforcée/);
});

test('le composant affiche l’indisponibilité sans température critique', () => {
  const card = buildCard(runtime, { states: {} });
  card.config.fonctionnalites_experimentales = { moteurEauMeteoV1: true };
  card.render();
  assert.match(card.shadowRoot.innerHTML, /Recommandation indisponible/);
  assert.doesNotMatch(card.shadowRoot.innerHTML, /scorePartiel/);
});

test('RC28.5 affiche les données réelles simulées et la couverture inconnue', () => {
  const card = buildCard(runtime, { states: statesComplets() });
  card.config.fonctionnalites_experimentales = { moteurEauMeteoV1: true };
  card.currentWeatherAlert = () => ({ configured:true, available:true, active:true, alerts:[], severity:2, levelKey:'orange', levelLabel:'Orange', department:'85', entityId:'sensor.alert' });
  card._hass.callService = () => { throw new Error('hass.callService interdit'); };
  card.render();
  assert.match(card.shadowRoot.innerHTML, /water-weather-v1-draft/);
  assert.match(card.shadowRoot.innerHTML, /canicule orange/);
  assert.match(card.shadowRoot.innerHTML, /couverture Inconnue/);
  assert.match(card.shadowRoot.innerHTML, /État de la couverture inconnu/);
});

test('RC28.5 gère température unknown, unavailable et absente', () => {
  for (const valeur of ['unknown', 'unavailable', null]) {
    const states = statesComplets();
    if (valeur === null) { delete states['sensor.ft']; delete states['sensor.bt']; }
    else { states['sensor.ft'] = state(valeur); states['sensor.bt'] = state(valeur); }
    const card = buildCard(runtime, { states });
    card.config.fonctionnalites_experimentales = { moteurEauMeteoV1: true };
    card.render();
    assert.match(card.shadowRoot.innerHTML, /Recommandation indisponible/);
  }
});

test('RC28.5 convertit les vigilances jaune orange rouge dans le rendu', () => {
  for (const [levelKey, texte] of [['yellow','jaune'],['orange','orange'],['red','rouge']]) {
    const card = buildCard(runtime, { states: statesComplets() });
    card.config.fonctionnalites_experimentales = { moteurEauMeteoV1: true };
    card.currentWeatherAlert = () => ({ configured:true, available:true, active:true, alerts:[], severity:1, levelKey, levelLabel:levelKey, department:'85', entityId:'sensor.alert' });
    card.render();
    assert.match(card.shadowRoot.innerHTML, new RegExp(`canicule ${texte}`));
  }
});
