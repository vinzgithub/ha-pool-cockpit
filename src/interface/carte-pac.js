/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import {
  FONCTIONNEMENTS_PAC,
  REGULATIONS_PAC,
} from "../pac/commandes-pac.js";

/**
 * Présentation pure de la carte PAC Polytropic.
 *
 * Ce module reçoit un modèle PAC déjà construit par le composant Home Assistant
 * et ne lit jamais directement les entités, le DOM ou les services. Il ne prépare
 * et n'exécute aucune commande : toutes les interactions restent derrière
 * `pac/commandes-pac.js` et le verrou inconditionnel de `pac/securite-pac.js`.
 *
 * RÈGLE PAC-001 : ce fichier ne peut ni lire ni modifier `write_enabled`.
 * RÈGLE PAC-002 : aucune configuration PAC brute n'est relue ici.
 * RÈGLE SEC-000 : aucun accès Home Assistant, service, WebSocket, DOM ou stockage.
 */

/**
 * Formate une valeur numérique PAC comme le rendu historique.
 *
 * La fonction ne borne ni ne corrige la valeur. `null` et `undefined` rendent le
 * tiret historique ; les autres valeurs suivent `Number(...).toLocaleString()`.
 * Elle ne modifie aucun état et ne commande rien.
 *
 * @param {unknown} valeur Valeur déjà lue/calculée par la couche appelante.
 * @param {string} [unite=""] Unité à suffixer.
 * @param {number} [decimales=1] Nombre fixe de décimales du rendu.
 * @returns {string} Valeur localisée en français ou `—`.
 *
 * @example
 * formaterValeurCartePac(29.1, "°C", 1); // => "29,1 °C"
 */
export function formaterValeurCartePac(valeur, unite = "", decimales = 1) {
  return valeur === null || valeur === undefined
    ? "—"
    : `${Number(valeur).toLocaleString("fr-FR", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    })}${unite ? ` ${unite}` : ""}`;
}

/**
 * Décompose le libellé de mode ESPHome en fonctionnement et régulation.
 *
 * Cette fonction reproduit uniquement la lecture historique des mots-clés. Une
 * valeur absente, inconnue ou partielle produit des chaînes vides ; elle n'invente
 * jamais un mode et n'envoie aucune commande.
 *
 * @param {unknown} mode Libellé de mode déjà lu par la couche Home Assistant.
 * @returns {{operation:string,regulation:string}} Parties techniques reconnues.
 *
 * @example
 * decomposerModeCartePac("Heating + Smart");
 * // => { operation: "heating", regulation: "smart" }
 */
export function decomposerModeCartePac(mode) {
  const brut = String(mode || "");
  const normalise = brut.toLowerCase();
  let operation = "";
  let regulation = "";

  if (/heating|chauff/.test(normalise)) operation = FONCTIONNEMENTS_PAC.CHAUFFAGE;
  else if (/cooling|froid|cold/.test(normalise)) operation = FONCTIONNEMENTS_PAC.FROID;
  else if (/auto/.test(normalise)) operation = FONCTIONNEMENTS_PAC.AUTOMATIQUE;

  if (/eco/.test(normalise)) regulation = REGULATIONS_PAC.ECO;
  else if (/boost/.test(normalise)) regulation = REGULATIONS_PAC.BOOST;
  else if (/smart/.test(normalise)) regulation = REGULATIONS_PAC.SMART;

  return { operation, regulation };
}

/**
 * Retourne le libellé utilisateur historique d'un fonctionnement PAC.
 *
 * Une valeur inconnue retourne `—`. Aucun état n'est lu ou modifié.
 *
 * @param {unknown} valeur Valeur technique `heating`, `auto` ou `cooling`.
 * @returns {string} Libellé français de présentation.
 */
export function libellerFonctionnementCartePac(valeur) {
  return {
    [FONCTIONNEMENTS_PAC.CHAUFFAGE]: "Chauffage",
    [FONCTIONNEMENTS_PAC.AUTOMATIQUE]: "Automatique",
    [FONCTIONNEMENTS_PAC.FROID]: "Froid",
  }[valeur] || "—";
}

/**
 * Retourne le libellé utilisateur historique d'une régulation PAC.
 *
 * Une valeur inconnue retourne `—`. Aucun état n'est lu ou modifié.
 *
 * @param {unknown} valeur Valeur technique `eco`, `smart` ou `boost`.
 * @returns {string} Libellé de présentation.
 */
export function libellerRegulationCartePac(valeur) {
  return {
    [REGULATIONS_PAC.ECO]: "Eco",
    [REGULATIONS_PAC.SMART]: "Smart",
    [REGULATIONS_PAC.BOOST]: "Boost",
  }[valeur] || "—";
}

