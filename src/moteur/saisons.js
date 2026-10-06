/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { detecterSaison } from "../intelligence/saisons/detecter-saison.js";

/**
 * Profils saisonniers de référence utilisés par la programmation adaptative.
 *
 * Ce module ne décide pas de la durée de filtration : il fournit uniquement les
 * bases horaires historiques associées aux saisons et le profil de référence
 * correspondant à la saison astronomique courante.
 *
 * RÈGLE SAISON-001 : la saison astronomique et le profil saisonnier sont des
 * repères de programmation. Ils ne remplacent jamais la température réelle de
 * l'eau comme critère principal de recommandation et ne commandent rien.
 */

/** Identifiants persistés historiquement dans `seasonal_profiles.current`. */
export const IDENTIFIANTS_PROFILS_SAISONNIERS = Object.freeze({
  PRINTEMPS: "spring",
  ETE: "summer",
  AUTOMNE: "autumn",
  HIVER: "winter",
  MAINTENANCE: "maintenance",
});

/**
 * Catalogue immuable des cinq profils saisonniers validés.
 *
 * Les clés anglaises sont conservées volontairement pour compatibilité avec les
 * configurations déjà persistées. Les libellés, raisons et plages sont ceux de
 * la référence FIX14.5.3 / v3.0.0 et ne sont pas recalculés ici.
 */
export const PROFILS_SAISONNIERS = Object.freeze({
  [IDENTIFIANTS_PROFILS_SAISONNIERS.PRINTEMPS]: Object.freeze({
    label: "Printemps · remise en route",
    icon: "🌱",
    reason: "Base horaire indicative : la saison donne le cadre, la température réelle de l’eau et le contexte fixent la recommandation.",
    periods: Object.freeze([
      { enabled: true, start: "10:00", end: "15:00" },
      { enabled: false, start: "00:00", end: "00:00" },
      { enabled: false, start: "00:00", end: "00:00" },
    ]),
  }),
  [IDENTIFIANTS_PROFILS_SAISONNIERS.ETE]: Object.freeze({
    label: "Été · saison de baignade",
    icon: "☀️",
    reason: "Base horaire indicative : la température de l’eau reste le critère principal ; les fortes chaleurs peuvent maintenir une logique estivale en intersaison.",
    periods: Object.freeze([
      { enabled: true, start: "08:30", end: "21:30" },
      { enabled: false, start: "00:00", end: "00:00" },
      { enabled: false, start: "00:00", end: "00:00" },
    ]),
  }),
  [IDENTIFIANTS_PROFILS_SAISONNIERS.AUTOMNE]: Object.freeze({
    label: "Automne · fin de saison",
    icon: "🍂",
    reason: "Base horaire indicative : réduction uniquement si les conditions réelles le permettent ; une chaleur tardive peut conserver un placement estival.",
    periods: Object.freeze([
      { enabled: true, start: "11:00", end: "16:00" },
      { enabled: false, start: "00:00", end: "00:00" },
      { enabled: false, start: "00:00", end: "00:00" },
    ]),
  }),
  [IDENTIFIANTS_PROFILS_SAISONNIERS.HIVER]: Object.freeze({
    label: "Hivernage actif",
    icon: "❄️",
    reason: "Base horaire indicative : filtration réduite autour des heures froides ; une alerte gel peut renforcer temporairement la recommandation.",
    periods: Object.freeze([
      { enabled: true, start: "02:00", end: "05:00" },
      { enabled: false, start: "00:00", end: "00:00" },
      { enabled: false, start: "00:00", end: "00:00" },
    ]),
  }),
  [IDENTIFIANTS_PROFILS_SAISONNIERS.MAINTENANCE]: Object.freeze({
    label: "Maintenance",
    icon: "🔧",
    reason: "Profil temporaire sans programme adaptatif imposé. Toute commande reste manuelle.",
    periods: Object.freeze([
      { enabled: false, start: "00:00", end: "00:00" },
      { enabled: false, start: "00:00", end: "00:00" },
      { enabled: false, start: "00:00", end: "00:00" },
    ]),
  }),
});

const PROFIL_PAR_SAISON_ASTRONOMIQUE = Object.freeze({
  printemps: IDENTIFIANTS_PROFILS_SAISONNIERS.PRINTEMPS,
  ete: IDENTIFIANTS_PROFILS_SAISONNIERS.ETE,
  automne: IDENTIFIANTS_PROFILS_SAISONNIERS.AUTOMNE,
  hiver: IDENTIFIANTS_PROFILS_SAISONNIERS.HIVER,
});

/**
 * Détermine le profil saisonnier de référence correspondant à la saison
 * astronomique détectée.
 *
 * Le comportement de repli historique est conservé : si la date est invalide
 * ou si aucune saison connue n'est détectée, le profil Été est retourné. Cette
 * fonction ne modifie aucun état, n'accède ni à Home Assistant ni au DOM et ne
 * commande rien.
 *
 * @param {Date|string|number} [maintenant=new Date()] Date utilisée pour la détection.
 * @returns {"spring"|"summer"|"autumn"|"winter"} Identifiant du profil conseillé.
 *
 * @example
 * determinerProfilSaisonnierDeReference(new Date(2026, 8, 4, 12, 0, 0));
 * // => "summer"
 */
export function determinerProfilSaisonnierDeReference(maintenant = new Date()) {
  const saison = detecterSaison({ maintenant });
  return (
    PROFIL_PAR_SAISON_ASTRONOMIQUE[saison?.identifiant]
    || IDENTIFIANTS_PROFILS_SAISONNIERS.ETE
  );
}
