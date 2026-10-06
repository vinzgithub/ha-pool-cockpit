const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBundle, buildCard } = require('./bundle_harness.cjs');

const runtime = loadBundle();

function prepareCard({ profile = {}, stats = null, pump = {}, collapsed = false } = {}) {
  const card = buildCard(runtime, { states: {} });
  card._treatmentProfile = { volume_m3: 16, pump_flow_m3h: 10, ...profile };
  card._filtrationStats = stats;
  card._rc27Control = { ...card._rc27Control, pump: { ...(card._rc27Control?.pump || {}), ...pump } };
  card._rc271Sections = {
    desktop: { filtration: collapsed, treatment: false, control: false, maintenance: false },
    mobile: { filtration: collapsed, treatment: false, control: false, maintenance: false },
  };
  return card;
}

test('étape 11 rend la carte filtration avec priorité à l’historique réel', () => {
  const card = prepareCard({
    stats: { available: true, hours: 7.5, running: true },
    pump: { scheduled_hours: 12, recommended_hours: 11 },
  });
  const perf = card.filtrationPerformance({ filtrationHours: 10 });
  const html = card.renderFiltrationSection({ filtrationHours: 10 });
  assert.equal(perf.hours, 7.5);
  assert.equal(perf.source, 'Historique réel du jour');
  assert.equal(perf.progress, 75);
  assert.match(html, /7 h 30/);
  assert.match(html, /75 %/);
  assert.match(html, /Pompe en marche/);
});

test('étape 11 conserve le repli programme prévu et l’état replié de la section', () => {
  const card = prepareCard({
    stats: { available: false, hours: 9, running: false },
    pump: { scheduled_hours: 6, recommended_hours: 8 },
    collapsed: true,
  });
  const html = card.renderFiltrationSection({});
  assert.match(html, /6 h 00/);
  assert.match(html, /Programme prévu/);
  assert.match(html, /rc271-collapsible is-collapsed/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, />›<\/span>/);
});

test('étape 11 ne réintroduit pas de formule température\/2 dans la carte', () => {
  const card = prepareCard({
    stats: null,
    pump: { scheduled_hours: 2, recommended_hours: 3 },
  });
  const html = card.renderFiltrationSection({ filtrationHours: 4 });
  assert.match(html, /Objectif conseillé<\/small><strong>4 h 00/);
  assert.match(html, /50 %/);
  assert.doesNotMatch(html, /température\/2/i);
});
