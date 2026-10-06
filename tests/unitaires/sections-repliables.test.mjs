import test from "node:test";
import assert from "node:assert/strict";

import {
  CLE_STOCKAGE_SECTIONS_REPLIABLES,
  IDENTIFIANTS_SECTIONS_REPLIABLES,
  MODES_AFFICHAGE_SECTIONS,
  creerEtatSectionsRepliablesParDefaut,
  normaliserEtatSectionsRepliables,
  resoudreModeAffichageSections,
  sectionEstRepliee,
  classeSectionRepliable,
  attributsEnteteSectionRepliable,
  rendreChevronSectionRepliable,
  definirSectionRepliee,
  rendreBarreSectionsRepliables,
} from "../../src/interface/composants/sections-repliables.js";

test("le contrat historique conserve la clé, les deux modes et les neuf sections", () => {
  assert.equal(CLE_STOCKAGE_SECTIONS_REPLIABLES, "ha-pool-dashboard:rc27.1-sections");
  assert.deepEqual(MODES_AFFICHAGE_SECTIONS, { ORDINATEUR: "desktop", MOBILE: "mobile" });
  assert.deepEqual([...IDENTIFIANTS_SECTIONS_REPLIABLES], [
    "operations", "filtration", "devices", "charts", "summary", "score", "health", "treatment", "information",
  ]);
});

test("l'état par défaut développe toutes les sections dans les deux modes", () => {
  const premier = creerEtatSectionsRepliablesParDefaut();
  const second = creerEtatSectionsRepliablesParDefaut();
  for (const mode of ["desktop", "mobile"]) {
    assert.deepEqual(Object.keys(premier[mode]), [...IDENTIFIANTS_SECTIONS_REPLIABLES]);
    assert.ok(Object.values(premier[mode]).every((valeur) => valeur === false));
  }
  assert.notEqual(premier, second);
  assert.notEqual(premier.desktop, second.desktop);
});

test("la normalisation conserve les coercitions historiques et ignore les clés étrangères", () => {
  const brut = {
    desktop: { operations: 1, filtration: "", score: "oui", inconnu: true },
    mobile: { treatment: null, information: [], devices: 0 },
    autre: { score: true },
  };
  const resultat = normaliserEtatSectionsRepliables(brut);
  assert.equal(resultat.desktop.operations, true);
  assert.equal(resultat.desktop.filtration, false);
  assert.equal(resultat.desktop.score, true);
  assert.equal(resultat.mobile.treatment, false);
  assert.equal(resultat.mobile.information, true);
  assert.equal(resultat.mobile.devices, false);
  assert.equal("inconnu" in resultat.desktop, false);
  assert.equal("autre" in resultat, false);
  assert.equal(brut.desktop.operations, 1, "l'entrée ne doit pas être mutée");
});

test("une entrée absente, nulle ou primitive retombe sur l'état développé", () => {
  for (const brut of [undefined, null, false, 17, "texte"]) {
    const resultat = normaliserEtatSectionsRepliables(brut);
    assert.equal(resultat.desktop.operations, false);
    assert.equal(resultat.mobile.information, false);
  }
});

test("le mode d'affichage est résolu sans lire le navigateur", () => {
  assert.equal(resoudreModeAffichageSections(true), "mobile");
  assert.equal(resoudreModeAffichageSections(1), "mobile");
  assert.equal(resoudreModeAffichageSections(false), "desktop");
  assert.equal(resoudreModeAffichageSections(undefined), "desktop");
});

test("la lecture d'une section absente ou d'un mode absent reste false", () => {
  const etat = { desktop: { filtration: true } };
  assert.equal(sectionEstRepliee(etat, "desktop", "filtration"), true);
  assert.equal(sectionEstRepliee(etat, "desktop", "score"), false);
  assert.equal(sectionEstRepliee(etat, "mobile", "filtration"), false);
  assert.equal(sectionEstRepliee(null, "desktop", "filtration"), false);
});

test("classe, attributs ARIA et chevron reproduisent exactement les deux états", () => {
  assert.equal(classeSectionRepliable(false), "rc271-collapsible");
  assert.equal(classeSectionRepliable(true), "rc271-collapsible is-collapsed");
  assert.equal(
    attributsEnteteSectionRepliable("filtration", false),
    'data-rc271-toggle="filtration" role="button" tabindex="0" aria-expanded="true"',
  );
  assert.equal(
    attributsEnteteSectionRepliable("filtration", true),
    'data-rc271-toggle="filtration" role="button" tabindex="0" aria-expanded="false"',
  );
  assert.equal(rendreChevronSectionRepliable(false), '<span class=rc271-chevron aria-hidden=true>⌄</span>');
  assert.equal(rendreChevronSectionRepliable(true), '<span class=rc271-chevron aria-hidden=true>›</span>');
});

test("définir une section normalise puis modifie uniquement le mode demandé", () => {
  const brut = { desktop: { score: true }, mobile: { score: true } };
  const resultat = definirSectionRepliee(brut, "desktop", "filtration", 1);
  assert.equal(resultat.desktop.filtration, true);
  assert.equal(resultat.desktop.score, true);
  assert.equal(resultat.mobile.score, true);
  assert.equal(resultat.mobile.filtration, false);
  assert.equal(brut.desktop.filtration, undefined, "l'état source ne doit pas être muté");
});

test("la barre de contrôle conserve les libellés ordinateur et mobile", () => {
  assert.equal(
    rendreBarreSectionsRepliables("desktop"),
    '<nav class=rc271-collapse-toolbar aria-label="Affichage des sections"><span>Affichage ordinateur</span><button type=button data-rc271-all=expand>Tout développer</button><button type=button data-rc271-all=collapse>Tout réduire</button></nav>',
  );
  assert.equal(
    rendreBarreSectionsRepliables("mobile"),
    '<nav class=rc271-collapse-toolbar aria-label="Affichage des sections"><span>Affichage mobile</span><button type=button data-rc271-all=expand>Tout développer</button><button type=button data-rc271-all=collapse>Tout réduire</button></nav>',
  );
  assert.match(rendreBarreSectionsRepliables("inconnu"), /Affichage ordinateur/);
});

test("SEC-000 : le module pur ne lit ni Home Assistant, ni DOM, ni navigateur, ni stockage", () => {
  const noms = ["hass", "document", "window", "localStorage"];
  const anciens = new Map(noms.map((nom) => [nom, Object.getOwnPropertyDescriptor(globalThis, nom)]));
  try {
    for (const nom of noms) {
      Object.defineProperty(globalThis, nom, {
        configurable: true,
        get() { throw new Error(`lecture interdite de ${nom}`); },
      });
    }
    const etat = creerEtatSectionsRepliablesParDefaut();
    const mode = resoudreModeAffichageSections(false);
    const repliee = sectionEstRepliee(etat, mode, "filtration");
    assert.equal(classeSectionRepliable(repliee), "rc271-collapsible");
    assert.match(attributsEnteteSectionRepliable("filtration", repliee), /aria-expanded="true"/);
    assert.match(rendreChevronSectionRepliable(repliee), /⌄/);
    assert.equal(definirSectionRepliee(etat, mode, "filtration", true).desktop.filtration, true);
    assert.match(rendreBarreSectionsRepliables(mode), /Affichage ordinateur/);
  } finally {
    for (const nom of noms) {
      const ancien = anciens.get(nom);
      if (ancien) Object.defineProperty(globalThis, nom, ancien);
      else delete globalThis[nom];
    }
  }
});
