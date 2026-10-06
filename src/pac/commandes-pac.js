/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Préparation pure des commandes PAC et géométrie du cadran de consigne.
 *
 * Ce module extrait la logique de commande historique de la PAC sans connaître
 * Home Assistant ni le DOM. Il ne fait qu'évaluer une demande utilisateur et,
 * lorsque le verrou normalisé l'autorise, construire un descripteur de service
 * que la couche existante pourra exécuter.
 *
 * RÈGLE PAC-001 : aucune commande n'est préparée tant que `write_enabled` est
 * falsy. La normalisation neutralise d'abord toute valeur persistée ; la couche
 * d'intégration ne réactive cette permission que sur l'instance maître.
 *
 * RÈGLE PAC-002 : l'appelant doit fournir exclusivement `_rc27Control.pac`, le
 * bloc PAC déjà normalisé. Ce module ne relit jamais une configuration brute.
 *
 * RÈGLE SEC-000 : aucun objet Home Assistant, aucun DOM, aucun appel de
 * service ou WebSocket et aucune persistance dans ce fichier.
 */

/** Statuts stables retournés par les préparateurs de commandes PAC. */
export const STATUTS_COMMANDE_PAC = Object.freeze({
  PRETE: "prete",
  VERROUILLEE: "verrouillee",
  INDISPONIBLE: "indisponible",
  INVALIDE: "invalide",
  SIMULATION: "simulation",
});

/** Bornes historiques du cadran de consigne PAC. */
export const BORNES_CONSIGNE_PAC = Object.freeze({
  MINIMUM_C: 8,
  MAXIMUM_C: 32,
  PAS_PAR_DEFAUT_C: 0.5,
});

/** Valeurs techniques historiques des modes de fonctionnement PAC. */
export const FONCTIONNEMENTS_PAC = Object.freeze({
  CHAUFFAGE: "heating",
  AUTOMATIQUE: "auto",
  FROID: "cooling",
});

/** Valeurs techniques historiques des profils de régulation PAC. */
export const REGULATIONS_PAC = Object.freeze({
  ECO: "eco",
  SMART: "smart",
  BOOST: "boost",
});

function configurationPacOuVide(configurationPac) {
  return configurationPac && typeof configurationPac === "object" && !Array.isArray(configurationPac)
    ? configurationPac
    : {};
}

/**
 * Indique si le bloc PAC normalisé interdit les écritures.
 *
 * Cette fonction reproduit exactement le test historique `!pac.write_enabled`.
 * Elle ne transforme pas une valeur brute en autorisation et ne remplace jamais
 * la normalisation de `securite-pac.js`.
 *
 * @param {object} configurationPac Bloc `_rc27Control.pac` déjà normalisé.
 * @returns {boolean} `true` lorsque toute écriture doit être refusée.
 */
export function commandePacEstVerrouillee(configurationPac) {
  const pac = configurationPacOuVide(configurationPac);
  return !pac.write_enabled;
}

/**
 * Construit une commande marche/arrêt sans l'exécuter.
 *
 * Ne modifie aucun état et ne contacte jamais Home Assistant. Une configuration
 * verrouillée retourne `VERROUILLEE` avant toute construction de service.
 *
 * @param {object} configurationPac Bloc `_rc27Control.pac` déjà normalisé.
 * @param {boolean} demarrer `true` pour marche, `false` pour arrêt.
 * @returns {{statut:string, service:null|{domaine:string,nom:string,donnees:object}}}
 *
 * @example
 * preparerCommandeMarcheArretPac({ write_enabled: false, command_entity: "switch.pac" }, true)
 * // => { statut: "verrouillee", service: null }
 */
export function preparerCommandeMarcheArretPac(configurationPac, demarrer) {
  const pac = configurationPacOuVide(configurationPac);
  if (commandePacEstVerrouillee(pac)) {
    return { statut: STATUTS_COMMANDE_PAC.VERROUILLEE, service: null };
  }
  if (!pac.command_entity) {
    return { statut: STATUTS_COMMANDE_PAC.INDISPONIBLE, service: null };
  }
  return {
    statut: STATUTS_COMMANDE_PAC.PRETE,
    service: {
      domaine: "switch",
      nom: demarrer ? "turn_on" : "turn_off",
      donnees: { entity_id: pac.command_entity },
    },
  };
}

/**
 * Construit la décision de validation d'une consigne PAC.
 *
 * Le cas non configuré et verrouillé reste une simulation visuelle, exactement
 * comme dans le code historique. Une PAC configurée et verrouillée refuse la
 * commande. Une valeur non numérique est rejetée avant toute autre décision.
 *
 * @param {object} configurationPac Bloc `_rc27Control.pac` déjà normalisé.
 * @param {unknown} valeur Consigne demandée.
 * @param {boolean} pacConfiguree Indique si au moins une entité PAC est configurée.
 * @returns {{statut:string, valeur:number|null, service:null|{domaine:string,nom:string,donnees:object}}}
 */
