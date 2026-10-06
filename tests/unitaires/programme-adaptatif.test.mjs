import test from "node:test";
import assert from "node:assert/strict";
import {
  convertirHeureEnMinutes,
  formaterMinutesHorloge,
  calculerMinutesPlage,
  calculerHeuresProgramme,
  determinerDebutProfil,
  construirePlagesAdaptatives,
  calculerRecommandationProgrammeAdaptatif,
} from "../../src/programmation/programme-adaptatif.js";

const jours = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const profils = {
  spring: { weekdays: jours, periods: [{ enabled: true, start: "10:00", end: "15:00" }] },
  summer: { weekdays: jours, periods: [{ enabled: true, start: "08:30", end: "21:30" }] },
  autumn: { weekdays: ["mon", "wed", "fri"], periods: [{ enabled: true, start: "11:00", end: "16:00" }] },
  winter: { weekdays: jours, periods: [{ enabled: true, start: "02:00", end: "05:00" }] },
  maintenance: { weekdays: jours, periods: [{ enabled: false, start: "00:00", end: "00:00" }] },
};

function calculer(surcharge = {}) {
  return calculerRecommandationProgrammeAdaptatif({
    profilsSaisonniers: { follow_astronomical: false, current: "summer", profiles: profils },
    profilAstronomique: "summer",
    modele: { filtrationHours: 14 },
    heuresRecommandeesPompe: 0,
    temperatureEau: 27.1,
    temperatureAir: 24,
    alerteMeteo: { available: true, alerts: [], levelLabel: "Aucune" },
    volumeM3: 16,
    debitM3h: 10,
    maintenant: new Date("2026-07-25T12:00:00+02:00"),
    ...surcharge,
  });
}

test("convertit et formate les heures avec le comportement historique", () => {
  assert.equal(convertirHeureEnMinutes("08:30"), 510);
  assert.equal(convertirHeureEnMinutes(undefined), 0);
  assert.equal(formaterMinutesHorloge(1350), "22:30");
  assert.equal(formaterMinutesHorloge(1500), "01:00");
});

test("calcule une plage nocturne et ignore une plage désactivée", () => {
  assert.equal(calculerMinutesPlage({ enabled: true, start: "22:00", end: "02:00" }), 240);
  assert.equal(calculerMinutesPlage({ enabled: false, start: "08:00", end: "18:00" }), 0);
  assert.equal(calculerMinutesPlage({ enabled: true, start: "08:00", end: "08:00" }), 0);
});

test("additionne les plages et borne le programme à 24 heures", () => {
  assert.equal(calculerHeuresProgramme([
    { enabled: true, start: "00:00", end: "12:00" },
    { enabled: true, start: "12:00", end: "00:00" },
  ]), 24);
  assert.equal(calculerHeuresProgramme(null), 0);
});

test("prend le début de la première plage utile et replie à 08:00", () => {
  assert.equal(determinerDebutProfil([
    { enabled: false, start: "03:00", end: "05:00" },
    { enabled: true, start: "11:00", end: "16:00" },
  ]), 660);
  assert.equal(determinerDebutProfil([]), 480);
});

test("construit 14 heures à partir de 08:30", () => {
  assert.deepEqual(construirePlagesAdaptatives(14, 510), [
    { enabled: true, start: "08:30", end: "22:30" },
    { enabled: false, start: "00:00", end: "00:00" },
    { enabled: false, start: "00:00", end: "00:00" },
  ]);
});

test("représente 24 h avec les deux plages historiques", () => {
  assert.deepEqual(construirePlagesAdaptatives(24, 510), [
    { enabled: true, start: "00:00", end: "12:00" },
    { enabled: true, start: "12:00", end: "00:00" },
    { enabled: false, start: "00:00", end: "00:00" },
  ]);
});

test("désactive les trois plages pour une durée nulle", () => {
  assert.deepEqual(construirePlagesAdaptatives(0, 510), [
    { enabled: false, start: "00:00", end: "00:00" },
    { enabled: false, start: "00:00", end: "00:00" },
    { enabled: false, start: "00:00", end: "00:00" },
  ]);
});

