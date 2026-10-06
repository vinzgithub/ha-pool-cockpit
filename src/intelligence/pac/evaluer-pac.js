/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

function etatIndisponible(etat) {
  return !etat || ["unknown", "unavailable", "none", "null", ""].includes(String(etat.state ?? "").toLowerCase());
}

function nombrePacOuNull(valeur) {
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
}

/** Lecture informative de la PAC. Aucun appel de service ni contribution au score. */
export function evaluerPac({ hass, identifiantEntite } = {}) {
  if (!identifiantEntite) {
    return Object.freeze({ applicable: false, identifiantEntite: null, active: null, chauffe: null, temperatureActuelleC: null, temperatureConsigneC: null, contributionScore: 0, explication: "PAC non configurée — aucun ajustement appliqué." });
  }
  const etat = hass?.states?.[identifiantEntite];
  if (etatIndisponible(etat)) {
    return Object.freeze({ applicable: false, identifiantEntite, active: null, chauffe: null, temperatureActuelleC: null, temperatureConsigneC: null, contributionScore: 0, explication: "PAC indisponible — aucun ajustement appliqué." });
  }
  const valeurEtat = String(etat.state).toLowerCase();
  const actionHvac = String(etat.attributes?.hvac_action ?? "").toLowerCase();
  const active = !["off", "standby", "idle"].includes(valeurEtat);
  const chauffe = actionHvac === "heating" || ["heating", "heat", "on"].includes(valeurEtat);
  const temperatureActuelleC = nombrePacOuNull(etat.attributes?.current_temperature ?? etat.attributes?.temperature_actuelle);
  const temperatureConsigneC = nombrePacOuNull(etat.attributes?.temperature ?? etat.attributes?.target_temperature);
  const details = [];
  if (temperatureActuelleC !== null) details.push(`eau ${temperatureActuelleC} °C`);
  if (temperatureConsigneC !== null) details.push(`consigne ${temperatureConsigneC} °C`);
  const suffixe = details.length ? ` (${details.join(" · ")})` : "";
  const explication = chauffe
    ? `PAC en chauffe${suffixe} — information uniquement, aucun ajustement automatique.`
    : active
      ? `PAC active sans chauffe détectée${suffixe} — information uniquement.`
      : `PAC à l’arrêt${suffixe} — information uniquement.`;
  return Object.freeze({ applicable: true, identifiantEntite, active, chauffe, temperatureActuelleC, temperatureConsigneC, contributionScore: 0, explication });
}
