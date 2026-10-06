import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CHAMPS_ENTITES_PAC,
  normaliserConfigurationPacSecurisee,
} from "../../src/pac/securite-pac.js";

const JOURS = Object.freeze([
  ["mon", "Lun"],
  ["tue", "Mar"],
  ["wed", "Mer"],
  ["thu", "Jeu"],
  ["fri", "Ven"],
  ["sat", "Sam"],
  ["sun", "Dim"],
]);

function normaliser(pac) {
  return normaliserConfigurationPacSecurisee(pac, JOURS);
}

test("PAC-001 force toujours write_enabled à false, quelle que soit l'entrée", () => {
  for (const valeur of [true, false, 1, 0, "true", "false", null, undefined, {}]) {
    const resultat = normaliser({ write_enabled: valeur });
    assert.equal(resultat.write_enabled, false);
  }
});

test("normalise les trois modes PAC historiques sans en inventer", () => {
  for (const mode of ["off", "manual", "program"]) {
    assert.equal(normaliser({ mode }).mode, mode);
  }
  for (const mode of ["automatic", "heat", "", null, 42]) {
    assert.equal(normaliser({ mode }).mode, "manual");
  }
});

test("normalise tous les entity_id en chaînes et conserve le contrat de champs", () => {
  const entree = Object.fromEntries(CHAMPS_ENTITES_PAC.map((cle, index) => [cle, index + 1]));
  const resultat = normaliser(entree);
  for (let index = 0; index < CHAMPS_ENTITES_PAC.length; index += 1) {
    assert.equal(resultat[CHAMPS_ENTITES_PAC[index]], String(index + 1));
  }
});

test("migre compressor_entity vers compressor_fault_code_entity puis supprime l'ancien nom", () => {
  const resultat = normaliser({ compressor_entity: "sensor.ancien_compresseur" });
  assert.equal(resultat.compressor_fault_code_entity, "sensor.ancien_compresseur");
  assert.equal("compressor_entity" in resultat, false);
});

test("un compressor_fault_code_entity explicite reste prioritaire sur l'ancien alias", () => {
  const resultat = normaliser({
    compressor_entity: "sensor.ancien_compresseur",
    compressor_fault_code_entity: "sensor.nouveau_compresseur",
  });
  assert.equal(resultat.compressor_fault_code_entity, "sensor.nouveau_compresseur");
  assert.equal("compressor_entity" in resultat, false);
});

test("filtre les jours inconnus et reprend les sept jours lorsque la liste est absente", () => {
  assert.deepEqual(normaliser({ weekdays: ["mon", "xxx", "sun"] }).weekdays, ["mon", "sun"]);
  assert.deepEqual(normaliser({ weekdays: null }).weekdays, JOURS.map(([cle]) => cle));
});

test("normalise exactement trois plages, tronque les heures et complète les plages manquantes", () => {
  const resultat = normaliser({
    periods: [
      { enabled: 1, start: "09:30:45", end: "12:15:59" },
      { enabled: 0, start: "", end: null },
      { enabled: true, start: "14:00", end: "15:00" },
      { enabled: true, start: "16:00", end: "17:00" },
    ],
  });
  assert.deepEqual(resultat.periods, [
    { enabled: true, start: "09:30", end: "12:15" },
    { enabled: false, start: "00:00", end: "00:00" },
    { enabled: true, start: "14:00", end: "15:00" },
  ]);

  assert.deepEqual(normaliser({ periods: [] }).periods, [
    { enabled: false, start: "00:00", end: "00:00" },
    { enabled: false, start: "00:00", end: "00:00" },
    { enabled: false, start: "00:00", end: "00:00" },
  ]);
});

test("requires_pump n'est désactivé que par la valeur booléenne false", () => {
  assert.equal(normaliser({ requires_pump: false }).requires_pump, false);
  for (const valeur of [true, undefined, null, 0, "false"]) {
    assert.equal(normaliser({ requires_pump: valeur }).requires_pump, true);
  }
});

test("la normalisation ne modifie pas l'objet PAC reçu", () => {
  const entree = {
    write_enabled: true,
    mode: "program",
    weekdays: ["mon", "sun"],
    periods: [{ enabled: true, start: "09:00", end: "20:00" }],
    metadata: { origine: "test" },
  };
  const avant = structuredClone(entree);
  const resultat = normaliser(entree);
  assert.deepEqual(entree, avant);
  assert.notEqual(resultat, entree);
  assert.deepEqual(resultat.metadata, entree.metadata);
  assert.equal(resultat.write_enabled, false);
});

test("un bloc PAC nul ou tableau reproduit le repli historique vers une configuration vide sécurisée", () => {
  for (const entree of [null, undefined, [], ["pac"]]) {
    const resultat = normaliser(entree);
    assert.equal(resultat.mode, "manual");
    assert.equal(resultat.write_enabled, false);
    assert.equal(resultat.requires_pump, true);
    assert.deepEqual(resultat.weekdays, JOURS.map(([cle]) => cle));
    assert.equal(resultat.periods.length, 3);
    for (const cle of CHAMPS_ENTITES_PAC) assert.equal(resultat[cle], "");
  }
});

test("SEC-000 : des getters callService/callWS piégés ne sont jamais lus", () => {
  const entree = { mode: "manual", write_enabled: true };
  Object.defineProperty(entree, "callService", {
    enumerable: true,
    get() { throw new Error("callService ne doit jamais être lu"); },
  });
  Object.defineProperty(entree, "callWS", {
    enumerable: true,
    get() { throw new Error("callWS ne doit jamais être lu"); },
  });

  assert.doesNotThrow(() => normaliser(entree));
  assert.equal(normaliser(entree).write_enabled, false);
});

test("SEC-000 : le code exécutable du module ne dépend ni de HA, ni du DOM, ni du navigateur", () => {
  const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const source = fs.readFileSync(path.join(racine, "src/pac/securite-pac.js"), "utf8");
  const codeSansCommentaires = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(codeSansCommentaires, /\bhass\b|callService\s*\(|callWS\s*\(|\bdocument\b|\bwindow\b/);
});

test("les erreurs historiques sur une liste de jours truthy non-tableau restent visibles", () => {
  assert.throws(() => normaliser({ weekdays: "mon" }), TypeError);
});
