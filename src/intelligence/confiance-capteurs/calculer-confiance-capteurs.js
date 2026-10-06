/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

const TOLERANCES = Object.freeze({ temperatureEauC: 1, ph: 0.2, redoxMv: 100 });

function nombreOuNull(valeur) {
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
}

function confianceComparaison(valeurs, tolerance) {
  if (valeurs.length < 2) return null;
  const ecart = Math.max(...valeurs) - Math.min(...valeurs);
  return Object.freeze({
    confiance: Math.max(0, Math.round(100 - (ecart / tolerance) * 20)),
    ecart,
    tolerance,
  });
}

/**
 * Évalue uniquement la cohérence des sources de mesure. Cette confiance
 * n'ajoute et ne retire aucun point au score Eau + Météo.
 * Une seule source exploitable est considérée fiable à 100 %, conformément
 * au contrat fonctionnel validé, sans prétendre comparer son exactitude.
 */
export function calculerConfianceCapteurs(observations = []) {
  const sources = observations.map((observation, index) => Object.freeze({
    identifiant: String(observation?.identifiant ?? `source-${index + 1}`),
    libelle: String(observation?.libelle ?? observation?.identifiant ?? `Source ${index + 1}`),
    temperatureEauC: nombreOuNull(observation?.temperatureEauC),
    ph: nombreOuNull(observation?.ph),
    redoxMv: nombreOuNull(observation?.redoxMv),
  })).filter((source) => [source.temperatureEauC, source.ph, source.redoxMv].some((valeur) => valeur !== null));

  if (sources.length === 0) {
    return Object.freeze({ confiance: null, niveau: "indisponible", nombreSources: 0, comparaisons: Object.freeze({}), explication: "Confiance indisponible — aucune source exploitable." });
  }
  if (sources.length === 1) {
    return Object.freeze({ confiance: 100, niveau: "source_unique", nombreSources: 1, comparaisons: Object.freeze({}), explication: `Confiance 100 % — une seule source active (${sources[0].libelle}).` });
  }

  const comparaisons = {};
  for (const [metrique, tolerance] of Object.entries(TOLERANCES)) {
    const valeurs = sources.map((source) => source[metrique]).filter((valeur) => valeur !== null);
    const comparaison = confianceComparaison(valeurs, tolerance);
    if (comparaison) comparaisons[metrique] = comparaison;
  }
  const scores = Object.values(comparaisons).map((comparaison) => comparaison.confiance);
  const confiance = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : 50;
  const niveau = confiance >= 85 ? "elevee" : confiance >= 60 ? "moyenne" : "faible";
  const explication = scores.length
    ? `Confiance ${confiance} % — cohérence calculée entre ${sources.length} sources actives.`
    : `Confiance ${confiance} % — ${sources.length} sources actives sans mesure commune comparable.`;
  return Object.freeze({ confiance, niveau, nombreSources: sources.length, comparaisons: Object.freeze(comparaisons), explication });
}
