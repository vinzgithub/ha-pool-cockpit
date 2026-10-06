const test = require("node:test");
const assert = require("node:assert/strict");
const { loadBundle, buildCard } = require("./bundle_harness.cjs");

function definirModeSombre(runtime, actif) {
  runtime.sandbox.window.matchMedia = () => ({
    matches: actif,
    addEventListener() {},
    removeEventListener() {},
  });
}

test("étape 13 conserve les noms réels resolveTheme/THEMES et le choix auto clair/sombre", () => {
  const runtime = loadBundle();
  definirModeSombre(runtime, false);
  assert.equal(runtime.resolveTheme("auto"), "sky");
  assert.equal(runtime.resolveTheme("ocean"), "ocean");
  assert.equal(runtime.THEMES.sky.text, "#10233f");

  definirModeSombre(runtime, true);
  assert.equal(runtime.resolveTheme("auto"), "night");
  assert.equal(runtime.THEMES.night.text, "#f4f8ff");
});

test("étape 13 applique réellement au rendu le même thème auto sky/night", () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card.config.visual_theme = "auto";

  definirModeSombre(runtime, false);
  card.render();
  assert.match(card.shadowRoot.innerHTML, /--text:#10233f/);
  assert.match(card.shadowRoot.innerHTML, /background:linear-gradient\(180deg,#f4fbff,#ffffff\)/);

  definirModeSombre(runtime, true);
  card.render();
  assert.match(card.shadowRoot.innerHTML, /--text:#f4f8ff/);
  assert.match(card.shadowRoot.innerHTML, /background:linear-gradient\(180deg,#06101d,#0c1a2d\)/);
});
