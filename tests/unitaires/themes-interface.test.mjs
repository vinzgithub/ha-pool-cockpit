import test from "node:test";
import assert from "node:assert/strict";
import {
  THEMES_TABLEAU_PISCINE,
  resoudreThemeInterface,
} from "../../src/interface/themes.js";

test("conserve exactement les trois thèmes historiques et leurs valeurs structurantes", () => {
  assert.deepEqual(Object.keys(THEMES_TABLEAU_PISCINE), ["ocean", "sky", "night"]);
  assert.equal(THEMES_TABLEAU_PISCINE.ocean.text, "#f8fcff");
  assert.equal(THEMES_TABLEAU_PISCINE.ocean.darkText, "#10233f");
  assert.equal(THEMES_TABLEAU_PISCINE.sky.app, "linear-gradient(180deg,#f4fbff,#ffffff)");
  assert.equal(THEMES_TABLEAU_PISCINE.night.app, "linear-gradient(180deg,#06101d,#0c1a2d)");
  assert.equal(THEMES_TABLEAU_PISCINE.night.text, "#f4f8ff");
});

test("laisse inchangé tout thème explicite, y compris une valeur inconnue", () => {
  assert.equal(resoudreThemeInterface("ocean", true), "ocean");
  assert.equal(resoudreThemeInterface("sky", false), "sky");
  assert.equal(resoudreThemeInterface("night", false), "night");
  assert.equal(resoudreThemeInterface("inconnu", true), "inconnu");
});

test("résout auto vers sky ou night uniquement selon la préférence sombre injectée", () => {
  assert.equal(resoudreThemeInterface("auto", false), "sky");
  assert.equal(resoudreThemeInterface("auto", true), "night");
});

test("conserve les cas absents et limites sans inventer de repli", () => {
  assert.equal(resoudreThemeInterface(undefined, true), undefined);
  assert.equal(resoudreThemeInterface(null, false), null);
  assert.equal(resoudreThemeInterface("", true), "");
  assert.equal(resoudreThemeInterface("AUTO", true), "AUTO");
});

test("reste pur : aucun accès navigateur, Home Assistant, DOM ou stockage", () => {
  const noms = ["window", "document", "localStorage", "hass"];
  const anciens = new Map(noms.map((nom) => [nom, Object.getOwnPropertyDescriptor(globalThis, nom)]));
  try {
    for (const nom of noms) {
      Object.defineProperty(globalThis, nom, {
        configurable: true,
        get() { throw new Error(`accès interdit à ${nom}`); },
      });
    }
    assert.equal(resoudreThemeInterface("auto", true), "night");
    assert.equal(resoudreThemeInterface("ocean", false), "ocean");
  } finally {
    for (const nom of noms) {
      const ancien = anciens.get(nom);
      if (ancien) Object.defineProperty(globalThis, nom, ancien);
      else delete globalThis[nom];
    }
  }
});
