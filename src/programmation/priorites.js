/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Priorités de programmation de la filtration.
 *
 * Ce module formalise uniquement la hiérarchie déjà validée entre programme
 * personnalisé, adaptatif, adaptatif suspendu et forçage manuel persistant.
 * Il ne calcule aucun horaire, ne commande aucun équipement et ne connaît ni
 * Home Assistant ni le DOM.
 *
 * RÈGLE PROG-001 : toute édition manuelle rend le programme personnalisé
 * immédiatement prioritaire.
 * RÈGLE PROG-002 : l'adaptatif ne reprend qu'après une action explicite.
 * RÈGLE PROG-003 : suspendre l'adaptatif fige son état sans le convertir en
 * programme personnalisé.
 */

/** Sources historiques persistées dans `seasonal_profiles.source`. */
export const SOURCES_PROGRAMMATION = Object.freeze({
  PERSONNALISEE: "custom",
  ADAPTATIVE: "adaptive",
  ADAPTATIVE_SUSPENDUE: "suspended",
});

/** Niveaux de priorité lisibles par un humain, du cas spécial au mode courant. */
export const NIVEAUX_PRIORITE_PROGRAMMATION = Object.freeze({
  MANUEL_FORCE: "manuel_force",
  PERSONNALISEE: "personnalisee",
  ADAPTATIVE_SUSPENDUE: "adaptative_suspendue",
  ADAPTATIVE: "adaptative",
});

const SOURCES_PROGRAMMATION_PERSISTEES = Object.freeze(["custom","adaptive","suspended"]);

/**
 * Normalise la source de programmation persistée.
 *
 * Une valeur inconnue conserve le comportement historique : retour au mode
 * personnalisé. Cette fonction ne modifie aucun état et n'exécute rien.
 *
 * @param {unknown} valeur Source persistée à normaliser.
 * @returns {"custom"|"adaptive"|"suspended"} Source reconnue.
 *
 * @example
 * normaliserSourceProgrammation("adaptive"); // => "adaptive"
 * normaliserSourceProgrammation("ancien-mode"); // => "custom"
 */
export function normaliserSourceProgrammation(valeur) {
  return SOURCES_PROGRAMMATION_PERSISTEES.includes(valeur)
    ? valeur
    : SOURCES_PROGRAMMATION.PERSONNALISEE;
}

/**
 * Indique si le moteur adaptatif possède actuellement les plages horaires.
 *
 * Le forçage manuel de la pompe est une priorité d'exécution distincte : il ne
 * change pas la propriété des horaires. Cette distinction reproduit le
 * comportement historique utilisé notamment pour neutraliser les prolongations
 * lorsqu'un programme adaptatif est déjà dimensionné.
 *
 * @param {unknown} source Source de programmation persistée.
 * @returns {boolean} `true` uniquement pour la source adaptative active.
 */
export function adaptatifPossedeLesHoraires(source) {
  return normaliserSourceProgrammation(source) === SOURCES_PROGRAMMATION.ADAPTATIVE;
}

/**
 * Passe explicitement un profil saisonnier en programmation personnalisée.
 *
 * Utilisé après une édition manuelle des jours/plages ou après l'action
 * explicite « Passer en personnalisé ». La fonction retourne un nouvel objet,
 * efface les marqueurs adaptatifs et laisse toutes les autres propriétés
 * intactes. Elle ne persiste rien elle-même.
 *
 * @param {object} [profilSaisonnier={}] État saisonnier courant déjà normalisé.
 * @param {number} [revision=Date.now()] Horodatage de la révision manuelle.
 * @returns {object} Nouvel état saisonnier en priorité personnalisée.
 *
 * @example
 * rendreProgrammationPersonnalisee({ source: "adaptive", current: "summer" }, 123);
 * // => { source: "custom", current: "summer", ..., manual_revision: 123 }
 */
