const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBundle, buildCard, FakeElement } = require('./bundle_harness.cjs');

const runtime = loadBundle();
const STORAGE_KEY = 'ha-pool-dashboard:rc27.1-sections';
const SECTION_IDS = ['operations','filtration','devices','charts','summary','score','health','treatment','information'];

function desktop() {
  runtime.sandbox.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
}
function mobile() {
  runtime.sandbox.window.matchMedia = (query) => ({ matches: String(query).includes('max-width'), addEventListener() {}, removeEventListener() {} });
}
function nouvelleCarte() {
  const card = buildCard(runtime, { states: {} });
  if (!card.shadowRoot) card.attachShadow({ mode: 'open' });
  return card;
}

test('étape 14 utilise les vrais points d’entrée rc271 du bundle', () => {
  const card = nouvelleCarte();
  for (const nom of ['rc271ViewportMode','rc271IsCollapsed','rc271SectionClass','rc271HeaderAttributes','rc271Chevron','rc271SetCollapsed','rc271ToggleSection','renderRc271Toolbar','bindRc271CollapseControls']) {
    assert.equal(typeof card[nom], 'function', `${nom} doit être une vraie méthode du bundle`);
  }
});

test('étape 14 conserve état, classe, ARIA, chevron et persistance desktop', () => {
  runtime.sandbox.localStorage.clear();
  desktop();
  const card = nouvelleCarte();
  assert.equal(card.rc271ViewportMode(), 'desktop');
  assert.equal(card.rc271IsCollapsed('filtration'), false);
  assert.equal(card.rc271SectionClass('filtration'), 'rc271-collapsible');
  assert.equal(card.rc271HeaderAttributes('filtration'), 'data-rc271-toggle="filtration" role="button" tabindex="0" aria-expanded="true"');
  assert.equal(card.rc271Chevron('filtration'), '<span class=rc271-chevron aria-hidden=true>⌄</span>');
  card.rc271SetCollapsed('filtration', true);
  assert.equal(card.rc271IsCollapsed('filtration'), true);
  assert.equal(card.rc271SectionClass('filtration'), 'rc271-collapsible is-collapsed');
  assert.match(card.rc271HeaderAttributes('filtration'), /aria-expanded="false"/);
  assert.match(card.rc271Chevron('filtration'), />›<\/span>/);
  const persiste = JSON.parse(runtime.sandbox.localStorage.getItem(STORAGE_KEY));
  assert.equal(persiste.desktop.filtration, true);
  assert.equal(persiste.mobile.filtration, false);
  assert.deepEqual(Object.keys(persiste.desktop), SECTION_IDS);
});

test('étape 14 conserve des états distincts entre mobile et ordinateur', () => {
  runtime.sandbox.localStorage.clear();
  desktop();
  const card = nouvelleCarte();
  card.rc271SetCollapsed('score', true);
  mobile();
  assert.equal(card.rc271ViewportMode(), 'mobile');
  assert.equal(card.rc271IsCollapsed('score'), false);
  card.rc271SetCollapsed('health', true);
  assert.equal(card.rc271IsCollapsed('health'), true);
  desktop();
  assert.equal(card.rc271IsCollapsed('score'), true);
  assert.equal(card.rc271IsCollapsed('health'), false);
  const persiste = JSON.parse(runtime.sandbox.localStorage.getItem(STORAGE_KEY));
  assert.equal(persiste.desktop.score, true);
  assert.equal(persiste.mobile.health, true);
});

test('un vrai clic et Entrée sur un en-tête basculent la section, une autre touche non', async () => {
  runtime.sandbox.localStorage.clear();
  desktop();
  const card = nouvelleCarte();
  let rendus = 0;
  card.render = () => { rendus += 1; };
  const header = new FakeElement();
  header.dataset.rc271Toggle = 'charts';
  card.shadowRoot.register('[data-rc271-toggle]', [header]);
  card.shadowRoot.register('[data-rc271-all]', []);
  card.bindRc271CollapseControls();
  await header.click();
  assert.equal(card.rc271IsCollapsed('charts'), true);
  assert.equal(rendus, 1);
  await header.dispatch('keydown', { type: 'keydown', key: 'ArrowDown' });
  assert.equal(card.rc271IsCollapsed('charts'), true);
  assert.equal(rendus, 1);
  await header.dispatch('keydown', { type: 'keydown', key: 'Enter' });
  assert.equal(card.rc271IsCollapsed('charts'), false);
  assert.equal(rendus, 2);
});

test('un clic provenant d’un contrôle interactif interne ne replie pas la section', async () => {
  runtime.sandbox.localStorage.clear();
  desktop();
  const card = nouvelleCarte();
  let rendus = 0;
  card.render = () => { rendus += 1; };
  const header = new FakeElement();
  header.dataset.rc271Toggle = 'operations';
  card.shadowRoot.register('[data-rc271-toggle]', [header]);
  card.shadowRoot.register('[data-rc271-all]', []);
  card.bindRc271CollapseControls();
  await header.dispatch('click', { target: { closest: () => ({ tagName: 'BUTTON' }) } });
  assert.equal(card.rc271IsCollapsed('operations'), false);
  assert.equal(rendus, 0);
});

test('les vrais boutons Tout réduire et Tout développer pilotent les neuf sections', async () => {
  runtime.sandbox.localStorage.clear();
  desktop();
  const card = nouvelleCarte();
  let rendus = 0;
  card.render = () => { rendus += 1; };
  const collapse = new FakeElement();
  collapse.dataset.rc271All = 'collapse';
  const expand = new FakeElement();
  expand.dataset.rc271All = 'expand';
  card.shadowRoot.register('[data-rc271-toggle]', []);
  card.shadowRoot.register('[data-rc271-all]', [collapse, expand]);
  card.bindRc271CollapseControls();
  await collapse.click();
  for (const key of SECTION_IDS) assert.equal(card.rc271IsCollapsed(key), true, `${key} doit être repliée`);
  assert.match(card.renderRc271Toolbar(), /Affichage ordinateur/);
  assert.equal(rendus, 1);
  await expand.click();
  for (const key of SECTION_IDS) assert.equal(card.rc271IsCollapsed(key), false, `${key} doit être développée`);
  assert.equal(rendus, 2);
});
