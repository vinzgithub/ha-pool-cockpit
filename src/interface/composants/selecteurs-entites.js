/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Construit le catalogue affichable par le sélecteur d'entités.
 *
 * Le module reçoit une photographie explicite des états déjà fournie par la
 * façade du dashboard. Il ne connaît ni l'objet Home Assistant, ni le DOM, ni
 * la persistance. L'entité actuellement configurée est conservée en tête de
 * liste lorsqu'elle n'appartient plus au catalogue disponible, exactement
 * comme dans le comportement historique.
 *
 * @param {object} entree
 * @param {Record<string,object>} entree.etats États déjà injectés par la façade.
 * @param {string[]} entree.domaines Domaines autorisés.
 * @param {string} [entree.courant=""] Entité actuellement configurée.
 * @returns {Array<{entityId:string,state:object|undefined,label:string,domain:string,missing?:boolean}>}
 */
export function construireCatalogueEntites({ etats = {}, domaines = [], courant = "" } = {}) {
  const autorises = new Set(domaines);
  const entities = Object.entries(etats)
    .filter(([entityId]) => autorises.has(entityId.split(".")[0]))
    .map(([entityId, state]) => ({
      entityId,
      state,
      label: String(state?.attributes?.friendly_name || entityId),
      domain: entityId.split(".")[0],
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr", { sensitivity: "base" }) || a.entityId.localeCompare(b.entityId));

  if (courant && !entities.some((item) => item.entityId === courant)) {
    const state = etats[courant];
    entities.unshift({
      entityId: courant,
      state,
      label: String(state?.attributes?.friendly_name || courant),
      domain: courant.split(".")[0],
      missing: !state,
    });
  }
  return entities;
}

/**
 * Rend le sélecteur d'entité searchable historique à partir de données déjà
 * injectées. La liaison des événements, la recherche interactive et la
 * sauvegarde restent volontairement dans le template principal.
 *
 * @param {object} entree
 * @param {string} entree.libelle
 * @param {string} entree.chemin
 * @param {string[]} entree.domaines
 * @param {string} [entree.courant=""]
 * @param {string} [entree.placeholder="Facultatif"]
 * @param {Record<string,object>} entree.etats
 * @param {(valeur:unknown)=>string} entree.echapperHtml
 * @returns {string}
 */
export function rendreSelecteurEntiteConfiguration({
  libelle,
  chemin,
  domaines,
  courant = "",
  placeholder = "Facultatif",
  etats = {},
  echapperHtml,
}) {
  const entities = construireCatalogueEntites({ etats, domaines, courant });
  const state = courant ? etats?.[courant] : null;
  const selectedLabel = courant ? String(state?.attributes?.friendly_name || courant) : placeholder;
  const selectedMeta = courant ? courant : `Types : ${domaines.join(" · ")}`;
  const options = entities
    .map((item) => `<button type=button class="rc30-entity-picker__option ${item.entityId === courant ? "is-selected" : ""}" data-rc30-entity-option="${echapperHtml(item.entityId)}"><span><b>${echapperHtml(item.label)}</b><small>${echapperHtml(item.entityId)}</small></span><em>${echapperHtml(item.domain)}${item.missing ? " · indisponible" : ""}</em></button>`)
    .join("");

  // RÈGLE SEC-000 : cette fonction ne fait qu'assembler le HTML. Elle ne lit
  // aucun objet d'intégration, ne lie aucun événement et ne déclenche aucun I/O.
  return `<div class=rc30-entity-field><span>${libelle}</span><div class=rc30-entity-picker data-rc30-entity-picker data-rc27-path="${echapperHtml(chemin)}" data-placeholder="${echapperHtml(placeholder)}"><button type=button class=rc30-entity-picker__trigger data-rc30-entity-trigger aria-haspopup=listbox aria-expanded=false><span><b>${echapperHtml(selectedLabel)}</b><small>${echapperHtml(selectedMeta)}</small></span><i>⌄</i></button><div class=rc30-entity-picker__panel><div class=rc30-entity-picker__search><span>⌕</span><input type=search data-rc30-entity-search autocomplete=off spellcheck=false placeholder="Rechercher par nom ou entity_id…"></div><div class=rc30-entity-picker__options role=listbox><button type=button class="rc30-entity-picker__option rc30-entity-picker__clear ${courant ? "" : "is-selected"}" data-rc30-entity-option=""><span><b>${echapperHtml(placeholder)}</b><small>Aucune entité</small></span><em>—</em></button>${options}</div><p class=rc30-entity-picker__empty hidden>Aucune entité correspondante.</p></div></div></div>`;
}
