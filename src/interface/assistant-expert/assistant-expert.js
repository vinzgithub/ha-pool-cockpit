/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { creerHtmlBlocGemini } from "../gemini/gemini-reformulation.js";

/**
 * Assistant Expert Piscine — couche d'explication uniquement.
 *
 * Principes de sécurité :
 * - ce module ne connaît pas Home Assistant ;
 * - il ne contient aucun appel de service et ne pilote aucun équipement ;
 * - il ne recalcule aucune décision métier ;
 * - il transforme uniquement des conclusions déjà calculées par le dashboard
 *   en un modèle lisible puis en HTML échappé.
 */

function assistantExpertEchapperHtml(valeur) {
  return String(valeur ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function assistantExpertNombre(valeur, decimales = 1) {
  const nombre = Number(valeur);
  return Number.isFinite(nombre)
    ? nombre.toLocaleString("fr-FR", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
      })
    : "—";
}

function assistantExpertHeures(valeur) {
  const heures = Number(valeur);
  if (!Number.isFinite(heures)) return "—";
  const minutes = Math.max(0, Math.round(heures * 60));
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

function assistantExpertEtatProgramme(source) {
  if (source === "adaptive") {
    return {
      identifiant: "adaptive",
      libelle: "Programme adaptatif actif",
      detail: "Le moteur peut recalculer les plages selon les conditions du bassin.",
      icone: "🧠",
    };
  }
  if (source === "suspended") {
    return {
      identifiant: "suspended",
      libelle: "Programme adaptatif suspendu",
      detail: "Les horaires appliqués sont figés jusqu'à une reprise explicite.",
      icone: "⏸",
    };
  }
  return {
    identifiant: "custom",
    libelle: "Programmation personnalisée prioritaire",
    detail: "Les horaires saisis par l'utilisateur restent prioritaires.",
    icone: "✋",
  };
}

/**
 * Assemble des conclusions déjà déterminées ailleurs.
 * Aucun seuil, score ou écart de programmation n'est interprété ici.
 */
function assistantExpertConclusion(contexte, programme) {
  const sources = Array.isArray(contexte.conclusions) ? contexte.conclusions : [];
  const morceaux = sources
    .map((texte) => String(texte ?? "").trim())
    .filter(Boolean);

  if (!morceaux.length) {
    const messageGeneral = String(contexte.general?.message ?? "").trim();
    if (messageGeneral) morceaux.push(messageGeneral);
  }

  const detailProgramme = String(programme?.detail ?? "").trim();
  if (detailProgramme) morceaux.push(detailProgramme);

  return [...new Set(morceaux)].join(" ");
}

/**
 * Construit le modèle de lecture de l'Assistant Expert.
 * Toutes les valeurs et conclusions reçues sont déjà calculées ailleurs.
 */
export function construireModeleAssistantExpert(contexte = {}) {
  const programme = assistantExpertEtatProgramme(contexte.filtration?.source);
  const general = contexte.general ?? {};
  const eau = contexte.eau ?? {};
  const meteo = contexte.meteo ?? {};
  const comparaison = contexte.comparaison ?? {};
  const filtration = contexte.filtration ?? {};
  const traitement = contexte.traitement ?? {};
  const pac = contexte.pac ?? {};

  return {
    titre: "Assistant Expert Piscine",
    sousTitre: "Analyse explicative en lecture seule — aucune commande automatique",
    general: {
      libelle: general.libelle || "État indisponible",
      message: general.message || "Aucune synthèse disponible.",
      score: Number.isFinite(Number(general.score)) ? Number(general.score) : null,
      suspendu: Boolean(general.suspendu),
    },
    eau: {
      temperature: eau.temperature,
      ph: eau.ph,
      orp: eau.orp,
      confiance: eau.confiance,
    },
    meteo: {
      disponible: Boolean(meteo.disponible),
      temperature: meteo.temperature,
      condition: meteo.condition || "Indisponible",
      vigilance: meteo.vigilance || "Aucune vigilance",
    },
    comparaison: {
      etat: comparaison.etat || "unknown",
      detail: comparaison.detail || "Comparaison indisponible.",
      sourceA: comparaison.sourceA || "",
      sourceB: comparaison.sourceB || "",
      ecartMinutes: Number.isFinite(Number(comparaison.ecartMinutes)) ? Number(comparaison.ecartMinutes) : null,
      ecarts: Array.isArray(comparaison.ecarts)
        ? comparaison.ecarts.map((ecart) => ({
            metrique: ecart?.metrique || "",
            libelle: ecart?.libelle || "Mesure",
            valeur: Number.isFinite(Number(ecart?.valeur)) ? Number(ecart.valeur) : null,
            unite: ecart?.unite || "",
            statut: ecart?.statut || "",
          }))
        : [],
    },
    filtration: {
      programme,
      horaireCourant: filtration.horaireCourant || "—",
      heuresCourantes: filtration.heuresCourantes,
      horaireRecommande: filtration.horaireRecommande || "—",
      heuresRecommandees: filtration.heuresRecommandees,
      plancherHydraulique: filtration.plancherHydraulique,
      saisonAstronomique: filtration.saisonAstronomique || "—",
      profilReference: filtration.profilReference || "—",
      contexte: filtration.contexte || "—",
      prolongation: filtration.prolongation || "Aucune prolongation ponctuelle active",
    },
    traitement: {
      resume: traitement.resume || "Traitement non évalué",
      confiance: traitement.confiance || "—",
    },
    pac: {
      configuree: Boolean(pac.configuree),
      etat: pac.etat || (pac.configuree ? "État indisponible" : "Non configurée"),
      consigne: pac.consigne,
      entree: pac.entree,
      sortie: pac.sortie,
      communication: pac.communication || "—",
      defaut: pac.defaut || "Aucun défaut signalé",
      ecrituresVerrouillees: pac.ecrituresVerrouillees !== false,
    },
    conclusion: assistantExpertConclusion(contexte, programme),
  };
}

function assistantExpertValeur(valeur, unite = "", decimales = 1) {
  if (valeur === null || valeur === undefined || valeur === "") return "—";
  const nombre = Number(valeur);
  const texte = Number.isFinite(nombre) ? assistantExpertNombre(nombre, decimales) : String(valeur);
  return `${texte}${unite ? ` ${unite}` : ""}`;
}

function assistantExpertEcartComparaison(ecart) {
  const decimales = ecart.metrique === "orp" ? 0 : ecart.metrique === "ph" ? 2 : 1;
  return assistantExpertValeur(ecart.valeur, ecart.unite, decimales);
}

/**
 * Produit le HTML de la popup. Le modèle est échappé avant injection.
 * Le seul bouton présent ferme la popup ; aucune action métier n'est proposée.
 */
export function creerHtmlAssistantExpert(modele, options = {}) {
  if (!modele) return "";

  const e = assistantExpertEchapperHtml;
  const f = modele.filtration ?? {};
  const p = f.programme ?? assistantExpertEtatProgramme("custom");
  const c = modele.comparaison ?? {};
  const pac = modele.pac ?? {};

  const comparaisonTexte = c.etat === "time_gap"
    ? `${c.detail}${c.ecartMinutes !== null ? ` Écart : ${Math.round(c.ecartMinutes)} min.` : ""}`
    : c.detail;
  const ecartsComparaison = c.etat === "ready" && Array.isArray(c.ecarts) && c.ecarts.length
    ? `<dl>${c.ecarts.map((ecart) => `<div><dt>Δ ${e(ecart.libelle)}</dt><dd>${e(assistantExpertEcartComparaison(ecart))}${ecart.statut ? ` · ${e(ecart.statut)}` : ""}</dd></div>`).join("")}</dl>`
    : "";

  return `<div class="rc30-expert-modal" data-assistant-expert-modal hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="rc30-expert-title" tabindex="-1">
    <div class="rc30-expert-modal__backdrop" data-assistant-expert-close></div>
    <section class="rc30-expert-modal__panel">
      <header class="rc30-expert-modal__header">
        <div><span>🧠</span><div><h2 id="rc30-expert-title">${e(modele.titre)}</h2><p>${e(modele.sousTitre)}</p></div></div>
        <button type="button" data-assistant-expert-close aria-label="Fermer l'Assistant Expert">×</button>
      </header>

      <div class="rc30-expert-modal__status">
        <span>${e(p.icone)}</span><div><small>Priorité de programmation</small><b>${e(p.libelle)}</b><em>${e(p.detail)}</em></div>
      </div>

      <div class="rc30-expert-grid">
        <article><h3>💧 Eau</h3><dl>
          <div><dt>État général</dt><dd>${e(modele.general.libelle)}</dd></div>
          <div><dt>Température</dt><dd>${e(assistantExpertValeur(modele.eau.temperature, "°C", 1))}</dd></div>
          <div><dt>pH</dt><dd>${e(assistantExpertValeur(modele.eau.ph, "", 2))}</dd></div>
          <div><dt>ORP</dt><dd>${e(assistantExpertValeur(modele.eau.orp, "mV", 0))}</dd></div>
          <div><dt>Confiance</dt><dd>${e(assistantExpertValeur(modele.eau.confiance, "%", 0))}</dd></div>
        </dl><p>${e(modele.general.message)}</p></article>

        <article><h3>🌤 Météo</h3><dl>
          <div><dt>Température extérieure</dt><dd>${e(modele.meteo.disponible ? assistantExpertValeur(modele.meteo.temperature, "°C", 1) : "Indisponible")}</dd></div>
          <div><dt>Conditions</dt><dd>${e(modele.meteo.condition)}</dd></div>
          <div><dt>Vigilance</dt><dd>${e(modele.meteo.vigilance)}</dd></div>
        </dl></article>

        <article><h3>⏱ Filtration</h3><dl>
          <div><dt>Programme appliqué</dt><dd>${e(f.horaireCourant)} · ${e(assistantExpertHeures(f.heuresCourantes))}</dd></div>
          <div><dt>Recommandation</dt><dd>${e(f.horaireRecommande)} · ${e(assistantExpertHeures(f.heuresRecommandees))}</dd></div>
          <div><dt>Plancher hydraulique</dt><dd>${e(assistantExpertHeures(f.plancherHydraulique))}</dd></div>
          <div><dt>Saison astronomique</dt><dd>${e(f.saisonAstronomique)}</dd></div>
          <div><dt>Profil de référence</dt><dd>${e(f.profilReference)}</dd></div>
          <div><dt>Correction du jour</dt><dd>${e(f.prolongation)}</dd></div>
        </dl><p>${e(f.contexte)}</p></article>

        <article><h3>⇄ Analyseurs</h3><p>${e(comparaisonTexte)}</p>${ecartsComparaison}${c.sourceA || c.sourceB ? `<small>${e([c.sourceA, c.sourceB].filter(Boolean).join(" ↔ "))}</small>` : ""}</article>

        <article><h3>🧪 Traitement</h3><dl>
          <div><dt>Recommandation</dt><dd>${e(modele.traitement.resume)}</dd></div>
          <div><dt>Fiabilité</dt><dd>${e(modele.traitement.confiance)}</dd></div>
        </dl></article>

        <article><h3>♨️ PAC</h3>${pac.configuree ? `<dl>
          <div><dt>État</dt><dd>${e(pac.etat)}</dd></div>
          <div><dt>Consigne</dt><dd>${e(assistantExpertValeur(pac.consigne, "°C", 1))}</dd></div>
          <div><dt>Eau entrée / sortie</dt><dd>${e(assistantExpertValeur(pac.entree, "°C", 1))} / ${e(assistantExpertValeur(pac.sortie, "°C", 1))}</dd></div>
          <div><dt>Communication</dt><dd>${e(pac.communication)}</dd></div>
          <div><dt>Défaut</dt><dd>${e(pac.defaut)}</dd></div>
          <div><dt>Commandes</dt><dd>${pac.ecrituresVerrouillees ? "🔒 Écritures verrouillées" : "Écritures autorisées"}</dd></div>
        </dl>` : `<p>PAC non configurée dans cette instance.</p>`}</article>
      </div>

      <aside class="rc30-expert-conclusion"><span>✓</span><div><small>Conclusion de l'Assistant Expert</small><p>${e(modele.conclusion)}</p></div></aside>
      <div data-gemini-host>${creerHtmlBlocGemini(options.gemini || {})}</div>
      <footer><small>Cette analyse explique les règles existantes. Elle n'exécute aucune commande Home Assistant.</small><button type="button" data-assistant-expert-close>Fermer</button></footer>
    </section>
  </div>`;
}
