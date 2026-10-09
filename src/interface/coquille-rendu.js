/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Assemble la coquille HTML principale du dashboard à partir d'un modèle de
 * vue explicite et de fragments déjà rendus par les responsabilités dédiées.
 *
 * RÈGLE SEC-000 : ce module n'accède ni à Home Assistant, ni au DOM, ni au
 * stockage. Il ne lie aucun événement et ne déclenche aucune commande.
 */
export function rendreCoquillePrincipaleDashboard({
  preferences,
  weatherAlertBanner,
  smart,
  ICONS,
  titre,
  displayTemp,
  temp,
  aggregated,
  libelleConfiance,
  confidence,
  enabledCount,
  nombreAppareils,
  weather,
  presentationMeteo,
  h,
  analyseDisponible,
  scoreValue,
  scoreDisplay,
  sourceLabel,
  derniereAnalyseFormatee,
  fragments,
  sections,
  phAssessment,
  pourcentagePh,
  pourcentageOrp,
  breakdown,
  confidenceDetail,
  weatherAlert,
  weatherAlertOptions,
  vigilanceUrl,
  echapperHtml,
  conseilAlerteMeteo,
  treatmentModel,
  smartAdviceLines,
  recent,
  comparisons,
  metaComparaison,
  typeTraitement,
  assistantExpertHtml,
}) {
  const confianceIndisponible =
    String(libelleConfiance ?? "").trim().toLowerCase() === "indisponible";

  const confianceValeurHero =
    confianceIndisponible ? "—" : `${confidence}%`;

  const confianceDetailHero =
    confianceIndisponible
      ? "Indisponible"
      : aggregated.activeCount === 1 && confidence === 100
        ? "1 source valide"
        : "";

  const sousTitreTemperatureHero =
    temp.count > 0
      ? `Température moyenne de l'eau · ${temp.count} appareil${temp.count > 1 ? "s" : ""}`
      : "Température de l'eau · Aucune mesure disponible";

  return `<main class="app ${preferences.compact_mobile?"pref-compact-mobile":""} ${preferences.animations?"":"pref-no-animations"} ${preferences.advanced_measurements?"pref-advanced":""}">
      ${weatherAlertBanner}
      <section class=hero-v2 data-health="${smart.level}">
        <div class=hero-v2__effects aria-hidden=true>
          <i class="hero-v2__wave hero-v2__wave--1"></i>
          <i class="hero-v2__wave hero-v2__wave--2"></i>
          <i class="hero-v2__wave hero-v2__wave--3"></i>
          <i class="hero-v2__bubble hero-v2__bubble--1"></i>
          <i class="hero-v2__bubble hero-v2__bubble--2"></i>
          <i class="hero-v2__bubble hero-v2__bubble--3"></i>
          <i class="hero-v2__bubble hero-v2__bubble--4"></i>
          <i class=hero-v2__shimmer></i>
        </div>
        <div class=hero-v2__grid>
          <div class=hero-v2__left>
            <div class=hero-v2__brand>
              <span class=hero-v2__logo>${ICONS.drop}</span>
              <strong>${titre}</strong>
            </div>
            <div class=hero-v2__temperature>${displayTemp.value}<small>${displayTemp.unit}</small></div>
            <div class=hero-v2__subtitle>${sousTitreTemperatureHero}</div>
            <div class=hero-v2__metrics>
              <article class=hero-v2__metric>
                <span class=hero-v2__metric-icon>${ICONS.drop}</span>
                <span><small>pH moyen</small><strong>${aggregated.ph.value}</strong></span>
              </article>
              <article class="hero-v2__metric hero-v2__confidence">
                <span class=hero-v2__metric-icon>${ICONS.shield}</span>
                <span><small>Confiance</small><strong>${confianceValeurHero}</strong><em>${confianceDetailHero}</em></span>
              </article>
              <article class=hero-v2__metric>
                <span class=hero-v2__metric-icon>${ICONS.device}</span>
                <span><small>Appareils</small><strong>${enabledCount}/${nombreAppareils} actifs</strong></span>
              </article>
              <article class="hero-v2__metric hero-v2__weather ${weather.available?presentationMeteo.classe:"weather-neutral"}">
                <span class=hero-v2__metric-icon>${weather.available?presentationMeteo.icone:ICONS.cloud}</span>
                <span><small>Météo</small><strong>${weather.available?presentationMeteo.libelle:"Indisponible"}</strong><em>${weather.available?`${weather.temperature} ${weather.temperatureUnit}`:"—"}</em></span>
              </article>
            </div>
            <div class=hero-v2__mobile-summary>
              <span>${smart.label}</span><span>${h.suspended?"—":h.score+"/100"}</span>
            </div>
            ${analyseDisponible?`<button class="global-analysis hero-v2__mobile-analysis" data-analysis-all>${ICONS.flask}<span>Lancer une analyse générale</span></button>`:""}
          </div>
          <aside class=hero-v2__score>
            <div class=hero-v2__ring style="--hero-score:${scoreValue}">
              <div><strong>${scoreDisplay}</strong><small>${h.suspended?"":"/100"}</small></div>
            </div>
            <h2>${smart.label}</h2>
            <div class=hero-v2__stars>${h.suspended?"○":"★".repeat(Math.max(1,Math.round(h.score/20)))}</div>
            <p>${smart.message}<br>· ${sourceLabel}</p>
            ${analyseDisponible?`<button class=global-analysis data-analysis-all>${ICONS.flask}<span>Lancer une analyse</span></button>`:""}
            <div class=hero-v2__last>${ICONS.calendar}<span>Dernière analyse globale<strong>${derniereAnalyseFormatee}</strong></span></div>
          </aside>
        </div>
      </section>
      ${fragments.barreSections}
      ${fragments.programmation}${fragments.recommandationEauMeteo}
      ${fragments.filtration}

      ${fragments.capteurs}
      <section class="v3-section ${sections.charts.classe}" data-rc271-section=charts>
        <header class=v3-section__header ${sections.charts.attributs}>
          <span class=v3-section__icon>📈</span>
          <div><h2>Évolutions · 24 heures</h2><p>${sourceLabel}</p></div>
          ${sections.charts.chevron}
        </header>
        <div class=v3-charts>
          ${fragments.graphiqueTemperature}
          ${fragments.graphiquePh}
          ${fragments.graphiqueOrp}
        </div>
      </section>

      <section class="v3-section ${sections.summary.classe}" data-rc271-section=summary>
        <header class=v3-section__header ${sections.summary.attributs}>
          <span class=v3-section__icon>✨</span>
          <div><h2>Résumé actuel</h2><p>Vue instantanée des paramètres essentiels</p></div>
          ${sections.summary.chevron}
        </header>
        <div class=v3-summary>
          <article class="v3-summary-card v3-summary-card--ph ${phAssessment.tone==="good"?"good":"warning"}">
            <div class=v3-summary-card__top><span class=v3-mini-ring style="--v3-pct:${phAssessment.score}"><b>pH</b></span><span class=v3-status>${phAssessment.label}</span></div>
            <small>pH moyen</small><strong>${aggregated.ph.value}</strong>
            <div class=v3-progress><i style="width:${pourcentagePh}%"></i></div>
          </article>
          <article class="v3-summary-card v3-summary-card--orp ${aggregated.orp.number!==null&&(aggregated.orp.number<650||aggregated.orp.number>800)?"warning":"good"}">
            <div class=v3-summary-card__top><span class=v3-mini-ring style="--v3-pct:${pourcentageOrp}"><b>ORP</b></span><span class=v3-status>${aggregated.orp.number!==null&&(aggregated.orp.number<650||aggregated.orp.number>800)?"À surveiller":"Optimal"}</span></div>
            <small>ORP moyen</small><strong>${aggregated.orp.value}</strong>
            <div class=v3-progress><i style="width:${pourcentageOrp}%"></i></div>
          </article>
          <article class="v3-summary-card v3-summary-card--score score">
            <div class=v3-summary-card__top><span class=v3-mini-ring style="--v3-pct:${scoreValue}"><b>★</b></span><span class=v3-status>${smart.label}</span></div>
            <small>Score global</small><strong>${scoreDisplay}<em>${h.suspended?"":"/100"}</em></strong>
            <div class=v3-progress><i style="width:${scoreValue}%"></i></div>
          </article>
        </div>
      </section>

      <section class="v3-section ${sections.score.classe}" data-rc271-section=score>
        <header class=v3-section__header ${sections.score.attributs}>
          <span class=v3-section__icon>🎯</span>
          <div><h2>Détail du score</h2><p>Contribution de chaque dimension au score global</p></div>
          ${sections.score.chevron}
        </header>
        <div class=v3-score-grid>
          ${[
            ["🌡","Température",breakdown.temperature],
            ["💧","pH",breakdown.ph],
            ["⚡","ORP",breakdown.orp],
            ["📈","Stabilité",breakdown.stability],
            ["◎","Cohérence",breakdown.coherence]
          ].map(([icon,label,value])=>`<article class=v3-score-card>
            <div class=v3-score-card__head><span>${icon}</span><div><h3>${label}</h3><p>${value}/20 points</p></div><strong>${value*5}%</strong></div>
            <div class=v3-progress><i style="width:${value*5}%"></i></div>
          </article>`).join("")}
        </div>
      </section>

      <section class="v3-section ${sections.health.classe}" data-rc271-section=health>
        <header class=v3-section__header ${sections.health.attributs}>
          <span class=v3-section__icon>❤️</span>
          <div><h2>Santé générale</h2><p>Qualité, stabilité et confiance des mesures</p></div>
          ${sections.health.chevron}
        </header>
        <div class=v3-health-grid>
          ${[
            ["💎","Qualité",scoreValue,""],
            ["📈","Stabilité",breakdown.stability*5,""],
            ["🛡","Confiance",confidence,confidenceDetail]
          ].map(([icon,label,value,detail])=>`<article class=v3-health-card>
            <div class=v3-health-card__head><span>${icon} ${label}</span><strong>${value}%</strong></div>
            <div class="v3-progress v3-progress--health"><i style="width:${value}%"></i></div>
            <small>${label==="Confiance"?`Confiance ${libelleConfiance.toLowerCase()}`:value>=85?"Excellent":value>=70?"Bon niveau":value>=50?"À surveiller":"Action recommandée"}</small>
            ${detail?`<em class=rc281-confidence-detail>${echapperHtml(detail)}</em>`:""}
          </article>`).join("")}
        </div>
      </section>

      ${fragments.traitement}

      <section class="v3-section ${sections.information.classe}" data-rc271-section=information>
        <header class=v3-section__header ${sections.information.attributs}>
          <span class=v3-section__icon>☀️</span>
          <div><h2>Informations utiles</h2><p>Météo, recommandations, historique et comparaison</p></div>
          ${sections.information.chevron}
        </header>
        <div class=v3-info-grid>
          <article class="v3-info-card v3-weather ${weather.available?presentationMeteo.classe:"weather-neutral"}" id=rc26-weather-card data-weather="${weather.condition||"unknown"}">
            <header><span class=v3-weather-icon>${weather.available?presentationMeteo.icone:ICONS.cloud}</span><h3>Météo locale</h3></header>
            ${weather.available?`<div class=v3-weather__main><span>${presentationMeteo.glyphe}</span><div><strong>${weather.temperature} ${weather.temperatureUnit}</strong><small>${presentationMeteo.libelle}</small></div></div>
            <div class=v3-weather__stats><div><small>Humidité</small><strong>${weather.humidity}${weather.humidity!=="—"?" %":""}</strong></div><div><small>Vent</small><strong>${weather.wind} ${weather.windUnit}</strong></div><div><small>UV</small><strong>${weather.uv}</strong></div></div>`:`<div class=chart-empty>Aucune météo détectée</div>`}
            <details class="rc26-weather-alert is-${weatherAlert.levelKey}" data-weather-alert-details ${weatherAlert.active?"open":""}>
              <summary><span>⚠️ Vigilances</span><b>${weatherAlert.available?(weatherAlert.active?weatherAlert.levelLabel:"Aucune vigilance"):weatherAlert.configured?"Indisponible":"Non configuré"}</b></summary>
              ${weatherAlert.available?`<div class=rc26-weather-alert__body>
                ${weatherAlert.active?`<div class=rc26-alert-chips>${weatherAlert.alerts.map(alert=>`<span class="is-${alert.key}">${alert.icon} ${echapperHtml(alert.label)} · ${alert.levelLabel}</span>`).join("")}</div>${weatherAlert.alerts.map(alert=>`<p><b>${alert.icon} ${echapperHtml(alert.label)}</b>${echapperHtml(conseilAlerteMeteo(alert.key))}</p>`).join("")}`:`<p><b>✅ Situation normale</b>Aucune vigilance active détectée pour le capteur sélectionné. La filtration reste calculée avec la température de l’eau et le débit de pompe.</p>`}
                <small>${echapperHtml(weatherAlert.department)} · ${weatherAlert.source}${weatherAlert.updatedAt?` · mise à jour ${new Date(weatherAlert.updatedAt).toLocaleString([], {dateStyle:"short",timeStyle:"short"})}`:""}</small>
                <a href="${vigilanceUrl}" target=_blank rel="noopener noreferrer">Ouvrir la carte officielle Météo-France ↗</a>
              </div>`:`<div class=rc26-weather-alert__body><p><b>Capteur non disponible</b>${weatherAlert.configured?"Vérifiez l’entité de vigilance choisie dans les préférences.":"Ajoutez l’intégration Météo-France puis sélectionnez le capteur de votre département."}</p><a href="${vigilanceUrl}" target=_blank rel="noopener noreferrer">Consulter la carte officielle ↗</a></div>`}
            </details>
          </article>

          <article class="v3-info-card v3-advice">
            <header><span>💡</span><h3>Conseils intelligents</h3><button type=button class=rc30-assistant-expert-trigger data-assistant-expert-open title="Ouvrir l'analyse détaillée en lecture seule">🧠 Analyse expert</button></header>
            <strong class=v3-advice__title>${h.suspended?"⚪":h.score>=85?"🟢":h.score>=70?"🟡":h.score>=50?"🟠":"🔴"} ${smart.label}</strong>
            <div class=v3-advice-legend aria-label="Légende des niveaux de conseil">
              <span class=is-good><i></i>OK</span>
              <span class=is-info><i></i>Information</span>
              <span class=is-warning><i></i>Surveillance</span>
              <span class=is-critical><i></i>Action</span>
            </div>
            <div class=advice-copy><p>${smart.message}</p><div class=advice-actions>
              <div class="${h.suspended?"is-info":h.score>=85?"is-good":h.score>=70?"is-warning":"is-critical"}"><b>${h.suspended?"○":h.score>=85?"✓":"!"}</b><span>${h.suspended?"Activez une source pour reprendre les analyses":h.score>=85?"Aucune action urgente requise":h.score>=70?"Surveillance recommandée":"Une action corrective est recommandée"}</span></div>
              <div class=is-info><b>↻</b><span>Nouvelle mesure conseillée dans environ 2 h</span></div>
              <div class="${!h.suspended&&h.score>=85&&confidence>=75?"is-good":"is-warning"}"><b>🏊</b><span>${!h.suspended&&h.score>=85&&confidence>=75?"Conditions favorables à la baignade":"Vérifiez les paramètres avant baignade"}</span></div>
            </div>${smartAdviceLines.map(line=>`<p>${line}</p>`).join("")}
            <div class=rc24-smart-dose><b>🧪 ${echapperHtml(treatmentModel.summary)}</b><small>${echapperHtml(treatmentModel.confidence.label)} · calcul pour ${treatmentModel.volume} m³</small><button type=button data-treatment-focus>Voir le dosage</button></div></div>
            <button class=advice-toggle type=button>Voir plus</button>
          </article>

          <article class="v3-info-card v3-history">
            <header><span>🕘</span><h3>Historique récent</h3></header>
            <div class=v3-timeline>${recent.length?recent.map(item=>`<div class=v3-timeline__row><span class=v3-timeline__dot></span><div><strong>${item.dateFormatee}</strong><small>${item.device.name}</small></div><b>OK</b></div>`).join(""):`<div class=chart-empty>Aucune analyse récente</div>`}</div>
          </article>

          <article class="v3-info-card v3-comparison ${comparisons.length?"":"is-suspended"}">
            <header><span>⇄</span><h3>Comparaison des appareils actifs</h3></header>
            ${comparisons.length?`<div class=v3-comparison__rows>${comparisons.map(row=>{const width=row.delta===null?0:Math.min(100,(row.delta/(row.metric==="orp"?300:row.limit))*100);return`<div class="v3-comparison__row is-${row.severity}"><div><strong>${row.label}</strong><small>${row.a.value} · ${row.b.value}</small></div><span class="${row.good?"good":"warn"}">${row.delta===null?"—":row.delta.toFixed(row.metric==="temperature"||row.metric==="ph"?2:0)+" "+row.unit}<small>${row.statusLabel}</small></span><div class=v3-progress><i style="width:${width}%"></i></div></div>`}).join("")}<p class=rc281-comparison-note>Tolérance ORP adaptée à l’installation : jusqu’à 200 mV sans pénalité.</p></div>`:`<div class=rc281-comparison-empty><b>Comparaison suspendue</b><span>${metaComparaison?.state==="time_gap"?metaComparaison.detail:`${metaComparaison?.activeName||"Une seule source"} est actuellement utilisée.`}</span><small>${metaComparaison?.state==="time_gap"?"Les deux relevés doivent dater de moins de 60 minutes l’un de l’autre.":"Réactivez le second appareil pour comparer les mesures."}</small></div>`}
          </article>

          <article class="v3-info-card v3-preferences">
            <header><span>⚙️</span><h3>Préférences</h3></header>
            <div class=v3-settings>
              <button class="v3-setting ${preferences.compact_mobile?"is-active":""}" type=button data-pref=compact_mobile aria-pressed="${preferences.compact_mobile}">
                <span><b>Compact mobile</b><small>Disposition optimisée</small></span>
                <i class="v3-switch ${preferences.compact_mobile?"is-on":""}"></i>
              </button>
              <button class="v3-setting ${preferences.animations?"is-active":""}" type=button data-pref=animations aria-pressed="${preferences.animations}">
                <span><b>Animations</b><small>Mouvements et reflets</small></span>
                <i class="v3-switch ${preferences.animations?"is-on":""}"></i>
              </button>
              <button class=v3-setting type=button data-unit-toggle aria-label="Changer l’unité de température">
                <span><b>Unité</b><small>Température de l’eau</small></span><em>°${preferences.temperature_unit}</em>
              </button>
              <button class="v3-setting ${preferences.advanced_measurements?"is-active":""}" type=button data-pref=advanced_measurements aria-pressed="${preferences.advanced_measurements}">
                <span><b>Mesures avancées</b><small>Valeurs techniques</small></span>
                <i class="v3-switch ${preferences.advanced_measurements?"is-on":""}"></i>
              </button>
              <button class=v3-setting type=button data-treatment-focus>
                <span><b>Profil du bassin</b><small>${treatmentModel.volume} m³ · ${typeTraitement==="bromine"?"Brome":"Chlore"} · ${echapperHtml(treatmentModel.feeder.short)}</small></span><em>Ouvrir</em>
              </button>
              <label class="v3-setting rc26-alert-setting">
                <span><b>Département / vigilance</b><small>${weatherAlert.available?echapperHtml(weatherAlert.department):"Capteur Météo-France"}</small></span>
                <select data-weather-alert-entity><option value=auto ${preferences.weather_alert_entity==="auto"?"selected":""}>Détection auto</option>${weatherAlertOptions.map(option=>`<option value="${echapperHtml(option.entityId)}" ${preferences.weather_alert_entity===option.entityId?"selected":""}>${echapperHtml(option.label)}</option>`).join("")}</select>
              </label>
            </div>
          </article>
        </div>
      </section>

      ${assistantExpertHtml}
    </main>`;
}
