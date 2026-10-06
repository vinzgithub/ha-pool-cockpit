/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { CONFIGURATION_EAU_METEO_PAR_DEFAUT } from "./configuration-eau-meteo.js";
import { normaliserEntreesEauMeteo } from "./normaliser-entrees-eau-meteo.js";
import { evaluerCanicule, evaluerCouverture, evaluerPh, evaluerRedox, evaluerTemperatureEau } from "./regles-eau-meteo.js";

function borner(valeur, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, valeur));
}

function trouverNiveau(score, niveaux) {
  return niveaux.find((niveau) => score >= niveau.minimum && score <= niveau.maximum) ?? niveaux[niveaux.length - 1];
}

/**
 * Calcule le score Eau + Météo indépendamment de Home Assistant et du rendu.
 *
 * Politique d'indisponibilité : la température de l'eau est critique. Si elle
 * manque, diagnostics.valide vaut false, score vaut null et recommandation vaut
 * null. scorePartiel reste disponible uniquement pour le diagnostic interne.
 */
export function calculerScoreEauMeteo(
  entreesBrutes,
  configuration = CONFIGURATION_EAU_METEO_PAR_DEFAUT,
) {
  const entrees = normaliserEntreesEauMeteo(entreesBrutes);
  const decomposition = [
    Object.freeze({ identifiant: "base", applicable: true, points: configuration.score.base, explication: "Base de calcul provisoire v0." }),
    evaluerTemperatureEau(entrees, configuration),
    evaluerPh(entrees, configuration),
    evaluerRedox(entrees, configuration),
    evaluerCanicule(entrees, configuration),
    evaluerCouverture(entrees, configuration),
  ];

  const scorePartiel = borner(
    decomposition.reduce((total, regle) => total + (regle.applicable ? regle.points : 0), 0),
    configuration.score.minimum,
    configuration.score.maximum,
  );

  const donneesCritiquesManquantes = [];
  if (entrees.temperatureEauC === null) donneesCritiquesManquantes.push("temperatureEauC");
  const valide = donneesCritiquesManquantes.length === 0;

  const diagnostics = Object.freeze({
    valide,
    donneesCritiquesManquantes: Object.freeze(donneesCritiquesManquantes),
    donneesOptionnellesManquantes: Object.freeze([...(entrees.ph === null ? ["ph"] : []), ...(entrees.redoxMv === null ? ["redoxMv"] : []), ...(entrees.couvertureFermee === null ? ["couvertureFermee"] : [])]),
    versionConfiguration: configuration.versionConfiguration,
    messageIndisponibilite: valide
      ? null
      : "Recommandation indisponible — donnée manquante : température de l’eau.",
  });

  if (!valide) {
    return Object.freeze({
      score: null,
      scorePartiel,
      niveau: null,
      recommandation: null,
      decomposition: Object.freeze(decomposition),
      explications: Object.freeze([]),
      diagnostics,
    });
  }

  const niveau = trouverNiveau(scorePartiel, configuration.niveaux);
  const explications = decomposition
    .filter((regle) => regle.identifiant !== "base" && regle.applicable && regle.explication)
    .map((regle) => regle.explication);

  return Object.freeze({
    score: scorePartiel,
    scorePartiel,
    niveau: Object.freeze({ identifiant: niveau.identifiant, libelle: niveau.libelle }),
    recommandation: Object.freeze({
      action: scorePartiel >= 50 ? "augmenter_filtration" : "maintenir_filtration",
      intensite: niveau.identifiant,
    }),
    decomposition: Object.freeze(decomposition),
    explications: Object.freeze(explications),
    diagnostics,
  });
}