test("reproduit la recommandation nominale 14 h et le plancher hydraulique", () => {
  const resultat = calculer();
  assert.equal(resultat.base, "summer");
  assert.equal(resultat.effective, "summer");
  assert.equal(resultat.hours, 14);
  assert.equal(resultat.scheduleLabel, "08:30 → 22:30");
  assert.equal(resultat.hydraulicHours, 2);
  assert.equal(resultat.context, "Conditions cohérentes avec la base de profil");
});

test("une chaleur tardive conserve la base Automne mais place comme Été", () => {
  const resultat = calculer({
    profilsSaisonniers: { follow_astronomical: false, current: "autumn", profiles: profils },
    profilAstronomique: "autumn",
    temperatureEau: 27.1,
    temperatureAir: 31,
  });
  assert.equal(resultat.base, "autumn");
  assert.equal(resultat.effective, "summer");
  assert.equal(resultat.scheduleLabel, "08:30 → 22:30");
  assert.deepEqual(resultat.weekdays, ["mon", "wed", "fri"]);
  assert.match(resultat.context, /Conditions estivales persistantes/);
});

test("une alerte canicule avec eau chaude force 24 h", () => {
  const resultat = calculer({
    temperatureEau: 28.2,
    alerteMeteo: { alerts: [{ key: "heatwave", severity: 2 }], levelLabel: "Orange" },
  });
  assert.equal(resultat.heatAlert, true);
  assert.equal(resultat.hours, 24);
  assert.equal(resultat.scheduleLabel, "24 h/24");
});

test("une alerte froid sur la base Hiver force 24 h", () => {
  const resultat = calculer({
    profilsSaisonniers: { follow_astronomical: false, current: "winter", profiles: profils },
    profilAstronomique: "winter",
    temperatureEau: 10,
    temperatureAir: -2,
    alerteMeteo: { alerts: [{ key: "cold", severity: 2 }] },
  });
  assert.equal(resultat.coldAlert, true);
  assert.equal(resultat.effective, "winter");
  assert.equal(resultat.hours, 24);
});

test("le profil Maintenance ignore les bascules thermiques", () => {
  const resultat = calculer({
    profilsSaisonniers: { follow_astronomical: false, current: "maintenance", profiles: profils },
    profilAstronomique: "summer",
    modele: { filtrationHours: 0 },
    temperatureEau: 31,
    temperatureAir: 35,
  });
  assert.equal(resultat.base, "maintenance");
  assert.equal(resultat.effective, "maintenance");
  assert.equal(resultat.hours, 0);
  assert.equal(resultat.scheduleLabel, "Aucune plage");
});

test("une durée invalide replie exactement sur les heures du profil de base", () => {
  const resultat = calculer({
    profilsSaisonniers: { follow_astronomical: false, current: "autumn", profiles: profils },
    profilAstronomique: "autumn",
    modele: { filtrationHours: "invalide" },
    heuresRecommandeesPompe: 0,
    temperatureAir: 20,
  });
  assert.equal(resultat.hours, 5);
  assert.equal(resultat.scheduleLabel, "11:00 → 16:00");
});

test("la signature conserve les arrondis historiques", () => {
  const resultat = calculer({ temperatureEau: 27.14, temperatureAir: 24.96 });
  const signature = JSON.parse(resultat.signature);
  assert.equal(signature.water, 27.1);
  assert.equal(signature.air, 25);
  assert.equal(signature.hours, 14);
  assert.equal(signature.hydraulicHours, 2);
});

test("SEC-000 : le moteur ne lit aucune API HA, DOM ou stockage cachée dans ses entrées", () => {
  const hostile = {};
  for (const nom of ["hass", "callService", "callWS", "document", "window", "localStorage"]) {
    Object.defineProperty(hostile, nom, { get() { throw new Error(`lecture interdite ${nom}`); } });
  }
  const resultat = calculer({
    alerteMeteo: Object.assign({ alerts: [] }, hostile),
    modele: Object.assign({ filtrationHours: 14 }, hostile),
  });
  assert.equal(resultat.hours, 14);
});
