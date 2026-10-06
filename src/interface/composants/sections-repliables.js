/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * État et présentation pure des sections repliables du tableau de bord.
 *
 * Ce module ne lit jamais `window`, `localStorage`, Home Assistant ou le DOM.
 * Il reçoit le mode d'affichage et l'état déjà lus par la couche interface,
 * puis retourne uniquement des valeurs normalisées ou des fragments HTML.
 *
 * RÈGLE SEC-000 : aucun appel Home Assistant n'est permis ici.
 */

export const CLE_STOCKAGE_SECTIONS_REPLIABLES = "ha-pool-dashboard:rc27.1-sections";

export const IDENTIFIANTS_SECTIONS_REPLIABLES = Object.freeze([
  "operations",
  "filtration",
  "devices",
  "charts",
  "summary",
  "score",
  "health",
  "treatment",
  "information",
]);

export const MODES_AFFICHAGE_SECTIONS = Object.freeze({
  ORDINATEUR: "desktop",
  MOBILE: "mobile",
});

/**
 * Construit l'état historique par défaut : toutes les sections sont développées
 * séparément pour l'ordinateur et le mobile.
 *
 * La fonction ne lit ni stockage ni navigateur et retourne toujours de nouveaux
 * objets. Aucune donnée d'entrée n'est requise.
 *
 * @returns {{desktop:Record<string,boolean>,mobile:Record<string,boolean>}}
 * État initial des sections.
 *
 * @example
 * creerEtatSectionsRepliablesParDefaut().desktop.filtration; // => false
 */
export function creerEtatSectionsRepliablesParDefaut() {
  return {
    desktop: Object.fromEntries(IDENTIFIANTS_SECTIONS_REPLIABLES.map((identifiant) => [identifiant, false])),
    mobile: Object.fromEntries(IDENTIFIANTS_SECTIONS_REPLIABLES.map((identifiant) => [identifiant, false])),
  };
}

/**
 * Normalise un état persisté en conservant exactement les deux modes et les neuf
 * identifiants historiques. Toute valeur manquante reprend `false` et toute valeur
 * présente est convertie avec `Boolean(...)`, comme auparavant.
 *
 * La fonction n'écrit jamais dans le stockage et ne modifie pas son argument.
 * Une entrée absente, primitive ou partielle reste donc exploitable.
 *
 * @param {unknown} [valeur={}] État brut lu par la couche de persistance.
 * @returns {{desktop:Record<string,boolean>,mobile:Record<string,boolean>}}
 * État normalisé.
 *
 * @example
 * normaliserEtatSectionsRepliables({ desktop: { score: 1 } }).desktop.score;
 * // => true
 */
export function normaliserEtatSectionsRepliables(valeur = {}) {
  const defauts = creerEtatSectionsRepliablesParDefaut();
  const resultat = { desktop: {}, mobile: {} };
  for (const mode of [MODES_AFFICHAGE_SECTIONS.ORDINATEUR, MODES_AFFICHAGE_SECTIONS.MOBILE]) {
    for (const identifiant of IDENTIFIANTS_SECTIONS_REPLIABLES) {
      resultat[mode][identifiant] = Boolean(valeur?.[mode]?.[identifiant] ?? defauts[mode][identifiant]);
    }
  }
  return resultat;
}

/**
 * Convertit le résultat déjà lu d'une media query en mode de sections.
 *
 * Cette fonction ne consulte jamais `window.matchMedia()` elle-même. Toute valeur
 * truthy signifie mobile, toute valeur falsy signifie ordinateur.
 *
 * @param {unknown} estMobile Résultat déjà fourni par la couche navigateur.
 * @returns {"mobile"|"desktop"} Mode historique du tableau de bord.
 */
export function resoudreModeAffichageSections(estMobile) {
  return estMobile ? MODES_AFFICHAGE_SECTIONS.MOBILE : MODES_AFFICHAGE_SECTIONS.ORDINATEUR;
}

