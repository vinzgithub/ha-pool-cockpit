/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

function convertirNiveauCanicule(alerte) {
  const cle = String(alerte?.levelKey ?? alerte?.niveau ?? "").toLowerCase();
  if (cle === "red" || cle === "rouge") return "rouge";
  if (cle === "orange") return "orange";
  if (cle === "yellow" || cle === "jaune") return "jaune";
  return "aucune";
}

function lireCouverture(hass, identifiantEntite) {
  if (!identifiantEntite) return null;
  const etat = hass?.states?.[identifiantEntite];
  if (!etat || ["unknown", "unavailable", "none", "null", ""].includes(String(etat.state).toLowerCase())) return null;
  return etat.state;
}

/**
 * Adaptateur pur entre les données déjà lues par la carte et le moteur.
 * Aucun appel de service et aucune écriture Home Assistant.
 */
export function construireEntreesEauMeteoDepuisHomeAssistant({
  hass,
  configurationCarte = {},
  temperatureEauC,
  ph,
  redoxMv,
  alerteMeteo,
} = {}) {
  return Object.freeze({
    temperatureEauC,
    ph,
    redoxMv,
    niveauCanicule: convertirNiveauCanicule(alerteMeteo),
    couvertureFermee: lireCouverture(hass, configurationCarte.cover_entity),
  });
}
