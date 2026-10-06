/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Rend l'éditeur historique des plages de programmation d'un équipement.
 *
 * Le module ne lit aucune entité Home Assistant et ne sauvegarde rien. Le
 * catalogue d'entités reste fourni par la couche d'intégration existante via
 * `rendreSelecteurEntite`, afin de ne pas déplacer ici la connaissance de HA.
 *
 * @param {object} entree Données déjà disponibles dans le dashboard.
 * @param {"pump"|"light"} entree.cible Équipement dont on édite les plages.
 * @param {string} entree.libelle Titre historique de l'éditeur.
 * @param {object} entree.bloc Configuration déjà normalisée de l'équipement.
 * @param {object|null|undefined} entree.coordination Configuration maître/satellite.
 * @param {Array<[string,string]>} entree.joursSemaine Jours supportés et libellés courts.
 * @param {(label:string,path:string,domains:string[],current:unknown,placeholder:string)=>string} entree.rendreSelecteurEntite
 *   Adaptateur de rendu du sélecteur d'entité, conservé hors de ce module.
 * @param {(valeur:unknown)=>string} entree.echapperHtml Fonction d'échappement historique.
 * @returns {string} HTML strictement équivalent à l'éditeur historique.
 *
 * @example
 * rendreEditeurProgrammationEquipement({
 *   cible: "pump",
 *   libelle: "Programmation de la pompe",
 *   bloc: { mode: "program", entity_id: "switch.pompe", power_entity: "", energy_entity: "", weekdays: ["mon"], periods: [] },
 *   coordination: { role: "master" },
 *   joursSemaine: [["mon", "L"]],
 *   rendreSelecteurEntite: () => "<label></label>",
 *   echapperHtml: String,
 * });
 */
export function rendreEditeurProgrammationEquipement({
  cible,
  libelle,
  bloc,
  coordination,
  joursSemaine,
  rendreSelecteurEntite,
  echapperHtml,
}) {
  const satellite = coordination?.role === "satellite";
  const verrouille = satellite ? "disabled" : "";
  const domainesEntite = cible === "pump"
    ? ["switch", "input_boolean"]
    : ["light", "switch", "input_boolean"];

  // RÈGLE SEC-000 : le module produit seulement le HTML. Les changements des
  // champs restent gérés par les événements et la sauvegarde du dashboard.
  return `<div class="rc27-schedule-editor ${satellite ? "is-satellite-locked" : ""}">
      <h4>${libelle}${satellite ? `<small>Programmation gérée par ${echapperHtml(coordination?.peer_name || "le maître")}</small>` : ""}</h4>
      <div class=rc27-config-grid>
        ${rendreSelecteurEntite("Entité de commande", `${cible}.entity_id`, domainesEntite, bloc.entity_id, "Sélectionner une entité")}
        <label><span>Mode</span><select data-rc27-path="${cible}.mode" ${verrouille}><option value=off ${bloc.mode === "off" ? "selected" : ""}>Arrêt</option><option value=manual ${bloc.mode === "manual" ? "selected" : ""}>Manuel</option><option value=program ${bloc.mode === "program" ? "selected" : ""}>Programme strict</option>${cible === "pump" ? `<option value=automatic ${bloc.mode === "automatic" ? "selected" : ""}>Conseillé avec validation</option>` : ""}</select></label>
        ${rendreSelecteurEntite("Capteur de puissance", `${cible}.power_entity`, ["sensor"], bloc.power_entity, "Facultatif")}
        ${cible === "pump" ? rendreSelecteurEntite("Capteur d’énergie", "pump.energy_entity", ["sensor"], bloc.energy_entity, "Facultatif") : `<label><span>Extinction automatique</span><div class=rc24-input-unit><input data-rc27-path="light.auto_off_minutes" type=number min=0 max=1440 step=5 value="${Number(bloc.auto_off_minutes || 0)}" ${verrouille}><em>min</em></div></label>`}
      </div>
      <div class=rc27-weekdays>${joursSemaine.map(([cle, court]) => `<button type=button class="${bloc.weekdays.includes(cle) ? "is-active" : ""}" data-rc27-weekday="${cle}" data-rc27-target="${cible}" ${verrouille}>${court}</button>`).join("")}</div>
      <div class=rc27-periods>${bloc.periods.map((periode, index) => `<div class="rc27-period ${periode.enabled ? "is-enabled" : ""}"><label><input type=checkbox data-rc27-path="${cible}.periods.${index}.enabled" ${periode.enabled ? "checked" : ""} ${verrouille}><span>Plage ${index + 1}</span></label><input type=time data-rc27-path="${cible}.periods.${index}.start" value="${periode.start}" ${verrouille}><b>→</b><input type=time data-rc27-path="${cible}.periods.${index}.end" value="${periode.end}" ${verrouille}></div>`).join("")}</div>
      ${satellite ? `<p class=rc30-satellite-note>🛰️ Cette instance n’exécute aucune plage horaire. Pour modifier la programmation, utilisez ${echapperHtml(coordination?.peer_name || "l’instance maître")} ou inversez les rôles.</p>` : ""}
    </div>`;
}

