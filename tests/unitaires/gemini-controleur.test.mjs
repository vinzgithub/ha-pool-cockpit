import test from "node:test";
import assert from "node:assert/strict";
import { genererReformulationGemini } from "../../src/interface/gemini/controleur-gemini.js";

function carteGemini({ payload = { schema_version: "1.0", water: { ph: 7.42 } }, callWS } = {}) {
  return {
    _rc30GeminiPayload: payload,
    _rc30GeminiState: { statut: "idle", message: "", texte: "", signature: "" },
    _rc30GeminiRequestInFlight: false,
    shadowRoot: { querySelector() { return null; } },
    _hass: callWS
      ? {
          get callService() {
            throw new Error("SEC-000: callService interdit");
          },
          callWS,
        }
      : {},
  };
}

test("le contrôleur Gemini passe en indisponible sans payload ou sans callWS", async () => {
  const sansPayload = carteGemini({ payload: null });
  await genererReformulationGemini(sansPayload);
  assert.equal(sansPayload._rc30GeminiState.statut, "unavailable");

  const sansWebSocket = carteGemini();
  await genererReformulationGemini(sansWebSocket);
  assert.equal(sansWebSocket._rc30GeminiState.statut, "unavailable");
});

test("le contrôleur envoie exactement une reformulation et ne lit jamais callService", async () => {
  const messages = [];
  const carte = carteGemini({
    callWS: async (message) => {
      messages.push(message);
      return { ok: true, status: "ready", text: "Texte reformulé." };
    },
  });

  await genererReformulationGemini(carte);
  assert.deepEqual(messages, [
    {
      type: "ha_pool_dashboard/gemini_rewrite",
      payload: { schema_version: "1.0", water: { ph: 7.42 } },
    },
  ]);
  assert.equal(carte._rc30GeminiState.statut, "ready");
  assert.equal(carte._rc30GeminiState.texte, "Texte reformulé.");
});

test("le verrou local empêche deux requêtes Gemini concurrentes", async () => {
  let resoudre;
  let appels = 0;
  const carte = carteGemini({
    callWS: async () => {
      appels += 1;
      return await new Promise((resolve) => { resoudre = resolve; });
    },
  });

  const premiere = genererReformulationGemini(carte);
  const seconde = genererReformulationGemini(carte);
  assert.equal(appels, 1);
  assert.equal(carte._rc30GeminiRequestInFlight, true);

  resoudre({ ok: true, status: "ready", text: "Une réponse." });
  await Promise.all([premiere, seconde]);
  assert.equal(appels, 1);
  assert.equal(carte._rc30GeminiRequestInFlight, false);
});

test("une réponse Gemini obsolète n'écrase pas un payload déterministe plus récent", async () => {
  let resoudre;
  const carte = carteGemini({
    callWS: async () => await new Promise((resolve) => { resoudre = resolve; }),
  });

  const requete = genererReformulationGemini(carte);
  const etatChargement = { ...carte._rc30GeminiState };
  carte._rc30GeminiPayload = { schema_version: "1.0", water: { ph: 7.55 } };
  resoudre({ ok: true, status: "ready", text: "Réponse devenue obsolète." });
  await requete;

  assert.deepEqual(carte._rc30GeminiState, etatChargement);
  assert.equal(carte._rc30GeminiRequestInFlight, false);
});
