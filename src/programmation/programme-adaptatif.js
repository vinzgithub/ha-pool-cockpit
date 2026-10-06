/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { detecterSaison } from "../intelligence/saisons/detecter-saison.js";

/**
 * Moteur pur de construction du programme adaptatif de filtration.
 *
 * RÈGLE FILT-004 : la durée calculée reste une recommandation indicative.
 * RÈGLE FILT-006 : ce module construit uniquement les plages correspondant à
 * la recommandation déjà calculée ; il n'ajoute aucune prolongation one-shot.
 * RÈGLES PROG-001/002/003 : ce module ne décide jamais de la priorité entre
 * personnalisé, adaptatif et suspendu. Il reçoit le profil déjà normalisé et
 * ne modifie aucun état persistant.
 * SEC-000 : aucun accès Home Assistant, DOM, navigateur ou stockage.
 */

const JOURS_SEMAINE_HISTORIQUES = Object.freeze([
  "mon", "tue", "wed", "thu", "fri", "sat", "sun",
]);

function clonerJson(valeur) {
  return valeur === undefined ? undefined : JSON.parse(JSON.stringify(valeur));
}

/**
 * Convertit une heure `HH:MM` en minutes depuis minuit avec les mêmes replis
 * historiques que le template v3.0.0.
 *
 * Ne modifie aucun état et ne commande rien. Une valeur absente est traitée
 * comme `00:00`; les composantes sont bornées au total entre 0 et 1439.
 *
 * @param {unknown} valeur Heure à convertir.
 * @returns {number} Nombre de minutes borné entre 0 et 1439.
 * @example convertirHeureEnMinutes("08:30") // 510
 */
export function convertirHeureEnMinutes(valeur) {
  const [heures, minutes] = String(valeur || "00:00").split(":").map(Number);
  return Math.max(0, Math.min(1439, (heures || 0) * 60 + (minutes || 0)));
}

/**
 * Formate un nombre de minutes sous la forme `HH:MM`, avec bouclage sur 24 h.
 *
 * Ne modifie aucun état et ne commande rien. Cette fonction conserve
 * volontairement le comportement historique pour les entrées atypiques.
 *
 * @param {unknown} valeur Minutes à formater.
 * @returns {string} Heure `HH:MM`.
 * @example formaterMinutesHorloge(1350) // "22:30"
 */
