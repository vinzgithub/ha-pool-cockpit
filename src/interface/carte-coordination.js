/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Rend la carte de coordination entre deux instances Home Assistant.
 *
 * Cette fonction ne lit aucune entité, ne persiste rien et ne déclenche aucune
 * action. Elle reçoit une configuration déjà disponible dans le dashboard et
 * reproduit uniquement sa présentation historique.
 *
 * @param {object} entree Données nécessaires au rendu.
 * @param {object|null|undefined} entree.coordination Configuration courante.
 * @param {object} entree.coordinationParDefaut Repli historique si la configuration est absente.
 * @param {(valeur: unknown) => string} entree.echapperHtml Fonction d'échappement déjà utilisée par le dashboard.
 * @returns {string} HTML de la carte de coordination.
 *
 * @example
 * rendreCarteCoordination({
 *   coordination: { role: "master", site_name: "Site A", peer_name: "Site B", allow_satellite_manual: true },
 *   coordinationParDefaut: { role: "master", site_name: "", peer_name: "", allow_satellite_manual: true },
 *   echapperHtml: String,
 * });
 */
export function rendreCarteCoordination({ coordination, coordinationParDefaut, echapperHtml }) {
  const donnees = coordination || coordinationParDefaut;
  const estMaitre = donnees.role !== "satellite";
  const site = echapperHtml(donnees.site_name || "Ce Home Assistant");
  const pair = echapperHtml(donnees.peer_name || "Autre Home Assistant");

  // RÈGLE SEC-000 : ce module reste une vue pure. Les changements de rôle sont
  // traités ailleurs par les événements déjà existants du dashboard.
  return `<div class="rc30-coordination ${estMaitre ? "is-master" : "is-satellite"}">
      <div class=rc30-coordination__head><span>${estMaitre ? "👑" : "🛰️"}</span><div><small>Architecture double Home Assistant</small><b>${estMaitre ? `${site} · maître de programmation` : `${site} · satellite`}</b><em>${estMaitre ? `Les programmations pompe / PAC / éclairage sont exécutées ici.` : `Les programmations automatiques locales sont neutralisées. Le maître attendu est ${pair}.`}</em></div><strong>${estMaitre ? "MAÎTRE" : "SATELLITE"}</strong></div>
      <div class=rc27-config-grid>
        <label><span>Rôle de cette instance</span><select data-rc27-path="coordination.role"><option value=master ${estMaitre ? "selected" : ""}>Maître · exécute les programmes</option><option value=satellite ${!estMaitre ? "selected" : ""}>Satellite · affichage / commandes manuelles</option></select></label>
        <label><span>Nom de cette instance</span><input type=text maxlength=40 data-rc27-path="coordination.site_name" value="${site}"></label>
        <label><span>Nom de l'autre instance</span><input type=text maxlength=40 data-rc27-path="coordination.peer_name" value="${pair}"></label>
        <label class=rc27-check><input type=checkbox data-rc27-path="coordination.allow_satellite_manual" ${donnees.allow_satellite_manual !== false ? "checked" : ""}><span>Autoriser les commandes manuelles sur le satellite</span></label>
      </div>
      <p>${estMaitre ? `Pour inverser Site A / Site B, passez d’abord l’instance actuellement maîtresse en <b>Satellite</b>, puis l’autre en <b>Maître</b>.` : `Les horaires restent visibles mais verrouillés sur cette instance. Une commande manuelle locale peut être reprise comme dérogation par le maître dès que l’état distant lui remonte.`}</p>
    </div>`;
}
