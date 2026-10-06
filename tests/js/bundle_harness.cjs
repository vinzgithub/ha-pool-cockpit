const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FakeClassList {
  add() {}
  remove() {}
  toggle() { return false; }
  contains() { return false; }
}
class FakeShadowRoot {
  constructor() { this.innerHTML = ''; this.__rc18Observer = null; this._selectors = new Map(); }
  register(selector, elements) { this._selectors.set(selector, Array.isArray(elements) ? elements : [elements]); }
  querySelectorAll(selector) { return this._selectors.get(selector) || []; }
  querySelector(selector) { return (this._selectors.get(selector) || [])[0] || null; }
  addEventListener() {}
}
class FakeElement {
  constructor() {
    this.shadowRoot = null;
    this.dataset = {};
    this.classList = new FakeClassList();
    this.textContent = '';
    this.value = '';
    this.type = '';
    this.checked = false;
    this.hidden = false;
    this._listeners = new Map();
  }
  attachShadow() { this.shadowRoot = new FakeShadowRoot(); return this.shadowRoot; }
  setAttribute() {}
  getAttribute() { return null; }
  removeAttribute() {}
  appendChild() {}
  addEventListener(type, handler) {
    const list = this._listeners.get(type) || [];
    list.push(handler);
    this._listeners.set(type, list);
  }
  removeEventListener(type, handler) {
    const list = this._listeners.get(type) || [];
    this._listeners.set(type, list.filter(item => item !== handler));
  }
  async dispatch(type, event = {}) {
    const listeners = [...(this._listeners.get(type) || [])];
    for (const handler of listeners) await handler({ target: this, currentTarget: this, preventDefault() {}, ...event });
  }
  async click() { await this.dispatch('click'); }
  closest() { return null; }
  querySelectorAll() { return []; }
  querySelector() { return null; }
}
class FakeMutationObserver { observe() {} disconnect() {} }

function makeLocalStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
    clear() { data.clear(); },
  };
}

function loadBundle(bundlePath = process.env.HA_POOL_BUNDLE || path.resolve(__dirname, '../../frontend/dist/pool-dashboard.js')) {
  const registry = new Map();
  const customElements = {
    get(name) { return registry.get(name); },
    define(name, ctor) { registry.set(name, ctor); },
  };
  const document = {
    querySelectorAll() { return []; },
    createElement() { return new FakeElement(); },
  };
  const window = {
    customCards: [],
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {} }; },
    confirm() { return true; },
    addEventListener() {},
    removeEventListener() {},
  };
  const sandbox = {
    console,
    Element: FakeElement,
    HTMLElement: FakeElement,
    MutationObserver: FakeMutationObserver,
    customElements,
    document,
    window,
    localStorage: makeLocalStorage(),
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Date,
    Intl,
    Math,
    JSON,
    Promise,
    Number,
    String,
    Boolean,
    Array,
    Object,
    RegExp,
    Error,
    TypeError,
    encodeURIComponent,
    decodeURIComponent,
    URL,
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  const source = fs.readFileSync(bundlePath, 'utf8');
  const expose = `\n;globalThis.__HA_POOL_TEST_EXPORTS__={VERSION,THEMES,resolveTheme,smartConfidence,confidenceLabel,rc28PhAssessment,health,rc24TreatmentModel,rc24SanitizeTreatmentProfile,RC24_DEFAULT_TREATMENT,RC24_PRODUCTS,rc24MergeTreatmentHistories,rc27SanitizeControl,calculerScoreEauMeteoRc284:typeof calculerScoreEauMeteoRc284==="function"?calculerScoreEauMeteoRc284:undefined,creerHtmlRecommandationEauMeteoRc284:typeof creerHtmlRecommandationEauMeteoRc284==="function"?creerHtmlRecommandationEauMeteoRc284:undefined,FONCTIONNALITES_EXPERIMENTALES:typeof FONCTIONNALITES_EXPERIMENTALES!=="undefined"?FONCTIONNALITES_EXPERIMENTALES:undefined,PoolDashboardCard};`;
  vm.runInContext(source + expose, sandbox, { filename: bundlePath });
  return { ...sandbox.__HA_POOL_TEST_EXPORTS__, sandbox, customElements };
}

function state(value, { unit = '', lastUpdated = new Date().toISOString(), attributes = {} } = {}) {
  return {
    state: String(value),
    attributes: { ...attributes, ...(unit ? { unit_of_measurement: unit } : {}) },
    last_updated: lastUpdated,
    last_changed: lastUpdated,
  };
}

function defaultDevices() {
  return [
    { key: 'flipr', name: 'Flipr', brand: 'flipr', entities: { ph: 'sensor.fp', orp: 'sensor.fo', temperature: 'sensor.ft', last_analysis: 'sensor.fl', start_analysis: 'button.fa', analysis_status: 'sensor.fs' } },
    { key: 'blue_connect', name: 'Blue Connect', brand: 'blue_connect', entities: { ph: 'sensor.bp', orp: 'sensor.bo', temperature: 'sensor.bt', last_analysis: 'sensor.bl', start_analysis: 'button.ba', analysis_status: 'sensor.bs' } },
  ];
}

function buildCard(runtime, { now = new Date('2026-07-25T18:00:00Z'), devices = defaultDevices(), states = {}, measurementSources = {} } = {}) {
  const card = new runtime.PoolDashboardCard();
  card.scheduleHistoryLoad = () => {};
  card.scheduleFiltrationLoad = () => {};
  card.startRc27Sync = () => {};
  card.loadRc27ControlState = async () => {};
  card.setConfig({ devices });
  card._rc27Control.measurement_sources = { ...measurementSources };
  card._hass = {
    locale: { language: 'fr-FR' },
    states: { ...states },
    callService: async () => {},
    callWS: async () => ({}),
  };
  return card;
}

module.exports = { loadBundle, state, defaultDevices, buildCard, FakeElement };
