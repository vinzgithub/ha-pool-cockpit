import test from "node:test";
import assert from "node:assert/strict";
import {
  regrouperHistoriqueHoraire,
  fusionnerHistoriqueAppareils,
  plageIdealeHistorique,
  libelleSourceHistorique,
  rendreGraphiqueHistoriqueCapteur,
} from "../../src/interface/historique-capteurs.js";

test("regroupe par heure, trie les tranches et conserve la moyenne historique", () => {
  const h = 60 * 60 * 1000;
  const points = [
    { timestamp: 2 * h + 5, value: 10 },
    { timestamp: h + 20, value: 4 },
    { timestamp: 2 * h + 40, value: 14 },
  ];
  assert.deepEqual(regrouperHistoriqueHoraire(points), [
    { timestamp: h, value: 4 },
    { timestamp: 2 * h, value: 12 },
  ]);
});

test("une série vide reste vide", () => {
  assert.deepEqual(regrouperHistoriqueHoraire([]), []);
});

test("fusionne les appareils actifs, conserve les sources et calcule la moyenne", () => {
  const perEntity = {
    "sensor.a": [{ timestamp: 1000, value: 7.2 }, { timestamp: 2000, value: 7.4 }],
    "sensor.b": [{ timestamp: 1000, value: 7.4 }, { timestamp: 2000, value: 7.6 }],
  };
  const appareils = [
    { name: "A", entities: { ph: "sensor.a" } },
    { name: "B", entities: { ph: "sensor.b" } },
  ];
  const fusion = fusionnerHistoriqueAppareils({ metric: "ph", perEntity, obtenirAppareilsActifs: () => appareils });
  assert.deepEqual(fusion, [
    { timestamp: 1000, value: 7.300000000000001, sources: [{ name: "A", value: 7.2 }, { name: "B", value: 7.4 }] },
    { timestamp: 2000, value: 7.5, sources: [{ name: "A", value: 7.4 }, { name: "B", value: 7.6 }] },
  ]);
});

test("redemande les appareils actifs à chaque timestamp comme l'algorithme historique", () => {
  const perEntity = { "sensor.a": Array.from({ length: 3 }, (_, index) => ({ timestamp: index + 1, value: index })) };
  let appels = 0;
  fusionnerHistoriqueAppareils({
    metric: "temperature",
    perEntity,
    obtenirAppareilsActifs: () => { appels += 1; return [{ name: "A", entities: { temperature: "sensor.a" } }]; },
  });
  assert.equal(appels, 3);
});

test("limite la fusion aux 24 derniers timestamps", () => {
  const perEntity = { "sensor.a": Array.from({ length: 30 }, (_, index) => ({ timestamp: index, value: index })) };
  const fusion = fusionnerHistoriqueAppareils({
    metric: "orp",
    perEntity,
    obtenirAppareilsActifs: () => [{ name: "A", entities: { orp: "sensor.a" } }],
  });
  assert.equal(fusion.length, 24);
  assert.equal(fusion[0].timestamp, 6);
  assert.equal(fusion.at(-1).timestamp, 29);
});

test("conserve strictement les plages idéales historiques", () => {
  assert.deepEqual(plageIdealeHistorique("temperature"), [24, 30]);
  assert.deepEqual(plageIdealeHistorique("ph"), [7.2, 7.5]);
  assert.deepEqual(plageIdealeHistorique("orp"), [650, 800]);
  assert.equal(plageIdealeHistorique("conductivity"), null);
});

test("conserve les trois libellés historiques de provenance", () => {
  assert.equal(libelleSourceHistorique([]), "Historique disponible");
  assert.equal(libelleSourceHistorique([{ sources: [{ name: "Flipr" }] }]), "Flipr");
  assert.equal(libelleSourceHistorique([
    { sources: [{ name: "Flipr" }, { name: "Blue Connect" }] },
    { sources: [{ name: "Flipr" }] },
  ]), "Synthèse de 2 appareils");
});

test("rend les trois états historiques quand moins de deux points sont disponibles", () => {
  const commun = { metric: "ph", label: "pH", unit: "", sourcePoints: [] };
  assert.match(rendreGraphiqueHistoriqueCapteur({ ...commun, historyLoading: true }), /Chargement…/);
  assert.match(rendreGraphiqueHistoriqueCapteur({ ...commun, historyError: true }), /Historique indisponible/);
  assert.match(rendreGraphiqueHistoriqueCapteur(commun), /Pas encore assez de données/);
});

test("rend le sparkline historique avec delta, source, points et bande idéale", () => {
  const html = rendreGraphiqueHistoriqueCapteur({
    metric: "ph",
    label: "pH",
    unit: "",
    sourcePoints: [
      { timestamp: 1, value: 7.2, sources: [{ name: "Flipr", value: 7.2 }] },
      { timestamp: 2, value: 7.4, sources: [{ name: "Flipr", value: 7.4 }] },
    ],
  });
  assert.match(html, /<strong>7\.40 <\/strong>/);
  assert.match(html, /\+0\.20 /);
  assert.match(html, /<div class=chart-source>Flipr<\/div>/);
  assert.match(html, /class=ideal-band/);
  assert.match(html, /2 points/);
  assert.match(html, /data-metric="ph"/);
});

test("conserve la conversion Fahrenheit historique sans modifier la série source", () => {
  const sourcePoints = [
    { timestamp: 1, value: 24, sources: [{ name: "A", value: 24 }] },
    { timestamp: 2, value: 30, sources: [{ name: "A", value: 30 }] },
  ];
  const copie = JSON.parse(JSON.stringify(sourcePoints));
  const html = rendreGraphiqueHistoriqueCapteur({
    metric: "temperature",
    label: "Température",
    unit: "°C",
    sourcePoints,
    temperatureUnit: "F",
  });
  assert.match(html, /75\.20 °F/);
  assert.match(html, /86\.00 °F/);
  assert.match(html, /\+10\.80 °F/);
  assert.match(html, /data-unit="°F"/);
  assert.deepEqual(sourcePoints, copie);
});

test("SEC-000 : aucune API Home Assistant, DOM, fenêtre ou stockage n'est consultée", () => {
  const hostile = {};
  for (const cle of ["hass", "callApi", "callService", "callWS", "document", "window", "localStorage"]) {
    Object.defineProperty(hostile, cle, { get() { throw new Error(`lecture interdite: ${cle}`); } });
  }
  const sourcePoints = Object.assign([
    { timestamp: 1, value: 700, sources: [{ name: "A", value: 700 }] },
    { timestamp: 2, value: 710, sources: [{ name: "A", value: 710 }] },
  ], hostile);
  assert.doesNotThrow(() => rendreGraphiqueHistoriqueCapteur({ metric: "orp", label: "ORP", unit: "mV", sourcePoints }));
  assert.doesNotThrow(() => regrouperHistoriqueHoraire(sourcePoints));
});
