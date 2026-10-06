/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Présentation pure de la carte « Traitement & dosage ».
 *
 * Ce module reçoit un profil déjà normalisé, un modèle de traitement déjà calculé
 * et un historique déjà chargé. Il ne calcule aucune dose, ne décide aucun
 * traitement, ne persiste rien et n'attache aucun gestionnaire d'événement.
 *
 * RÈGLE TRAIT-001 : ce fichier affiche les actions déjà décidées par le moteur ;
 * il ne transforme jamais le mode ponctuel en protocole fabricant.
 * RÈGLE TRAIT-002 : le journal est seulement rendu ici ; la fusion/persistance
 * reste dans `traitement/journal.js` et la couche d'intégration existante.
 * RÈGLE SEC-000 : aucun accès Home Assistant, DOM, WebSocket, service ou stockage.
 */

/**
 * Rend les options `<option>` historiques d'un catalogue de traitement.
 *
 * La fonction ne modifie aucun état et ne normalise pas le catalogue. Comme dans
 * le template historique, une valeur `items` non compatible avec `Object.entries`
 * provoque une erreur au lieu d'être réparée silencieusement.
 *
 * @param {object} items Catalogue indexé par valeur technique.
 * @param {unknown} current Valeur actuellement sélectionnée.
 * @param {(valeur:unknown)=>string} echapperHtml Fonction d'échappement historique.
 * @returns {string} Suite d'options HTML.
 *
 * @example
 * rendreOptionsTraitement({a:{label:"Produit A"}}, "a", String);
 * // => '<option value="a" selected>Produit A</option>'
 */
export function rendreOptionsTraitement(items, current, echapperHtml) {
  if (typeof echapperHtml !== "function") {
    throw new TypeError("rendreOptionsTraitement requiert une fonction echapperHtml");
  }
  return Object.entries(items)
    .map(([value, item]) => `<option value="${value}" ${current === value ? "selected" : ""}>${echapperHtml(item.label)}</option>`)
    .join("");
}

/**
 * Rend la section « Traitement & dosage » à partir de données déjà préparées.
 *
 * Le moteur de traitement, les calculs de dose, les choix de produits, la
 * persistance du profil et le journal restent hors de ce module. La fonction
 * construit uniquement le HTML historique et ne déclenche jamais une action.
 *
 * Les entrées invalides ne sont pas corrigées au-delà des replis déjà présents
 * dans l'ancien rendu (`historique || []`, détails déjà normalisés). Le modèle et
 * le profil doivent respecter le même contrat qu'avant l'extraction.
 *
 * @param {object} entrees Données de rendu préparées par le composant parent.
 * @param {object} entrees.modele Modèle de traitement déterministe déjà calculé.
 * @param {object} entrees.profil Profil de bassin déjà normalisé.
 * @param {object} [entrees.etatDetails={}] État déjà normalisé des panneaux details.
 * @param {Array<object>} [entrees.historique=[]] Journal déjà chargé/fusionné.
 * @param {object} entrees.doseurs Catalogue historique des doseurs.
 * @param {object} entrees.produits Catalogue historique des produits.
 * @param {string} [entrees.classeSection=""] Classes de repli préparées par le parent.
 * @param {string} [entrees.attributsEntete=""] Attributs accessibles préparés par le parent.
 * @param {string} [entrees.chevronHtml=""] Chevron préparé par le parent.
 * @param {(valeur:unknown)=>string} entrees.echapperHtml Fonction d'échappement historique.
 * @returns {string} HTML de la section, sans effet de bord.
 */
