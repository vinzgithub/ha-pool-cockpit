/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { PROFILS_SAISONNIERS } from "../../moteur/saisons.js";
import { lireProlongationPonctuelle } from "../../programmation/prolongation.js";
import { construireModeleAssistantExpert } from "./assistant-expert.js";

/**
 * Adaptateur entre les calculs déjà réalisés par le dashboard et le modèle
 * d'affichage de l'Assistant Expert.
 *
 * Ce fichier ne décide rien : il ne recalcule ni une recommandation adaptative,
 * ni un seuil de traitement, ni une consigne PAC. Il assemble uniquement des
 * valeurs déjà obtenues par les moteurs historiques puis les transmet à
 * `construireModeleAssistantExpert()`.
 *
 * RÈGLE FILT-004 : une durée de filtration reste une recommandation indicative.
 * RÈGLES PROG-001/002/003 : la source de programmation reçue est seulement
 * décrite ; cet adaptateur ne change jamais la priorité effective.
 * RÈGLE PAC-001 : l'état du verrou PAC reçu est seulement affiché ; ce module ne
 * peut pas activer les écritures.
 * RÈGLE SEC-000 : aucun accès Home Assistant et aucun appel de service ou
 * WebSocket HA n'est effectué ici.
 */

/**
 * Construit le libellé lisible des plages de filtration déjà configurées.
 *
 * Les deux fonctions de calcul sont injectées afin de réutiliser exactement les
 * règles historiques du dashboard au lieu de dupliquer le calcul des durées.
 * Cette fonction ne modifie aucune plage et ne persiste rien.
 *
 * @param {Array<object>} [periodes=[]] Plages déjà normalisées.
 * @param {object} dependances Fonctions historiques de calcul des horaires.
 * @param {function(Array<object>):number} dependances.calculerHeuresProgramme
 * Calcule le nombre total d'heures planifiées.
 * @param {function(object):number} dependances.calculerMinutesPlage
 * Calcule la durée d'une plage en minutes.
 * @returns {string} `24 h/24`, les plages actives ou `Aucune plage`.
 *
 * @example
 * construireLibellePlagesAssistantExpert(
 *   [{ enabled: true, start: "08:30", end: "21:30" }],
 *   { calculerHeuresProgramme, calculerMinutesPlage },
 * );
 * // => "08:30 → 21:30"
 */
export function construireLibellePlagesAssistantExpert(
  periodes = [],
  { calculerHeuresProgramme, calculerMinutesPlage } = {},
) {
  const heures = calculerHeuresProgramme(periodes);
  if (heures >= 23.98) return "24 h/24";
  const actives = (periodes || []).filter(
    (periode) => periode?.enabled && calculerMinutesPlage(periode) > 0,
  );
  return actives.length
    ? actives.map((periode) => `${periode.start} → ${periode.end}`).join(" + ")
    : "Aucune plage";
}

/**
 * Assemble le modèle de l'Assistant Expert à partir de données déjà calculées.
 *
 * Cette fonction reproduit l'ancien pont `rc30AssistantExpertModel()` sans
 * réévaluer les moteurs métier. En particulier, `adaptiveRecommendation` doit
 * déjà avoir été calculée une seule fois par le rendu principal ; elle n'est
 * jamais recalculée ici.
 *
 * Les dépendances de formatage/calcul encore historiques sont explicites afin
 * d'éviter toute duplication pendant ce refactor progressif. Une dépendance
 * absente provoque la même erreur de programmation qu'auparavant : aucun repli
 * silencieux n'est inventé.
 *
 * Cette fonction ne modifie aucun état, ne lit pas le DOM, ne connaît pas
 * Home Assistant et n'exécute aucune commande.
 *
 * @param {object} donnees Valeurs déjà calculées par le dashboard.
 * @param {object} donnees.controle Configuration déjà normalisée.
 * @param {object} donnees.profilsSaisonniers Profils saisonniers déjà normalisés.
 * @param {object} donnees.agregation Résultat consolidé des mesures.
 * @param {object} donnees.etatIntelligent État intelligent déjà calculé.
 * @param {number} donnees.confiance Confiance déjà calculée.
 * @param {Array<object>} donnees.comparaisons Comparaisons analyseurs existantes.
 * @param {object} donnees.metaComparaison Métadonnées de comparaison existantes.
 * @param {object} donnees.meteo Météo déjà lue par le dashboard.
 * @param {object} donnees.alerteMeteo Vigilance déjà calculée.
 * @param {object} donnees.modeleTraitement Modèle traitement déjà calculé.
 * @param {object} donnees.recommandationAdaptative Recommandation déjà calculée.
 * @param {Array<string>} [donnees.conseilsIntelligents=[]] Conclusions déjà calculées.
 * @param {number|null} donnees.temperatureAirC Température extérieure déjà résolue.
 * @param {string} donnees.libelleConditionMeteo Libellé météo déjà résolu.
 * @param {object} donnees.modelePac Modèle PAC déjà calculé.
 * @param {function(number):string} donnees.formaterHeures Formateur historique.
 * @param {function(Array<object>):number} donnees.calculerHeuresProgramme
 * Calcul historique de durée des plages.
 * @param {function(object):number} donnees.calculerMinutesPlage
 * Calcul historique d'une plage.
 * @returns {object} Modèle prêt à être rendu par `creerHtmlAssistantExpert()`.
 *
 * @example
 * construireModeleAssistantExpertDepuisDonnees({
 *   controle,
 *   profilsSaisonniers,
 *   agregation,
 *   etatIntelligent,
 *   confiance: 88,
 *   comparaisons: [],
 *   metaComparaison: {},
 *   meteo,
 *   alerteMeteo,
 *   modeleTraitement,
 *   recommandationAdaptative,
 *   temperatureAirC: 17.5,
 *   libelleConditionMeteo: "Partiellement nuageux",
 *   modelePac,
 *   formaterHeures,
 *   calculerHeuresProgramme,
 *   calculerMinutesPlage,
 * });
 */
