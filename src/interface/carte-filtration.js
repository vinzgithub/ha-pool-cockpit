/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { lireNombreTraitement } from "../traitement/produits-dosage.js";

/**
 * Présentation de la carte « Performance de filtration ».
 *
 * Ce module transforme uniquement des données déjà disponibles dans le dashboard
 * en indicateurs et en HTML de présentation. Il ne recalcule pas la recommandation
 * métier de filtration : `modele.filtrationHours` reste l'autorité quand elle est
 * présente, avec le repli historique sur `controle.pump.recommended_hours`.
 *
 * RÈGLE FILT-004 : la durée recommandée reste calculée par `moteur/filtration.js`.
 * Cette carte ne doit jamais réintroduire température/2, plancher hydraulique ou
 * modificateurs météo/traitement.
 *
 * RÈGLE SEC-000 : aucun accès Home Assistant, aucun DOM et aucune commande ne sont
 * autorisés ici. Les données d'historique et de configuration sont injectées par
 * le composant appelant.
 */

/**
 * Formate une durée décimale en heures/minutes selon le rendu historique.
 *
 * La fonction ne modifie aucun état et ne borne pas la durée à 24 h. Une valeur
 * absente ou non finie retourne le tiret historique.
 *
 * @param {number|null|undefined} heures Durée décimale en heures.
 * @returns {string} Libellé `H h MM` ou `—`.
 *
 * @example
 * formaterDureeHeures(2.5); // => "2 h 30"
 */
