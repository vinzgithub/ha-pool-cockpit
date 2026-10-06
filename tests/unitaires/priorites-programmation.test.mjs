import test from "node:test";
import assert from "node:assert/strict";
import {
  NIVEAUX_PRIORITE_PROGRAMMATION,
  SOURCES_PROGRAMMATION,
  adaptatifPossedeLesHoraires,
  evaluerPrioriteProgrammation,
  normaliserSourceProgrammation,
  obtenirDerogationPompeActive,
  rendreProgrammationPersonnalisee,
} from "../../src/programmation/priorites.js";

test("normalise les trois sources persistées et replie toute valeur inconnue vers personnalisé", () => {
  assert.equal(normaliserSourceProgrammation("custom"), "custom");
  assert.equal(normaliserSourceProgrammation("adaptive"), "adaptive");
  assert.equal(normaliserSourceProgrammation("suspended"), "suspended");
  for (const valeur of [undefined, null, "", "ancien-mode", 42]) {
    assert.equal(normaliserSourceProgrammation(valeur), SOURCES_PROGRAMMATION.PERSONNALISEE);
  }
});

test("évalue la hiérarchie personnalisé / adaptatif suspendu / adaptatif sans forçage", () => {
  assert.equal(
    evaluerPrioriteProgrammation({ source: "custom", maintenant: 1000 }).niveau,
    NIVEAUX_PRIORITE_PROGRAMMATION.PERSONNALISEE,
  );
  assert.equal(
    evaluerPrioriteProgrammation({ source: "suspended", maintenant: 1000 }).niveau,
    NIVEAUX_PRIORITE_PROGRAMMATION.ADAPTATIVE_SUSPENDUE,
  );
  assert.equal(
    evaluerPrioriteProgrammation({ source: "adaptive", maintenant: 1000 }).niveau,
    NIVEAUX_PRIORITE_PROGRAMMATION.ADAPTATIVE,
  );
});

test("un forçage manuel persistant marche ou arrêt est prioritaire sur toutes les sources", () => {
  for (const source of ["custom", "adaptive", "suspended"]) {
    for (const state of ["on", "off"]) {
      const overridePompe = { state, persistent: true, since: "2026-09-05T12:00:00Z" };
      const resultat = evaluerPrioriteProgrammation({ source, overridePompe, maintenant: 1000 });
      assert.equal(resultat.niveau, NIVEAUX_PRIORITE_PROGRAMMATION.MANUEL_FORCE);
      assert.equal(resultat.forcageManuelPersistant, true);
      assert.equal(resultat.overrideActif, overridePompe);
    }
  }
});

test("une dérogation temporaire suit strictement sa date d'expiration sans devenir un forçage persistant", () => {
  const overridePompe = { state: "on", until: "2026-09-05T12:10:00.000Z" };
  const avant = Date.parse("2026-09-05T12:09:59.000Z");
  const apres = Date.parse("2026-09-05T12:10:00.000Z");

  assert.equal(obtenirDerogationPompeActive(overridePompe, avant), overridePompe);
  assert.equal(obtenirDerogationPompeActive(overridePompe, apres), null);

  const resultat = evaluerPrioriteProgrammation({
    source: "adaptive",
    overridePompe,
    maintenant: avant,
  });
  assert.equal(resultat.niveau, NIVEAUX_PRIORITE_PROGRAMMATION.ADAPTATIVE);
  assert.equal(resultat.forcageManuelPersistant, false);
  assert.equal(resultat.overrideActif, overridePompe);
});

test("un override persistant avec un état inconnu reste actif mais n'est pas classé comme forçage manuel marche/arrêt", () => {
  const overridePompe = { state: "inconnu", persistent: true };
  const resultat = evaluerPrioriteProgrammation({
    source: "suspended",
    overridePompe,
    maintenant: 1000,
  });
  assert.equal(resultat.overrideActif, overridePompe);
  assert.equal(resultat.forcageManuelPersistant, false);
  assert.equal(resultat.niveau, NIVEAUX_PRIORITE_PROGRAMMATION.ADAPTATIVE_SUSPENDUE);
});

test("une édition manuelle produit un nouvel état personnalisé sans muter l'objet d'origine", () => {
  const origine = {
    schema: 3,
    current: "summer",
    source: "adaptive",
    last_adaptive_signature: "signature",
    suspended_at: "2026-09-05T12:00:00Z",
    manual_revision: 5,
    profiles: { summer: { periods: [] } },
  };
  const resultat = rendreProgrammationPersonnalisee(origine, 123456);

  assert.notEqual(resultat, origine);
  assert.equal(origine.source, "adaptive");
  assert.deepEqual(resultat, {
    ...origine,
    source: "custom",
    last_adaptive_signature: "",
    suspended_at: "",
    manual_revision: 123456,
  });
});

test("la propriété des horaires reste adaptative même si un forçage manuel d'exécution existe", () => {
  assert.equal(adaptatifPossedeLesHoraires("adaptive"), true);
  assert.equal(adaptatifPossedeLesHoraires("custom"), false);
  assert.equal(adaptatifPossedeLesHoraires("suspended"), false);

  const resultat = evaluerPrioriteProgrammation({
    source: "adaptive",
    overridePompe: { state: "off", persistent: true },
    maintenant: 1000,
  });
  assert.equal(resultat.niveau, NIVEAUX_PRIORITE_PROGRAMMATION.MANUEL_FORCE);
  assert.equal(resultat.adaptatifPossedeHoraires, true);
});

test("le module de priorités ne lit ni Home Assistant ni le DOM", () => {
  const ancienHass = Object.getOwnPropertyDescriptor(globalThis, "hass");
  const ancienDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "hass", {
    configurable: true,
    get() {
      throw new Error("priorites.js ne doit jamais lire hass");
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    get() {
      throw new Error("priorites.js ne doit jamais lire le DOM");
    },
  });

  try {
    assert.equal(
      evaluerPrioriteProgrammation({ source: "adaptive", maintenant: 1000 }).niveau,
      NIVEAUX_PRIORITE_PROGRAMMATION.ADAPTATIVE,
    );
    assert.equal(
      rendreProgrammationPersonnalisee({ source: "adaptive" }, 10).source,
      "custom",
    );
  } finally {
    if (ancienHass) Object.defineProperty(globalThis, "hass", ancienHass);
    else delete globalThis.hass;
    if (ancienDocument) Object.defineProperty(globalThis, "document", ancienDocument);
    else delete globalThis.document;
  }
});