/**
 * Indique si une section est repliée dans un mode donné.
 *
 * Une section, un mode ou un état absent retourne `false`, comme l'accès optionnel
 * historique. La fonction ne normalise pas et ne modifie aucune donnée.
 *
 * @param {unknown} etat État courant des sections.
 * @param {unknown} mode Mode courant (`desktop` ou `mobile`).
 * @param {unknown} identifiant Identifiant de section.
 * @returns {boolean} `true` si la valeur stockée est truthy.
 */
export function sectionEstRepliee(etat, mode, identifiant) {
  return Boolean(etat?.[mode]?.[identifiant]);
}

/**
 * Produit la classe CSS historique d'une section repliable.
 *
 * Cette fonction ne touche jamais au DOM ; elle ne fait que rendre une chaîne.
 *
 * @param {boolean} repliee État déjà calculé de la section.
 * @returns {string} Classe `rc271-collapsible` éventuellement complétée.
 */
export function classeSectionRepliable(repliee) {
  return `rc271-collapsible${repliee ? " is-collapsed" : ""}`;
}

/**
 * Produit les attributs d'accessibilité historiques de l'en-tête repliable.
 *
 * L'identifiant est interpolé tel quel afin de préserver strictement le rendu
 * existant ; ce module n'ajoute aucune règle d'échappement ou de validation.
 *
 * @param {unknown} identifiant Identifiant déjà choisi par le composant parent.
 * @param {boolean} repliee État de la section.
 * @returns {string} Attributs HTML historiques.
 */
export function attributsEnteteSectionRepliable(identifiant, repliee) {
  return `data-rc271-toggle="${identifiant}" role="button" tabindex="0" aria-expanded="${!repliee}"`;
}

/**
 * Rend le chevron historique d'une section repliable.
 *
 * La fonction ne lit ni DOM ni état externe.
 *
 * @param {boolean} repliee État de la section.
 * @returns {string} Fragment HTML du chevron.
 */
export function rendreChevronSectionRepliable(repliee) {
  return `<span class=rc271-chevron aria-hidden=true>${repliee ? "›" : "⌄"}</span>`;
}

/**
 * Retourne un nouvel état où une section valide est définie repliée ou développée.
 *
 * L'appelant reste responsable de vérifier l'identifiant avant l'appel lorsqu'il
 * veut reproduire le no-op historique sur une clé inconnue. La fonction ne persiste
 * rien et ne modifie jamais l'état reçu.
 *
 * @param {unknown} etat État brut ou partiel courant.
 * @param {"desktop"|"mobile"} mode Mode déjà résolu par la couche navigateur.
 * @param {string} identifiant Identifiant historique de section.
 * @param {unknown} repliee Nouvelle valeur, convertie avec `Boolean(...)`.
 * @returns {{desktop:Record<string,boolean>,mobile:Record<string,boolean>}}
 * Nouvel état normalisé.
 */
export function definirSectionRepliee(etat, mode, identifiant, repliee) {
  const resultat = normaliserEtatSectionsRepliables(etat);
  resultat[mode][identifiant] = Boolean(repliee);
  return resultat;
}

/**
 * Rend la barre historique « Tout développer / Tout réduire ».
 *
 * Seul le libellé du mode varie : `mobile` reste affiché tel quel et tout autre
 * mode produit le mot historique `ordinateur`. Aucun événement n'est attaché ici.
 *
 * @param {unknown} mode Mode déjà résolu par le composant parent.
 * @returns {string} HTML de la barre de contrôle.
 */
export function rendreBarreSectionsRepliables(mode) {
  const libelleMode = mode === MODES_AFFICHAGE_SECTIONS.MOBILE ? "mobile" : "ordinateur";
  return `<nav class=rc271-collapse-toolbar aria-label="Affichage des sections"><span>Affichage ${libelleMode}</span><button type=button data-rc271-all=expand>Tout développer</button><button type=button data-rc271-all=collapse>Tout réduire</button></nav>`;
}
