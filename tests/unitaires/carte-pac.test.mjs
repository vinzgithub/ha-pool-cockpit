import test from "node:test";
import assert from "node:assert/strict";
import {
  formaterValeurCartePac,
  decomposerModeCartePac,
  libellerFonctionnementCartePac,
  libellerRegulationCartePac,
  determinerEtatCadranCartePac,
  rendreCartePac,
} from "../../src/interface/carte-pac.js";

const echapperHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
}[char]));

function geometrie() {
  return { progress: 66.13, x: 42.5, y: 11.25 };
}

test("formate les valeurs PAC exactement selon le rendu français historique", () => {
  assert.equal(formaterValeurCartePac(29.1, "°C", 1), "29,1 °C");
  assert.equal(formaterValeurCartePac(231.4, "V", 0), "231 V");
  assert.equal(formaterValeurCartePac(null, "kWh", 2), "—");
  assert.equal(formaterValeurCartePac(undefined), "—");
});

test("décompose les modes PAC sans inventer de fonctionnement ou de régulation", () => {
  assert.deepEqual(decomposerModeCartePac("Heating + Smart"), { operation: "heating", regulation: "smart" });
  assert.deepEqual(decomposerModeCartePac("Cooling + Boost"), { operation: "cooling", regulation: "boost" });
  assert.deepEqual(decomposerModeCartePac("Auto (heat & cool)"), { operation: "auto", regulation: "" });
  assert.deepEqual(decomposerModeCartePac("inconnu"), { operation: "", regulation: "" });
  assert.equal(libellerFonctionnementCartePac("heating"), "Chauffage");
  assert.equal(libellerFonctionnementCartePac("auto"), "Automatique");
  assert.equal(libellerRegulationCartePac("eco"), "Eco");
  assert.equal(libellerRegulationCartePac("inconnu"), "—");
});

test("l'état visuel du cadran conserve la priorité défaut > arrêt > froid > chauffe > attente", () => {
  assert.equal(determinerEtatCadranCartePac({ on: true, mode: "Heating + Smart", fault: "E03" }), "fault");
  assert.equal(determinerEtatCadranCartePac({ on: true, mode: "Heating + Smart", compressorFaultCode: "7" }), "fault");
  assert.equal(determinerEtatCadranCartePac({ on: false, mode: "Cooling + Boost" }), "off");
  assert.equal(determinerEtatCadranCartePac({ on: null, mode: "Cooling + Eco" }), "cooling");
  assert.equal(determinerEtatCadranCartePac({ on: true, mode: "Heating + Eco" }), "heating");
  assert.equal(determinerEtatCadranCartePac({ on: null, mode: "" }), "idle");
});

test("rend la simulation historique sans inventer d'entités ni de consommation", () => {
  const html = rendreCartePac({
    modelePac: {
      configured: false,
      on: null,
      energy: null,
      dailyEnergy: null,
      monthlyEnergy: null,
    },
    valeurConsigne: 28.5,
    geometrieCadran: geometrie(),
    temperatureEauC: 27.1,
    echapperHtml,
  });
  assert.match(html, /<h3>PAC Polytropic<\/h3><b>Simulation<\/b>/);
  assert.match(html, /rc30-pac-gauge--idle/);
  assert.match(html, /28,5 °C/);
  assert.match(html, /Eau bassin 27,1 °C/);
  assert.match(html, /27,9 → 29,1 °C/);
  assert.match(html, /Chauffage · Smart/);
  assert.doesNotMatch(html, /<span>Consommation<\/span>/);
});

test("rend les lectures PAC réelles, l'énergie et les sécurités sans changer les libellés", () => {
  const html = rendreCartePac({
    modelePac: {
      configured: true,
      on: true,
      setpoint: 29,
      inlet: 27.9,
      outlet: 29.1,
      delta: 1.2,
      mode: "Heating + Eco",
      ambient: 24.6,
      coil: null,
      ipm: 42,
      voltage: 231,
      current: 3.8,
      power: 812,
      energy: 123.4,
      dailyEnergy: 4.56,
      monthlyEnergy: 88.8,
      highPressure: "ok",
      lowPressure: "ok",
      waterFlow: "on",
      compressorFaultCode: "0",
      fault: "aucun",
      communication: "online",
    },
    valeurConsigne: 29,
    geometrieCadran: geometrie(),
    temperatureEauC: 27.1,
    echapperHtml,
  });
  assert.match(html, /<b>En marche<\/b>/);
  assert.match(html, /27,9 °C → 29,1 °C/);
  assert.match(html, /1,2 °C<\/b> ΔT/);
  assert.match(html, /Chauffage · Eco/);
  assert.match(html, /4,56 kWh aujourd’hui · 88,8 kWh ce mois · 123,4 kWh total/);
  assert.match(html, /ok · ok · on/);
  assert.match(html, /0 · aucun · online/);
});

test("échappe les états texte injectés sans lire de service Home Assistant", () => {
  const modelePac = {
    configured: true,
    on: false,
    mode: "Heating + Smart",
    energy: null,
    dailyEnergy: null,
    monthlyEnergy: null,
    highPressure: "<hp>",
    lowPressure: "&lp",
    waterFlow: '"flow"',
    compressorFaultCode: "<0>",
    fault: "aucun",
    communication: "a&b",
  };
  Object.defineProperty(modelePac, "callService", { get() { throw new Error("interdit"); } });
  Object.defineProperty(modelePac, "callWS", { get() { throw new Error("interdit"); } });
  Object.defineProperty(modelePac, "write_enabled", { get() { throw new Error("verrou PAC interdit à la présentation"); } });
  const avant = structuredClone(modelePac);
  const html = rendreCartePac({ modelePac, valeurConsigne: 28.5, geometrieCadran: geometrie(), echapperHtml });
  assert.match(html, /&lt;hp&gt; · &amp;lp · &quot;flow&quot;/);
  assert.match(html, /&lt;0&gt; · aucun · a&amp;b/);
  assert.deepEqual(structuredClone(modelePac), avant);
});

test("refuse un rendu sans fonction d'échappement explicite", () => {
  assert.throws(
    () => rendreCartePac({ modelePac: {}, geometrieCadran: geometrie() }),
    /echapperHtml/,
  );
});

test("signale visuellement un mode optimiste sans le présenter comme confirmé", () => {
  const html = rendreCartePac({
    modelePac: {
      configured: true,
      on: true,
      mode: "Cooling + Eco",
      modePending: true,
      energy: null,
      dailyEnergy: null,
      monthlyEnergy: null,
    },
    valeurConsigne: 28.5,
    geometrieCadran: geometrie(),
    temperatureEauC: 27.1,
    echapperHtml,
  });
  assert.match(html, /Mode en cours…/);
  assert.match(html, /Pilotage \/ mode PAC · confirmation en cours/);
  assert.match(html, /Froid · Eco/);
});
