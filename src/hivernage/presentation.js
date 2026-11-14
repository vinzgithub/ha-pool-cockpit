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
export function renderWinterCard({control={},devices=[],now=Date.now(),settings=false,error=''}){
  const s=control.winter_status||{},c=s.configuration||control.wintering||{},r=s.runtime||{},f=r.frost||{};
  const live=winterBackendLive(control,now),master=live&&s.master===true;
  const e=winterEscape,l=value=>winterLabels[value]||value||'Non renseigné';
  const statuses=[['pump','Pompe de filtration'],['pac','Pompe à chaleur'],...devices.map(d=>[d.key,d.name])];
  const options=(values,current)=>values.map(v=>`<option value="${e(v)}" ${v===current?'selected':''}>${e(l(v))}</option>`).join('');
  const field=(key,label,value,type='number',extra='')=>`<label>${e(label)}<input data-winter-field="${key}" type="${type}" value="${e(value??'')}" ${extra}></label>`;
  const frost=c.frost||{};
  const equipment=statuses.map(([key,name])=>`<label>${e(name)}<select data-winter-equipment="${e(key)}">${options(['en_service','hiverne','maintenance','indisponible'],c.equipment?.[key]?.status||'en_service')}</select></label>`).join('');
  const form=settings?`<details class="winter-config"><summary>Configurer et confirmer</summary><form data-winter-form><fieldset ${master?'':'disabled'}>
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
  return `<section class="winter-card" data-winter-card aria-label="Hivernage actif">
    <header><div><small>PISCINE · FONCTIONNEMENT</small><h2>${e(l(c.mode||'normal'))}</h2></div><span class="winter-badge">${!live?'Backend indisponible · protection non confirmée':!s.master?'Satellite · aucune exécution locale':e(l(f.status))}</span></header>
    ${error?`<p role="alert" class="winter-alert">${e(error)}</p>`:''}
    ${!live?'<p role="alert" class="winter-alert">État non confirmé. Les dernières données affichées ne prouvent pas que la pompe fonctionne.</p>':''}
    ${(r.alerts||[]).map(a=>`<p role="alert" class="winter-alert">${e(a)}</p>`).join('')}
    <div class="winter-metrics"><div><span>Base hivernale</span><strong>${e(c.base_hours??4)} h/j</strong></div><div><span>Recommandation backend</span><strong>${live?e(s.calculated_hours):'—'} h</strong></div><div><span>Programme appliqué</span><strong>${live?e(s.applied_hours):'—'} h</strong></div><div><span>Origine</span><strong>${e(l(s.origin||'Non confirmée'))}</strong></div></div>
    ${s.different?`<p class="winter-alert">Recommandation : ${e(s.calculated_hours)} h / programme appliqué : ${e(s.applied_hours)} h — ${e(s.reason)}. Aucun remplacement silencieux.</p>`:''}
    <p><b>${e(s.reason||'En attente du backend')}</b>. Pompe réellement observée : ${live?(r.pump_state==='on'?'en marche':r.pump_state==='off'?'arrêtée':'indisponible'):'non confirmée'} · Débit : ${live&&r.flow_verified?'vérifié par le capteur':'non vérifié'}.</p>
    <p>Demande antigel : ${live&&f.requested?'oui':'non confirmée / inactive'} · Température locale : ${e(f.temperature_c??'—')} °C · ${e(l(f.sensor_status))}. Eau : ${e(l(s.water_status))}${s.water_temperature_c!=null?' · '+e(s.water_temperature_c)+' °C':''}.</p>
    <ul class="winter-equipment">${statuses.map(([key,name])=>`<li>${e(name)} : <b>${e(l(c.equipment?.[key]?.status||'en_service'))}</b>${c.equipment?.[key]?.status==='hiverne'?' — remise en service manuelle nécessaire':''}</li>`).join('')}</ul>
    <div data-winter-clock>${e(new Date(now).toLocaleString('fr-FR',{timeZone:s.timezone?.includes('/')?s.timezone:undefined}))} · ${e(s.timezone||'fuseau du navigateur')}</div>
    <h3>Programme prévu</h3>${winterTimeline(s.program_day,s.program_day?.segments,now)}
    <h3>Fonctionnement réellement constaté</h3>${winterTimeline(s.program_day,r.observations,now,true)}
    <small>Vert : marche observée · gris : arrêt observé · hachures : aucune observation. Le repère rouge indique maintenant. Un ordre n’est pas une preuve de circulation.</small>
    <details><summary>Pourquoi ce calcul ?</summary><p>Dernier recalcul : ${e(s.generated_at||'inconnu')} · Source : ${e(s.source)} · ${e(s.reason)}.</p><p>La validation concerne les prolongations proposées ; les plages régulières s’exécutent sans nouvelle validation. Une édition manuelle des plages passe en personnalisé.</p><ul>${(s.sensors||[]).map(row=>`<li>${e(row.name||row.key)} : ${e(l(row.status))} · ${e(row.value??'—')} °C · échantillon ${e(row.sample_at||'non daté')}</li>`).join('')}</ul><p>Durée et majorations calculées une fois côté backend ; l’antigel est arbitré séparément.</p><p>Commande pompe : ${e(r.command?.state||'aucune')} · demandée ${e(r.command?.requested_at||'—')} · confirmée ${e(r.command?.confirmed_at||'non confirmée')}.</p></details>
    ${form}<p class="winter-warning">${e(s.warning||'Home Assistant doit être disponible. Une protection hors-gel matérielle indépendante peut être nécessaire.')} Une plage à 02:00 ne garantit pas le hors-gel.</p>
  </section>`;
}
