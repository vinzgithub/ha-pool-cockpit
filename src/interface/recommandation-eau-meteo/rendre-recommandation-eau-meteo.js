/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Composant de rendu expérimental Eau + Météo.
 * Consomme exclusivement une évaluation déjà calculée par le contrôleur.
 */
function echapperHtml(valeur) {
  return String(valeur ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formaterHeure(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "heure inconnue";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
}

function libelleCouverture(valeur) {
  if (valeur === null || valeur === undefined) return "Inconnue";
  return valeur === true || valeur === "on" || valeur === "closed" ? "Fermée" : "Ouverte";
}

export function creerHtmlRecommandationEauMeteo(evaluation) {
  if (!evaluation) return "";
  const resultatMoteur = evaluation.resultatMoteur;
  const donnees = evaluation.donneesUtilisees ?? {};
  const version = resultatMoteur?.diagnostics?.versionConfiguration ?? "water-weather-v1-draft";
  const heure = formaterHeure(evaluation.calculeA);
  const confiance = evaluation.confianceCapteurs;
  const optimisation = evaluation.optimisationEnergetique;
  const saison = evaluation.saison;
  const pac = evaluation.pac;
  const modeLocation = evaluation.modeLocation;
  const style = `<style>.recommandation-eau-meteo{margin:0 0 14px;padding:18px 20px;border-radius:22px;background:rgba(255,255,255,.86);border:1px solid rgba(35,90,140,.14);box-shadow:0 12px 28px rgba(30,80,120,.07);color:#17324f}.recommandation-eau-meteo header{display:flex;align-items:center;gap:12px}.recommandation-eau-meteo header>span{font-size:1.5rem}.recommandation-eau-meteo h2,.recommandation-eau-meteo p{margin:0}.recommandation-eau-meteo header p{font-size:.72rem;opacity:.62}.recommandation-eau-meteo__score{margin-left:auto}.recommandation-eau-meteo__score strong{font-size:1.8rem}.recommandation-eau-meteo__niveau{font-weight:800;margin-top:12px!important}.recommandation-eau-meteo ul{display:grid;gap:7px;padding:0;margin:12px 0 0;list-style:none}.recommandation-eau-meteo li{display:flex;justify-content:space-between;gap:12px;font-size:.8rem}.recommandation-eau-meteo__confiance,.recommandation-eau-meteo__energie,.recommandation-eau-meteo__saison,.recommandation-eau-meteo__pac,.recommandation-eau-meteo__location{margin-top:12px!important;font-size:.8rem;font-weight:750}.recommandation-eau-meteo__donnees{margin-top:14px!important;font-size:.75rem;opacity:.76}.recommandation-eau-meteo--indisponible{border-color:rgba(217,132,25,.35)}</style>`;

  const confianceHtml = `<p class="recommandation-eau-meteo__confiance" data-confiance-capteurs>${echapperHtml(confiance?.explication ?? "Confiance indisponible — aucune source exploitable.")}</p>`;

  const energieHtml = `<p class="recommandation-eau-meteo__energie" data-optimisation-energetique>${echapperHtml(optimisation?.explication ?? "Heures creuses non configurées — aucune optimisation énergétique appliquée.")}</p>`;

  const saisonHtml = `<p class="recommandation-eau-meteo__saison" data-saison>${echapperHtml(saison?.explication ?? "Saison indisponible — aucun ajustement appliqué.")}</p>`;

  const pacHtml = `<p class="recommandation-eau-meteo__pac" data-pac>${echapperHtml(pac?.explication ?? "PAC non configurée — aucun ajustement appliqué.")}</p>`;

  const locationHtml = `<p class="recommandation-eau-meteo__location" data-mode-location>${echapperHtml(modeLocation?.explication ?? "Mode Location non configuré — aucun ajustement appliqué.")}</p>`;

  const donneesHtml = `<p class="recommandation-eau-meteo__donnees" aria-label="Données utilisées">Données utilisées : eau ${echapperHtml(donnees.temperatureEauC ?? "indisponible")} °C · pH ${echapperHtml(donnees.ph ?? "indisponible")} · Redox ${echapperHtml(donnees.redoxMv ?? "indisponible")} mV · canicule ${echapperHtml(donnees.niveauCanicule ?? "aucune")} · couverture ${echapperHtml(libelleCouverture(donnees.couvertureFermee))} · calcul ${echapperHtml(heure)}</p>`;

  if (!resultatMoteur || resultatMoteur.diagnostics?.valide === false) {
    const message = resultatMoteur?.diagnostics?.messageIndisponibilite ?? "Recommandation indisponible — donnée critique manquante.";
    return `${style}<section class="recommandation-eau-meteo recommandation-eau-meteo--indisponible" data-eau-meteo-experimental role="status" aria-live="polite" aria-label="Recommandation Eau et Météo indisponible"><header><span aria-hidden="true">🧭</span><div><h2>Assistant Eau + Météo</h2><p>Expérimental · ${echapperHtml(version)}</p></div></header><p class="recommandation-eau-meteo__message">${echapperHtml(message)}</p>${confianceHtml}${energieHtml}${saisonHtml}${pacHtml}${locationHtml}${donneesHtml}</section>`;
  }

  const libelleNiveauEchappe = echapperHtml(resultatMoteur.niveau?.libelle ?? "Recommandation");
  const decomposition = (resultatMoteur.decomposition ?? [])
    .filter((element) => element.identifiant !== "base")
    .map((element) => `<li data-regle="${echapperHtml(element.identifiant)}"><span>${echapperHtml(element.explication ?? element.identifiant)}</span><strong>${element.applicable ? `${element.points >= 0 ? "+" : ""}${echapperHtml(element.points)} pts` : "Non applicable"}</strong></li>`)
    .join("");

  return `${style}<section class="recommandation-eau-meteo" data-eau-meteo-experimental aria-labelledby="titre-eau-meteo-experimental"><header><span aria-hidden="true">🧭</span><div><h2 id="titre-eau-meteo-experimental">Assistant Eau + Météo</h2><p>Expérimental · ${echapperHtml(version)}</p></div><div class="recommandation-eau-meteo__score" aria-label="Score ${echapperHtml(resultatMoteur.score)} sur 100"><strong>${echapperHtml(resultatMoteur.score)}</strong><small>/100</small></div></header><p class="recommandation-eau-meteo__niveau">${libelleNiveauEchappe}</p><ul aria-label="Détail du score">${decomposition}</ul>${confianceHtml}${energieHtml}${saisonHtml}${pacHtml}${locationHtml}${donneesHtml}</section>`;
}

export function rendreRecommandationEauMeteo({ conteneur, evaluation }) {
  if (!conteneur) throw new TypeError("conteneur requis");
  conteneur.innerHTML = creerHtmlRecommandationEauMeteo(evaluation);
}
