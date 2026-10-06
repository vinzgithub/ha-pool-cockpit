/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

const NIVEAUX_CANICULE = new Set(["aucune", "jaune", "orange", "rouge"]);

function versNombreOuNull(valeur) {
  if (valeur === null || valeur === undefined || valeur === "") return null;
  const nombre = Number(String(valeur).replace(",", "."));
  return Number.isFinite(nombre) ? nombre : null;
}

function versBooleenOuNull(valeur) {
  if (valeur === null || valeur === undefined || valeur === "") return null;
  if (typeof valeur === "boolean") return valeur;
  const texte = String(valeur).trim().toLowerCase();
  if (["on", "true", "1", "fermee", "fermée", "closed"].includes(texte)) return true;
  if (["off", "false", "0", "ouverte", "open"].includes(texte)) return false;
  return null;
}

function normaliserCanicule(valeur) {
  const texte = String(valeur ?? "aucune").trim().toLowerCase();
  return NIVEAUX_CANICULE.has(texte) ? texte : "aucune";
}

export function normaliserEntreesEauMeteo(entrees = {}) {
  return Object.freeze({
    temperatureEauC: versNombreOuNull(entrees.temperatureEauC),
    ph: versNombreOuNull(entrees.ph),
    redoxMv: versNombreOuNull(entrees.redoxMv),
    niveauCanicule: normaliserCanicule(entrees.niveauCanicule),
    couvertureFermee: versBooleenOuNull(entrees.couvertureFermee),
  });
}