export function rendreCarteTraitement({
  modele,
  profil,
  etatDetails = {},
  historique = [],
  doseurs,
  produits,
  classeSection = "",
  attributsEntete = "",
  chevronHtml = "",
  echapperHtml,
} = {}) {
  if (typeof echapperHtml !== "function") {
    throw new TypeError("rendreCarteTraitement requiert une fonction echapperHtml");
  }

  const last = (historique || [])[0];
  const lastDose = last ? (last.dose_amount ?? last.dose_g ?? last.dose_ml ?? null) : null;
  const lastUnit = last ? (last.dose_unit || (last.dose_ml ? "ml" : last.dose_g ? "g" : "")) : "";
  const lastText = last
    ? `${new Date(last.date).toLocaleDateString([], {day:"2-digit", month:"short"})} · ${lastDose !== null ? `${lastDose} ${lastUnit} · ` : ""}${echapperHtml(last.product || last.detail || "Action enregistrée")}`
    : "Aucune action enregistrée";

  const customPhPlus = profil.ph_plus_product === "custom_ph_plus";
  const customPhMinus = profil.ph_minus_product === "custom_ph_minus";
  const customSanitizer = profil.sanitizer_product === "custom_sanitizer";

  const recentHistory = (historique || []).slice(0, 5).map((item) => {
    const date = new Date(item.date).toLocaleString([], {day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit"});
    const label = item.kind === "sanitizer_measurement"
      ? `Mesure ${profil.treatment === "bromine" ? "brome" : "chlore"} : ${item.sanitizer_level} mg/L`
      : (item.detail || item.product || "Action enregistrée");
    return `<li><time>${date}</time><span>${echapperHtml(label)}</span></li>`;
  }).join("");

  const actionButtons = modele.actions.length
    ? modele.actions.map((action, index) => `<button class="rc24-action ${action.kind === "bromine_shock" ? "is-critical" : ""} ${action.manualConfirmation ? "is-manual" : ""}" type=button data-treatment-action="${index}" title="${action.manualConfirmation ? "Confirmation manuelle d’une dose d’entretien issue de l’étiquette" : "Enregistrer cette action"}">${action.kind === "feeder_setting" ? "⚙️" : action.kind.startsWith("maintenance_") ? "🧹" : action.manualConfirmation ? "☑" : "✓"}<span>${echapperHtml(action.label)}</span></button>`).join("")
    : `<div class=rc24-no-action>Aucune action à enregistrer pour le moment.</div>`;

  return `<section class="v3-section rc24-treatment-section ${classeSection}" id=rc24-treatment data-rc271-section=treatment>
      <header class=v3-section__header ${attributsEntete}>
        <span class=v3-section__icon>🧪</span>
        <div><h2>Traitement & dosage</h2><p>Profil du bassin, doseur et calculs issus des étiquettes</p></div>
        ${chevronHtml}
      </header>
      <div class=rc24-treatment-grid>
        <article class="v3-info-card rc24-profile-card">
          <header><span>⚙️</span><h3>Profil du bassin</h3><b class=rc24-verified>Calcul local</b></header>
          <div class=rc24-form-grid>
            <label><span>Volume du bassin</span><div class=rc24-input-unit><input data-treatment-field=volume_m3 type=number min=1 max=500 step=.1 value="${profil.volume_m3}"><em>m³</em></div></label>
            <label><span>Traitement</span><select data-treatment-field=treatment><option value=bromine ${profil.treatment === "bromine" ? "selected" : ""}>Brome</option><option value=chlorine ${profil.treatment === "chlorine" ? "selected" : ""}>Chlore</option></select></label>
            <label><span>Débit nominal de la pompe</span><div class=rc24-input-unit><input data-treatment-field=pump_flow_m3h type=number min=.1 max=200 step=.1 value="${profil.pump_flow_m3h}"><em>m³/h</em></div><small class=rc28-field-hint>StarFlo 1/2 HP : 10 m³/h</small></label>
            <label><span>Mode du bassin</span><select data-treatment-field=pool_mode><option value=active ${profil.pool_mode === "active" ? "selected" : ""}>En service</option><option value=winterized ${profil.pool_mode === "winterized" ? "selected" : ""}>Hiverné</option></select></label>
            <label class=rc24-wide><span>Doseur installé</span><select data-treatment-field=feeder_model>${rendreOptionsTraitement(doseurs, profil.feeder_model, echapperHtml)}</select></label>
            <label><span>Réglage actuel</span><div class=rc24-input-unit><input data-treatment-field=feeder_setting type=number min=0 max="${profil.feeder_scale_max}" step=1 value="${profil.feeder_setting}"><em>/${profil.feeder_scale_max}</em></div></label>
            <label><span>Maximum de l’échelle</span><input data-treatment-field=feeder_scale_max type=number min=1 max=20 step=1 value="${profil.feeder_scale_max}"></label>
            <label><span>${modele.sanitizerTarget.label} mesuré</span><div class=rc24-input-unit><input data-treatment-field=sanitizer_level type=number min=0 max=20 step=.1 placeholder="À saisir" value="${profil.sanitizer_level}"><em>mg/L</em></div></label>
            <label><span>État visuel de l’eau</span><select data-treatment-field=water_condition><option value=clear ${profil.water_condition === "clear" ? "selected" : ""}>Claire</option><option value=cloudy ${profil.water_condition === "cloudy" ? "selected" : ""}>Trouble</option><option value=green ${profil.water_condition === "green" ? "selected" : ""}>Verte</option></select></label>
            <label class=rc24-wide><span>Fréquentation / incident récent</span><select data-treatment-field=recent_load><option value=normal ${profil.recent_load === "normal" ? "selected" : ""}>Normale</option><option value=busy ${profil.recent_load === "busy" ? "selected" : ""}>Forte fréquentation</option><option value=polluted ${profil.recent_load === "polluted" ? "selected" : ""}>Pollution importante</option></select></label>
          </div>
          <details class=rc24-products data-treatment-details=products ${etatDetails.products ? "open" : ""}>
            <summary>Produits et dosage de l’étiquette</summary>
            <div class=rc24-form-grid>
              <label><span>Produit pH+</span><select data-treatment-field=ph_plus_product>${rendreOptionsTraitement(Object.fromEntries(Object.entries(produits).filter(([, item]) => item.kind === "ph_plus")), profil.ph_plus_product, echapperHtml)}</select></label>
              <label><span>Produit pH-</span><select data-treatment-field=ph_minus_product>${rendreOptionsTraitement(Object.fromEntries(Object.entries(produits).filter(([, item]) => item.kind === "ph_minus")), profil.ph_minus_product, echapperHtml)}</select></label>
              ${customPhPlus ? `<label><span>Nom du pH+</span><input data-treatment-field=custom_ph_plus_name type=text value="${echapperHtml(profil.custom_ph_plus_name)}"></label><label><span>Unité de l’étiquette</span><select data-treatment-field=custom_ph_plus_unit><option value=g ${profil.custom_ph_plus_unit === "g" ? "selected" : ""}>Grammes</option><option value=ml ${profil.custom_ph_plus_unit === "ml" ? "selected" : ""}>Millilitres</option></select></label><label class=rc24-wide><span>${profil.custom_ph_plus_unit}/10 m³ pour +0,1</span><input data-treatment-field=custom_ph_plus_rate type=number min=1 step=1 value="${profil.custom_ph_plus_rate}"></label>` : ""}
              ${customPhMinus ? `<label><span>Nom du pH-</span><input data-treatment-field=custom_ph_minus_name type=text value="${echapperHtml(profil.custom_ph_minus_name)}"></label><label><span>Unité de l’étiquette</span><select data-treatment-field=custom_ph_minus_unit><option value=g ${profil.custom_ph_minus_unit === "g" ? "selected" : ""}>Grammes</option><option value=ml ${profil.custom_ph_minus_unit === "ml" ? "selected" : ""}>Millilitres</option></select></label><label class=rc24-wide><span>${profil.custom_ph_minus_unit}/10 m³ pour -0,1</span><input data-treatment-field=custom_ph_minus_rate type=number min=1 step=1 value="${profil.custom_ph_minus_rate}"></label>` : ""}
              ${profil.treatment === "bromine" ? `<label class=rc24-wide><span>Activateur / produit choc</span><select data-treatment-field=sanitizer_product><option value=sunval_bromine_activator ${profil.sanitizer_product === "sunval_bromine_activator" ? "selected" : ""}>Sunval Activateur de brome · contre-étiquette vérifiée</option><option value=custom_sanitizer ${profil.sanitizer_product === "custom_sanitizer" ? "selected" : ""}>Produit personnalisé</option></select></label>${customSanitizer ? `<label class=rc24-wide><span>Nom du produit</span><input data-treatment-field=custom_sanitizer_name type=text value="${echapperHtml(profil.custom_sanitizer_name)}"></label><label><span>Entretien · g/10 m³</span><input data-treatment-field=custom_weekly_rate type=number min=1 step=1 value="${profil.custom_weekly_rate}"></label><label><span>Choc · g/10 m³</span><input data-treatment-field=custom_shock_rate type=number min=1 step=1 value="${profil.custom_shock_rate}"></label>` : ""}` : `<p class="rc24-profile-note rc24-wide">Le réglage chlore est calculé depuis la mesure manuelle. Aucun dosage de galet n’est proposé sans contre-étiquette spécifique au produit.</p>`}
              <label class=rc24-wide><span>Usage des produits complémentaires</span><select data-treatment-field=supplemental_products_mode><option value=on_demand ${profil.supplemental_products_mode === "on_demand" ? "selected" : ""}>Ponctuel / urgence · aucun rappel hebdomadaire</option><option value=manufacturer_schedule ${profil.supplemental_products_mode === "manufacturer_schedule" ? "selected" : ""}>Protocole fabricant · rappels hebdomadaires</option></select><small class=rc28-field-hint>Le mode ponctuel conserve les doses de référence mais masque les boutons d’entretien. Les traitements choc restent proposés si une situation le justifie.</small></label>
              <label><span>Anti-algues disponible</span><select data-treatment-field=algaecide_product><option value=none ${profil.algaecide_product === "none" ? "selected" : ""}>Non suivi</option><option value=bayrol_desalgin_classic ${profil.algaecide_product === "bayrol_desalgin_classic" ? "selected" : ""}>Bayrol Desalgin Classic · vérifié</option></select></label>
              <label><span>Anti-graisses disponible</span><select data-treatment-field=degreaser_product><option value=none ${profil.degreaser_product === "none" ? "selected" : ""}>Non suivi</option><option value=piscimar_grease_killer ${profil.degreaser_product === "piscimar_grease_killer" ? "selected" : ""}>Piscimar Grease Killer · vérifié</option></select></label>
            </div>
            <small>Les valeurs personnalisées doivent être recopiées exactement depuis la contre-étiquette.</small>
          </details>
          <details class="rc24-products rc26-maintenance-config" data-treatment-details=maintenance ${etatDetails.maintenance ? "open" : ""}>
            <summary>Équilibre, filtre, stock et nouveau contrôle</summary>
            <div class=rc24-form-grid>
              <label><span>TAC mesuré</span><div class=rc24-input-unit><input data-treatment-field=total_alkalinity type=number min=0 max=500 step=1 placeholder="À saisir" value="${profil.total_alkalinity}"><em>mg/L</em></div></label>
              <label><span>TH mesuré</span><div class=rc24-input-unit><input data-treatment-field=calcium_hardness type=number min=0 max=2000 step=1 placeholder="À saisir" value="${profil.calcium_hardness}"><em>mg/L</em></div></label>
              <label><span>Type de filtre</span><select data-treatment-field=filter_type><option value=sand ${profil.filter_type === "sand" ? "selected" : ""}>Sable</option><option value=glass ${profil.filter_type === "glass" ? "selected" : ""}>Verre</option><option value=cartridge ${profil.filter_type === "cartridge" ? "selected" : ""}>Cartouche</option><option value=diatom ${profil.filter_type === "diatom" ? "selected" : ""}>Diatomées</option></select></label>
              <label><span>Pression filtre propre</span><div class=rc24-input-unit><input data-treatment-field=filter_clean_pressure type=number min=0 max=10 step=.05 placeholder="À saisir" value="${profil.filter_clean_pressure}"><em>bar</em></div></label>
              <label><span>Pression actuelle</span><div class=rc24-input-unit><input data-treatment-field=filter_current_pressure type=number min=0 max=10 step=.05 placeholder="À saisir" value="${profil.filter_current_pressure}"><em>bar</em></div></label>
              <label><span>Seuil de contre-lavage</span><div class=rc24-input-unit><input data-treatment-field=filter_pressure_threshold type=number min=0 max=5 step=.05 placeholder="Auto : +0,30" value="${profil.filter_pressure_threshold}"><em>bar</em></div><small class=rc28-field-hint>${modele.filterThreshold !== null ? `Seuil appliqué : ${modele.filterThreshold.toFixed(2)} bar` : "Automatique après saisie de la pression propre"}</small></label>
              <label><span>Stock de désinfectant</span><div class=rc24-input-unit><input data-treatment-field=sanitizer_stock_g type=number min=0 max=100000 step=10 placeholder="À saisir" value="${profil.sanitizer_stock_g}"><em>g</em></div></label>
              <label><span>Délai avant nouveau contrôle</span><div class=rc24-input-unit><input data-treatment-field=remeasure_delay_hours type=number min=0 max=168 step=.5 placeholder="Ex. 4" value="${profil.remeasure_delay_hours}"><em>h</em></div></label>
            </div>
            <div class="rc28-filter-state is-${modele.filterAdvice.tone}"><span>🫧</span><div><b>${modele.filterAdvice.state}</b><small>${modele.filterAdvice.detail}</small></div></div>
            <small>Le seuil automatique est fixé à la pression propre + 0,30 bar. Vous pouvez saisir une autre valeur issue du manuel.</small>
          </details>
          <p class=rc24-profile-note>Le dashboard conseille uniquement. Il ne commande pas le doseur et ne mélange jamais les profils chlore/brome.</p>
          <div class=rc26-profile-tools>
            <small>Profil mémorisé sur ce navigateur · journal des traitements synchronisé dans Home Assistant.</small>
            <button type=button data-treatment-reset>↺ Réinitialiser le profil</button>
          </div>
        </article>

        <article class="v3-info-card rc24-dose-card">
          <header><span>🧮</span><h3>Conseil calculé</h3><b class="rc24-confidence is-${modele.confidence.tone}">${modele.confidence.label}</b></header>
          <div class=rc24-dose-summary><strong>${echapperHtml(modele.summary)}</strong><small>${echapperHtml(modele.confidence.detail)} · bassin ${modele.volume} m³</small></div>
          <div class=rc24-advice-rows>
            <div class="rc24-advice-row is-${modele.phAdvice.tone}"><i>pH</i><span><b>${modele.phAdvice.title}</b><small>${modele.phAdvice.detail}</small></span></div>
            <div class="rc24-advice-row is-${modele.feederAdvice.tone}"><i>⚙</i><span><b>${modele.feederAdvice.title}</b><small>${modele.feederAdvice.detail}</small></span></div>
            <div class="rc24-advice-row is-${modele.sanitizerAdvice.tone}"><i>${modele.isBromine ? "Br" : "Cl"}</i><span><b>${modele.sanitizerAdvice.title}</b><small>${modele.sanitizerAdvice.detail}</small></span></div>
            <div class="rc24-advice-row is-${modele.filtrationTone}"><i>⏱</i><span><b>Filtration</b><small>${modele.filtrationAdvice}</small></span></div>
          </div>
          <details class=rc26-maintenance-details>
            <summary>Conseils d’entretien complémentaires</summary>
            <div class=rc24-advice-rows>
              <div class="rc24-advice-row is-${modele.balanceAdvice.tone}"><i>⚖</i><span><b>${modele.balanceAdvice.title}</b><small>${modele.balanceAdvice.detail}</small></span></div>
              <div class="rc24-advice-row is-${modele.filterAdvice.tone}"><i>🫧</i><span><b>${modele.filterAdvice.title}</b><small>${modele.filterAdvice.detail}</small></span></div>
              <div class="rc24-advice-row is-${modele.stockAdvice.tone}"><i>📦</i><span><b>${modele.stockAdvice.title}</b><small>${modele.stockAdvice.detail}</small></span></div>
              <div class="rc24-advice-row is-${modele.remeasureAdvice.tone}"><i>🕒</i><span><b>${modele.remeasureAdvice.title}</b><small>${modele.remeasureAdvice.detail}</small></span></div>
              ${(modele.supplementalAdvice || []).map((item) => `<div class="rc24-advice-row is-${item.tone}"><i>🧴</i><span><b>${echapperHtml(item.title)}</b><small>${echapperHtml(item.detail)}</small></span></div>`).join("")}
            </div>
          </details>
          <div class=rc24-actions>${actionButtons}</div>
          <div class=rc24-history><span><b>Dernière action</b><small>${lastText}</small></span>${last ? `<button type=button data-treatment-undo>Annuler</button>` : ""}</div>
          ${recentHistory ? `<details class=rc26-action-log><summary>Journal des 5 dernières actions</summary><ol>${recentHistory}</ol></details>` : ""}
        </article>
      </div>
    </section>`;
}
