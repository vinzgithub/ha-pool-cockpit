/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { construireEntreesEauMeteoDepuisHomeAssistant } from "../adaptateurs/home-assistant/construire-entrees-eau-meteo.js";
import { calculerScoreEauMeteo } from "../intelligence/eau-meteo/calculer-score-eau-meteo.js";
import { calculerConfianceCapteurs } from "../intelligence/confiance-capteurs/calculer-confiance-capteurs.js";
import { evaluerHeuresCreuses } from "../intelligence/optimisation-energetique/evaluer-heures-creuses.js";
import { detecterSaison } from "../intelligence/saisons/detecter-saison.js";
import { evaluerPac } from "../intelligence/pac/evaluer-pac.js";
import { evaluerModeLocation } from "../intelligence/mode-location/evaluer-mode-location.js";

/**
 * Contrôleur temps réel RC28.5.
 * Il orchestre adaptateur + moteur, sans DOM, sans hass.callService() et sans écriture.
 */
export function evaluerRecommandationEauMeteoTempsReel({
  actif,
  hass,
  configurationCarte,
  temperatureEauC,
  ph,
  redoxMv,
  alerteMeteo,
  observationsCapteurs = [],
  maintenant = new Date(),
} = {}) {
  if (!actif) return null;

  const entrees = construireEntreesEauMeteoDepuisHomeAssistant({
    hass,
    configurationCarte,
    temperatureEauC,
    ph,
    redoxMv,
    alerteMeteo,
  });
  const resultatMoteur = calculerScoreEauMeteo(entrees);
  const confianceCapteurs = calculerConfianceCapteurs(observationsCapteurs);
  const plagesHeuresCreuses = configurationCarte?.optimisation_energetique?.heures_creuses ?? configurationCarte?.heures_creuses ?? [];
  const optimisationEnergetique = evaluerHeuresCreuses({ plages: plagesHeuresCreuses, maintenant });
  const saison = detecterSaison({ maintenant });
  const pac = evaluerPac({ hass, identifiantEntite: configurationCarte?.pac_entity ?? configurationCarte?.heat_pump_entity });
  const modeLocation = evaluerModeLocation({ hass, configuration: configurationCarte });

  return Object.freeze({
    resultatMoteur,
    donneesUtilisees: entrees,
    confianceCapteurs,
    optimisationEnergetique,
    saison,
    pac,
    modeLocation,
    calculeA: maintenant instanceof Date ? maintenant.toISOString() : String(maintenant),
  });
}