/**
 * Rend la carte de profil saisonnier et l'état de priorité de programmation.
 *
 * La recommandation adaptative est reçue déjà calculée : cette fonction ne
 * recalcule ni durée, ni saison, ni plage horaire. Elle ne change aucune
 * priorité et ne déclenche aucune action.
 *
 * @param {object} entree Données de présentation déjà préparées.
 * @param {object} entree.saisonnalite Configuration saisonnière déjà normalisée.
 * @param {Record<string,object>} entree.profilsSaisonniers Catalogue historique des profils.
 * @param {string} entree.profilSuggere Identifiant du profil astronomique de référence.
 * @param {object} entree.recommandationAdaptative Recommandation déterministe déjà calculée.
 * @param {object|null|undefined} entree.coordination Configuration maître/satellite.
 * @param {(heures:number)=>string} entree.formaterDuree Formateur historique de durée.
 * @param {(valeur:unknown)=>string} entree.echapperHtml Fonction d'échappement historique.
 * @returns {string} HTML strictement équivalent à la carte historique.
 */
export function rendreCarteProfilProgrammationSaisonniere({
  saisonnalite,
  profilsSaisonniers,
  profilSuggere,
  recommandationAdaptative,
  coordination,
  formaterDuree,
  echapperHtml,
}) {
  const courant = saisonnalite.current;
  const profil = profilsSaisonniers[courant];
  const suggestion = profilsSaisonniers[profilSuggere];
  const adaptatif = recommandationAdaptative;
  const satellite = coordination?.role === "satellite";
  const sourceAdaptative = saisonnalite.source === "adaptive";
  const sourceSuspendue = saisonnalite.source === "suspended";
  const maintenance = courant === "maintenance";
  const libelleSource = sourceAdaptative
    ? "Programme adaptatif actif"
    : sourceSuspendue
      ? "Programme adaptatif suspendu"
      : "Programmation personnalisée prioritaire";
  const iconeSource = sourceAdaptative ? "🧠" : sourceSuspendue ? "⏸" : "✋";
  const detailSource = sourceAdaptative
    ? "Le moteur peut recalculer les plages selon saison astronomique, températures, hydraulique et alertes."
    : sourceSuspendue
      ? "Les plages actuellement appliquées sont figées. Aucun recalcul adaptatif n’a lieu jusqu’à une reprise explicite."
      : "Les horaires saisis manuellement ne seront jamais remplacés automatiquement.";
  const libelleSaison = adaptatif.seasonInfo?.libelle || suggestion.label;
  const contexteTemperatures = [
    Number.isFinite(adaptatif.water) ? `Eau ${adaptatif.water.toFixed(1)} °C` : null,
    Number.isFinite(adaptatif.air) ? `Air ${adaptatif.air.toFixed(1)} °C` : null,
    Number.isFinite(adaptatif.hydraulicHours) ? `Plancher hydraulique ${formaterDuree(adaptatif.hydraulicHours)}` : null,
  ].filter(Boolean).join(" · ") || "Contexte incomplet";
  const libelleAlerte = adaptatif.heatAlert
    ? `🔥 ${adaptatif.weatherAlert.levelLabel || "Alerte"} canicule`
    : adaptatif.coldAlert
      ? `❄️ ${adaptatif.weatherAlert.levelLabel || "Alerte"} froid`
      : "Aucune alerte thermique active";
  const note = satellite
    ? `Profil affiché localement ; la programmation est exécutée par ${coordination?.peer_name || "l’instance maître"}.`
    : saisonnalite.follow_astronomical
      ? `Saison astronomique actuelle : ${libelleSaison}. ${adaptatif.context}. Les horaires du profil sont des bases indicatives, jamais des ordres rigides.`
      : `Profil de référence choisi manuellement : ${profil.label}. Saison astronomique conseillée : ${suggestion.label}. Les bases horaires restent indicatives.`;
  const boutonsAction = sourceAdaptative
    ? `<button type=button class=is-primary data-rc30-suspend-adaptive>Suspendre l’adaptatif</button><button type=button data-rc30-stop-adaptive>Passer en personnalisé</button>`
    : sourceSuspendue
      ? `<button type=button class=is-primary data-rc30-resume-adaptive>Reprendre l’adaptatif</button><button type=button data-rc30-stop-adaptive>Passer en personnalisé</button>`
      : maintenance
        ? ""
        : `<button type=button class=is-primary data-rc30-resume-adaptive>Reprendre le programme adaptatif</button>`;

  // RÈGLES PROG-001/002/003 et FILT-004 : les textes reflètent uniquement
  // l'état déjà décidé ailleurs. Cette vue ne peut ni reprendre l'adaptatif,
  // ni suspendre une programmation, ni transformer une recommandation en ordre.
  return `<div class="rc30-seasonal-profile ${satellite ? "is-satellite-locked" : ""} ${sourceAdaptative ? "is-adaptive" : sourceSuspendue ? "is-suspended" : "is-custom"}">
      <div class=rc30-seasonal-profile__main><span>${profil.icon}</span><div><small>Base saisonnière de programmation</small><b>${echapperHtml(profil.label)}</b><em>${echapperHtml(profil.reason)}</em></div></div>
      <label><span>Profil de référence</span><select data-rc30-profile ${satellite ? "disabled" : ""}>${Object.entries(profilsSaisonniers).map(([cle, item]) => `<option value="${cle}" ${cle === courant ? "selected" : ""}>${item.icon} ${echapperHtml(item.label)}</option>`).join("")}</select></label>
      <div class=rc30-adaptive-status><span>${iconeSource}</span><div><small>Priorité actuelle</small><b>${echapperHtml(libelleSource)}</b><em>${echapperHtml(detailSource)}</em></div></div>
      <div class=rc30-adaptive-proposal><small>Recommandation adaptative indicative maintenant</small><b>${echapperHtml(adaptatif.scheduleLabel)} · ${formaterDuree(adaptatif.hours)}</b><em>${echapperHtml(contexteTemperatures)} · ${echapperHtml(libelleAlerte)}</em></div>
      <div class=rc30-adaptive-actions>${satellite ? "" : `${boutonsAction}${!saisonnalite.follow_astronomical ? `<button type=button data-rc30-follow-astronomical>Suivre la saison astronomique</button>` : ""}<button type=button data-rc30-save-profile-base>Mémoriser les horaires actuels comme base du profil</button>`}</div>
      <p>${echapperHtml(note)}</p>
    </div>`;
}