export function preparerCommandeConsignePac(configurationPac, valeur, pacConfiguree) {
  const pac = configurationPacOuVide(configurationPac);
  const consigne = Number(valeur);
  if (!Number.isFinite(consigne)) {
    return { statut: STATUTS_COMMANDE_PAC.INVALIDE, valeur: null, service: null };
  }
  if (commandePacEstVerrouillee(pac)) {
    return {
      statut: pacConfiguree ? STATUTS_COMMANDE_PAC.VERROUILLEE : STATUTS_COMMANDE_PAC.SIMULATION,
      valeur: consigne,
      service: null,
    };
  }
  if (!pac.setpoint_entity) {
    return { statut: STATUTS_COMMANDE_PAC.INDISPONIBLE, valeur: consigne, service: null };
  }
  return {
    statut: STATUTS_COMMANDE_PAC.PRETE,
    valeur: consigne,
    service: {
      domaine: "number",
      nom: "set_value",
      donnees: { entity_id: pac.setpoint_entity, value: consigne },
    },
  };
}

/**
 * Compose le libellé d'option historique attendu par le `select` ESPHome.
 *
 * Aucun état Home Assistant n'est lu ici. Une combinaison incomplète retourne
 * une chaîne vide, comme l'implémentation précédente.
 *
 * @param {string} fonctionnement `heating`, `auto` ou `cooling`.
 * @param {string} regulation `eco`, `smart` ou `boost`.
 * @returns {string}
 */
export function composerOptionModePac(fonctionnement, regulation) {
  if (fonctionnement === FONCTIONNEMENTS_PAC.AUTOMATIQUE) return "Auto (heat & cool)";
  const operation = fonctionnement === FONCTIONNEMENTS_PAC.FROID
    ? "Cooling"
    : fonctionnement === FONCTIONNEMENTS_PAC.CHAUFFAGE ? "Heating" : "";
  const profil = {
    [REGULATIONS_PAC.ECO]: "Eco",
    [REGULATIONS_PAC.SMART]: "Smart",
    [REGULATIONS_PAC.BOOST]: "Boost",
  }[regulation] || "";
  return operation && profil ? `${operation} + ${profil}` : "";
}

/**
 * Résout l'option réelle d'un `select` PAC à partir de ses options déjà lues.
 *
 * La recherche reproduit l'ordre historique : correspondance complète, repli
 * spécifique Auto, puis valeur composée. La fonction ne lit aucune entité.
 *
 * @param {string} fonctionnement Fonctionnement demandé.
 * @param {string} regulation Régulation demandée.
 * @param {unknown} optionsSelect Options de l'entité `select`, si disponibles.
 * @returns {string}
 */
export function resoudreOptionModePac(fonctionnement, regulation, optionsSelect) {
  const options = Array.isArray(optionsSelect) ? optionsSelect : [];
  if (!options.length) return composerOptionModePac(fonctionnement, regulation);
  const cibles = fonctionnement === FONCTIONNEMENTS_PAC.AUTOMATIQUE
    ? [FONCTIONNEMENTS_PAC.AUTOMATIQUE]
    : [fonctionnement === FONCTIONNEMENTS_PAC.FROID ? FONCTIONNEMENTS_PAC.FROID : FONCTIONNEMENTS_PAC.CHAUFFAGE, regulation];
  const correspondance = options.find((option) => {
    const normalisee = String(option).toLowerCase();
    return cibles.every((cible) => cible && normalisee.includes(cible));
  }) || (fonctionnement === FONCTIONNEMENTS_PAC.AUTOMATIQUE
    ? options.find((option) => String(option).toLowerCase().includes(FONCTIONNEMENTS_PAC.AUTOMATIQUE))
    : null);
  return correspondance || composerOptionModePac(fonctionnement, regulation);
}

/**
 * Construit une commande de changement de mode PAC sans l'exécuter.
 *
 * Le verrou est évalué avant la résolution d'option afin que la branche
 * verrouillée reste indépendante des données Home Assistant, comme auparavant.
 *
 * @param {object} configurationPac Bloc `_rc27Control.pac` déjà normalisé.
 * @param {string} fonctionnement Fonctionnement demandé.
 * @param {string} regulation Régulation demandée.
 * @param {unknown} optionsSelect Options déjà lues de l'entité mode.
 * @returns {{statut:string, option:string, service:null|{domaine:string,nom:string,donnees:object}}}
 */
