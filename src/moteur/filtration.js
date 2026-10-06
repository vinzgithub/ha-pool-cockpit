/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Moteur de calcul de la durée de filtration de base.
 *
 * Ce module ne connaît ni Home Assistant, ni le DOM, ni les modes de
 * programmation. Il transforme seulement trois données physiques en trois
 * durées de référence. Les renforcements (canicule, eau trouble, forte
 * fréquentation, etc.) restent appliqués par le code métier historique tant
 * qu'ils n'ont pas été extraits dans une étape dédiée.
 *
 * RÈGLE FILT-004 : les valeurs retournées sont des recommandations de calcul.
 * Ce module ne les présente jamais comme obligatoires et ne commande rien.
 */

/**
 * Convertit une valeur numérique déjà normalisée — ou raisonnablement
 * convertible — en nombre fini. Une donnée absente ou invalide devient null.
 *
 * Cette normalisation rend le module testable seul sans modifier le contrat du
 * dashboard : l'appelant historique lui fournit déjà des nombres finis ou null.
 *
 * @param {unknown} valeur Valeur à interpréter.
 * @returns {number|null} Nombre fini ou null si la donnée est inutilisable.
 */
function nombreFiniOuNull(valeur) {
  if (valeur === "" || valeur === null || valeur === undefined) return null;
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
}

/**
 * Calcule les trois repères de filtration utilisés par le dashboard.
 *
 * - durée liée à l'eau : température ÷ 2, arrondie à l'heure supérieure,
 *   avec un minimum historique de 1 h ;
 * - plancher hydraulique : volume ÷ débit, arrondi à l'heure supérieure,
 *   soit un renouvellement théorique, avec un minimum historique de 1 h ;
 * - durée recommandée de base : le plus long des deux repères disponibles.
 *
 * Cette fonction ne modifie aucun état, n'accède jamais à `hass`, ne lit pas le
 * DOM et n'exécute aucune commande. Les renforcements météo, qualité d'eau ou
 * fréquentation ne sont volontairement pas traités ici.
 *
 * @param {object} [entrees={}] Données physiques nécessaires au calcul.
 * @param {number|string|null} [entrees.temperatureEauC=null] Température de l'eau en °C.
 * @param {number|string|null} [entrees.volumeBassinM3=null] Volume du bassin en m³.
 * @param {number|string|null} [entrees.debitPompeM3H=null] Débit de pompe en m³/h.
 * @returns {{
 *   dureeTemperatureHeures: number|null,
 *   plancherHydrauliqueHeures: number|null,
 *   dureeRecommandeeHeures: number|null
 * }} Repères de filtration calculés, ou null lorsqu'un repère est indisponible.
 *
 * @example
 * calculerDureeFiltrationDeBase({
 *   temperatureEauC: 28.1,
 *   volumeBassinM3: 16,
 *   debitPompeM3H: 10,
 * });
 * // => {
 * //   dureeTemperatureHeures: 15,
 * //   plancherHydrauliqueHeures: 2,
 * //   dureeRecommandeeHeures: 15
 * // }
 */
export function calculerDureeFiltrationDeBase(entrees = {}) {
  const temperatureEauC = nombreFiniOuNull(entrees.temperatureEauC);
  const volumeBassinM3 = nombreFiniOuNull(entrees.volumeBassinM3);
  const debitPompeM3H = nombreFiniOuNull(entrees.debitPompeM3H);

  const dureeTemperatureHeures =
    temperatureEauC === null
      ? null
      : Math.max(1, Math.ceil(temperatureEauC / 2));

  const plancherHydrauliqueHeures =
    volumeBassinM3 !== null && debitPompeM3H !== null && debitPompeM3H > 0
      ? Math.max(1, Math.ceil(volumeBassinM3 / debitPompeM3H))
      : null;

  const dureeRecommandeeHeures =
    dureeTemperatureHeures === null
      ? plancherHydrauliqueHeures
      : plancherHydrauliqueHeures === null
        ? dureeTemperatureHeures
        : Math.max(dureeTemperatureHeures, plancherHydrauliqueHeures);

  return {
    dureeTemperatureHeures,
    plancherHydrauliqueHeures,
    dureeRecommandeeHeures,
  };
}
