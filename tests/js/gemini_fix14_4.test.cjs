const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const template = fs.readFileSync(path.join(root, "frontend/pool-dashboard.template.js"), "utf8");
const geminiModule = fs.readFileSync(path.join(root, "src/interface/gemini/gemini-reformulation.js"), "utf8");
const geminiController = fs.readFileSync(path.join(root, "src/interface/gemini/controleur-gemini.js"), "utf8");
const backend = fs.readFileSync(path.join(root, "home_assistant/custom_components/ha_pool_dashboard/gemini_backend.py"), "utf8");
const component = fs.readFileSync(path.join(root, "home_assistant/custom_components/ha_pool_dashboard/__init__.py"), "utf8");
const { loadBundle, state, buildCard } = require("./bundle_harness.cjs");

function buildGeminiCard() {
  const runtime = loadBundle();
  const now = new Date().toISOString();
  return buildCard(runtime, {
    states: {
      "sensor.fp": state("7.52", { lastUpdated: now }),
      "sensor.fo": state("616", { unit: "mV", lastUpdated: now }),
      "sensor.ft": state("27.6", { unit: "°C", lastUpdated: now }),
      "sensor.fl": state(now, { lastUpdated: now }),
      "sensor.fs": state("idle", { lastUpdated: now }),
      "button.fa": state("unknown", { lastUpdated: now }),
    },
  });
}

test("FIX14.4 ne contient ni clé Gemini ni appel direct à Google dans le frontend", () => {
  const frontend = `${template}\n${geminiModule}\n${geminiController}`;
  assert.doesNotMatch(frontend, /GEMINI_API_KEY|x-goog-api-key|generativelanguage\.googleapis\.com/i);
  assert.match(backend, /x-goog-api-key/);
  assert.match(backend, /generativelanguage\.googleapis\.com\/v1beta\/interactions/);
});

test("FIX14.4 utilise un WebSocket HA dédié à la reformulation et aucune commande métier", async () => {
  assert.match(geminiController, /ha_pool_dashboard\/gemini_rewrite/);
  assert.match(component, /ws_gemini_rewrite/);
  assert.doesNotMatch(geminiController, /callService\s*\(|turn_on|turn_off|set_value|select_option/);

  const card = buildGeminiCard();
  card.render();
  const messages = [];
  card._hass = {
    ...card._hass,
    get callService() {
      throw new Error("SEC-000: callService ne doit même pas être lu par Gemini");
    },
    callWS: async (message) => {
      messages.push(message);
      return { ok: true, status: "ready", text: "Reformulation déterministe." };
    },
  };

  await card.rc30GenerateGemini();
  assert.deepEqual(messages.map(({ type }) => type), ["ha_pool_dashboard/gemini_rewrite"]);
});

test("FIX14.4 conserve les callService historiques sans en ajouter pour Gemini", () => {
  const occurrences = (template.match(/callService\s*\(/g) || []).length;
  assert.equal(occurrences, 4);
  assert.doesNotMatch(geminiController, /callService\s*\(/);
});

test("FIX14.4 envoie au backend le payload dérivé de l'Assistant Expert et affiche la réponse", async () => {
  const card = buildGeminiCard();
  const wsMessages = [];
  card._hass = {
    ...card._hass,
    get callService() {
      throw new Error("SEC-000: Gemini ne doit jamais lire callService");
    },
    callWS: async (message) => {
      wsMessages.push(message);
      return { ok: true, status: "ready", text: "La qualité de l’eau est décrite à partir des conclusions déterministes." };
    },
  };

  card.render();
  wsMessages.length = 0;
  await card.rc30GenerateGemini();

  assert.equal(wsMessages.length, 1);
  const wsMessage = wsMessages[0];
  assert.equal(wsMessage.type, "ha_pool_dashboard/gemini_rewrite");
  assert.equal(wsMessage.payload.schema_version, "1.0");
  assert.equal(wsMessage.payload.water.ph, 7.52);
  assert.equal(card._rc30GeminiState.statut, "ready");
  assert.match(card._rc30GeminiState.texte, /qualité de l’eau/);
});

test("FIX14.4 ne redessine pas le dashboard pour afficher une reformulation", async () => {
  const card = buildGeminiCard();
  card.render();
  let fullRenders = 0;
  card.render = () => { fullRenders += 1; };
  card._hass.callWS = async () => ({ ok: true, status: "ready", text: "Reformulation déterministe." });

  await card.rc30GenerateGemini();
  assert.equal(fullRenders, 0);
  assert.equal(card._rc30GeminiState.statut, "ready");
});

test("FIX14.4.2 verrouille les clics Gemini concurrents pendant une requête", async () => {
  const card = buildGeminiCard();
  card.render();

  let resolveWs;
  let calls = 0;
  card._hass.callWS = async () => {
    calls += 1;
    return await new Promise((resolve) => { resolveWs = resolve; });
  };

  const first = card.rc30GenerateGemini();
  const second = card.rc30GenerateGemini();
  assert.equal(card._rc30GeminiState.statut, "loading");
  assert.equal(card._rc30GeminiRequestInFlight, true);
  assert.equal(calls, 1);

  resolveWs({ ok: true, status: "ready", text: "Reformulation déterministe." });
  await Promise.all([first, second]);
  assert.equal(calls, 1);
  assert.equal(card._rc30GeminiRequestInFlight, false);
  assert.equal(card._rc30GeminiState.statut, "ready");
});

test("FIX14.4.2 backend prévoit backoff et détail d'erreur sans exposer la clé", () => {
  assert.match(backend, /DEFAULT_MAX_ATTEMPTS/);
  assert.match(backend, /calculer_delai_retry/);
  assert.match(backend, /asyncio\.sleep/);
  assert.match(backend, /extraire_detail_erreur/);
  assert.doesNotMatch(`${template}\n${geminiController}`, /x-goog-api-key|GEMINI_API_KEY|generativelanguage\.googleapis\.com/i);
});
