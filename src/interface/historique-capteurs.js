/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Préparation et présentation pure de l'historique des capteurs.
 *
 * Ce module ne charge aucun historique Home Assistant et ne connaît aucun objet
 * `hass`. Il reçoit uniquement des séries déjà lues, des appareils déjà résolus
 * par le composant parent et des préférences d'affichage déjà normalisées.
 *
 * RÈGLE SEC-000 : aucun appel Home Assistant, WebSocket, service, DOM ou stockage.
 */

/**
 * Regroupe une série de mesures dans des tranches horaires en conservant la
 * moyenne historique de chaque tranche.
 *
 * @param {{timestamp:number,value:number}[]} points Mesures numériques déjà filtrées.
 * @returns {{timestamp:number,value:number}[]} Série horaire triée.
 */
export function regrouperHistoriqueHoraire(points) {
  if (!points.length) return [];
  const bucketMs = 60 * 60 * 1000;
  const buckets = new Map();
  for (const point of points) {
    const bucket = Math.floor(point.timestamp / bucketMs) * bucketMs;
    const current = buckets.get(bucket) || { sum: 0, count: 0 };
    current.sum += point.value;
    current.count += 1;
    buckets.set(bucket, current);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([timestamp, data]) => ({ timestamp, value: data.sum / data.count }));
}

/**
 * Fusionne, pour une métrique, les séries horaires de plusieurs appareils.
 *
 * `obtenirAppareilsActifs` reste injecté afin de conserver strictement le point
 * d'appel historique : la liste des appareils est redemandée pour chaque
 * timestamp, comme avant l'extraction.
 *
 * @param {object} entrees Données déjà préparées par le parent.
 * @param {string} entrees.metric Métrique historique (`temperature`, `ph`, `orp`).
 * @param {Record<string,{timestamp:number,value:number}[]>} entrees.perEntity Séries par entité.
 * @param {()=>Array<{name:string,entities?:Record<string,string>}>} entrees.obtenirAppareilsActifs Fournisseur historique des appareils actifs.
 * @returns {{timestamp:number,value:number,sources:{name:string,value:number}[]}[]} Série fusionnée, limitée aux 24 derniers points.
 */
export function fusionnerHistoriqueAppareils({ metric, perEntity, obtenirAppareilsActifs }) {
  const entityIds = Object.keys(perEntity);
  const timestamps = [...new Set(entityIds.flatMap((id) => (perEntity[id] || []).map((point) => point.timestamp)))].sort((a, b) => a - b);
  const lookup = {};
  for (const entityId of entityIds) {
    lookup[entityId] = new Map((perEntity[entityId] || []).map((point) => [point.timestamp, point.value]));
  }

  return timestamps.map((timestamp) => {
    const sources = [];
    for (const device of obtenirAppareilsActifs()) {
      const entityId = device.entities?.[metric];
      if (!entityId) continue;
      const value = lookup[entityId]?.get(timestamp);
      if (Number.isFinite(value)) sources.push({ name: device.name, value });
    }
    if (!sources.length) return null;
    const average = sources.reduce((sum, item) => sum + item.value, 0) / sources.length;
    return { timestamp, value: average, sources };
  }).filter(Boolean).slice(-24);
}

/**
 * Retourne la plage idéale historique, sans modifier les seuils de production.
 *
 * @param {string} metric Métrique demandée.
 * @returns {[number,number]|null} Plage historique ou `null`.
 */
export function plageIdealeHistorique(metric) {
  return { temperature: [24, 30], ph: [7.2, 7.5], orp: [650, 800] }[metric] || null;
}

/**
 * Produit le libellé de provenance historique d'une série consolidée.
 *
 * @param {{sources?:{name:string}[]}[]} points Points déjà fusionnés.
 * @returns {string} Libellé historique inchangé.
 */
export function libelleSourceHistorique(points) {
  const names = [...new Set(points.flatMap((point) => (point.sources || []).map((source) => source.name)))];
  return names.length > 1 ? `Synthèse de ${names.length} appareils` : names[0] || "Historique disponible";
}

/**
 * Rend le graphique historique 24 h à partir de données déjà chargées.
 *
 * Important : la conversion Fahrenheit et le domaine de calcul reproduisent
 * volontairement l'algorithme historique à l'identique. Cette extraction ne
 * corrige ni ne réinterprète aucune formule existante.
 *
 * @param {object} entrees Données de présentation.
 * @param {string} entrees.metric Métrique.
 * @param {string} entrees.label Libellé affiché.
 * @param {string} entrees.unit Unité initiale.
 * @param {{timestamp:number,value:number,sources?:{name:string,value:number}[]}[]} entrees.sourcePoints Série déjà chargée.
 * @param {string} [entrees.temperatureUnit] Préférence historique `C`/`F`.
 * @param {boolean} [entrees.historyLoading=false] Chargement en cours.
 * @param {boolean} [entrees.historyError=false] Erreur de chargement.
 * @returns {string} HTML du graphique, sans effet de bord.
 */
