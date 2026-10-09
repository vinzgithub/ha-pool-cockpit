const assert = require('node:assert/strict');
const { loadBundle, state, buildCard } = require('./js/bundle_harness.cjs');

const runtime = loadBundle();
const now = new Date().toISOString();
const card = buildCard(runtime, {
  states: {
    'sensor.bp': state('7.23', { lastUpdated: now }),
    'sensor.bo': state('717', { unit: 'mV', lastUpdated: now }),
    'sensor.bt': state('27.1', { unit: '°C', lastUpdated: now }),
    'sensor.bl': state(now),
    'sensor.bs': state('idle'),
    'button.ba': state('unknown'),
  },
  measurementSources: { flipr: false, blue_connect: true },
});
const aggregate = card.aggregateHealth();
assert.equal(aggregate.activeCount, 1);
assert.equal(aggregate.completeCount, 1);
assert.equal(runtime.smartConfidence([], aggregate.usableCount, aggregate.activeCount, aggregate.completeCount), 100);
card.render();
assert.match(card.shadowRoot.innerHTML, /Mes appareils de mesure/);
assert.match(
  card.shadowRoot.innerHTML,
  /<small>Confiance<\/small><strong>100%<\/strong><em>1 source valide<\/em>/,
);
console.log('rc28.3-runtime-ok');