export function construireModeleAssistantExpertDepuisDonnees(donnees = {}) {
  const {
    controle,
    profilsSaisonniers,
    agregation,
    etatIntelligent,
    confiance,
    comparaisons,
    metaComparaison,
    meteo,
    alerteMeteo,
    modeleTraitement,
    recommandationAdaptative,
    conseilsIntelligents = [],
    temperatureAirC,
    libelleConditionMeteo,
    modelePac,
    formaterHeures,
    calculerHeuresProgramme,
    calculerMinutesPlage,
  } = donnees;

  // La recommandation adaptative est fournie par le render principal.
  // Elle n'est volontairement jamais recalculée dans l'Assistant Expert.
  const adaptatif = recommandationAdaptative || {};
  const heuresPompe = calculerHeuresProgramme(controle.pump?.periods || []);
  const prolongationPonctuelle = lireProlongationPonctuelle(
    controle.pump?.extension || {},
  );
  const libelleProlongation = prolongationPonctuelle.validee
    ? `Prolongation ponctuelle validée : +${formaterHeures(prolongationPonctuelle.minutes / 60)}`
    : prolongationPonctuelle.ignoree
      ? "Prolongation ponctuelle ignorée aujourd'hui"
      : "Aucune prolongation ponctuelle active";

  const configurationPac = controle.pac || {};
  const defautPac = modelePac.fault || modelePac.compressorFaultCode || "";
  const vigilance = alerteMeteo?.active
    ? `Vigilance ${alerteMeteo.levelLabel}${
        alerteMeteo.alerts?.length
          ? ` · ${alerteMeteo.alerts.map((alerte) => alerte.label).join(" · ")}`
          : ""
      }`
    : alerteMeteo?.available
      ? "Aucune vigilance"
      : "Vigilance indisponible";

  const ecartsComparaison = (comparaisons || []).map((ligne) => ({
    metrique: ligne.metric || "",
    libelle: ligne.label || ligne.metric || "Mesure",
    valeur: ligne.delta,
    unite: ligne.unit || "",
    statut: ligne.statusLabel || "",
  }));

  const profilReference =
    PROFILS_SAISONNIERS[profilsSaisonniers.current]?.label || "—";
  const saisonAstronomique = adaptatif.seasonInfo?.libelle || "—";
  const conclusions = [
    etatIntelligent.message,
    ...conseilsIntelligents,
    modeleTraitement.filtrationAdvice,
    adaptatif.context,
  ].filter(Boolean);

  return construireModeleAssistantExpert({
    general: {
      libelle: etatIntelligent.label,
      message: etatIntelligent.message,
      score: agregation.result?.score,
      suspendu: Boolean(agregation.result?.suspended),
    },
    eau: {
      temperature: agregation.temperature?.number,
      ph: agregation.ph?.number,
      orp: agregation.orp?.number,
      confiance,
    },
    meteo: {
      disponible: Boolean(meteo.available),
      temperature: meteo.available ? temperatureAirC : null,
      condition: meteo.available ? libelleConditionMeteo : "Indisponible",
      vigilance,
    },
    comparaison: {
      etat: metaComparaison.state,
      detail: metaComparaison.detail,
      sourceA: metaComparaison.a?.name || "",
      sourceB: metaComparaison.b?.name || "",
      ecartMinutes: metaComparaison.timeGapMinutes,
      ecarts: ecartsComparaison,
    },
    filtration: {
      source: profilsSaisonniers.source,
      horaireCourant: construireLibellePlagesAssistantExpert(
        controle.pump?.periods || [],
        { calculerHeuresProgramme, calculerMinutesPlage },
      ),
      heuresCourantes: heuresPompe,
      horaireRecommande: adaptatif.scheduleLabel || "—",
      heuresRecommandees: adaptatif.hours,
      plancherHydraulique: adaptatif.hydraulicHours,
      saisonAstronomique,
      profilReference,
      contexte: adaptatif.context || "—",
      prolongation: libelleProlongation,
    },
    traitement: {
      resume: modeleTraitement.summary,
      confiance: modeleTraitement.confidence?.label || "—",
    },
    pac: {
      configuree: modelePac.configured,
      etat:
        modelePac.on === true
          ? "En marche"
          : modelePac.on === false
            ? "À l'arrêt"
            : "État indisponible",
      consigne: modelePac.setpoint,
      entree: modelePac.inlet,
      sortie: modelePac.outlet,
      communication: modelePac.communication || "—",
      defaut: defautPac || "Aucun défaut signalé",
      ecrituresVerrouillees: !configurationPac.write_enabled,
    },
    conclusions,
  });
}
