import test from "node:test";
import assert from "node:assert/strict";
import {
  calculerHeuresManquantesPourProlongation,
  construireEtatProlongationPourAffichage,
  lireProlongationPonctuelle,
} from "../../src/programmation/prolongation.js";

test("lit une prolongation one-shot approuvée sans modifier son état", () => {
  const origine = { status: "approved", minutes: 90, date: "2026-09-05" };
  const resultat = lireProlongationPonctuelle(origine);
  assert.deepEqual(resultat, { minutes: 90, validee: true, ignoree: false });
  assert.deepEqual(origine, { status: "approved", minutes: 90, date: "2026-09-05" });
});

test("distingue une prolongation ignorée et ne considère pas approved + 0 minute comme validée", () => {
  assert.deepEqual(lireProlongationPonctuelle({ status: "ignored", minutes: 150 }), {
    minutes: 150,
    validee: false,
    ignoree: true,
  });
  assert.deepEqual(lireProlongationPonctuelle({ status: "approved", minutes: 0 }), {
    minutes: 0,
    validee: false,
    ignoree: false,
  });
});

test("calcule l'écart historique en personnalisé et en adaptatif suspendu", () => {
  for (const sourceProgrammation of ["custom", "suspended"]) {
    assert.equal(
      calculerHeuresManquantesPourProlongation({
        sourceProgrammation,
        heuresRecommandees: 16,
        heuresProgrammeesBase: 13.5,
      }),
      2.5,
    );
  }
});

test("anti-double-comptage : une source adaptative force toujours le manque à zéro", () => {
  assert.equal(
    calculerHeuresManquantesPourProlongation({
      sourceProgrammation: "adaptive",
      heuresRecommandees: 16,
      heuresProgrammeesBase: 3,
    }),
    0,
  );
});

test("une programmation qui couvre déjà la recommandation ne demande aucune prolongation", () => {
  assert.equal(
    calculerHeuresManquantesPourProlongation({
      sourceProgrammation: "custom",
      heuresRecommandees: 12,
      heuresProgrammeesBase: 13.5,
    }),
    0,
  );
});

test("prépare exactement les valeurs de repli historiques du rendu", () => {
  assert.deepEqual(
    construireEtatProlongationPourAffichage({
      sourceProgrammation: "custom",
      heuresRecommandees: 16,
      heuresProgrammeesBase: 13.5,
      minutesProposeesBackend: undefined,
      statutBackend: "",
      finProposeeBackend: "",
      minutesValideesBackend: undefined,
    }),
    {
      heuresManquantes: 2.5,
      minutesProposees: 150,
      statut: "none",
      finProposee: "—",
      minutesValidees: 0,
    },
  );
});

test("une valeur backend explicite, même zéro, reste prioritaire sur le calcul de repli", () => {
  assert.deepEqual(
    construireEtatProlongationPourAffichage({
      sourceProgrammation: "custom",
      heuresRecommandees: 16,
      heuresProgrammeesBase: 13.5,
      minutesProposeesBackend: 0,
      statutBackend: "approved",
      finProposeeBackend: "00:00",
      minutesValideesBackend: 150,
    }),
    {
      heuresManquantes: 2.5,
      minutesProposees: 0,
      statut: "approved",
      finProposee: "00:00",
      minutesValidees: 150,
    },
  );
});

test("conserve les coercitions numériques historiques sur les valeurs limites", () => {
  const nan = calculerHeuresManquantesPourProlongation({
    sourceProgrammation: "custom",
    heuresRecommandees: Number.NaN,
    heuresProgrammeesBase: 13,
  });
  assert.equal(Number.isNaN(nan), true);

  const etat = construireEtatProlongationPourAffichage({
    sourceProgrammation: "custom",
    heuresRecommandees: 13.004,
    heuresProgrammeesBase: 13,
    minutesProposeesBackend: null,
    statutBackend: null,
    finProposeeBackend: null,
    minutesValideesBackend: null,
  });
  assert.equal(etat.heuresManquantes, 0.0039999999999995595);
  assert.equal(etat.minutesProposees, 0);
});

test("le module de prolongation ne lit ni Home Assistant ni le DOM", () => {
  const ancienHass = Object.getOwnPropertyDescriptor(globalThis, "hass");
  const ancienDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "hass", {
    configurable: true,
    get() { throw new Error("prolongation.js ne doit jamais lire hass"); },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    get() { throw new Error("prolongation.js ne doit jamais lire le DOM"); },
  });

  try {
    assert.equal(
      calculerHeuresManquantesPourProlongation({
        sourceProgrammation: "adaptive",
        heuresRecommandees: 20,
        heuresProgrammeesBase: 1,
      }),
      0,
    );
    assert.equal(lireProlongationPonctuelle({ status: "ignored", minutes: 60 }).ignoree, true);
  } finally {
    if (ancienHass) Object.defineProperty(globalThis, "hass", ancienHass);
    else delete globalThis.hass;
    if (ancienDocument) Object.defineProperty(globalThis, "document", ancienDocument);
    else delete globalThis.document;
  }
});
