/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Présentation pure de la section « Mes appareils de mesure ».
 *
 * Ce module reçoit uniquement des valeurs et fragments HTML déjà préparés par le
 * composant parent. Il ne lit aucune entité Home Assistant, ne calcule aucune
 * recommandation, ne déclenche aucune analyse et n'attache aucun événement DOM.
 *
 * RÈGLE SEC-000 : aucun accès Home Assistant, DOM, WebSocket, service ou stockage.
 */

/**
 * Rend une carte d'appareil de mesure à partir de données déjà préparées.
 *
 * La fonction ne lit jamais Home Assistant et ne décide jamais si un appareil est
 * utilisable : `actif`, `recent`, les jauges, anomalies et statut d'analyse sont
 * fournis par la couche historique. Les valeurs absentes restent affichées telles
 * qu'elles l'étaient avant l'extraction ; aucun repli métier supplémentaire n'est
 * introduit ici.
 *
 * @param {object} entrees Données de présentation déjà calculées.
 * @param {number} entrees.index Position historique de l'appareil.
 * @param {string} entrees.nom Nom affiché de l'appareil.
 * @param {string} entrees.marque Marque technique historique.
 * @param {boolean} entrees.actif Appareil inclus ou non dans les calculs.
 * @param {boolean} entrees.recent Mesure encore considérée récente.
 * @param {string} entrees.synchronisation Texte de synchronisation déjà calculé.
 * @param {{value:unknown,unit:unknown}} entrees.temperature Température déjà formatée.
 * @param {{direction:string,label:string}} entrees.tendance Tendance déjà calculée.
 * @param {string} entrees.jaugePhHtml Jauge pH déjà rendue.
 * @param {string} entrees.jaugeOrpHtml Jauge ORP déjà rendue.
 * @param {{label:string,value:unknown,unit:unknown,percent:number}|null} [entrees.mesureSpecifique=null] Mesure spécifique facultative.
 * @param {{phase:string,label:string,progress:number,detail:string}} entrees.statutAnalyse Statut déjà normalisé.
 * @param {{value:unknown,unit:unknown}} entrees.batterie Lecture batterie déjà préparée.
 * @param {{value:unknown,unit:unknown}} entrees.bluetooth Lecture Bluetooth déjà préparée.
 * @param {string} entrees.derniereAnalyse Texte de date déjà formaté.
 * @param {boolean} entrees.analyseDisponible Présence historique d'une commande d'analyse.
 * @param {boolean} entrees.analyseOccupee Analyse déjà en cours.
 * @param {string[]} [entrees.anomalies=[]] Anomalies déjà détectées.
 * @param {{battery:string,bluetooth:string,calendar:string,flask:string}} entrees.icones Fragments SVG historiques.
 * @returns {string} HTML de la carte, sans effet de bord.
 *
 * @example
 * rendreCarteCapteur({
 *   index: 0, nom: "Blue Connect", marque: "blue_connect",
 *   actif: true, recent: true, synchronisation: "Synchronisé à l’instant",
 *   temperature: {value: "27,1", unit: "°C"},
 *   tendance: {direction: "stable", label: "Stable"},
 *   jaugePhHtml: "<pool-gauge></pool-gauge>", jaugeOrpHtml: "<pool-gauge></pool-gauge>",
 *   mesureSpecifique: null,
 *   statutAnalyse: {phase: "idle", label: "Prêt", progress: 0, detail: "Disponible"},
 *   batterie: {value: "80", unit: "%"}, bluetooth: {value: "-60", unit: "dBm"},
 *   derniereAnalyse: "06 sept. 19:00", analyseDisponible: true, analyseOccupee: false,
 *   anomalies: [], icones: {battery: "B", bluetooth: "BT", calendar: "C", flask: "F"},
 * });
 */
