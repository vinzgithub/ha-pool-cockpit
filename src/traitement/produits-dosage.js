/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Catalogue vérifié et calculs purs de dosage des produits de traitement.
 *
 * Ce module extrait les données produit et les formules historiques de dosage
 * sans décider si un traitement doit être effectué. Les décisions de contexte
 * (pH acceptable, eau verte/trouble, délai depuis la dernière dose, etc.)
 * restent dans le moteur de traitement existant pendant cette étape.
 *
 * RÈGLE TRAIT-001 : le mode « ponctuel / urgence » est la valeur par défaut.
 * Les produits complémentaires peuvent y afficher leurs doses de référence,
 * mais aucun rappel hebdomadaire ni bouton de confirmation automatique ne doit
 * en découler. Le protocole fabricant hebdomadaire exige un choix explicite.
 *
 * RÈGLE SEC-000 : ce fichier ne connaît ni Home Assistant, ni le DOM, ni le
 * stockage. Il calcule et normalise uniquement des données en mémoire.
 */

/** Valeurs persistées du choix d'usage des produits complémentaires. */
export const MODES_PRODUITS_COMPLEMENTAIRES = Object.freeze({
  PONCTUEL_URGENCE: "on_demand",
  PROTOCOLE_FABRICANT: "manufacturer_schedule",
});

/**
 * Catalogue historique des produits connus par le dashboard.
 *
 * Les clés techniques et toutes les valeurs sont conservées à l'identique afin
 * de rester compatibles avec les profils déjà persistés. Ce catalogue décrit
 * les contre-étiquettes ; il ne constitue jamais, à lui seul, une recommandation
 * d'ajout.
 */
export const CATALOGUE_PRODUITS_TRAITEMENT = {
  bayrol_ph_plus:{label:"Bayrol pH-Plus",kind:"ph_plus",dosePer10m3Per01:100,unit:"g",verified:true},
  bayrol_ph_minus:{label:"Bayrol pH-Minus",kind:"ph_minus",dosePer10m3Per01:100,unit:"g",verified:true},
  axton_ph_plus_powder:{label:"AXTON pH+ poudre",kind:"ph_plus",dosePer10m3Per01:100,unit:"g",verified:true,source:"Contre-étiquette AXTON fournie",note:"100 g/10 m³ pour relever le pH de 0,1 · vérifié sur la contre-étiquette."},
  axton_ph_minus_liquid:{label:"AXTON pH− liquide 14 %",kind:"ph_minus",dosePer10m3Per01:300,unit:"ml",verified:true,source:"Contre-étiquette fournie",application:"dosing_pump",safety:"Prêt à l’emploi : injection par pompe doseuse, ne jamais diluer."},
  sunval_bromine_activator:{label:"Sunval Activateur de brome",kind:"bromine_activator",weeklyPer10m3:100,shockPer10m3:250,unit:"g",verified:true,source:"Contre-étiquette fournie",targetPhMin:7.2,targetPhMax:7.4,targetBromineMin:1,targetBromineMax:2,note:"Entretien hebdomadaire 100 g/10 m³ ; choc 250 g/10 m³. Filtration en marche."},
  bayrol_desalgin_classic:{label:"Bayrol Desalgin Classic",kind:"algaecide",weeklyPer10m3:50,unit:"ml",verified:true,source:"Contre-étiquette fournie",note:"Anti-algues préventif : 50 ml/10 m³ par semaine."},
  piscimar_grease_killer:{label:"Piscimar Grease Killer PM-620",kind:"degreaser",initialPer100m3:750,weeklyPer100m3:350,unit:"ml",verified:true,source:"Contre-étiquette fournie",maxChlorinePpm:1.5,maxBrominePpm:3,filtrationHours:8,note:"Agiter, répartir dans le bassin puis filtrer 8 h. Vérifier le désinfectant avant utilisation."},
  custom_ph_plus:{label:"pH+ personnalisé",kind:"ph_plus",verified:false},
  custom_ph_minus:{label:"pH- personnalisé",kind:"ph_minus",verified:false},
  custom_sanitizer:{label:"Produit personnalisé",kind:"sanitizer",verified:false}
};

/**
 * Convertit une valeur en nombre fini avec le repli historique.
 *
 * Les chaînes vides, `null` et `undefined` utilisent directement le repli. La
 * fonction ne borne pas la valeur et ne modifie aucun état.
 *
 * @param {unknown} valeur Valeur à convertir.
 * @param {number|null} [repli=null] Valeur retournée si la conversion échoue.
 * @returns {number|null}
 */
export function lireNombreTraitement(valeur, repli = null) {
  if (valeur === "" || valeur === null || valeur === undefined) return repli;
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : repli;
}

/**
 * Borne un nombre entre deux limites, sans autre transformation.
 *
 * @param {number} valeur Nombre à borner.
 * @param {number} minimum Borne basse incluse.
 * @param {number} maximum Borne haute incluse.
 * @returns {number}
 */
