/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

function resultatRegle({ identifiant, applicable, points = 0, explication = null, raison = null, metadonnees = {} }) {
  return Object.freeze({ identifiant, applicable, points, explication, raison, metadonnees: Object.freeze(metadonnees) });
}

export function evaluerTemperatureEau(entrees, configuration) {
  const temperature = entrees.temperatureEauC;
  if (temperature === null) {
    return resultatRegle({
      identifiant: "temperature_eau",
      applicable: false,
      raison: "donnee_critique_manquante",
    });
  }

  const seuils = configuration.temperatureEau;
  let points;
  let explication;

  if (temperature < seuils.seuilFroid) {
    points = seuils.points.froid;
    explication = `Eau à ${temperature.toFixed(1)} °C : besoin de filtration réduit.`;
  } else if (temperature < seuils.seuilChaud) {
    points = seuils.points.normal;
    explication = `Eau à ${temperature.toFixed(1)} °C : température sans renforcement particulier.`;
  } else if (temperature < seuils.seuilTresChaud) {
    points = seuils.points.chaud;
    explication = `Eau à ${temperature.toFixed(1)} °C : filtration légèrement renforcée.`;
  } else if (temperature < seuils.seuilCritique) {
    points = seuils.points.tresChaud;
    explication = `Eau à ${temperature.toFixed(1)} °C : filtration renforcée recommandée.`;
  } else {
    points = seuils.points.critique;
    explication = `Eau à ${temperature.toFixed(1)} °C : risque biologique accru, filtration fortement renforcée.`;
  }

  return resultatRegle({
    identifiant: "temperature_eau",
    applicable: true,
    points,
    explication,
    metadonnees: { valeurMesuree: temperature, unite: "°C" },
  });
}

export function evaluerPh(entrees, configuration) {
  const ph = entrees.ph;
  if (ph === null) {
    return resultatRegle({
      identifiant: "ph",
      applicable: false,
      raison: "donnee_optionnelle_manquante",
      explication: "pH indisponible — aucun ajustement appliqué.",
    });
  }

  const seuils = configuration.ph;
  let points;
  let explication;
  if (ph < seuils.seuilTresBas) {
    points = seuils.points.tresBas;
    explication = `pH ${ph.toFixed(2)} : valeur très basse, correction prioritaire recommandée.`;
  } else if (ph < seuils.seuilBas) {
    points = seuils.points.bas;
    explication = `pH ${ph.toFixed(2)} : valeur légèrement basse, surveillance recommandée.`;
  } else if (ph <= seuils.seuilHaut) {
    points = seuils.points.optimal;
    explication = `pH ${ph.toFixed(2)} : plage acceptable, aucun ajustement appliqué.`;
  } else if (ph <= seuils.seuilTresHaut) {
    points = seuils.points.haut;
    explication = `pH ${ph.toFixed(2)} : valeur haute, correction recommandée.`;
  } else {
    points = seuils.points.tresHaut;
    explication = `pH ${ph.toFixed(2)} : valeur très haute, correction prioritaire recommandée.`;
  }

  return resultatRegle({
    identifiant: "ph",
    applicable: true,
    points,
    explication,
    metadonnees: { valeurMesuree: ph, unite: "pH" },
  });
}

export function evaluerRedox(entrees, configuration) {
  const redox = entrees.redoxMv;
  if (redox === null) {
    return resultatRegle({
      identifiant: "redox",
      applicable: false,
      raison: "donnee_optionnelle_manquante",
      explication: "Redox indisponible — aucun ajustement appliqué.",
    });
  }

  const seuils = configuration.redox;
  let points;
  let explication;
  if (redox < seuils.seuilCritiqueBas) {
    points = seuils.points.critiqueBas;
    explication = `Redox ${redox.toFixed(0)} mV : désinfection très insuffisante, filtration fortement renforcée.`;
  } else if (redox < seuils.seuilBas) {
    points = seuils.points.bas;
    explication = `Redox ${redox.toFixed(0)} mV : désinfection insuffisante, filtration renforcée.`;
  } else if (redox < seuils.seuilSurveillance) {
    points = seuils.points.surveillance;
    explication = `Redox ${redox.toFixed(0)} mV : valeur légèrement basse, surveillance recommandée.`;
  } else if (redox <= seuils.seuilHautInformation) {
    points = seuils.points.acceptable;
    explication = `Redox ${redox.toFixed(0)} mV : niveau acceptable, aucun ajustement de filtration.`;
  } else {
    points = seuils.points.haut;
    explication = `Redox ${redox.toFixed(0)} mV : valeur élevée à surveiller côté traitement, sans augmenter la filtration.`;
  }

  return resultatRegle({
    identifiant: "redox",
    applicable: true,
    points,
    explication,
    metadonnees: { valeurMesuree: redox, unite: "mV" },
  });
}

export function evaluerCanicule(entrees, configuration) {
  const niveau = entrees.niveauCanicule;
  const points = configuration.canicule.points[niveau] ?? 0;
  const explications = {
    aucune: "Aucune vigilance canicule : aucun renforcement météo appliqué.",
    jaune: "Vigilance canicule jaune : renforcement météo léger.",
    orange: "Vigilance canicule orange : charge thermique élevée.",
    rouge: "Vigilance canicule rouge : renforcement météo maximal.",
  };
  return resultatRegle({
    identifiant: "canicule",
    applicable: true,
    points,
    explication: explications[niveau],
    metadonnees: { niveau },
  });
}

export function evaluerCouverture(entrees, configuration) {
  if (entrees.couvertureFermee === null) {
    return resultatRegle({
      identifiant: "couverture",
      applicable: false,
      raison: "donnee_optionnelle_manquante",
      explication: "État de la couverture inconnu — aucun ajustement appliqué.",
    });
  }

  if (!entrees.couvertureFermee) {
    return resultatRegle({
      identifiant: "couverture",
      applicable: true,
      points: 0,
      explication: "Couverture ouverte : aucune réduction appliquée.",
    });
  }

  if (
    entrees.temperatureEauC !== null &&
    entrees.temperatureEauC >= configuration.couverture.annulerReductionDepuisTemperature
  ) {
    return resultatRegle({
      identifiant: "couverture",
      applicable: true,
      points: 0,
      explication: "Couverture fermée, mais réduction annulée car l’eau est très chaude.",
    });
  }

  return resultatRegle({
    identifiant: "couverture",
    applicable: true,
    points: configuration.couverture.pointsFermee,
    explication: "Couverture fermée : exposition extérieure réduite.",
  });
}