/**
 * Détermine uniquement la classe visuelle du cadran PAC.
 *
 * Priorité historique : défaut/code défaut > arrêt > froid > chauffe > attente.
 * La fonction ne décide jamais si la PAC doit fonctionner et ne consulte aucune
 * configuration d'écriture.
 *
 * @param {object} [modelePac] Modèle PAC déjà construit par le composant.
 * @returns {"fault"|"off"|"cooling"|"heating"|"idle"} État visuel.
 */
export function determinerEtatCadranCartePac(modelePac = {}) {
  const defaut = String(modelePac.fault || "").trim().toLowerCase();
  const code = String(modelePac.compressorFaultCode || "").trim().toLowerCase();
  const defautActif = Boolean(defaut) && !["aucun", "none", "0", "off", "false", "ok"].includes(defaut);
  const codeActif = Boolean(code) && !["0", "aucun", "none", "ok"].includes(code);
  if (defautActif || codeActif) return "fault";

  const parties = decomposerModeCartePac(modelePac.mode);
  if (modelePac.on === false) return "off";
  if (parties.operation === FONCTIONNEMENTS_PAC.FROID) return "cooling";
  if (modelePac.on === true) return "heating";
  return "idle";
}

/**
 * Rend la carte PAC historique à partir de données déjà préparées.
 *
 * Le modèle, la consigne affichée, la géométrie du cadran et la température du
 * bassin sont injectés par le composant. La fonction ne lit jamais Home Assistant,
 * ne touche pas au DOM, n'attache aucun événement et n'appelle aucun service.
 * Les boutons rendus restent de simples marqueurs d'interface : leur sécurité et
 * leur exécution appartiennent exclusivement à `pac/commandes-pac.js`.
 *
 * @param {object} [entrees] Données de rendu déjà préparées.
 * @param {object} [entrees.modelePac] Modèle de lecture PAC.
 * @param {number} [entrees.valeurConsigne=28.5] Valeur déjà choisie pour le cadran.
 * @param {{progress:number,x:number,y:number}} [entrees.geometrieCadran] Géométrie déjà calculée.
 * @param {number|null|undefined} [entrees.temperatureEauC] Température du bassin.
 * @param {(valeur:unknown)=>string} entrees.echapperHtml Fonction d'échappement fournie par l'interface parente.
 * @returns {string} HTML de la carte PAC, sans effet de bord.
 *
 * @example
 * rendreCartePac({
 *   modelePac: { configured: false, on: null },
 *   valeurConsigne: 28.5,
 *   geometrieCadran: { progress: 66, x: 50, y: 8 },
 *   temperatureEauC: 27.1,
 *   echapperHtml: (valeur) => String(valeur),
 * });
 */
