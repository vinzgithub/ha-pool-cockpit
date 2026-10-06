/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * FIX14.4 — contrat frontend de la reformulation Gemini.
 *
 * Ce module ne connaît pas Home Assistant et ne fait aucun appel réseau.
 * Il transforme uniquement le modèle déterministe de l'Assistant Expert en
 * payload JSON minimal et produit le petit bloc d'interface Gemini.
 */

function geminiEchapperHtml(valeur) {
  return String(valeur ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function geminiValeurOuNull(valeur) {
  return valeur === undefined || valeur === "" ? null : valeur;
}

/**
 * Construit le contrat transmis au backend. Aucun accès direct à hass.states :
 * la seule source est le modèle Assistant Expert déjà déterminé.
 */
export function construirePayloadGemini(modele = {}) {
  const general = modele.general ?? {};
  const eau = modele.eau ?? {};
  const meteo = modele.meteo ?? {};
  const comparaison = modele.comparaison ?? {};
  const filtration = modele.filtration ?? {};
  const programme = filtration.programme ?? {};
  const traitement = modele.traitement ?? {};
  const pac = modele.pac ?? {};

  return {
    schema_version: "1.0",
    locale: "fr-FR",
    water: {
      status: general.libelle || null,
      message: general.message || null,
      temperature_c: geminiValeurOuNull(eau.temperature),
      ph: geminiValeurOuNull(eau.ph),
      orp_mv: geminiValeurOuNull(eau.orp),
      confidence_pct: geminiValeurOuNull(eau.confiance),
    },
    analyzers: {
      status: comparaison.etat || null,
      detail: comparaison.detail || null,
      source_a: comparaison.sourceA || null,
      source_b: comparaison.sourceB || null,
      gap_minutes: geminiValeurOuNull(comparaison.ecartMinutes),
      deltas: Array.isArray(comparaison.ecarts)
        ? comparaison.ecarts.map((ecart) => ({
            metric: ecart?.metrique || null,
            label: ecart?.libelle || null,
            value: geminiValeurOuNull(ecart?.valeur),
            unit: ecart?.unite || null,
            status: ecart?.statut || null,
          }))
        : [],
    },
    weather: {
      available: Boolean(meteo.disponible),
      temperature_c: geminiValeurOuNull(meteo.temperature),
      condition: meteo.condition || null,
      vigilance: meteo.vigilance || null,
    },
    filtration: {
      program_state: programme.identifiant || null,
      program_label: programme.libelle || null,
      program_detail: programme.detail || null,
      applied_schedule: filtration.horaireCourant || null,
      applied_hours: geminiValeurOuNull(filtration.heuresCourantes),
      adaptive_schedule: filtration.horaireRecommande || null,
      adaptive_hours: geminiValeurOuNull(filtration.heuresRecommandees),
      hydraulic_floor_hours: geminiValeurOuNull(filtration.plancherHydraulique),
      astronomical_season: filtration.saisonAstronomique || null,
      reference_profile: filtration.profilReference || null,
      context: filtration.contexte || null,
      one_shot: filtration.prolongation || null,
    },
    treatment: {
      summary: traitement.resume || null,
      reliability: traitement.confiance || null,
    },
    pac: {
      configured: Boolean(pac.configuree),
      state: pac.etat || null,
      setpoint_c: geminiValeurOuNull(pac.consigne),
      inlet_c: geminiValeurOuNull(pac.entree),
      outlet_c: geminiValeurOuNull(pac.sortie),
      communication: pac.communication || null,
      fault: pac.defaut || null,
      writes_locked: pac.ecrituresVerrouillees !== false,
    },
    deterministic_conclusion: modele.conclusion || null,
  };
}

export function signaturePayloadGemini(payload = {}) {
  return JSON.stringify(payload);
}

/** Rend uniquement la surcouche Gemini ; la conclusion déterministe reste ailleurs. */
export function creerHtmlBlocGemini(etat = {}) {
  const e = geminiEchapperHtml;
  const statut = etat.statut || "idle";
  const texte = String(etat.texte || "").trim();
  const message = String(etat.message || "").trim();
  const chargement = statut === "loading";
  const succes = statut === "ready" && texte;
  const erreur = ["unavailable", "rejected", "error"].includes(statut);

  return `<aside class="rc30-gemini" data-gemini-block data-gemini-status="${e(statut)}">
    <header><div><span>✨</span><div><b>Reformulation Gemini</b><small>Optionnelle · lecture seule · via le backend Home Assistant</small></div></div></header>
    ${succes
      ? `<p class="rc30-gemini__answer">${e(texte)}</p><small class="rc30-gemini__notice">Cette synthèse reformule uniquement les conclusions déterministes ci-dessus. Elle n'effectue aucune commande.</small>`
      : erreur
        ? `<p class="rc30-gemini__message">${e(message || "Reformulation Gemini indisponible. L'analyse déterministe reste valable.")}</p>`
        : `<p class="rc30-gemini__message">Une explication plus naturelle peut être générée à partir du modèle Assistant Expert déjà calculé.</p>`}
    <button type="button" data-gemini-generate ${chargement ? "disabled" : ""}>${chargement ? "Génération…" : succes ? "Régénérer l'explication" : "Générer l'explication"}</button>
  </aside>`;
}
