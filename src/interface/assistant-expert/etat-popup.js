/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * État d'interface de la popup Assistant Expert.
 *
 * Ce fichier gère uniquement l'ouverture, la fermeture, le retour de focus et
 * la conservation de la position de défilement lors des reconstructions du
 * Shadow DOM. Il ne calcule aucune recommandation et ne connaît pas Home
 * Assistant.
 *
 * RÈGLE SEC-000 : aucune API Home Assistant n'est lue ici. Les seules
 * mutations concernent les propriétés d'interface historiques
 * `_rc30Expert*` du composant et les attributs DOM de la popup.
 */

/**
 * Capture la position de défilement avant qu'un rendu reconstruise le DOM.
 *
 * Si la popup est fermée, absente ou fournit une position invalide, l'état
 * existant reste inchangé. Aucune autre propriété du composant n'est modifiée.
 *
 * @param {object} composant Carte Pool Dashboard portant l'état de la popup.
 * @returns {void}
 *
 * @example
 * capturerDefilementAssistantExpert(carte);
 */
export function capturerDefilementAssistantExpert(composant) {
  if (!composant._rc30ExpertOpen) return;
  const panneau = composant.shadowRoot?.querySelector?.(
    ".rc30-expert-modal__panel",
  );
  const position = Number(panneau?.scrollTop);
  if (Number.isFinite(position) && position >= 0) {
    composant._rc30ExpertScrollTop = position;
  }
}

/**
 * Réapplique l'état d'ouverture après une reconstruction du Shadow DOM.
 *
 * La fonction ne déclenche aucun rendu. Lorsque la popup reste ouverte, elle
 * remémorise le nouveau bouton d'ouverture créé par le rendu et restaure la
 * position de défilement historique.
 *
 * @param {object} composant Carte Pool Dashboard portant l'état de la popup.
 * @param {object} [options={}] Options d'interface.
 * @param {boolean} [options.focus=false] Place le focus sur la popup si ouverte.
 * @returns {void}
 */
export function appliquerEtatPopupAssistantExpert(
  composant,
  { focus = false } = {},
) {
  const modal = composant.shadowRoot?.querySelector?.(
    "[data-assistant-expert-modal]",
  );
  if (!modal) return;

  const ouvert = Boolean(composant._rc30ExpertOpen);
  modal.hidden = !ouvert;
  modal.setAttribute("aria-hidden", ouvert ? "false" : "true");

  if (ouvert) {
    composant._rc30ExpertReturnFocus =
      composant.shadowRoot?.querySelector?.("[data-assistant-expert-open]") ||
      composant._rc30ExpertReturnFocus ||
      null;
    if (focus) modal.focus?.({ preventScroll: true });
    const panneau =
      modal.querySelector?.(".rc30-expert-modal__panel") ||
      composant.shadowRoot?.querySelector?.(".rc30-expert-modal__panel");
    const position = Number(composant._rc30ExpertScrollTop);
    if (panneau && Number.isFinite(position) && position >= 0) {
      panneau.scrollTop = position;
    }
  }
}

/**
 * Ouvre la popup sans provoquer de nouveau rendu du dashboard.
 *
 * La position repart à zéro comme dans le comportement historique. Le bouton
 * déclencheur est mémorisé afin de lui rendre le focus à la fermeture.
 *
 * @param {object} composant Carte Pool Dashboard portant l'état de la popup.
 * @param {object|null} [declencheur=null] Bouton ayant ouvert la popup.
 * @returns {void}
 */
export function ouvrirPopupAssistantExpert(composant, declencheur = null) {
  composant._rc30ExpertOpen = true;
  composant._rc30ExpertScrollTop = 0;
  composant._rc30ExpertReturnFocus =
    declencheur || composant._rc30ExpertReturnFocus || null;
  appliquerEtatPopupAssistantExpert(composant, { focus: true });
}

/**
 * Ferme la popup et rend le focus au bouton qui l'avait ouverte.
 *
 * La position de défilement est remise à zéro. Cette fonction ne touche à
 * aucun état métier et n'appelle aucun service externe.
 *
 * @param {object} composant Carte Pool Dashboard portant l'état de la popup.
 * @returns {void}
 */
export function fermerPopupAssistantExpert(composant) {
  composant._rc30ExpertOpen = false;
  composant._rc30ExpertScrollTop = 0;
  appliquerEtatPopupAssistantExpert(composant);
  composant._rc30ExpertReturnFocus?.focus?.();
  composant._rc30ExpertReturnFocus = null;
}