export function rendreCarteCapteur({
  index,
  nom,
  marque,
  actif,
  recent,
  synchronisation,
  temperature,
  tendance,
  jaugePhHtml,
  jaugeOrpHtml,
  mesureSpecifique = null,
  statutAnalyse,
  batterie,
  bluetooth,
  derniereAnalyse,
  analyseDisponible,
  analyseOccupee,
  anomalies = [],
  icones,
} = {}) {
  const iconeStatut = statutAnalyse.phase === "done"
    ? "✓"
    : statutAnalyse.phase === "error"
      ? "!"
      : statutAnalyse.phase === "disabled"
        ? "○"
        : statutAnalyse.phase === "idle"
          ? "●"
          : statutAnalyse.phase === "analyzing"
            ? "⚗"
            : "↻";

  const pourcentageStatut = ["idle", "disabled", "offline"].includes(statutAnalyse.phase)
    ? ""
    : `${statutAnalyse.progress}%`;

  return `<section class="device-card ${actif ? "" : "is-disabled"} ${recent ? "" : "is-stale"}" style="--delay:${index * 80}ms">
      <header><div><h2>${nom}</h2><span>${marque.replaceAll("_", " ")}</span><em class=fresh>${actif ? synchronisation : "Désactivé pour HA Pool"}</em></div><strong>${temperature.value}<small>${temperature.unit}</small><em class="trend ${tendance.direction}">${recent ? tendance.label : "Hors calcul"}</em></strong><button class="rc28-device-toggle ${actif ? "is-on" : ""}" type=button data-device-toggle="${index}" aria-pressed="${actif}" title="${actif ? "Désactiver" : "Activer"} ${nom}"><i></i><span>${actif ? "Activé" : "Désactivé"}</span></button></header>
      <div class=gauges>${jaugePhHtml}${jaugeOrpHtml}</div>
      ${mesureSpecifique ? `<div class=linear><div><span>${mesureSpecifique.label}</span><strong>${mesureSpecifique.value} ${mesureSpecifique.unit}</strong></div><i><b style="width:${mesureSpecifique.percent}%"></b></i></div>` : ""}
      <div class="device-analysis-status is-${statutAnalyse.phase}" aria-live=polite>
        <span class=device-analysis-status__icon>${iconeStatut}</span>
        <span class=device-analysis-status__copy><small>Statut de la source</small><strong>${statutAnalyse.label}</strong><em>${statutAnalyse.detail}</em></span>
        <span class=device-analysis-status__percent>${pourcentageStatut}</span>
        <span class=device-analysis-status__bar><i style="width:${statutAnalyse.progress}%"></i></span>
      </div>
      <div class=chips><div>${icones.battery}<span>Batterie<strong>${batterie.value}${batterie.unit ? " " + batterie.unit : ""}</strong></span></div><div>${icones.bluetooth}<span>Bluetooth<strong>${bluetooth.value}${bluetooth.unit ? " " + bluetooth.unit : ""}</strong></span></div></div>
      <div class=analysis-box><div class=last>${icones.calendar}<span>Dernière analyse<strong>${derniereAnalyse}</strong></span></div>${analyseDisponible ? `<button data-i="${index}" ${analyseOccupee ? "disabled aria-busy=true" : ""}>${icones.flask}<span>${analyseOccupee ? "Analyse en cours…" : "Lancer une analyse"}</span></button>` : ""}</div>
      ${!actif ? `<div class="anomaly rc28-disabled-note">○ Ignoré par HA Pool · historique Home Assistant conservé</div>` : anomalies.length ? `<div class=anomaly>⚠ ${anomalies.join(" · ")}</div>` : ""}
    </section>`;
}

/**
 * Rend la section qui regroupe toutes les cartes d'appareils de mesure.
 *
 * Les cartes, le comptage des appareils actifs et l'état replié sont préparés par
 * le composant parent. Cette fonction ne parcourt pas la configuration Home
 * Assistant et ne déclenche aucune action.
 *
 * @param {object} entrees Données de présentation de la section.
 * @param {string} entrees.sourceLabel Libellé historique des sources consolidées.
 * @param {number} entrees.nombreActifs Nombre d'appareils actifs déjà calculé.
 * @param {number} entrees.nombreTotal Nombre total d'appareils configurés.
 * @param {string} entrees.cartesHtml Cartes déjà rendues, dans l'ordre historique.
 * @param {string} [entrees.classeSection=""] Classes de repli préparées par le parent.
 * @param {string} [entrees.attributsEntete=""] Attributs accessibles préparés par le parent.
 * @param {string} [entrees.chevronHtml=""] Chevron préparé par le parent.
 * @returns {string} HTML de la section, sans effet de bord.
 */
export function rendreSectionCapteurs({
  sourceLabel,
  nombreActifs,
  nombreTotal,
  cartesHtml,
  classeSection = "",
  attributsEntete = "",
  chevronHtml = "",
} = {}) {
  return `<section class="v3-section rc28-devices-section ${classeSection}" data-rc271-section=devices>
        <header class=v3-section__header ${attributsEntete}>
          <span class=v3-section__icon>📡</span>
          <div><h2>Mes appareils de mesure</h2><p>Synthèse de tous les appareils actifs · ${sourceLabel}</p></div>
          <span class=rc28-section-count>${nombreActifs} actif${nombreActifs > 1 ? "s" : ""} sur ${nombreTotal}</span>
          ${chevronHtml}
        </header>
        <div class=devices>${cartesHtml}</div>
      </section>`;
}