export function rendreCartePac({
  modelePac = {},
  valeurConsigne = 28.5,
  geometrieCadran = { progress: 0, x: 50, y: 50 },
  temperatureEauC = null,
  echapperHtml,
} = {}) {
  if (typeof echapperHtml !== "function") {
    throw new TypeError("rendreCartePac requiert une fonction echapperHtml");
  }

  const partiesMode = decomposerModeCartePac(modelePac.configured ? modelePac.mode : "Heating + Smart");
  const modeEnAttente = modelePac.modePending === true;
  const etatCadran = determinerEtatCadranCartePac(modelePac);
  const consigne = formaterValeurCartePac(valeurConsigne, "°C", 1);
  const eau = temperatureEauC !== null && temperatureEauC !== undefined
    ? formaterValeurCartePac(temperatureEauC, "°C", 1)
    : "—";

  return `<article class="v3-info-card rc27-equipment rc30-pac-preview ${modelePac.on === true ? "is-on" : ""}">
          <header><span>♨️</span><h3>PAC Polytropic</h3><b>${modeEnAttente ? "Mode en cours…" : modelePac.configured ? (modelePac.on === true ? "En marche" : modelePac.on === false ? "À l’arrêt" : "Configurée") : "Simulation"}</b></header>

          <div class="rc30-pac-gauge rc30-pac-gauge--${etatCadran}">
            <div class=rc30-pac-gauge__ring data-rc30-pac-gauge role=slider tabindex=0 aria-label="Consigne PAC" aria-valuemin="8" aria-valuemax="32" aria-valuenow="${valeurConsigne}" style="--pac-progress:${geometrieCadran.progress}%">
              <div class=rc30-pac-gauge__center><small>Consigne</small><strong>${consigne}</strong><span>🌊 Eau bassin ${eau}</span></div>
              <i class=rc30-pac-gauge__knob style="left:${geometrieCadran.x}%;top:${geometrieCadran.y}%" aria-hidden=true></i>
              <span class="rc30-pac-gauge__limit rc30-pac-gauge__limit--min">8°</span><span class="rc30-pac-gauge__limit rc30-pac-gauge__limit--max">32°</span>
            </div>
            <button type=button class=rc30-pac-gauge__confirm data-rc30-pac-confirm hidden aria-label="Valider ${consigne}" title="Valider ${consigne}"><b>✓</b></button>
          </div>
          <div class=rc27-control-buttons><button type=button data-rc30-pac-sim="on">Démarrer</button><button type=button class=is-stop data-rc30-pac-sim="off">Arrêter</button></div>
          <div class=rc30-pac-mode-grid>
            <label><span>Fonctionnement</span><select data-rc30-pac-operation><option value=heating ${partiesMode.operation === FONCTIONNEMENTS_PAC.CHAUFFAGE ? "selected" : ""}>☀️ Chauffage</option><option value=auto ${partiesMode.operation === FONCTIONNEMENTS_PAC.AUTOMATIQUE ? "selected" : ""}>🔄 Automatique</option><option value=cooling ${partiesMode.operation === FONCTIONNEMENTS_PAC.FROID ? "selected" : ""}>❄️ Froid</option></select></label>
            <label><span>Régulation</span><select data-rc30-pac-regulation ${partiesMode.operation === FONCTIONNEMENTS_PAC.AUTOMATIQUE ? "disabled" : ""}><option value=eco ${partiesMode.regulation === REGULATIONS_PAC.ECO ? "selected" : ""}>🍃 Eco</option><option value=smart ${(!partiesMode.regulation || partiesMode.regulation === REGULATIONS_PAC.SMART) ? "selected" : ""}>💡 Smart</option><option value=boost ${partiesMode.regulation === REGULATIONS_PAC.BOOST ? "selected" : ""}>⚡ Boost</option></select></label>
          </div>
          <div class=rc27-schedule-balance><span><b>${modelePac.configured ? `${formaterValeurCartePac(modelePac.inlet, "°C", 1)} → ${formaterValeurCartePac(modelePac.outlet, "°C", 1)}` : "27,9 → 29,1 °C"}</b> entrée → sortie</span><span><b>${modelePac.configured ? formaterValeurCartePac(modelePac.delta, "°C", 1) : "+1,2 °C"}</b> ΔT</span><em class=is-good>${modelePac.configured ? "Entités PAC raccordées · commandes Home Assistant actives sur le maître" : "Préparation ESPHome / Modbus · valeurs simulées"}</em></div>
          <div class=rc27-light-timer><span>Air / échangeur / IPM</span><b>${modelePac.configured ? `${formaterValeurCartePac(modelePac.ambient, "°C", 1)} · ${formaterValeurCartePac(modelePac.coil, "°C", 1)} · ${formaterValeurCartePac(modelePac.ipm, "°C", 1)}` : "24,6 °C · — · 42 °C"}</b></div>
          <div class=rc27-light-timer><span>Pilotage / mode PAC${modeEnAttente ? " · confirmation en cours" : ""}</span><b>${modelePac.configured ? `${echapperHtml(libellerFonctionnementCartePac(decomposerModeCartePac(modelePac.mode).operation))} · ${echapperHtml(libellerRegulationCartePac(decomposerModeCartePac(modelePac.mode).regulation))}` : "Chauffage · Smart"}</b></div>
          <div class=rc27-light-timer><span>Électrique</span><b>${modelePac.configured ? `${formaterValeurCartePac(modelePac.voltage, "V", 0)} · ${formaterValeurCartePac(modelePac.current, "A", 1)} · ${formaterValeurCartePac(modelePac.power, modelePac.powerUnit || "W", 0)}` : "231 V · 3,8 A · —"}</b></div>
          ${(modelePac.energy !== null || modelePac.dailyEnergy !== null || modelePac.monthlyEnergy !== null) ? `<div class=rc27-light-timer><span>Consommation estimée</span><b>${modelePac.dailyEnergy !== null ? `${formaterValeurCartePac(modelePac.dailyEnergy, "kWh", 2)} aujourd’hui` : "— aujourd’hui"}${modelePac.monthlyEnergy !== null ? ` · ${formaterValeurCartePac(modelePac.monthlyEnergy, "kWh", 1)} ce mois` : ""}${modelePac.energy !== null ? ` · ${formaterValeurCartePac(modelePac.energy, "kWh", 1)} total` : ""}</b></div>` : ""}
          <div class=rc27-light-timer><span>Sécurités HP / LP / débit</span><b>${modelePac.configured ? `${echapperHtml(modelePac.highPressure || "—")} · ${echapperHtml(modelePac.lowPressure || "—")} · ${echapperHtml(modelePac.waterFlow || "—")}` : "— · — · —"}</b></div>
          <div class=rc27-light-timer><span>Code compresseur / défaut / communication</span><b>${modelePac.configured ? `${echapperHtml(modelePac.compressorFaultCode || "0")} · ${echapperHtml(modelePac.fault || "aucun")} · ${echapperHtml(modelePac.communication || "—")}` : "0 · aucun · simulation"}</b></div>
        </article>`;
}
