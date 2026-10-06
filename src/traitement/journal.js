/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Journal de traitement : miroir navigateur et fusion avec Home Assistant.
 *
 * Ce module extrait les opérations de journal qui ne dépendent ni du rendu, ni
 * des commandes d'équipement : lecture/écriture du miroir local, construction
 * de la clé de déduplication, fusion chronologique et préparation de la
 * synchronisation backend/local.
 *
 * RÈGLE TRAIT-002 : le journal persistant Home Assistant reste la référence
 * durable ; le miroir navigateur reste disponible en repli et les deux sources
 * sont fusionnées sans doublon au rechargement.
 *
 * RÈGLE SEC-000 : ce fichier n'effectue aucun appel de service ni WebSocket
 * Home Assistant. L'appel réseau reste dans l'adaptateur
 * historique du composant tant qu'il n'est pas extrait dans sa propre couche.
 */

/** Clé historique du miroir local du journal de traitement. */
export const CLE_JOURNAL_TRAITEMENT_NAVIGATEUR = "ha-pool-dashboard:treatment-history";

/** Limite historique commune au navigateur et au backend. */
export const LIMITE_ENTREES_JOURNAL_TRAITEMENT = 500;

/**
 * Lit le miroir navigateur du journal avec les replis historiques.
 *
 * Une valeur absente, un JSON invalide ou un contenu qui n'est pas un tableau
 * retourne un tableau vide. L'ordre persisté est conservé et seules les 500
 * premières entrées sont retenues, exactement comme dans la référence.
 *
 * @param {{getItem:function(string): (string|null)}} stockage Stockage compatible localStorage.
 * @returns {Array<object>} Journal local limité à 500 entrées.
 *
 * @example
 * lireJournalTraitementLocal(localStorage);
 */
export function lireJournalTraitementLocal(stockage) {
  try {
    const historique = JSON.parse(stockage.getItem(CLE_JOURNAL_TRAITEMENT_NAVIGATEUR) || "[]");
    return Array.isArray(historique)
      ? historique.slice(0, LIMITE_ENTREES_JOURNAL_TRAITEMENT)
      : [];
  } catch (_erreur) {
    return [];
  }
}

/**
 * Écrit le miroir navigateur sans modifier les entrées.
 *
 * Comme le code historique, les erreurs de stockage sont ignorées afin que le
 * dashboard reste utilisable en navigation privée ou stockage indisponible.
 * La fonction ne fusionne et ne trie rien : l'appelant choisit le journal à
 * persister.
 *
 * @param {{setItem:function(string,string):void}} stockage Stockage compatible localStorage.
 * @param {Array<object>} historique Entrées à enregistrer.
 * @returns {void}
 */
export function ecrireJournalTraitementLocal(stockage, historique) {
  try {
    stockage.setItem(
      CLE_JOURNAL_TRAITEMENT_NAVIGATEUR,
      JSON.stringify((historique || []).slice(0, LIMITE_ENTREES_JOURNAL_TRAITEMENT)),
    );
  } catch (_erreur) {
    // Repli historique : une impossibilité d'écriture locale n'interrompt rien.
  }
}

/**
 * Construit la clé historique utilisée pour dédupliquer deux entrées.
 *
 * Les champs et leur ordre sont volontairement inchangés. En particulier,
 * `dose_amount` reste prioritaire sur `dose_g`, puis `dose_ml`.
 *
 * @param {object} entree Entrée de journal, éventuellement partielle.
 * @returns {string} Clé de déduplication stable.
 */
export function construireCleEntreeJournalTraitement(entree = {}) {
  return [
    entree.date || "",
    entree.kind || "",
    entree.product || "",
    entree.dose_amount ?? entree.dose_g ?? entree.dose_ml ?? "",
    entree.dose_unit || "",
    entree.detail || "",
  ].join("|");
}

/**
 * Fusionne plusieurs journaux, supprime les doublons et conserve 500 entrées.
 *
 * La première occurrence d'une clé est conservée, puis l'ensemble est trié par
 * date décroissante selon `new Date(...).getTime()`, exactement comme dans le
 * code validé. La fonction ne modifie aucune source reçue et n'effectue aucun
 * accès Home Assistant ou navigateur.
 *
 * @param {...Array<object>} sources Journaux à fusionner.
 * @returns {Array<object>} Journal fusionné, dédupliqué et limité.
 */
export function fusionnerJournauxTraitement(...sources) {
  const vues = new Set();
  const fusion = [];
  for (const entree of sources.flat().filter(element => element && typeof element === "object")) {
    const cle = construireCleEntreeJournalTraitement(entree);
    if (vues.has(cle)) continue;
    vues.add(cle);
    fusion.push(entree);
  }
  return fusion
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, LIMITE_ENTREES_JOURNAL_TRAITEMENT);
}

/**
 * Prépare la fusion backend/local et indique quelles copies doivent être mises à jour.
 *
 * Cette fonction ne synchronise rien elle-même : elle reproduit seulement les
 * comparaisons JSON historiques utilisées par le composant pour savoir s'il doit
 * réécrire le miroir navigateur et/ou le stockage Home Assistant.
 *
 * @param {Array<object>} journalBackend Historique reçu du backend HA.
 * @param {Array<object>} journalLocal Historique déjà présent côté navigateur.
 * @returns {{historique:Array<object>,localModifie:boolean,backendModifie:boolean}}
 * Résultat de fusion et drapeaux d'écart.
 *
 * @example
 * preparerSynchronisationJournauxTraitement([], [{date:"2026-09-05",kind:"ph_plus"}]);
 */
export function preparerSynchronisationJournauxTraitement(journalBackend, journalLocal) {
  const backend = Array.isArray(journalBackend) ? journalBackend : [];
  const local = Array.isArray(journalLocal) ? journalLocal : [];
  const historique = fusionnerJournauxTraitement(backend, local);
  return {
    historique,
    localModifie: JSON.stringify(historique) !== JSON.stringify(local),
    backendModifie: JSON.stringify(historique) !== JSON.stringify(backend),
  };
}
