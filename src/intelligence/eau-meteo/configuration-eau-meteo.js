/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * CONFIGURATION V0 À VALIDER EN CONDITIONS RÉELLES.
 *
 * Les seuils et pondérations ci-dessous sont volontairement considérés comme
 * provisoires. Ils devront être observés pendant plusieurs jours sur la piscine
 * réelle, puis ajustés avant toute stabilisation ou activation par défaut.
 */
export const CONFIGURATION_EAU_METEO_PAR_DEFAUT = Object.freeze({
  versionConfiguration: "water-weather-v1-draft",
  score: Object.freeze({
    minimum: 0,
    maximum: 100,
    base: 20,
  }),
  temperatureEau: Object.freeze({
    seuilFroid: 15,
    seuilChaud: 24,
    seuilTresChaud: 28,
    seuilCritique: 30,
    points: Object.freeze({
      froid: -5,
      normal: 0,
      chaud: 10,
      tresChaud: 20,
      critique: 30,
    }),
  }),
  ph: Object.freeze({
    // Seuils V0 volontairement souples, à valider en conditions réelles.
    seuilTresBas: 7.0,
    seuilBas: 7.2,
    seuilHaut: 7.6,
    seuilTresHaut: 7.8,
    points: Object.freeze({
      tresBas: 15,
      bas: 5,
      optimal: 0,
      haut: 10,
      tresHaut: 20,
    }),
  }),
  redox: Object.freeze({
    // Seuils V0 : seul un Redox bas renforce la filtration.
    seuilCritiqueBas: 550,
    seuilBas: 650,
    seuilSurveillance: 680,
    seuilHautInformation: 850,
    points: Object.freeze({
      critiqueBas: 25,
      bas: 15,
      surveillance: 5,
      acceptable: 0,
      haut: 0,
    }),
  }),
  canicule: Object.freeze({
    points: Object.freeze({
      aucune: 0,
      jaune: 5,
      orange: 15,
      rouge: 25,
    }),
  }),
  couverture: Object.freeze({
    pointsFermee: -5,
    annulerReductionDepuisTemperature: 30,
  }),
  niveaux: Object.freeze([
    Object.freeze({ minimum: 0, maximum: 24, identifiant: "faible", libelle: "Besoin faible" }),
    Object.freeze({ minimum: 25, maximum: 49, identifiant: "normal", libelle: "Filtration normale" }),
    Object.freeze({ minimum: 50, maximum: 74, identifiant: "renforce", libelle: "Filtration renforcée" }),
    Object.freeze({ minimum: 75, maximum: 100, identifiant: "critique", libelle: "Filtration prioritaire" }),
  ]),
});
