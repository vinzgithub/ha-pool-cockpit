/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { adaptatifPossedeLesHoraires } from "./priorites.js";

/**
 * Lecture pure de la prolongation ponctuelle persistée.
 *
 * La prolongation est un état du jour : cette fonction ne modifie jamais les
 * plages permanentes, ne persiste rien et ne commande aucun équipement.
 *
 * RÈGLE FILT-005 : une prolongation one-shot reste distincte de la
 * programmation permanente.
 *
 * @param {object|null|undefined} prolongation État `pump.extension` courant.
 * @returns {{minutes: number, validee: boolean, ignoree: boolean}} État utile à
 * l'affichage, sans effet de bord.
 *
 * @example
 * lireProlongationPonctuelle({ status: "approved", minutes: 90 });
 * // => { minutes: 90, validee: true, ignoree: false }
 */
export function lireProlongationPonctuelle(prolongation = {}) {
  const extension = prolongation || {};
  const minutes = Number(extension.minutes || 0);
  return {
    minutes,
    validee: extension.status === "approved" && minutes > 0,
    ignoree: extension.status === "ignored",
  };
}

/**
 * Calcule l'écart qui peut encore justifier une prolongation ponctuelle.
 *
 * RÈGLE FILT-006 : si le programme adaptatif possède déjà les horaires, il a
 * déjà intégré la recommandation ; l'écart est donc forcé à zéro pour éviter
 * tout double comptage. En personnalisé ou suspendu, le calcul historique
 * `max(0, recommandation - programme de base)` reste inchangé.
 *
 * La fonction attend les valeurs déjà converties en nombres par l'appelant,
 * comme dans le code historique. Elle ne corrige volontairement pas un NaN :
 * ce comportement fait partie de l'équivalence stricte du refactor.
 *
 * @param {object} entrees Données nécessaires au calcul.
 * @param {unknown} entrees.sourceProgrammation Source persistée de programmation.
 * @param {number} entrees.heuresRecommandees Recommandation du jour.
 * @param {number} entrees.heuresProgrammeesBase Durée du programme permanent.
 * @returns {number} Heures manquantes, ou zéro si l'adaptatif couvre déjà la recommandation.
 *
 * @example
 * calculerHeuresManquantesPourProlongation({
 *   sourceProgrammation: "custom",
 *   heuresRecommandees: 16,
 *   heuresProgrammeesBase: 13.5,
 * }); // => 2.5
 */
export function calculerHeuresManquantesPourProlongation({
  sourceProgrammation,
  heuresRecommandees,
  heuresProgrammeesBase,
}) {
  if (adaptatifPossedeLesHoraires(sourceProgrammation)) return 0;
  return Math.max(0, heuresRecommandees - heuresProgrammeesBase);
}

/**
 * Prépare les seules valeurs de prolongation nécessaires au rendu historique.
 *
 * Cette fonction ne décide pas d'approuver ou d'ignorer une prolongation : ces
 * actions restent gérées par le backend Home Assistant existant. Elle reproduit
 * uniquement les conversions et valeurs de repli déjà présentes dans le front.
 * Elle ne modifie aucun horaire, aucun état et n'appelle jamais Home Assistant.
 *
 * @param {object} entrees Données brutes de la pompe et du moteur.
 * @param {unknown} entrees.sourceProgrammation Source de programmation.
 * @param {number} entrees.heuresRecommandees Recommandation du jour.
 * @param {number} entrees.heuresProgrammeesBase Durée permanente configurée.
 * @param {unknown} entrees.minutesProposeesBackend Valeur backend éventuelle.
 * @param {unknown} entrees.statutBackend Statut backend éventuel.
 * @param {unknown} entrees.finProposeeBackend Fin calculée par le backend.
 * @param {unknown} entrees.minutesValideesBackend Minutes approuvées éventuelles.
 * @returns {{
 *   heuresManquantes: number,
 *   minutesProposees: number,
 *   statut: string,
 *   finProposee: unknown,
 *   minutesValidees: number
 * }} Valeurs prêtes pour le rendu, sans effet de bord.
 */
export function construireEtatProlongationPourAffichage({
  sourceProgrammation,
  heuresRecommandees,
  heuresProgrammeesBase,
  minutesProposeesBackend,
  statutBackend,
  finProposeeBackend,
  minutesValideesBackend,
}) {
  const heuresManquantes = calculerHeuresManquantesPourProlongation({
    sourceProgrammation,
    heuresRecommandees,
    heuresProgrammeesBase,
  });

  return {
    heuresManquantes,
    minutesProposees: Number(
      minutesProposeesBackend ?? Math.round(heuresManquantes * 60),
    ),
    statut: String(statutBackend || "none"),
    finProposee: finProposeeBackend || "—",
    minutesValidees: Number(minutesValideesBackend || 0),
  };
}
