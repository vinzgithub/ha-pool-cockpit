import test from "node:test";
import assert from "node:assert/strict";
import {
  IDENTIFIANTS_PROFILS_SAISONNIERS,
  PROFILS_SAISONNIERS,
  determinerProfilSaisonnierDeReference,
} from "../../src/moteur/saisons.js";

const tousLesProfils = [
  IDENTIFIANTS_PROFILS_SAISONNIERS.PRINTEMPS,
  IDENTIFIANTS_PROFILS_SAISONNIERS.ETE,
  IDENTIFIANTS_PROFILS_SAISONNIERS.AUTOMNE,
  IDENTIFIANTS_PROFILS_SAISONNIERS.HIVER,
  IDENTIFIANTS_PROFILS_SAISONNIERS.MAINTENANCE,
];

test("le catalogue expose exactement les cinq profils saisonniers historiques", () => {
  assert.deepEqual(Object.keys(PROFILS_SAISONNIERS), tousLesProfils);
});

test("les libellés et plages de référence restent ceux de FIX14.5.3", () => {
  assert.equal(PROFILS_SAISONNIERS.spring.label, "Printemps · remise en route");
  assert.deepEqual(PROFILS_SAISONNIERS.spring.periods[0], { enabled: true, start: "10:00", end: "15:00" });
  assert.equal(PROFILS_SAISONNIERS.summer.label, "Été · saison de baignade");
  assert.deepEqual(PROFILS_SAISONNIERS.summer.periods[0], { enabled: true, start: "08:30", end: "21:30" });
  assert.equal(PROFILS_SAISONNIERS.autumn.label, "Automne · fin de saison");
  assert.deepEqual(PROFILS_SAISONNIERS.autumn.periods[0], { enabled: true, start: "11:00", end: "16:00" });
  assert.equal(PROFILS_SAISONNIERS.winter.label, "Hivernage actif");
  assert.deepEqual(PROFILS_SAISONNIERS.winter.periods[0], { enabled: true, start: "02:00", end: "05:00" });
  assert.equal(PROFILS_SAISONNIERS.maintenance.label, "Maintenance");
  assert.equal(PROFILS_SAISONNIERS.maintenance.periods.some((periode) => periode.enabled), false);
});

test("le 4 septembre 2026 conserve le profil été astronomique", () => {
  assert.equal(
    determinerProfilSaisonnierDeReference(new Date(2026, 8, 4, 12, 0, 0)),
    "summer",
  );
});

test("une date de printemps retourne le profil printemps", () => {
  assert.equal(
    determinerProfilSaisonnierDeReference(new Date(2026, 3, 15, 12, 0, 0)),
    "spring",
  );
});

test("une date d'automne retourne le profil automne", () => {
  assert.equal(
    determinerProfilSaisonnierDeReference(new Date(2026, 9, 15, 12, 0, 0)),
    "autumn",
  );
});

test("une date d'hiver retourne le profil hiver", () => {
  assert.equal(
    determinerProfilSaisonnierDeReference(new Date(2026, 0, 15, 12, 0, 0)),
    "winter",
  );
});

test("une date invalide conserve le repli historique vers été", () => {
  assert.equal(determinerProfilSaisonnierDeReference("date-invalide"), "summer");
});

test("le moteur de saisons reste pur et ne lit ni Home Assistant ni le DOM", () => {
  const descripteurHass = Object.getOwnPropertyDescriptor(globalThis, "hass");
  const descripteurDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "hass", {
    configurable: true,
    get() { throw new Error("hass ne doit jamais être lu par moteur/saisons.js"); },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    get() { throw new Error("document ne doit jamais être lu par moteur/saisons.js"); },
  });
  try {
    assert.equal(
      determinerProfilSaisonnierDeReference(new Date(2026, 6, 15, 12, 0, 0)),
      "summer",
    );
  } finally {
    if (descripteurHass) Object.defineProperty(globalThis, "hass", descripteurHass);
    else delete globalThis.hass;
    if (descripteurDocument) Object.defineProperty(globalThis, "document", descripteurDocument);
    else delete globalThis.document;
  }
});
