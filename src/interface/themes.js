/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Thèmes visuels historiques du tableau de bord piscine.
 *
 * Ce module contient uniquement des valeurs de présentation. Il ne lit aucune
 * entité Home Assistant, ne touche pas au DOM et ne déclenche aucune action.
 */
export const THEMES_TABLEAU_PISCINE = {
  ocean:{
    app:"linear-gradient(180deg,#dff5ff 0%,#eef9ff 34%,#f8fbff 100%)",
    hero:"radial-gradient(circle at 76% 14%,rgba(255,255,255,.96),transparent 9%),radial-gradient(circle at 82% 12%,rgba(255,220,105,.72),transparent 18%),linear-gradient(180deg,#8cddff 0%,#55c4ef 42%,#17b1d8 70%,#0874b4 100%)",
    card:"linear-gradient(160deg,rgba(6,83,150,.97),rgba(12,132,188,.95))",
    text:"#f8fcff",darkText:"#10233f",muted:"rgba(244,251,255,.76)",
    surface:"rgba(255,255,255,.12)",border:"rgba(255,255,255,.22)",
    button:"linear-gradient(135deg,#2e9fff,#1c70e8)"
  },
  sky:{
    app:"linear-gradient(180deg,#f4fbff,#ffffff)",
    hero:"linear-gradient(180deg,#c9efff,#eefaff)",
    card:"linear-gradient(150deg,#ffffff,#f2f9ff)",
    text:"#10233f",darkText:"#10233f",muted:"rgba(16,35,63,.62)",
    surface:"rgba(255,255,255,.8)",border:"rgba(35,90,140,.14)",
    button:"linear-gradient(135deg,#2e9df4,#2773d6)"
  },
  night:{
    app:"linear-gradient(180deg,#06101d,#0c1a2d)",
    hero:"radial-gradient(circle at 82% 14%,rgba(80,150,255,.24),transparent 22%),linear-gradient(180deg,#0e2747,#102f55)",
    card:"linear-gradient(155deg,#08111f,#10233c)",
    text:"#f4f8ff",darkText:"#f4f8ff",muted:"rgba(235,243,255,.64)",
    surface:"rgba(255,255,255,.06)",border:"rgba(255,255,255,.12)",
    button:"linear-gradient(135deg,#2f7df0,#2359b8)"
  }
};

/**
 * Résout le nom de thème effectif en conservant exactement le comportement
 * historique du mode `auto`.
 *
 * La détection du mode sombre est injectée par la couche navigateur afin que ce
 * module reste pur : cette fonction ne lit jamais `window`, Home Assistant, le
 * DOM ou un stockage. Un nom autre que `auto` est rendu tel quel, y compris une
 * valeur inconnue ; le repli vers `ocean` reste la responsabilité du rendu
 * historique qui indexe le catalogue.
 *
 * @param {unknown} nomTheme Nom configuré.
 * @param {boolean} [modeSombrePrefere=false] Résultat déjà lu de la préférence système.
 * @returns {unknown} Le nom reçu, ou `night` / `sky` pour le mode `auto`.
 *
 * @example
 * resoudreThemeInterface("auto", true); // => "night"
 * resoudreThemeInterface("ocean", false); // => "ocean"
 */
export function resoudreThemeInterface(nomTheme, modeSombrePrefere = false) {
  if (nomTheme !== "auto") return nomTheme;
  return modeSombrePrefere ? "night" : "sky";
}
