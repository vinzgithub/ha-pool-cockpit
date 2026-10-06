/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import {
  creerHtmlBlocGemini,
  signaturePayloadGemini,
} from "./gemini-reformulation.js";

const MESSAGE_GEMINI_INDISPONIBLE =
  "Reformulation Gemini indisponible. L'analyse déterministe reste valable.";
const TYPE_WEBSOCKET_GEMINI = "ha_pool_dashboard/gemini_rewrite";

/**
 * Met à jour uniquement le bloc Gemini déjà présent dans la popup Assistant Expert.
 *
 * Cette fonction ne redessine jamais le dashboard complet, ne recalcule aucune
 * conclusion et ne commande aucun équipement. Elle ne lit pas Home Assistant :
 * elle ne fait qu'utiliser le DOM local de la carte et son état Gemini courant.
 *
 * Si la carte ou le bloc Gemini est absent, la fonction ne fait rien.
 *
 * @param {object|null|undefined} carte Carte HA Pool Dashboard porteuse du Shadow DOM.
 * @returns {void}
 * @example
 * rendreEtatGemini(carte);
 */
export function rendreEtatGemini(carte) {
  const host = carte?.shadowRoot?.querySelector?.("[data-gemini-host]");
  if (!host) return;

  host.innerHTML = creerHtmlBlocGemini(
    carte._rc30GeminiState || { statut: "idle" },
  );
  host
    .querySelectorAll?.("[data-gemini-generate]")
    .forEach((controle) =>
      controle.addEventListener("click", () => carte.rc30GenerateGemini()),
    );
}

async function executerReformulationGemini(carte) {
  const payload = carte?._rc30GeminiPayload;
  const hass = carte?._hass;
  if (!payload || typeof hass?.callWS !== "function") {
    if (carte) {
      carte._rc30GeminiState = {
        statut: "unavailable",
        message: MESSAGE_GEMINI_INDISPONIBLE,
        signature: "",
      };
      rendreEtatGemini(carte);
    }
    return;
  }

  // FIX14.4.2 — verrou local indépendant du DOM : un re-rendu HA pendant
  // l'appel ne permet pas à un second clic de lancer une requête concurrente.
  if (carte._rc30GeminiRequestInFlight) return;

  const signature = signaturePayloadGemini(payload);
  if (
    carte._rc30GeminiState?.statut === "loading" &&
    carte._rc30GeminiState?.signature === signature
  ) {
    return;
  }

  carte._rc30GeminiRequestInFlight = true;
  carte._rc30GeminiState = {
    statut: "loading",
    message: "",
    texte: "",
    signature,
  };
  rendreEtatGemini(carte);

  let doitRendre = true;
  try {
    const resultat = await hass.callWS({
      type: TYPE_WEBSOCKET_GEMINI,
      payload,
    });

    // Les données déterministes ont changé pendant la requête : ne jamais
    // afficher une reformulation calculée pour un ancien payload.
    if (signaturePayloadGemini(carte._rc30GeminiPayload || {}) !== signature) {
      doitRendre = false;
      return;
    }

    if (resultat?.ok && resultat?.text) {
      carte._rc30GeminiState = {
        statut: "ready",
        texte: String(resultat.text),
        message: "",
        signature,
      };
    } else {
      const statut = ["unavailable", "rejected"].includes(resultat?.status)
        ? resultat.status
        : "error";
      carte._rc30GeminiState = {
        statut,
        message: String(resultat?.message || MESSAGE_GEMINI_INDISPONIBLE),
        texte: "",
        signature,
      };
    }
  } catch (_error) {
    if (signaturePayloadGemini(carte._rc30GeminiPayload || {}) !== signature) {
      doitRendre = false;
      return;
    }
    carte._rc30GeminiState = {
      statut: "unavailable",
      message: MESSAGE_GEMINI_INDISPONIBLE,
      texte: "",
      signature,
    };
  } finally {
    carte._rc30GeminiRequestInFlight = false;
    if (doitRendre) rendreEtatGemini(carte);
  }

}

/**
 * Demande au backend Home Assistant une reformulation Gemini du payload déjà
 * produit par l'Assistant Expert.
 *
 * RÈGLE GEMINI-001 : la clé API reste exclusivement côté backend ; le navigateur
 * appelle seulement le WebSocket `ha_pool_dashboard/gemini_rewrite`.
 * RÈGLE GEMINI-002 : cette fonction ne calcule aucune conclusion, ne modifie
 * aucune recommandation et n'interprète jamais la réponse comme une décision.
 * RÈGLE SEC-000 : ce contrôleur d'intégration Gemini n'appelle jamais
 * `service Home Assistant` et ne possède aucun chemin de pilotage d'équipement.
 *
 * Le verrou de concurrence historique est conservé : deux clics simultanés ne
 * créent qu'une requête. Si le payload déterministe change pendant la requête,
 * la réponse devenue obsolète n'est pas affichée.
 *
 * Une carte sans payload ou sans fonction WebSocket Home Assistant passe simplement à l'état
 * `unavailable`. Les erreurs réseau ont le même repli et ne remontent pas vers
 * le moteur déterministe.
 *
 * @param {object|null|undefined} carte Carte HA Pool Dashboard et son état Gemini.
 * @returns {Promise<void>}
 * @example
 * await genererReformulationGemini(carte);
 */
export function genererReformulationGemini(carte) {
  return executerReformulationGemini(carte);
}
