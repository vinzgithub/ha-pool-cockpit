/* SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0 */
function installWinteringV430(Card){
  const p=Card.prototype;
  const original={render:p.render,deviceEnabled:p.deviceEnabled,deviceFresh:p.deviceFresh,
    treatmentModel:p.treatmentModel,adaptive:p.rc30AdaptiveRecommendation,
    control:p.rc27ControlEquipment,pacModel:p.rc30PacModel,timeline:p.rcV4PlanningTimeline,disconnected:p.disconnectedCallback};
  p.winterDeviceKey=function(device,index){return String(device._rc8Id||this.deviceKey(device,index));};
  p.winterLive=function(){return winterBackendLive(this._rc27Control);};
  p.deviceEnabled=function(device,index=this.config?.devices?.indexOf(device)??-1){
    const eq=this._rc27Control?.winter_status?.configuration?.equipment?.[this.winterDeviceKey(device,index)]
      ||this._rc27Control?.wintering?.equipment?.[this.winterDeviceKey(device,index)];
    return (!eq||eq.status==='en_service')&&original.deviceEnabled.call(this,device,index);
  };
  p.deviceFresh=function(device,maxAgeHours=24){
    const last=this.deviceReading(device,'last_analysis'),stamp=Date.parse(last?.value),age=Date.now()-stamp;
    if(!Number.isFinite(stamp)||age<0||age>maxAgeHours*3600000)return false;
    const key=this.winterDeviceKey(device,this.config?.devices?.indexOf(device));
    const after=Date.parse(this._rc27Control?.winter_status?.configuration?.equipment?.[key]?.reactivated_at);
    return !Number.isFinite(after)||stamp>after;
  };
  p.syncRc27Context=function(model){
    if(!this._hass?.callWS||this.config?.pool_id==='pool_cockpit_demo')return;
    const weather=this.currentWeatherAlert();
    const sources=(this.config?.devices||[]).map((device,index)=>({key:this.winterDeviceKey(device,index),name:device.name||device.brand||'Sonde',
      enabled:original.deviceEnabled.call(this,device,index),temperature:device.entities?.temperature||'',ph:device.entities?.ph||'',orp:device.entities?.orp||'',last_analysis:device.entities?.last_analysis||''}));
    const watch={sensor_sources:sources,temperature_entities:sources.filter(s=>s.enabled).map(s=>s.temperature).filter(Boolean),
      ph_entities:sources.filter(s=>s.enabled).map(s=>s.ph).filter(Boolean),
      weather_entity:String(this.config.weather?.weather||''),air_temperature_entity:String(this.config.weather?.air_temperature||''),
      weather_alert_entity:String(weather.entityId||''),weather_heat_alert:Boolean(weather.alerts?.some(a=>a.key==='heatwave'&&a.severity>=2)),weather_cold_alert:Boolean(weather.alerts?.some(a=>a.key==='cold'&&a.severity>=2)),
      pool_volume_m3:Number(this._treatmentProfile?.volume_m3||0),pump_flow_m3h:Number(this._treatmentProfile?.pump_flow_m3h||0),
      water_condition:this._treatmentProfile?.water_condition||'clear',recent_load:this._treatmentProfile?.recent_load||'normal',
      sanitizer_level:this._treatmentProfile?.sanitizer_level,sanitizer_min:model?.sanitizerTarget?.min,
      sanitizer_label:model?.sanitizerTarget?.label,sanitizer_measured_at:this._treatmentProfile?.sanitizer_measured_at||''};
    const hash=JSON.stringify(watch);
    if(this._winterSyncing||(hash===this._winterContextHash&&Date.now()-(this._winterContextAt||0)<60000))return;
    this._winterSyncing=true;
    watch.context_updated_at=new Date().toISOString();
    this._hass.callWS({type:'ha_pool_dashboard/save_state',config:{watch}}).then(state=>{
      this._winterContextHash=hash;this._winterContextAt=Date.now();
      this._rc27Control=rc27SanitizeControl({...state,backend_available:true});
      writeRc27Control(this._rc27Control);
    }).catch(()=>{this._rc27Control.backend_available=false;}).finally(()=>{this._winterSyncing=false;});
  };
  p.saveRc27Control=async function(next,{render=true}={}){
    if(!this.winterLive()||!this._rc27Control?.winter_status?.master){this._winterError='Backend maître indisponible : modification non appliquée.';if(render)this.render();return;}
    const payload=JSON.parse(JSON.stringify(next));
    ['wintering','winter_status','winter_runtime','schedule_proposal','schema_version','overrides','boost_until','history'].forEach(k=>delete payload[k]);
    if(payload.pump){delete payload.pump.recommended_hours;if(payload.seasonal_profiles?.source==='adaptive'){delete payload.pump.periods;delete payload.pump.weekdays;}}
    try{const state=await this._hass.callWS({type:'ha_pool_dashboard/save_state',config:payload});this._rc27Control=rc27SanitizeControl({...state,backend_available:true});writeRc27Control(this._rc27Control);this._winterError='';}
    catch(error){this._winterError=error?.message||'Sauvegarde refusée ; réglages conservés.';this._rc27Control.backend_available=false;}
    if(render)this.render();
  };
  p.rc30AdaptiveRecommendation=function(control,model){
    const s=control?.winter_status;
    if(!s){return {...original.adaptive.call(this,control,model),context:this.config?.pool_id==='pool_cockpit_demo'?'Démonstration · recommandation simulée':'Backend v4.3.0 requis · suggestion locale non exécutable'};}
    const old=original.adaptive.call(this,control,{...model,filtrationHours:s.calculated_hours});
    const periods=s.proposed_periods||[],watch=control.watch||{};
    return {...old,hours:s.calculated_hours,periods,weekdays:control.pump?.weekdays||[],
      water:s.water_temperature_c,context:s.reason,signature:JSON.stringify([s.calculated_hours,periods,s.source]),
      scheduleLabel:periods.filter(p=>p.enabled).map(p=>p.start+' → '+p.end).join(' + ')||'Aucune plage',
      hydraulicHours:watch.adaptive_hydraulic_hours??null};
  };
  p.treatmentModel=function(aggregated,weather){
    const model=original.treatmentModel.call(this,aggregated,weather),s=this._rc27Control?.winter_status;
    if(s)model.filtrationHours=s.calculated_hours;
    if(s?.mode==='hivernage_actif'&&!aggregated.usableCount){model.actions=[];model.summary='Capteurs hivernés / non valides : conseils de traitement suspendus';}
    return model;
  };
  p.rcV4PlanningTimeline=function(control){
    const status=control?.winter_status?.configuration?.equipment?.pac?.status;
    return original.timeline.call(this,status&&status!=='en_service'?{...control,pac:{...control.pac,mode:'off'}}:control);
  };
  p.rc30PacPeutCommander=function(){return false;}; // Preserve the backend's absolute PAC write lock.
  p.rc30PacModel=function(pac){
    const model=original.pacModel.call(this,pac),status=this._rc27Control?.winter_status?.configuration?.equipment?.pac?.status;
    return status&&status!=='en_service'?{...model,on:false,configured:false,mode:'Hivernée — remise en service manuelle nécessaire',setpoint:null}:model;
  };
  p.rc27ControlEquipment=async function(target,state){
    if(!this.winterLive()||!this._rc27Control?.winter_status?.master){this._winterError='Commande indisponible : backend maître non confirmé.';this.render();return;}
    if(target==='pac')return;
    const override=this._rc27Control?.overrides?.pump;
    if(target==='pump'&&state==='auto'&&override?.state==='off'&&(override.safety||override.source==='external')&&!window.confirm('Lever explicitement cet arrêt de sécurité/externe ? Confirmer uniquement après vérification du circuit.'))return;
    const frost=this._rc27Control?.winter_status?.runtime?.frost;
    if(target==='pump'&&state==='off'&&frost?.requested){
      if(!window.confirm('L’antigel est prioritaire sur cet arrêt ordinaire. Pour interdire tout démarrage, déclarer le circuit en maintenance. Conserver cette dérogation pour la fin du gel ?'))return;
    }
    return original.control.call(this,target,state);
  };
  p.winterSubmit=async function(form){
    if(!this.winterLive()||!this._rc27Control?.winter_status?.master)return;
    const changes={frost:{},equipment:{}};
    form.querySelectorAll('[data-winter-field]').forEach(input=>{const [parent,child]=input.dataset.winterField.split('.'),value=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;if(child)changes[parent][child]=value;else changes[parent]=value;});
    form.querySelectorAll('[data-winter-equipment]').forEach(input=>{changes.equipment[input.dataset.winterEquipment]=input.value;});
    const current=this._rc27Control.winter_status;
    const text=`Confirmer les changements ?\n\nMode : ${winterLabels[changes.mode]}\nBase hivernale : ${changes.base_hours} h/j à ${changes.start}\nProgramme actuel : ${current.applied_hours} h/j\nHydraulique : ${changes.hydraulic_ready?'autorisée':'INTERDITE'}\nAntigel : ${changes.frost.enabled?'activé':'désactivé'}\n\nL’entrée en hivernage applique le programme hivernal confirmé. La sortie ne remet pas les équipements en service. Les capteurs réactivés attendent un nouvel échantillon.`;
    if(!window.confirm(text))return;
    try{
      const state=await this._hass.callWS({type:'ha_pool_dashboard/configure_wintering',payload:{confirmed:true,expected_revision:current.configuration.revision,changes}});
      this._rc27Control=rc27SanitizeControl({...state,backend_available:true});writeRc27Control(this._rc27Control);
      this._winterDraft={};this._winterError='';this._winterFormOpen=false;
    }catch(error){this._winterError=error?.message||'Configuration refusée ; recharger avant de confirmer.';}
    this.render();
  };
  p.render=function(){
    original.render.call(this);
    const root=this.shadowRoot,shell=root?.querySelector?.('.pool-cockpit-v4');
    if(!shell)return;
    const view=this._v4Ui?.ongletActif||'overview';
    root.querySelector('[data-winter-card]')?.remove();
    if(this._rc27Control?.winter_status?.mode==='hivernage_actif')root.querySelectorAll('.rc30-adaptive-overview').forEach(el=>el.remove());
    const devices=(this.config?.devices||[]).map((d,i)=>({key:this.winterDeviceKey(d,i),name:d.name||d.brand||'Sonde'}));
    const html=renderWinterCard({control:this._rc27Control,devices,view,demo:this.config?.pool_id==='pool_cockpit_demo',settings:['settings','planning'].includes(view),error:this._winterError});
    const nav=shell.querySelector('.v4-navigation');
    const heading=['planning','equipment','settings'].includes(view)?shell.querySelector('.v4-view__header'):null;
    if(heading)heading.insertAdjacentHTML('afterend',html);else if(nav)nav.insertAdjacentHTML('afterend',html);else shell.insertAdjacentHTML('afterbegin',html);
    const panel=root.querySelector('[data-winter-card]'),form=panel?.querySelector('[data-winter-form]');
    if(form){
      const details=panel.querySelector('.winter-config');details.open=Boolean(this._winterFormOpen);
      details.addEventListener('toggle',()=>{this._winterFormOpen=details.open;});
      form.querySelectorAll('[data-winter-field],[data-winter-equipment]').forEach(input=>{
        const key=input.dataset.winterField||'equipment.'+input.dataset.winterEquipment;
        if(Object.prototype.hasOwnProperty.call(this._winterDraft||{},key)){if(input.type==='checkbox')input.checked=this._winterDraft[key];else input.value=this._winterDraft[key];}
        input.addEventListener('input',()=>{this._winterDraft={...this._winterDraft,[key]:input.type==='checkbox'?input.checked:input.value};});
      });
      const catalog=(domain)=>Object.keys(this._hass?.states||{}).filter(id=>id.startsWith(domain+'.')).map(id=>`<option value="${winterEscape(id)}"></option>`).join('');
      form.insertAdjacentHTML('beforeend',`<datalist id="winter-sensors">${catalog('sensor')}</datalist><datalist id="winter-binary">${catalog('binary_sensor')}</datalist>`);
      form.addEventListener('submit',event=>{event.preventDefault();this.winterSubmit(form);});
    }
    if(!this._winterClockTimer)this._winterClockTimer=setInterval(()=>{if(this._connected)this.render();},30000);
  };
  p.disconnectedCallback=function(){if(this._winterClockTimer){clearInterval(this._winterClockTimer);this._winterClockTimer=null;}return original.disconnected?.call(this);};
}
installWinteringV430(PoolDashboardCard);
