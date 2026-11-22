/* SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0 */
// Pure presentation of the unified backend response. No HA or DOM access.
export const winterLabels = Object.freeze({normal:'Fonctionnement normal',hivernage_actif:'Hivernage actif',maintenance:'Maintenance',en_service:'En service',hiverne:'Hiverné',indisponible:'Indisponible',fresh:'Mesure valide',stale:'Mesure périmée / date non vérifiée',awaiting_sample:'Nouvelle mesure attendue',incoherent:'Mesure incohérente',unavailable:'Indisponible',none:'Aucune sonde',disabled:'Antigel désactivé',unconfirmed:'Protection non confirmée',monitoring:'Surveillance',entry_delay:'Risque détecté · temporisation',requested:'Circulation antigel demandée',exit_delay:'Sortie du gel · maintien temporaire'});
export function winterEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function winterBackendLive(control, now=Date.now()){
  const status=control?.winter_status, age=now-Date.parse(status?.generated_at);
  return Boolean(control?.backend_available&&status?.backend_version==='4.3.0'&&Number.isFinite(age)&&age>=-5000&&age<=90000);
}
export function winterTimeline(day, segments, now, observed=false){
  const begin=Date.parse(day?.start),end=Date.parse(day?.end),span=end-begin;
  if(!(span>0))return '<p>Frise indisponible.</p>';
  const blocks=(segments||[]).filter(s=>s.state==='on'||observed&&s.state==='off').map(s=>{
    const start=Math.max(begin,Date.parse(s.start)),stop=Math.min(end,Date.parse(s.end));
    if(!(stop>start))return '';
    return `<i class="winter-slot ${s.state==='off'?'is-off':''}" style="left:${100*(start-begin)/span}%;width:${100*(stop-start)/span}%" title="${winterEscape(s.start+' → '+s.end+' · '+s.state)}"></i>`;
  }).join('');
  const position=100*(now-begin)/span;
  return `<div class="winter-timeline ${observed?'is-observed':''}" role="img" aria-label="${observed?'Marche réellement observée ; zones hachurées : sans observation':'Plages prévues'}">${blocks}${position>=0&&position<=100?`<b class="winter-now" style="left:${position}%" title="Maintenant"></b>`:''}</div><div class="winter-axis"><span>00:00</span><span>Journée locale · ${day.elapsed_hours} h réelles</span><span>24:00</span></div>`;
}

