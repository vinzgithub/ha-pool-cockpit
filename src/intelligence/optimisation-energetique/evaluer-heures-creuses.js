/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

function minutesDepuisMinuit(heure) {
  const correspondance = /^(\d{1,2}):(\d{2})$/.exec(String(heure ?? "").trim());
  if (!correspondance) return null;
  const heures = Number(correspondance[1]);
  const minutes = Number(correspondance[2]);
  if (!Number.isInteger(heures) || !Number.isInteger(minutes) || heures < 0 || heures > 23 || minutes < 0 || minutes > 59) return null;
  return heures * 60 + minutes;
}

function normaliserPlage(plage) {
  const debut = minutesDepuisMinuit(plage?.debut ?? plage?.start);
  const fin = minutesDepuisMinuit(plage?.fin ?? plage?.end);
  if (debut === null || fin === null || debut === fin || plage?.active === false || plage?.enabled === false) return null;
  return Object.freeze({ debut, fin, debutLibelle: plage?.debut ?? plage?.start, finLibelle: plage?.fin ?? plage?.end });
}

function estDansPlage(minute, plage) {
  return plage.debut < plage.fin
    ? minute >= plage.debut && minute < plage.fin
    : minute >= plage.debut || minute < plage.fin;
}

function minutesAvantPlage(minute, plage) {
  if (estDansPlage(minute, plage)) return 0;
  return (plage.debut - minute + 1440) % 1440;
}

/**
 * Évalue uniquement la position horaire par rapport aux heures creuses configurées.
 * Cette information est indicative : elle ne modifie pas le score et ne pilote aucun équipement.
 */
export function evaluerHeuresCreuses({ plages = [], maintenant = new Date() } = {}) {
  const date = maintenant instanceof Date ? maintenant : new Date(maintenant);
  const plagesValides = Array.isArray(plages) ? plages.map(normaliserPlage).filter(Boolean) : [];
  if (plagesValides.length === 0) {
    return Object.freeze({ configure: false, active: null, contributionScore: 0, plageActive: null, prochainePlage: null, explication: "Heures creuses non configurées — aucune optimisation énergétique appliquée." });
  }
  if (Number.isNaN(date.getTime())) {
    return Object.freeze({ configure: true, active: null, contributionScore: 0, plageActive: null, prochainePlage: null, explication: "Heure courante invalide — état des heures creuses indéterminé." });
  }
  const minute = date.getHours() * 60 + date.getMinutes();
  const plageActive = plagesValides.find((plage) => estDansPlage(minute, plage)) ?? null;
  if (plageActive) {
    return Object.freeze({ configure: true, active: true, contributionScore: 0, plageActive, prochainePlage: null, explication: `Heures creuses actives (${plageActive.debutLibelle}–${plageActive.finLibelle}) — période énergétique favorable.` });
  }
  const prochainePlage = [...plagesValides].sort((a, b) => minutesAvantPlage(minute, a) - minutesAvantPlage(minute, b))[0];
  return Object.freeze({ configure: true, active: false, contributionScore: 0, plageActive: null, prochainePlage, explication: `Heures pleines — prochaine plage creuse à ${prochainePlage.debutLibelle}.` });
}
