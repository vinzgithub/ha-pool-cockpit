/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

function normaliserMode(valeur) {
  if (valeur === true) return "sejour_en_cours";
  if (valeur === false || valeur === null || valeur === undefined) return valeur === false ? "inactive" : null;
  const texte = String(valeur).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]+/g, "_");
  const correspondances = {
    on: "sejour_en_cours", active: "sejour_en_cours", actif: "sejour_en_cours", location: "sejour_en_cours", occupied: "sejour_en_cours", occupe: "sejour_en_cours", sejour: "sejour_en_cours", sejour_en_cours: "sejour_en_cours",
    arrival: "arrivee_aujourdhui", arrivee: "arrivee_aujourdhui", arrivee_aujourdhui: "arrivee_aujourdhui",
    departure: "depart_aujourdhui", depart: "depart_aujourdhui", depart_aujourdhui: "depart_aujourdhui",
    off: "inactive", inactive: "inactive", inactif: "inactive", vacant: "inactive", vide: "inactive", libre: "inactive",
  };
  return correspondances[texte] ?? null;
}

function resultat(mode, source) {
  const details = {
    arrivee_aujourdhui: ["Arrivée aujourd’hui", "Arrivée de voyageurs aujourd’hui — fréquentation potentiellement accrue, information uniquement."],
    sejour_en_cours: ["Séjour en cours", "Mode Location actif — fréquentation potentiellement accrue, information uniquement."],
    depart_aujourdhui: ["Départ aujourd’hui", "Départ de voyageurs aujourd’hui — contrôle du bassin conseillé, information uniquement."],
    inactive: ["Maison inoccupée", "Mode Location inactif — fréquentation faible présumée, information uniquement."],
  };
  if (!mode || !details[mode]) return Object.freeze({ applicable: false, mode: null, libelle: "Indisponible", source, contributionScore: 0, explication: "Mode Location non configuré — aucun ajustement appliqué." });
  return Object.freeze({ applicable: true, mode, libelle: details[mode][0], source, contributionScore: 0, explication: details[mode][1] });
}

/** Lecture informative du contexte Location. Aucun appel de service ni contribution au score. */
export function evaluerModeLocation({ hass, configuration } = {}) {
  const valeurDirecte = configuration?.mode_location ?? configuration?.location_mode;
  const modeDirect = normaliserMode(valeurDirecte);
  if (modeDirect) return resultat(modeDirect, "configuration");

  const identifiantEntite = configuration?.location_entity ?? configuration?.mode_location_entity;
  if (!identifiantEntite) return resultat(null, null);
  const etat = hass?.states?.[identifiantEntite];
  const valeurEtat = etat?.state;
  if (!etat || ["unknown", "unavailable", "none", "null", ""].includes(String(valeurEtat ?? "").trim().toLowerCase())) {
    return Object.freeze({ applicable: false, mode: null, libelle: "Indisponible", source: identifiantEntite, contributionScore: 0, explication: "Mode Location indisponible — aucun ajustement appliqué." });
  }
  const modeEntite = normaliserMode(valeurEtat);
  if (!modeEntite) return Object.freeze({ applicable: false, mode: null, libelle: "Indisponible", source: identifiantEntite, contributionScore: 0, explication: `Mode Location non reconnu (${String(valeurEtat)}) — aucun ajustement appliqué.` });
  return resultat(modeEntite, identifiantEntite);
}
