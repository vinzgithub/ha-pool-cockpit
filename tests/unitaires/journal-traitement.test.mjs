import test from "node:test";
import assert from "node:assert/strict";

import {
  CLE_JOURNAL_TRAITEMENT_NAVIGATEUR,
  LIMITE_ENTREES_JOURNAL_TRAITEMENT,
  lireJournalTraitementLocal,
  ecrireJournalTraitementLocal,
  construireCleEntreeJournalTraitement,
  fusionnerJournauxTraitement,
  preparerSynchronisationJournauxTraitement,
} from "../../src/traitement/journal.js";

function stockageMemoire(initial = new Map()) {
  const data = new Map(initial);
  return {
    data,
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
  };
}

const entree = (date, kind, overrides = {}) => ({
  date,
  kind,
  product: "Produit",
  dose_amount: 10,
  dose_unit: "g",
  detail: "Détail",
  ...overrides,
});

test("TRAIT-002 : conserve la clé locale historique et la limite 500", () => {
  assert.equal(CLE_JOURNAL_TRAITEMENT_NAVIGATEUR, "ha-pool-dashboard:treatment-history");
  assert.equal(LIMITE_ENTREES_JOURNAL_TRAITEMENT, 500);
});

test("lit un journal local valide sans en changer l'ordre", () => {
  const source = [entree("2026-09-05T10:00:00Z", "ph_plus"), entree("2026-09-04T10:00:00Z", "maintenance_filter")];
  const stockage = stockageMemoire(new Map([[CLE_JOURNAL_TRAITEMENT_NAVIGATEUR, JSON.stringify(source)]]));
  assert.deepEqual(lireJournalTraitementLocal(stockage), source);
});

test("un miroir local absent, invalide ou non-tableau retombe sur un journal vide", () => {
  assert.deepEqual(lireJournalTraitementLocal(stockageMemoire()), []);
  assert.deepEqual(lireJournalTraitementLocal(stockageMemoire(new Map([[CLE_JOURNAL_TRAITEMENT_NAVIGATEUR, "{"]]))), []);
  assert.deepEqual(lireJournalTraitementLocal(stockageMemoire(new Map([[CLE_JOURNAL_TRAITEMENT_NAVIGATEUR, "{}"]]))), []);
});

test("la lecture locale conserve exactement les 500 premières entrées", () => {
  const source = Array.from({length: 520}, (_, index) => entree(`2026-09-05T10:${String(index % 60).padStart(2, "0")}:00Z`, `kind-${index}`));
  const stockage = stockageMemoire(new Map([[CLE_JOURNAL_TRAITEMENT_NAVIGATEUR, JSON.stringify(source)]]));
  const lu = lireJournalTraitementLocal(stockage);
  assert.equal(lu.length, 500);
  assert.equal(lu[0].kind, "kind-0");
  assert.equal(lu[499].kind, "kind-499");
});

test("l'écriture locale limite à 500 sans trier ni fusionner", () => {
  const stockage = stockageMemoire();
  const source = Array.from({length: 502}, (_, index) => entree(`2026-09-05T10:00:${String(index % 60).padStart(2, "0")}Z`, `kind-${index}`));
  ecrireJournalTraitementLocal(stockage, source);
  const persisted = JSON.parse(stockage.data.get(CLE_JOURNAL_TRAITEMENT_NAVIGATEUR));
  assert.equal(persisted.length, 500);
  assert.equal(persisted[0].kind, "kind-0");
  assert.equal(persisted[499].kind, "kind-499");
});

test("une erreur de stockage en lecture ou écriture reste non bloquante", () => {
  const stockage = {
    getItem() { throw new Error("indisponible"); },
    setItem() { throw new Error("indisponible"); },
  };
  assert.deepEqual(lireJournalTraitementLocal(stockage), []);
  assert.doesNotThrow(() => ecrireJournalTraitementLocal(stockage, [entree("2026-09-05", "x")]));
});