export function formaterMinutesHorloge(valeur) {
  const minutes = ((Math.round(valeur) % 1440) + 1440) % 1440;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/**
 * Calcule la durée d'une plage horaire activée, y compris lorsqu'elle traverse
 * minuit.
 *
 * Ne modifie aucun état et ne commande rien. Une plage désactivée ou dont le
 * début est égal à la fin vaut zéro minute, comme dans la référence v3.0.0.
 *
 * @param {{enabled?:unknown,start?:unknown,end?:unknown}|null|undefined} plage
 * @returns {number} Durée en minutes entre 0 et 1439.
 * @example calculerMinutesPlage({enabled:true,start:"22:00",end:"02:00"}) // 240
 */
export function calculerMinutesPlage(plage) {
  if (!plage?.enabled) return 0;
  const debut = convertirHeureEnMinutes(plage.start);
  const fin = convertirHeureEnMinutes(plage.end);
  return debut === fin ? 0 : fin > debut ? fin - debut : 1440 - debut + fin;
}

/**
 * Additionne les plages d'un programme et borne le total à 24 heures.
 *
 * Ne modifie aucun état et ne commande rien. Une liste absente est traitée
 * comme une liste vide.
 *
 * @param {Array<object>|null|undefined} plages
 * @returns {number} Durée totale en heures, bornée à 24.
 * @example calculerHeuresProgramme([{enabled:true,start:"08:00",end:"10:30"}]) // 2.5
 */
export function calculerHeuresProgramme(plages) {
  return Math.min(
    24,
    (plages || []).reduce((somme, plage) => somme + calculerMinutesPlage(plage), 0) / 60,
  );
}

/**
 * Détermine l'heure de départ de référence d'un profil saisonnier.
 *
 * La première plage activée et non vide est utilisée. En l'absence d'une telle
 * plage, le repli historique est 08:00. Cette fonction ne commande rien.
 *
 * @param {Array<object>} [plages=[]]
 * @returns {number} Début de référence en minutes depuis minuit.
 * @example determinerDebutProfil([{enabled:true,start:"11:00",end:"16:00"}]) // 660
 */
export function determinerDebutProfil(plages = []) {
  const plage = plages.find((element) => element?.enabled && calculerMinutesPlage(element) > 0);
  return plage ? convertirHeureEnMinutes(plage.start) : 8 * 60;
}

/**
 * Construit les trois plages persistées correspondant à une durée adaptative.
 *
 * Une recommandation quasi 24 h est représentée par les deux plages historiques
 * `00:00→12:00` puis `12:00→00:00`. Une durée nulle désactive les trois plages.
 * La fonction ne modifie aucun état et n'exécute aucune commande.
 *
 * @param {unknown} heures Durée recommandée en heures.
 * @param {unknown} debutReference Début souhaité en minutes depuis minuit.
 * @returns {Array<{enabled:boolean,start:string,end:string}>} Trois plages.
 * @example construirePlagesAdaptatives(14, 510)[0] // 08:30 → 22:30
 */
export function construirePlagesAdaptatives(heures, debutReference) {
  const total = Math.max(0, Math.min(1440, Math.round(Number(heures || 0) * 60)));
  if (total >= 1439) {
    return [
      { enabled: true, start: "00:00", end: "12:00" },
      { enabled: true, start: "12:00", end: "00:00" },
      { enabled: false, start: "00:00", end: "00:00" },
    ];
  }
  if (total <= 0) {
    return [
      { enabled: false, start: "00:00", end: "00:00" },
      { enabled: false, start: "00:00", end: "00:00" },
      { enabled: false, start: "00:00", end: "00:00" },
    ];
  }
  const debut = ((Math.round(debutReference) % 1440) + 1440) % 1440;
  const fin = (debut + total) % 1440;
  return [
    { enabled: true, start: formaterMinutesHorloge(debut), end: formaterMinutesHorloge(fin) },
    { enabled: false, start: "00:00", end: "00:00" },
    { enabled: false, start: "00:00", end: "00:00" },
  ];
}

/**
 * Construit la recommandation de programmation adaptative à partir de données
 * déjà lues et normalisées par le dashboard.
 *
 * Cette fonction ne lit jamais Home Assistant, le DOM, `window` ou le stockage.
 * Elle ne choisit pas si l'adaptatif est autorisé à reprendre la main : cette
 * décision reste dans le moteur de priorités et dans les actions explicites de
 * l'utilisateur. Elle ne crée pas non plus de prolongation one-shot.
 *
 * Les noms de propriétés du résultat (`astronomical`, `base`, `effective`, ...)
 * restent volontairement ceux de la référence historique afin de conserver le
 * contrat interne du bundle sans migration.
 *
 * @param {object} parametres
 * @param {object} parametres.profilsSaisonniers Profils déjà normalisés.
 * @param {string} parametres.profilAstronomique Profil astronomique déjà déterminé.
 * @param {object|null|undefined} parametres.modele Modèle de traitement contenant éventuellement `filtrationHours`.
 * @param {unknown} parametres.heuresRecommandeesPompe Repli historique `pump.recommended_hours`.
 * @param {unknown} parametres.temperatureEau Température d'eau en °C, ou valeur non finie.
 * @param {unknown} parametres.temperatureAir Température d'air en °C, ou valeur non finie.
 * @param {object} parametres.alerteMeteo Objet d'alertes déjà lu par l'interface.
 * @param {unknown} parametres.volumeM3 Volume du bassin.
 * @param {unknown} parametres.debitM3h Débit de filtration.
 * @param {Date|string|number} [parametres.maintenant] Date injectée pour les tests; par défaut l'instant courant.
 * @returns {object} Recommandation historique prête à être affichée/appliquée.
 * @example
 * calculerRecommandationProgrammeAdaptatif({
 *   profilsSaisonniers:{follow_astronomical:false,current:"summer",profiles:{summer:{weekdays:["mon"],periods:[{enabled:true,start:"08:30",end:"21:30"}]}}},
 *   profilAstronomique:"summer", modele:{filtrationHours:14}, heuresRecommandeesPompe:0,
 *   temperatureEau:27.1, temperatureAir:24, alerteMeteo:{alerts:[]}, volumeM3:16, debitM3h:10,
 * });
 */
export function calculerRecommandationProgrammeAdaptatif({
  profilsSaisonniers,
  profilAstronomique,
  modele,
  heuresRecommandeesPompe,
  temperatureEau,
  temperatureAir,
  alerteMeteo,
  volumeM3,
  debitM3h,
  maintenant,
}) {
  const base = profilsSaisonniers.follow_astronomical
    ? profilAstronomique
    : profilsSaisonniers.current;
  // Alias historiques conservés ici : ils rendent immédiatement visibles les seuils FIX14.2 dans le bundle généré.
  const air=temperatureAir,water=temperatureEau;

  const heatAlert = alerteMeteo.alerts?.some(
    (alerte) => alerte.key === "heatwave" && alerte.severity >= 2,
  ) === true;
  const coldAlert = alerteMeteo.alerts?.some(
    (alerte) => alerte.key === "cold" && alerte.severity >= 2,
  ) === true;

  let effective = base;
  let context = "Conditions cohérentes avec la base de profil";
  if (
    base !== "maintenance"
    && (
      heatAlert
      || (Number.isFinite(air) && air>=30)
      || (Number.isFinite(water) && water>=28)
    )
  ) {
    effective = "summer";
    context = base === "summer"
      ? "Conditions estivales"
      : "Conditions estivales persistantes : placement horaire de type Été";
  } else if (
    base !== "maintenance"
    && (
      coldAlert
      || (
        Number.isFinite(air)
        && air <= 5
        && ["autumn", "winter", "spring"].includes(base)
      )
    )
  ) {
    effective = "winter";
    context = coldAlert
      ? "Alerte froid : placement horaire de type Hiver"
      : "Conditions froides : placement horaire de type Hiver";
  }

  const profilBase = profilsSaisonniers.profiles[base]
    || profilsSaisonniers.profiles[profilAstronomique];
  const profilEffectif = profilsSaisonniers.profiles[effective] || profilBase;
  const heuresRepli = Math.max(0, calculerHeuresProgramme(profilBase?.periods || []));

  let hours = Number(
    modele?.filtrationHours
    || heuresRecommandeesPompe
    || heuresRepli
    || 0,
  );
  if (!Number.isFinite(hours) || hours <= 0) hours = heuresRepli;
  if (heatAlert && Number.isFinite(water) && water>=28) hours = 24;
  if (coldAlert && base === "winter") hours = 24;
  hours = Math.max(0, Math.min(24, hours));

  const debutReference = determinerDebutProfil(profilEffectif?.periods || []);
  const periods = construirePlagesAdaptatives(hours, debutReference);
  const weekdays = clonerJson(
    profilBase?.weekdays || JOURS_SEMAINE_HISTORIQUES,
  );
  const actives = periods.filter(
    (plage) => plage.enabled && calculerMinutesPlage(plage) > 0,
  );
  const scheduleLabel = hours >= 23.98
    ? "24 h/24"
    : actives.length
      ? actives.map((plage) => `${plage.start} → ${plage.end}`).join(" + ")
      : "Aucune plage";

  const seasonInfo = detecterSaison({
    maintenant: maintenant === undefined ? new Date() : maintenant,
  });
  const volume = Number(volumeM3);
  const debit = Number(debitM3h);
  const hydraulicHours = volume > 0 && debit > 0
    ? Math.max(1, Math.ceil(volume / debit))
    : null;

  const signature = JSON.stringify({
    base,
    effective,
    hours: Math.round(hours * 60) / 60,
    weekdays,
    periods,
    water: Number.isFinite(water) ? Math.round(water * 10) / 10 : null,
    air: Number.isFinite(air) ? Math.round(air * 10) / 10 : null,
    heatAlert,
    coldAlert,
    hydraulicHours,
  });

  return {
    astronomical: profilAstronomique,
    base,
    effective,
    hours,
    periods,
    weekdays,
    scheduleLabel,
    water,
    air,
    heatAlert,
    coldAlert,
    weatherAlert: alerteMeteo,
    context,
    seasonInfo,
    signature,
    hydraulicHours,
  };
}
