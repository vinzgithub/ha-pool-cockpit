/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

const SAISONS_ASTRONOMIQUES = Object.freeze([
  Object.freeze({ identifiant: "printemps", libelle: "Printemps", cle: "spring" }),
  Object.freeze({ identifiant: "ete", libelle: "Été", cle: "summer" }),
  Object.freeze({ identifiant: "automne", libelle: "Automne", cle: "autumn" }),
  Object.freeze({ identifiant: "hiver", libelle: "Hiver", cle: "winter" }),
]);

const JOUR_JULIEN_UNIX = 2440587.5;
const MS_PAR_JOUR = 86400000;

function jde0Saison(annee, cle) {
  const y = (annee - 2000) / 1000;
  const coefficients = {
    spring: [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],
    summer: [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030],
    autumn: [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],
    winter: [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032],
  }[cle];
  if (!coefficients) return null;
  return coefficients.reduce((total, coefficient, index) => total + coefficient * (y ** index), 0);
}

function dateAstronomiqueApprochee(annee, cle) {
  if (annee < 2000 || annee > 3000) {
    const replis = {
      spring: [2, 20],
      summer: [5, 21],
      autumn: [8, 22],
      winter: [11, 21],
    }[cle];
    return new Date(annee, replis[0], replis[1], 12, 0, 0, 0);
  }
  const jde = jde0Saison(annee, cle);
  return new Date((jde - JOUR_JULIEN_UNIX) * MS_PAR_JOUR);
}

function bornesAstronomiques(annee) {
  return SAISONS_ASTRONOMIQUES.map((saison) => ({
    ...saison,
    date: dateAstronomiqueApprochee(annee, saison.cle),
  }));
}

/**
 * Détermine la saison astronomique en France métropolitaine.
 * Le calcul utilise les dates approchées d'équinoxes et de solstices (formules de Meeus),
 * sans contribution automatique au score Eau + Météo.
 */
export function detecterSaison({ maintenant = new Date() } = {}) {
  const date = maintenant instanceof Date ? maintenant : new Date(maintenant);
  if (Number.isNaN(date.getTime())) {
    return Object.freeze({
      applicable: false,
      identifiant: null,
      libelle: "Indisponible",
      contributionScore: 0,
      debut: null,
      prochainChangement: null,
      prochainIdentifiant: null,
      prochainLibelle: null,
      explication: "Saison indisponible — date invalide, aucun ajustement appliqué.",
    });
  }

  const annee = date.getFullYear();
  const bornes = bornesAstronomiques(annee);
  const printemps = bornes.find((item) => item.cle === "spring");
  const ete = bornes.find((item) => item.cle === "summer");
  const automne = bornes.find((item) => item.cle === "autumn");
  const hiver = bornes.find((item) => item.cle === "winter");

  let saison;
  let prochaine;
  if (date >= hiver.date) {
    saison = hiver;
    prochaine = { ...bornesAstronomiques(annee + 1).find((item) => item.cle === "spring") };
  } else if (date >= automne.date) {
    saison = automne;
    prochaine = hiver;
  } else if (date >= ete.date) {
    saison = ete;
    prochaine = automne;
  } else if (date >= printemps.date) {
    saison = printemps;
    prochaine = ete;
  } else {
    saison = { ...bornesAstronomiques(annee - 1).find((item) => item.cle === "winter") };
    prochaine = printemps;
  }

  return Object.freeze({
    applicable: true,
    identifiant: saison.identifiant,
    libelle: saison.libelle,
    contributionScore: 0,
    debut: saison.date.toISOString(),
    prochainChangement: prochaine.date.toISOString(),
    prochainIdentifiant: prochaine.identifiant,
    prochainLibelle: prochaine.libelle,
    explication: `Saison astronomique : ${saison.libelle} — information uniquement, aucun ajustement automatique.`,
  });
}