export function rendreGraphiqueHistoriqueCapteur({
  metric,
  label,
  unit,
  sourcePoints,
  temperatureUnit,
  historyLoading = false,
  historyError = false,
}) {
  const points = metric === "temperature" && temperatureUnit === "F"
    ? sourcePoints.map((point) => ({ ...point, value: point.value * 9 / 5 + 32 }))
    : sourcePoints;
  if (metric === "temperature" && temperatureUnit === "F") unit = "°F";
  if (points.length < 2) {
    const message = historyLoading ? "Chargement…" : historyError ? "Historique indisponible" : "Pas encore assez de données";
    return `<article class=chart-card><header><div><small>${label}</small><strong>—</strong></div><span>24 h</span></header><div class=chart-empty>${message}</div></article>`;
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values), max = Math.max(...values);
  const ideal = plageIdealeHistorique(metric);
  const domainMin = ideal ? Math.min(min, ideal[0]) : min;
  const domainMax = ideal ? Math.max(max, ideal[1]) : max;
  const width = 320, height = 110, padX = 10, padY = 13, range = domainMax - domainMin || 1;
  const coords = points.map((point, index) => {
    const x = padX + (index / (points.length - 1)) * (width - padX * 2);
    const rawY = height - padY - ((point.value - domainMin) / range) * (height - padY * 2);
    const y = Math.max(padY, Math.min(height - padY, rawY));
    return [x, y];
  });
  const line = coords.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords.at(-1)[0].toFixed(1)},${height - padY} L${coords[0][0].toFixed(1)},${height - padY} Z`;
  const latest = values.at(-1);
  const delta = latest - values[0];
  const deltaText = `${delta >= 0 ? "+" : ""}${delta.toFixed(metric === "temperature" || metric === "ph" ? 2 : 0)} ${unit}`;
  const gradientId = `g-${metric}`;

  let idealBand = "";
  if (ideal) {
    const displayIdeal = metric === "temperature" && temperatureUnit === "F"
      ? ideal.map((value) => value * 9 / 5 + 32) : ideal;
    const yTop = height - padY - ((displayIdeal[1] - domainMin) / range) * (height - padY * 2);
    const yBottom = height - padY - ((displayIdeal[0] - domainMin) / range) * (height - padY * 2);
    const bandTop = Math.max(padY, Math.min(height - padY, Math.min(yTop, yBottom)));
    const bandBottom = Math.max(padY, Math.min(height - padY, Math.max(yTop, yBottom)));
    idealBand = `<rect class=ideal-band x="${padX}" y="${bandTop}" width="${width - padX * 2}" height="${Math.max(0, bandBottom - bandTop)}" rx="8"></rect>`;
  }

  return `<article class=chart-card>
      <header><div><small>${label}</small><strong>${latest.toFixed(metric === "temperature" || metric === "ph" ? 2 : 0)} ${unit}</strong></div><span class="${delta > 0 ? "up" : delta < 0 ? "down" : ""}">${deltaText}</span></header>
      <div class=chart-source>${libelleSourceHistorique(points)}</div>
      <div class=spark-wrap><svg class=spark viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="Évolution ${label} sur 24 heures">
        <defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity=".32"/><stop offset="100%" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
        <g class=spark-grid><line x1="${padX}" y1="28" x2="${width - padX}" y2="28"></line><line x1="${padX}" y1="55" x2="${width - padX}" y2="55"></line><line x1="${padX}" y1="82" x2="${width - padX}" y2="82"></line></g>
        ${idealBand}
        <path class=area d="${area}" fill="url(#${gradientId})"></path>
        <path class=line d="${line}"></path>
        <circle class=end-halo cx="${coords.at(-1)[0]}" cy="${coords.at(-1)[1]}" r="7"></circle>
        <circle class=end-dot cx="${coords.at(-1)[0]}" cy="${coords.at(-1)[1]}" r="3.3"></circle>
      </svg><div class=spark-hit data-metric="${metric}" data-points="${encodeURIComponent(JSON.stringify(points))}" data-label="${label}" data-unit="${unit}"></div><div class=spark-tip></div></div>
      <footer><span>${min.toFixed(metric === "temperature" || metric === "ph" ? 2 : 0)} ${unit}</span><span>${points.length} points</span><span>${max.toFixed(metric === "temperature" || metric === "ph" ? 2 : 0)} ${unit}</span></footer>
    </article>`;
}