export function bornerNombreTraitement(valeur, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, valeur));
}

/**
 * Arrondit une dose au multiple de 5 historique, avec plancher à zéro.
 *
 * @param {number} valeur Dose brute.
 * @returns {number} Dose arrondie comme dans la référence validée.
 *
 * @example
 * arrondirDoseTraitement(156); // => 155
 */
export function arrondirDoseTraitement(valeur) {
  return Math.max(0, Math.round(valeur / 5) * 5);
}

/**
 * Calcule une dose étiquetée « par 10 m³ » pour le volume réel.
 *
 * La formule et l'arrondi sont strictement ceux du code historique. La fonction
 * n'évalue jamais si le produit doit être utilisé.
 *
 * @param {number} tauxPar10m3 Dose de l'étiquette pour 10 m³.
 * @param {number} volumeM3 Volume du bassin en m³.
 * @returns {number}
 */
export function calculerDosePar10m3(tauxPar10m3, volumeM3) {
  return arrondirDoseTraitement(tauxPar10m3 * volumeM3 / 10);
}

/**
 * Calcule une dose étiquetée « par 100 m³ » pour le volume réel.
 *
 * @param {number} tauxPar100m3 Dose de l'étiquette pour 100 m³.
 * @param {number} volumeM3 Volume du bassin en m³.
 * @returns {number}
 */
export function calculerDosePar100m3(tauxPar100m3, volumeM3) {
  return arrondirDoseTraitement(tauxPar100m3 * volumeM3 / 100);
}

/**
 * Normalise uniquement les champs liés au choix des produits et à leurs doses.
 *
 * Cette fonction reproduit les replis et bornes historiques. Elle ne normalise
 * ni le filtre, ni la pompe, ni le doseur, ni les mesures du bassin.
 *
 * @param {object} profil Profil déjà fusionné avec les valeurs par défaut.
 * @returns {object} Champs produit normalisés.
 */
export function normaliserConfigurationProduitsTraitement(profil = {}) {
  return {
    ph_plus_product: CATALOGUE_PRODUITS_TRAITEMENT[profil.ph_plus_product]?.kind === "ph_plus" ? profil.ph_plus_product : "bayrol_ph_plus",
    ph_minus_product: CATALOGUE_PRODUITS_TRAITEMENT[profil.ph_minus_product]?.kind === "ph_minus" ? profil.ph_minus_product : "bayrol_ph_minus",
    sanitizer_product: ["bromine_activator", "sanitizer"].includes(CATALOGUE_PRODUITS_TRAITEMENT[profil.sanitizer_product]?.kind) ? profil.sanitizer_product : "custom_sanitizer",
    algaecide_product: profil.algaecide_product === "bayrol_desalgin_classic" ? profil.algaecide_product : "none",
    degreaser_product: profil.degreaser_product === "piscimar_grease_killer" ? profil.degreaser_product : "none",
    supplemental_products_mode: [MODES_PRODUITS_COMPLEMENTAIRES.PONCTUEL_URGENCE, MODES_PRODUITS_COMPLEMENTAIRES.PROTOCOLE_FABRICANT].includes(profil.supplemental_products_mode)
      ? profil.supplemental_products_mode
      : MODES_PRODUITS_COMPLEMENTAIRES.PONCTUEL_URGENCE,
    custom_ph_plus_rate: bornerNombreTraitement(lireNombreTraitement(profil.custom_ph_plus_rate, 100), 1, 5000),
    custom_ph_minus_rate: bornerNombreTraitement(lireNombreTraitement(profil.custom_ph_minus_rate, 100), 1, 5000),
    custom_ph_plus_unit: ["g", "ml"].includes(profil.custom_ph_plus_unit) ? profil.custom_ph_plus_unit : "g",
    custom_ph_minus_unit: ["g", "ml"].includes(profil.custom_ph_minus_unit) ? profil.custom_ph_minus_unit : "g",
    custom_weekly_rate: bornerNombreTraitement(lireNombreTraitement(profil.custom_weekly_rate, 100), 1, 5000),
    custom_shock_rate: bornerNombreTraitement(lireNombreTraitement(profil.custom_shock_rate, 250), 1, 10000),
  };
}

/**
 * Prépare les données de correction pH pour un seul palier de 0,1.
 *
 * Le produit, son nom, son unité et son taux sont résolus comme dans le code
 * historique. La dose est calculée même si l'appelant décide ensuite de ne pas
 * corriger le pH ; cette fonction ne prend aucune décision de traitement.
 *
 * @param {object} profil Profil de traitement normalisé.
 * @param {"plus"|"minus"} sens Sens de correction.
 * @param {number} volumeM3 Volume du bassin.
 * @returns {{produit:object,nom:string,taux:number,unite:string,dose:number}}
 */