function winterDemoFixture(now){
  // Fictional preview only: no HA state, physical commands or frost arbitration.
  const midnight=new Date(now);midnight.setHours(0,0,0,0);
  const tomorrow=new Date(midnight);tomorrow.setDate(tomorrow.getDate()+1);
  const start=new Date(midnight);start.setHours(4,30,0,0);
  const end=new Date(midnight);end.setHours(8,30,0,0);
  const observedEnd=new Date(midnight);observedEnd.setHours(7,0,0,0);
  return {
    mode:'hivernage_actif',base_hours:4,calculated_hours:4,applied_hours:4,
    source:'demo',origin:'hivernage_actif',different:false,
    reason:'Exemple fictif : 4 h de filtration de 04:30 à 08:30. Aucune programmation réelle modifiée.',
    generated_at:new Date(now).toISOString(),timezone:'Europe/Paris',
    configuration:{mode:'hivernage_actif',base_hours:4,start:'04:30',equipment:{
      pump:{status:'en_service'},pac:{status:'hiverne'},demo_bl:{status:'hiverne'},demo_fl:{status:'en_service'}
    }},
    runtime:{pump_state:'off',flow_verified:false,alerts:[],frost:{status:'disabled',sensor_status:'unavailable',temperature_c:null},
      observations:[{start:start.toISOString(),end:observedEnd.toISOString(),state:'on'}]},
    program_day:{start:midnight.toISOString(),end:tomorrow.toISOString(),
      elapsed_hours:(tomorrow-midnight)/3600000,segments:[{start:start.toISOString(),end:end.toISOString(),state:'on'}]},
    water_status:'hiverne',water_temperature_c:null,sensors:[],
    warning:'Exemple fictif : aucune protection antigel ni commande physique exécutée.'
  };
}
export function renderWinterCard({control={},devices=[],now=Date.now(),settings=false,error='',view='planning',demo=false}){
  // Demo uses its own fictional control only; never render a cached real winter status.
  const s=demo?winterDemoFixture(now):control.winter_status||{},c=s.configuration||(!demo&&control.wintering)||{},r=s.runtime||{},f=r.frost||{};
  const live=!demo&&winterBackendLive(control,now),master=live&&s.master===true;
  const e=winterEscape,l=value=>winterLabels[value]||value||'Non renseigné';
  const statuses=demo?[['pump','Pompe de filtration'],['pac','Pompe à chaleur'],['demo_bl','Blue Connect (fictif)'],['demo_fl','Flipr (fictif)']]:[['pump','Pompe de filtration'],['pac','Pompe à chaleur'],...devices.map(d=>[d.key,d.name])];
  const options=(values,current)=>values.map(v=>`<option value="${e(v)}" ${v===current?'selected':''}>${e(l(v))}</option>`).join('');
  const field=(key,label,value,type='number',extra='')=>`<label>${e(label)}<input data-winter-field="${key}" type="${type}" value="${e(value??'')}" ${extra}></label>`;
  const frost=c.frost||{};
  const equipment=statuses.map(([key,name])=>`<label>${e(name)}<select data-winter-equipment="${e(key)}">${options(['en_service','hiverne','maintenance','indisponible'],c.equipment?.[key]?.status||'en_service')}</select></label>`).join('');
  const form=settings&&!demo?`<details class="winter-config"><summary>Paramètres d’hivernage · configurer et confirmer</summary><form data-winter-form><fieldset ${master?'':'disabled'}>
    <div class="winter-fields"><label>Mode du bassin<select data-winter-field="mode">${options(['normal','hivernage_actif','maintenance'],c.mode||'normal')}</select></label>
    ${field('base_hours','Base hivernale (h/j)',c.base_hours??4,'number','min="0.25" max="24" step="0.25" required')}${field('start','Départ nocturne',c.start||'02:00','time','required')}
    <label class="winter-check"><input data-winter-field="hydraulic_ready" type="checkbox" ${c.hydraulic_ready!==false?'checked':''}>Circuit en eau, pompe autorisée à fonctionner</label>
    ${equipment}
    <label class="winter-check"><input data-winter-field="frost.enabled" type="checkbox" ${frost.enabled?'checked':''}>Activer la surveillance antigel</label>
    ${field('frost.temperature_entity','Capteur local antigel',frost.temperature_entity,'text','placeholder="sensor.temperature_local" list="winter-sensors"')}
    ${field('frost.sample_time_entity','Date du dernier échantillon antigel',frost.sample_time_entity,'text','placeholder="sensor.derniere_mesure" list="winter-sensors"')}
    ${field('frost.enter_c','Entrée antigel (°C)',frost.enter_c??3,'number','min="-10" max="10" step="0.5"')}
    ${field('frost.exit_c','Sortie antigel (°C)',frost.exit_c??5,'number','min="-9" max="15" step="0.5"')}
    ${field('frost.entry_delay_seconds','Temporisation entrée (s)',frost.entry_delay_seconds??60,'number','min="0" max="600"')}
    ${field('frost.exit_delay_seconds','Temporisation sortie (s)',frost.exit_delay_seconds??600,'number','min="30" max="3600"')}
    ${field('frost.minimum_run_seconds','Maintien minimal (s)',frost.minimum_run_seconds??900,'number','min="60" max="7200"')}
    ${field('frost.max_age_minutes','Âge maximal du capteur (min)',frost.max_age_minutes??15,'number','min="1" max="60"')}
    ${field('frost.command_timeout_seconds','Délai de confirmation pompe (s)',frost.command_timeout_seconds??120,'number','min="30" max="600"')}
    ${field('dry_run_entity','Verrou marche à sec (on = interdit)',c.dry_run_entity,'text','placeholder="binary_sensor.risque_a_sec" list="winter-binary"')}
    ${field('flow_entity','Débit confirmé (on = circulation)',c.flow_entity,'text','placeholder="binary_sensor.debit" list="winter-binary"')}
    </div><p>4 h/j est une suggestion à adapter et confirmer. La modification peut remplacer les plages actuelles. Une PAC hivernée doit être remise en service manuellement ; ce statut ne certifie pas sa vidange.</p>
    <p>Renseigner la date d’acquisition du capteur local, ou un attribut <code>measurement_timestamp</code>, <code>last_measurement</code> ou <code>last_sample</code>. Sans date fiable : protection non confirmée. La météo distante seule ne suffit pas.</p>
    <button type="submit">Vérifier et confirmer les changements</button></fieldset></form></details>`:'';
  const alerts=[...(error&&!demo?[error]:[]),...(!live&&!demo?['Backend indisponible · protection non confirmée. Les dernières données ne prouvent pas que la pompe fonctionne.']:[]),...(r.alerts||[])];
  const alertHtml=alerts.map(a=>`<p role="alert" class="winter-alert rc8-message">${e(a)}</p>`).join('');
  // Even views without a winter panel retain safety diagnostics outside details.
  if(!['overview','planning','equipment','settings','history'].includes(view))return alertHtml?`<section class="winter-card rc8-observation winter-alerts-only" data-winter-card aria-label="Alertes hivernage">${alertHtml}</section>`:'';
  const kinds={start:'Demande antigel',end:'Fin de demande',pump_observed:'Marche pompe observée',alert:'Alerte de sécurité',recovery:'Retour à la normale'};
  const eventRows=(!demo&&live?(s.events||[]):[]).slice(0,30).map(row=>{
    const time=Date.parse(row.date);
    const when=Number.isFinite(time)?new Date(time).toLocaleString('fr-FR',{timeZone:s.timezone?.includes('/')?s.timezone:undefined}):'Date inconnue';
    return `<li class="winter-event"><time datetime="${e(row.date)}">${e(when)}</time><b>${e(kinds[row.kind]||'Événement')}</b><span>${e(row.detail||'')}</span></li>`;
  }).join('');
  const eventsHtml=['planning','history'].includes(view)?`<details class="winter-events"><summary>Historique antigel ${demo?'(démonstration)':('('+eventRows.length+' derniers événements affichés)')}</summary>${demo?'<p class="winter-muted">Aucun événement réel dans la démonstration.</p>':eventRows?`<ol>${eventRows}</ol>`:'<p class="winter-muted">Aucun événement antigel enregistré pour le moment.</p>'}<p class="winter-muted">Les demandes antigel, observations de pompe et alertes sont distinctes. La marche observée ne prouve pas le débit.</p></details>`:'';
  const pump=demo?'Fictif · arrêtée':live?(r.pump_state==='on'?'En marche':r.pump_state==='off'?'Arrêtée':'Indisponible'):'Non confirmée';
  const frostLabel=demo?'Antigel non simulé':!live?'Protection non confirmée':!s.master?'Satellite · aucune exécution locale':l(f.status);
  const title=demo?'Hivernage actif · Démonstration':view==='overview'?l(c.mode||'normal'):view==='equipment'?'Équipements du bassin':view==='settings'?'Hivernage · paramètres':view==='history'?'Historique antigel':'Filtration et antigel';
  const metric=(label,value)=>`<div class="rc8-device-row"><span>${e(label)}</span><strong>${e(value)}</strong></div>`;
  const demoSettings=view==='settings'&&demo?
    '<details class="winter-config"><summary>Paramètres d’hivernage · aperçu non modifiable</summary>'+
    '<div class="winter-metrics">'+metric('Mode','Hivernage actif · fictif')+metric('Durée','4 h/j · exemple')+
    metric('Plage horaire','04:30 → 08:30')+metric('Antigel','Non simulé')+'</div>'+
    '<p class="winter-muted">En mode réel, ces réglages exigent une confirmation explicite. Aucune commande possible dans cette démonstration.</p></details>':'';
  const summary=`<div class="winter-summary"><span><b>Filtration</b> · ${demo?'Fictive · 4 h prévues':e(pump)}${live?' · '+e(s.applied_hours)+' h programmées':''}</span><span><b>Antigel</b> · ${e(frostLabel)}</span></div>`;
  const demoNote=demo?'<p class="rc8-message winter-demo" role="status">Données simulées : programme, frises et équipements fictifs. Aucun état du backend réel ni commande physique. La protection antigel n’est pas simulée.</p>':'';
  const diagnostic=demo?'<p class="winter-muted">Exemple fictif : ni la pompe ni le débit ne sont mesurés.</p>':live?`<p class="winter-muted">Pompe observée : ${e(pump.toLowerCase())} · Débit : ${r.flow_verified?'vérifié par le capteur':'non vérifié'}. Un ordre ne prouve pas la circulation.</p>`:'';
  const pacControlLabel=demo?'':!live?'Commande PAC non confirmée':control.pac?.write_enabled===true?'Commande PAC autorisée dans Pool Cockpit':'Commande PAC désactivée dans Pool Cockpit';
  const equipmentHtml=view==='equipment'?`<div class="winter-equipment">${statuses.map(([key,name])=>`<article class="rc8-device-row winter-equipment-item" data-winter-equipment="${e(key)}"><header><b>${e(name)}</b><span>${demo?e(l(c.equipment?.[key]?.status||'en_service'))+' · fictif':e(l(c.equipment?.[key]?.status||'en_service'))}</span></header>${!demo&&c.equipment?.[key]?.status==='hiverne'?'<p>Remise en service manuelle nécessaire.</p>':''}${key==='pac'&&!demo?`<p class="winter-pac-lock" data-winter-pac-lock>${e(pacControlLabel)}</p>`:''}</article>`).join('')}</div>${diagnostic}`:'';
  const planning=view==='planning'?`
    <div class="winter-metrics">${metric('Base hivernale',String(c.base_hours??4)+' h/j')}${metric('Durée recommandée',live||demo?s.calculated_hours+' h':'Non confirmée')}${metric('Programme appliqué',demo?'4 h · exemple':live?s.applied_hours+' h':'Non confirmé')}${metric('Origine',l(s.origin))}</div>
    ${s.different?`<p class="rc8-message">Recommandation : ${e(s.calculated_hours)} h / programme appliqué : ${e(s.applied_hours)} h — ${e(s.reason)}. Aucun remplacement silencieux.</p>`:''}
    <p>${e(s.reason||'En attente du backend')}</p>${diagnostic}
    <p class="winter-muted">Température locale : ${e(f.temperature_c??'—')} °C · ${e(l(f.sensor_status))}. Eau : ${e(l(s.water_status))}${s.water_temperature_c!=null?' · '+e(s.water_temperature_c)+' °C':''}.</p>
    <div data-winter-clock class="winter-muted">${e(new Date(now).toLocaleString('fr-FR',{timeZone:s.timezone?.includes('/')?s.timezone:undefined}))} · ${e(s.timezone||'fuseau du navigateur')}</div>
    <div class="winter-tracks"><div><h3>Programme prévu</h3>${winterTimeline(s.program_day,s.program_day?.segments,now)}</div><div><h3>${demo?'Fonctionnement simulé':'Fonctionnement réellement constaté'}</h3>${winterTimeline(s.program_day,r.observations,now,true)}</div></div>
    <p class="winter-legend">${demo?'Frises entièrement fictives · aucune marche réelle constatée.':'Vert : marche observée · gris : arrêt observé · hachures : aucune observation · repère rouge : maintenant.'}</p>
    <details class="winter-explanation"><summary>Pourquoi ce calcul ?</summary><p>Dernier recalcul : ${e(s.generated_at||'inconnu')} · Source : ${e(s.source)} · ${e(s.reason)}.</p><p>La validation concerne les prolongations proposées ; les plages régulières s’exécutent sans nouvelle validation. Une édition manuelle passe en personnalisé.</p><ul>${(s.sensors||[]).map(row=>`<li>${e(row.name||row.key)} : ${e(l(row.status))} · ${e(row.value??'—')} °C · échantillon ${e(row.sample_at||'non daté')}</li>`).join('')}</ul><p>Durée et majorations calculées une fois côté backend ; l’antigel est arbitré séparément.</p><p>Commande pompe : ${e(r.command?.state||'aucune')} · demandée ${e(r.command?.requested_at||'—')} · confirmée ${e(r.command?.confirmed_at||'non confirmée')}.</p></details>`:'';
  return `<section class="winter-card rc8-observation ${view==='overview'?'is-compact':''}" data-winter-card data-winter-view="${e(view)}" aria-label="Hivernage actif">
    <header class="winter-header"><h2>${e(title)}</h2>${view!=='overview'?`<span class="winter-badge">${e(frostLabel)}</span>`:''}</header>
    ${view==='overview'?summary:''}${demoNote}${alertHtml}${planning}${eventsHtml}${equipmentHtml}${form}${demoSettings}
    ${!demo&&['planning','settings'].includes(view)?`<p class="winter-warning">${e(s.warning||'Home Assistant doit être disponible. Une protection hors-gel matérielle indépendante peut être nécessaire.')} Une plage à 02:00 ne garantit pas le hors-gel.</p>`:''}
  </section>`;
}