export function formaterDureeHeures(heures) {
  if (heures === null || !Number.isFinite(heures)) return "—";
  const minutes = Math.max(0, Math.round(heures * 60));
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

/**
 * Calcule les indicateurs purement présentatifs de la carte filtration.
 *
 * Cette fonction conserve exactement les replis historiques de volume/débit et
 * la priorité « historique réel du jour > programme prévu ». Elle ne décide jamais
 * combien d'heures la piscine devrait filtrer : l'objectif vient exclusivement du
 * modèle métier déjà calculé ou du champ historique `recommended_hours`.
 *
 * @param {object} [entrees] Données injectées par le dashboard.
 * @param {object} [entrees.profilTraitement] Profil contenant volume et débit.
 * @param {object} [entrees.statistiquesFiltration] Historique réel du jour.
 * @param {object} [entrees.controle] État de programmation déjà normalisé.
 * @param {object} [entrees.modele] Modèle de traitement/filtration déjà calculé.
 * @returns {object} Indicateurs prêts à rendre, sans effet de bord.
 */
export function calculerPerformanceCarteFiltration({
  profilTraitement,
  statistiquesFiltration,
  controle,
  modele,
} = {}) {
  const flow = lireNombreTraitement(profilTraitement?.pump_flow_m3h, 10) || 10;
  const volume = lireNombreTraitement(profilTraitement?.volume_m3, 16) || 16;
  const actual = statistiquesFiltration?.available && Number.isFinite(statistiquesFiltration.hours);
  const planned = Number(controle?.pump?.scheduled_hours || 0);
  const hours = actual ? statistiquesFiltration.hours : (planned > 0 ? planned : null);
  const source = actual ? "Historique réel du jour" : hours !== null ? "Programme prévu" : "Durée indisponible";
  const filtered = hours === null ? null : hours * flow;
  const turnovers = filtered === null ? null : filtered / volume;
  const targetHours = Number(modele?.filtrationHours || controle?.pump?.recommended_hours || 0) || null;
  const targetTurnovers = targetHours === null ? null : targetHours * flow / volume;
  const progress = hours === null || !targetHours ? 0 : Math.max(0, Math.min(100, hours / targetHours * 100));
  const renewalHours = volume / flow;

  return {
    flow,
    volume,
    hours,
    filtered,
    turnovers,
    targetHours,
    targetTurnovers,
    progress,
    renewalHours,
    actual,
    source,
    running: Boolean(statistiquesFiltration?.running),
  };
}

/**
 * Rend le HTML historique de la section « Performance de filtration ».
 *
 * Les informations de repli/collapse sont fournies sous forme de chaînes déjà
 * préparées par la couche de mise en page. Cette fonction ne touche jamais au DOM,
 * ne lit aucun état HA et ne déclenche aucune action.
 *
 * @param {object} [entrees] Données de rendu.
 * @param {object} [entrees.modele] Modèle métier déjà calculé.
 * @param {object} [entrees.profilTraitement] Profil volume/débit.
 * @param {object} [entrees.statistiquesFiltration] Statistiques réelles du jour.
 * @param {object} [entrees.controle] Programmation déjà normalisée.
 * @param {string} [entrees.classeSection=""] Classes de collapse préparées par le parent.
 * @param {string} [entrees.attributsEntete=""] Attributs accessibles préparés par le parent.
 * @param {string} [entrees.chevronHtml=""] Chevron de collapse préparé par le parent.
 * @returns {string} HTML de la section, strictement sans effet de bord.
 */
export function rendreCarteFiltration({
  modele,
  profilTraitement,
  statistiquesFiltration,
  controle,
  classeSection = "",
  attributsEntete = "",
  chevronHtml = "",
} = {}) {
  const perf = calculerPerformanceCarteFiltration({
    profilTraitement,
    statistiquesFiltration,
    controle,
    modele,
  });
  const reached = perf.hours !== null && perf.targetHours !== null && perf.hours >= perf.targetHours;
  const status = perf.hours === null ? "Durée non disponible" : reached ? "Objectif atteint" : "Filtration à poursuivre";

  return `<section class="v3-section rc28-filtration-section ${classeSection}" data-rc271-section=filtration>
      <header class=v3-section__header ${attributsEntete}>
        <span class=v3-section__icon>🌊</span>
        <div><h2>Performance de filtration</h2><p>Volume brassé, renouvellements et objectif du jour</p></div>
        <span class="rc28-filter-live ${perf.running ? "is-running" : ""}">${perf.running ? "Pompe en marche" : "Pompe arrêtée"}</span>
        ${chevronHtml}
      </header>
      <div class=rc28-filtration-card>
        <div class=rc28-filtration-kpis>
          <article><span>⏱</span><small>Filtration aujourd’hui</small><strong>${formaterDureeHeures(perf.hours)}</strong><em>${perf.source}</em></article>
          <article><span>💧</span><small>Volume filtré</small><strong>${perf.filtered === null ? "—" : Math.round(perf.filtered) + " m³"}</strong><em>Débit nominal ${perf.flow.toFixed(1).replace(".0", "")} m³/h</em></article>
          <article><span>↻</span><small>Renouvellements</small><strong>${perf.turnovers === null ? "—" : perf.turnovers.toFixed(1) + " volumes"}</strong><em>Bassin ${perf.volume} m³</em></article>
          <article><span>🎯</span><small>Objectif conseillé</small><strong>${perf.targetHours === null ? "—" : formaterDureeHeures(perf.targetHours)}</strong><em>${perf.targetTurnovers === null ? "Calcul indisponible" : perf.targetTurnovers.toFixed(1) + " volumes théoriques"}</em></article>
          <article><span>⚙</span><small>Un renouvellement</small><strong>${formaterDureeHeures(perf.renewalHours)}</strong><em>${perf.volume} m³ ÷ ${perf.flow.toFixed(1).replace(".0", "")} m³/h</em></article>
        </div>
        <div class="rc28-filtration-progress ${reached ? "is-reached" : ""}"><div><b>${status}</b><span>${Math.round(perf.progress)} %</span></div><i><b style="width:${perf.progress}%"></b></i><small>Le volume est théorique : les pertes de charge réelles peuvent réduire le débit.</small></div>
      </div>
    </section>`;
}