export function preparerDosageCorrectionPh(profil, sens, volumeM3) {
  const plus = sens === "plus";
  const identifiant = plus ? profil.ph_plus_product : profil.ph_minus_product;
  const produitParDefaut = plus ? CATALOGUE_PRODUITS_TRAITEMENT.bayrol_ph_plus : CATALOGUE_PRODUITS_TRAITEMENT.bayrol_ph_minus;
  const produit = CATALOGUE_PRODUITS_TRAITEMENT[identifiant] || produitParDefaut;
  const taux = produit.verified
    ? produit.dosePer10m3Per01
    : plus ? profil.custom_ph_plus_rate : profil.custom_ph_minus_rate;
  const unite = produit.verified
    ? (produit.unit || "g")
    : plus ? profil.custom_ph_plus_unit : profil.custom_ph_minus_unit;
  const nom = produit.verified
    ? produit.label
    : ((plus ? profil.custom_ph_plus_name : profil.custom_ph_minus_name) || produit.label);
  return { produit, nom, taux, unite, dose: calculerDosePar10m3(taux, volumeM3) };
}

/**
 * Prépare les deux repères de dose du produit désinfectant au brome.
 *
 * Pour le produit Sunval vérifié, les taux 100/250 g par 10 m³ sont lus dans le
 * catalogue. Pour un produit personnalisé, les taux persistés sont conservés.
 * La fonction ne décide ni du rappel hebdomadaire ni du traitement choc.
 *
 * @param {object} profil Profil de traitement normalisé.
 * @param {number} volumeM3 Volume du bassin.
 * @returns {{produit:object,nom:string,tauxHebdomadaire:number,tauxChoc:number,doseHebdomadaire:number,doseChoc:number}}
 */
export function preparerDosageDesinfectantBrome(profil, volumeM3) {
  const produit = CATALOGUE_PRODUITS_TRAITEMENT[profil.sanitizer_product] || CATALOGUE_PRODUITS_TRAITEMENT.custom_sanitizer;
  const nom = produit.verified ? produit.label : (profil.custom_sanitizer_name || produit.label);
  const tauxHebdomadaire = produit.kind === "bromine_activator" ? produit.weeklyPer10m3 : profil.custom_weekly_rate;
  const tauxChoc = produit.kind === "bromine_activator" ? produit.shockPer10m3 : profil.custom_shock_rate;
  return {
    produit,
    nom,
    tauxHebdomadaire,
    tauxChoc,
    doseHebdomadaire: calculerDosePar10m3(tauxHebdomadaire, volumeM3),
    doseChoc: calculerDosePar10m3(tauxChoc, volumeM3),
  };
}

/**
 * Retourne la dose hebdomadaire de Desalgin Classic pour un volume donné.
 *
 * @param {number} volumeM3 Volume du bassin.
 * @returns {number} Dose en ml, arrondie au multiple de 5 historique.
 */
export function calculerDoseDesalginClassic(volumeM3) {
  return calculerDosePar10m3(CATALOGUE_PRODUITS_TRAITEMENT.bayrol_desalgin_classic.weeklyPer10m3, volumeM3);
}

/**
 * Prépare les doses et la limite de désinfectant de Grease Killer.
 *
 * L'ORP n'est jamais utilisé ici : la compatibilité dépend uniquement de la
 * mesure dédiée de brome/chlore fournie par l'appelant, conformément au
 * comportement validé.
 *
 * @param {object} entree Données nécessaires au calcul.
 * @param {number} entree.volumeM3 Volume du bassin.
 * @param {boolean} entree.brome `true` pour utiliser la limite brome.
 * @param {number|null} entree.niveauDesinfectant Mesure dédiée déjà normalisée.
 * @returns {{produit:object,doseInitiale:number,doseHebdomadaire:number,limite:number,mesureCompatible:boolean}}
 */
export function preparerDosageGreaseKiller({ volumeM3, brome, niveauDesinfectant } = {}) {
  const produit = CATALOGUE_PRODUITS_TRAITEMENT.piscimar_grease_killer;
  const limite = brome ? produit.maxBrominePpm : produit.maxChlorinePpm;
  return {
    produit,
    doseInitiale: calculerDosePar100m3(produit.initialPer100m3, volumeM3),
    doseHebdomadaire: calculerDosePar100m3(produit.weeklyPer100m3, volumeM3),
    limite,
    mesureCompatible: niveauDesinfectant !== null && niveauDesinfectant <= limite,
  };
}

/**
 * Indique si l'utilisateur a explicitement choisi les rappels fabricant.
 *
 * RÈGLE TRAIT-001 : toute autre valeur, notamment le défaut `on_demand`, reste
 * en usage ponctuel / urgence et ne doit pas produire de rappel hebdomadaire.
 *
 * @param {unknown} mode Valeur persistée du mode complémentaire.
 * @returns {boolean}
 */
export function protocoleFabricantHebdomadaireActif(mode) {
  return mode === MODES_PRODUITS_COMPLEMENTAIRES.PROTOCOLE_FABRICANT;
}