export function preparerCommandeModePac(configurationPac, fonctionnement, regulation, optionsSelect) {
  const pac = configurationPacOuVide(configurationPac);
  if (commandePacEstVerrouillee(pac)) {
    return { statut: STATUTS_COMMANDE_PAC.VERROUILLEE, option: "", service: null };
  }
  const option = resoudreOptionModePac(fonctionnement, regulation, optionsSelect);
  if (!pac.mode_entity || !option) {
    return { statut: STATUTS_COMMANDE_PAC.INDISPONIBLE, option, service: null };
  }
  return {
    statut: STATUTS_COMMANDE_PAC.PRETE,
    option,
    service: {
      domaine: "select",
      nom: "select_option",
      donnees: { entity_id: pac.mode_entity, option },
    },
  };
}

/**
 * Retourne les bornes du cadran et le pas effectif de l'entité number.
 *
 * Les bornes 8–32 °C restent volontairement celles du comportement validé ;
 * seuls les pas strictement positifs de l'entité remplacent 0,5 °C.
 *
 * @param {unknown} pasEntite Attribut `step` déjà lu de l'entité de consigne.
 * @returns {{min:number,max:number,step:number}}
 */
export function calculerLimitesConsignePac(pasEntite) {
  const pas = Number(pasEntite);
  return {
    min: BORNES_CONSIGNE_PAC.MINIMUM_C,
    max: BORNES_CONSIGNE_PAC.MAXIMUM_C,
    step: Number.isFinite(pas) && pas > 0 ? pas : BORNES_CONSIGNE_PAC.PAS_PAR_DEFAUT_C,
  };
}

/**
 * Choisit la valeur affichée par le cadran selon la priorité historique.
 *
 * Priorité : brouillon utilisateur > consigne réelle d'une PAC configurée >
 * simulation locale > valeur de présentation 28,5 °C.
 *
 * @param {{brouillon?:unknown,pacConfiguree?:boolean,consigne?:unknown,simulation?:unknown}} entree
 * @returns {number}
 */
export function choisirValeurAfficheeConsignePac({ brouillon, pacConfiguree, consigne, simulation } = {}) {
  if (Number.isFinite(brouillon)) return brouillon;
  if (pacConfiguree && Number.isFinite(consigne)) return consigne;
  if (Number.isFinite(simulation)) return simulation;
  return 28.5;
}

/**
 * Calcule la géométrie SVG/CSS historique du cadran de consigne.
 *
 * Ne touche jamais au DOM : la fonction retourne uniquement ratio, progression,
 * angle et coordonnées du bouton sur l'anneau.
 *
 * @param {unknown} valeur Valeur à projeter.
 * @param {{min:number,max:number}} limites Bornes du cadran.
 * @returns {{ratio:number,progress:number,angle:number,x:number,y:number}}
 */
export function calculerGeometrieCadranPac(valeur, limites) {
  const { min, max } = limites;
  const sure = Number.isFinite(Number(valeur)) ? Number(valeur) : min;
  const ratio = Math.max(0, Math.min(1, (sure - min) / (max - min)));
  const depart = 220;
  const amplitude = 280;
  const angle = depart + ratio * amplitude;
  const radians = angle * Math.PI / 180;
  const rayon = 42;
  return {
    ratio,
    progress: ratio * 77.8,
    angle,
    x: 50 + rayon * Math.sin(radians),
    y: 50 - rayon * Math.cos(radians),
  };
}

/**
 * Convertit une position de pointeur en consigne, avec le même snap historique.
 *
 * Une géométrie absente ou nulle retourne `null`. Les positions hors de l'arc
 * sont rabattues vers l'extrémité la plus proche avant application du pas.
 *
 * @param {{clientX:unknown,clientY:unknown,rect:object|null|undefined,limites:{min:number,max:number,step:number}}} entree
 * @returns {number|null}
 */
export function calculerConsigneDepuisPointeurPac({ clientX, clientY, rect, limites } = {}) {
  if (!rect || !rect.width || !rect.height) return null;
  const centreX = rect.left + rect.width / 2;
  const centreY = rect.top + rect.height / 2;
  const deltaX = clientX - centreX;
  const deltaY = clientY - centreY;
  let angle = Math.atan2(deltaX, -deltaY) * 180 / Math.PI;
  if (angle < 0) angle += 360;

  const depart = 220;
  const fin = 500;
  let etendu = angle;
  if (etendu < depart) etendu += 360;
  if (etendu > fin) {
    const distanceCirculaire = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
    etendu = distanceCirculaire(angle, depart % 360) <= distanceCirculaire(angle, fin % 360)
      ? depart
      : fin;
  }

  const { min, max, step } = limites;
  const ratio = Math.max(0, Math.min(1, (etendu - depart) / (fin - depart)));
  const brute = min + ratio * (max - min);
  const arrondie = Math.round(brute / step) * step;
  return Math.max(min, Math.min(max, Number(arrondie.toFixed(2))));
}