test("la clé de déduplication conserve l'ordre et la priorité des champs dose", () => {
  assert.equal(
    construireCleEntreeJournalTraitement({date:"d",kind:"k",product:"p",dose_amount:1,dose_g:2,dose_ml:3,dose_unit:"g",detail:"x"}),
    "d|k|p|1|g|x",
  );
  assert.equal(
    construireCleEntreeJournalTraitement({date:"d",kind:"k",product:"p",dose_g:2,dose_ml:3,dose_unit:"g",detail:"x"}),
    "d|k|p|2|g|x",
  );
  assert.equal(
    construireCleEntreeJournalTraitement({date:"d",kind:"k",product:"p",dose_ml:3,dose_unit:"ml",detail:"x"}),
    "d|k|p|3|ml|x",
  );
});

test("fusionne backend et local sans doublon et trie par date décroissante", () => {
  const ancien = entree("2026-09-04T10:00:00Z", "ancien");
  const recent = entree("2026-09-05T10:00:00Z", "recent");
  assert.deepEqual(fusionnerJournauxTraitement([ancien], [recent, ancien]), [recent, ancien]);
});

test("la première occurrence d'une même clé reste celle qui est conservée", () => {
  const backend = entree("2026-09-05T10:00:00Z", "ph_plus", {source:"backend"});
  const local = {...backend, source:"local"};
  const fusion = fusionnerJournauxTraitement([backend], [local]);
  assert.equal(fusion.length, 1);
  assert.equal(fusion[0].source, "backend");
});

test("la fusion ignore les valeurs nulles/primitives et reste limitée à 500", () => {
  const source = Array.from({length: 510}, (_, index) => entree(new Date(Date.UTC(2026, 8, 5, 0, 0, index)).toISOString(), `kind-${index}`));
  const fusion = fusionnerJournauxTraitement(source, [null, 4, "texte"]);
  assert.equal(fusion.length, 500);
});

test("prépare une synchronisation sans écriture quand les deux journaux sont identiques", () => {
  const history = [entree("2026-09-05T10:00:00Z", "ph_plus")];
  const result = preparerSynchronisationJournauxTraitement(history, history);
  assert.deepEqual(result.historique, history);
  assert.equal(result.localModifie, false);
  assert.equal(result.backendModifie, false);
});

test("prépare la remontée du miroir local lorsque le backend est vide", () => {
  const local = [entree("2026-09-05T10:00:00Z", "ph_plus")];
  const result = preparerSynchronisationJournauxTraitement([], local);
  assert.deepEqual(result.historique, local);
  assert.equal(result.localModifie, false);
  assert.equal(result.backendModifie, true);
});

test("prépare la mise à jour locale lorsque le backend contient une entrée absente", () => {
  const backend = [entree("2026-09-05T10:00:00Z", "ph_plus")];
  const result = preparerSynchronisationJournauxTraitement(backend, []);
  assert.deepEqual(result.historique, backend);
  assert.equal(result.localModifie, true);
  assert.equal(result.backendModifie, false);
});

test("les sources non-tableau conservent le repli historique vers un tableau vide", () => {
  assert.deepEqual(preparerSynchronisationJournauxTraitement(null, undefined), {
    historique: [], localModifie: false, backendModifie: false,
  });
});

test("SEC-000 : le module ne lit jamais des accès HA ou DOM injectés dans les entrées", () => {
  const hostile = entree("2026-09-05T10:00:00Z", "ph_plus");
  for (const nom of ["hass", "callService", "callWS", "document", "window", "shadowRoot"]) {
    Object.defineProperty(hostile, nom, {get() { throw new Error(`lecture interdite ${nom}`); }});
  }
  assert.doesNotThrow(() => construireCleEntreeJournalTraitement(hostile));
  assert.doesNotThrow(() => fusionnerJournauxTraitement([hostile], []));
  assert.doesNotThrow(() => preparerSynchronisationJournauxTraitement([hostile], []));
});