export function rendreProgrammationPersonnalisee(
  profilSaisonnier = {},
  revision = Date.now(),
) {
  const resultat = { ...profilSaisonnier };
  resultat.source = SOURCES_PROGRAMMATION.PERSONNALISEE;
  resultat.last_adaptive_signature = "";
  resultat.suspended_at = "";
  resultat.manual_revision = revision;
  return resultat;
}

/**
 * Retourne la dérogation pompe encore active selon les règles historiques.
 *
 * Une dérogation persistante est toujours active ; une dérogation temporaire
 * reste active seulement tant que son champ `until` est dans le futur. Une
 * donnée absente, expirée ou invalide produit `null`.
 *
 * @param {object|null|undefined} overridePompe Dérogation enregistrée.
 * @param {number} [maintenant=Date.now()] Horodatage courant en millisecondes.
 * @returns {object|null} Objet d'origine s'il est actif, sinon `null`.
 */
export function obtenirDerogationPompeActive(
  overridePompe,
  maintenant = Date.now(),
) {
  if (!overridePompe) return null;
  if (overridePompe.persistent) return overridePompe;
  if (
    overridePompe.until &&
    new Date(overridePompe.until).getTime() > maintenant
  ) {
    return overridePompe;
  }
  return null;
}

/**
 * Évalue la priorité effective sans changer la configuration.
 *
 * Hiérarchie observée :
 * 1. un forçage manuel persistant marche/arrêt est prioritaire sur l'exécution ;
 * 2. sinon la source personnalisée reste prioritaire sur tout recalcul ;
 * 3. la source adaptative suspendue conserve les plages figées ;
 * 4. la source adaptative active peut recalculer les plages.
 *
 * Le résultat expose aussi la source normalisée et la dérogation active afin
 * que l'appelant puisse conserver exactement ses libellés et calculs existants.
 * Cette fonction ne lit jamais `hass`, n'accède pas au DOM et ne commande rien.
 *
 * @param {object} [entrees={}] Données nécessaires à l'évaluation.
 * @param {unknown} [entrees.source] Source `seasonal_profiles.source`.
 * @param {object|null} [entrees.overridePompe=null] Dérogation pompe éventuelle.
 * @param {number} [entrees.maintenant=Date.now()] Horodatage courant.
 * @returns {{
 *   niveau: "manuel_force"|"personnalisee"|"adaptative_suspendue"|"adaptative",
 *   source: "custom"|"adaptive"|"suspended",
 *   overrideActif: object|null,
 *   forcageManuelPersistant: boolean,
 *   adaptatifPossedeHoraires: boolean
 * }} État de priorité, sans effet de bord.
 */
export function evaluerPrioriteProgrammation(entrees = {}) {
  const source = normaliserSourceProgrammation(entrees.source);
  const overrideActif = obtenirDerogationPompeActive(
    entrees.overridePompe ?? null,
    entrees.maintenant ?? Date.now(),
  );
  const forcageManuelPersistant = Boolean(
    overrideActif?.persistent && ["on", "off"].includes(overrideActif?.state),
  );

  let niveau;
  if (forcageManuelPersistant) {
    niveau = NIVEAUX_PRIORITE_PROGRAMMATION.MANUEL_FORCE;
  } else if (source === SOURCES_PROGRAMMATION.PERSONNALISEE) {
    niveau = NIVEAUX_PRIORITE_PROGRAMMATION.PERSONNALISEE;
  } else if (source === SOURCES_PROGRAMMATION.ADAPTATIVE_SUSPENDUE) {
    niveau = NIVEAUX_PRIORITE_PROGRAMMATION.ADAPTATIVE_SUSPENDUE;
  } else {
    niveau = NIVEAUX_PRIORITE_PROGRAMMATION.ADAPTATIVE;
  }

  return {
    niveau,
    source,
    overrideActif,
    forcageManuelPersistant,
    adaptatifPossedeHoraires: adaptatifPossedeLesHoraires(source),
  };
}
