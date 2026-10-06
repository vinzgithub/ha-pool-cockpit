const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {loadBundle,buildCard,FakeElement,state}=require("./bundle_harness.cjs");
const root=path.resolve(__dirname,"../..");
const template=fs.readFileSync(path.join(root,"frontend/dist/pool-dashboard.js"),"utf8");

test("PAC card is inserted between filtration and existing pool light",()=>{
  const runtime=loadBundle();
  const card=buildCard(runtime);
  const model=runtime.rc24TreatmentModel(card._treatmentProfile,{ph:7.3,temperature:27.1,history:[],weatherAlert:{available:false,alerts:[]}});
  const html=card.renderRc27Section(model,{hours:14,hydraulicHours:2,scheduleLabel:"08:30 → 22:30",seasonInfo:{libelle:"Été"},context:"test",water:27.1,air:24,heatAlert:false,coldAlert:false,weatherAlert:{},periods:[{enabled:true,start:"08:30",end:"22:30"}],weekdays:["mon","tue","wed","thu","fri","sat","sun"],signature:"pac-card-order"});
  const pump=html.indexOf('data-rc27-control="pump:on"');
  const pac=html.indexOf('<h3>PAC Polytropic</h3>',pump);
  const light=html.indexOf('<h3>Éclairage piscine</h3>',pac);
  assert.ok(pump>=0 && pac>pump && light>pac);
});

test("PAC FIX10 follows ESPHome entity architecture and keeps writes locked",()=>{
  assert.match(template,/PAC Polytropic · entités ESPHome \/ Home Assistant/);
  assert.match(template,/row\("Marche \/ arrêt · switch","command_entity",\["switch"\]/);
  assert.match(template,/row\("Pilotage Auto \/ Arrêt \/ Marche · select \(optionnel\)","control_mode_entity",\["select"\]/);
  assert.match(template,/row\("Température de consigne · number","setpoint_entity",\["number"\]/);
  assert.match(template,/row\("Mode PAC · select","mode_entity",\["select"\]/);
  assert.match(template,/row\("Water flow switch","water_flow_entity",\["binary_sensor"\]/);
  assert.match(template,/row\("High pressure switch · HP","high_pressure_entity",\["binary_sensor"\]/);
  assert.match(template,/row\("Low pressure switch · LP","low_pressure_entity",\["binary_sensor"\]/);
  assert.match(template,/row\("Code défaut compresseur","compressor_fault_code_entity",\["sensor"\]/);
  assert.match(template,/data-rc30-pac-sim="on">Démarrer/);
  assert.doesNotMatch(template,/data-rc30-pac-setpoint/);
  assert.match(template,/data-rc30-pac-gauge role=slider/);
  assert.match(template,/data-rc30-pac-confirm/);
  assert.match(template,/commandes Home Assistant actives sur le maître/);
  // Le verrou est désormais vérifié comportementalement dans pac_write_lock_runtime.test.cjs.
  assert.doesNotMatch(template,/row\([^\n]+\["[^\]]*climate/);
  assert.doesNotMatch(template,/data-rc27-control="pac:/);
});

test("PAC FIX10 contains no Modbus register address in dashboard mapping",()=>{
  const editor=template.slice(template.indexOf('rc30PacConfigEditor(){'),template.indexOf('rc27MaintenanceRows(){'));
  assert.doesNotMatch(editor,/\b(?:500|512|513|514|515|516|521|522|523|1000|1001)\b/);
  assert.match(editor,/aucune adresse de registre Modbus/i);
});

test("camera keeps a normal card width and 16:9 aspect ratio",()=>{
  assert.match(template,/\.rc27-camera\{grid-column:auto;align-self:start\}/);
  assert.match(template,/aspect-ratio:16\/9/);
});


test("PAC FIX10 prepares independent HA scheduling with pump interlock",()=>{
  assert.match(template,/Mode de programmation/);
  assert.match(template,/data-rc27-path="pac\.mode"/);
  assert.match(template,/data-rc27-target="pac"/);
  assert.match(template,/data-rc27-path="pac\.periods\.\$\{index\}\.start"/);
  assert.match(template,/pac\.requires_pump/);
  assert.match(template,/Sécurité hydraulique/);
});

test("FIX10 filters irrelevant Home Assistant refreshes to avoid full-card blinking",()=>{
  assert.match(template,/rc30HassRenderSignature\(hass\)/);
  assert.match(template,/signature!==this\._rc30LastHassSignature/);
  assert.match(template,/if\(changed\)this\.rc30RequestBackgroundRender\(\)/);
  assert.match(template,/rc30ConfigurationInteractionActive\(\)/);
  assert.match(template,/this\._rc30PendingBackgroundRender=true/);
  assert.doesNotMatch(template,/set hass\(hass\)\{this\._hass=hass;this\.reconcileAnalysisProgress\(\);this\.render\(\)/);
});


test("FIX10 keeps configuration open during background refreshes",()=>{
  assert.match(template,/settings\?\.open/);
  assert.match(template,/if\(!details\.open\)this\.rc30FlushBackgroundRender\(\)/);
  assert.match(template,/saveRc27Control\(next,\{render:false\}\)/);
});

test("FIX10 replaces huge native entity selects with searchable UX pickers",()=>{
  assert.match(template,/rc30EntityPicker\(label,path,domains,current/);
  assert.match(template,/data-rc30-entity-search/);
  assert.match(template,/Rechercher par nom ou entity_id/);
  assert.match(template,/\.rc30-entity-picker__panel/);
  assert.match(template,/\.rc30-entity-picker__options\{[^}]*max-height:310px/);
  assert.match(template,/const row=\(label,path,domains,placeholder="Facultatif"\)=>this\.rc30EntityPicker/);
  assert.doesNotMatch(template,/<select data-rc27-path="pac\.[^"]*_entity"/);
});

test("FIX10 exposes PAC total, daily and monthly energy entities",()=>{
  assert.match(template,/daily_energy_entity/);
  assert.match(template,/Énergie totale \/ compteur/);
  assert.match(template,/Énergie du jour/);
  assert.match(template,/monthly_energy_entity/);
  assert.match(template,/Énergie du mois/);
  assert.match(template,/ce mois/);
  assert.match(template,/Consommation/);
});

test("PAC FIX11 adds a circular dynamic setpoint gauge",()=>{
  assert.match(template,/rc30-pac-gauge/);
  assert.match(template,/--pac-progress/);
  assert.match(template,/rc30PacGaugeState/);
  assert.match(template,/rc30-pac-gauge--cooling/);
  assert.match(template,/rc30-pac-gauge--fault/);
  assert.match(template,/Eau bassin/);
});



test("PAC FIX12 conserve réellement le cadran 8–32 °C et la validation explicite",async()=>{
  const runtime=loadBundle();
  const card=buildCard(runtime,{states:{"number.pac_consigne":state("28.5",{attributes:{step:1}})}});
  card._rc27Control.pac={...card._rc27Control.pac,write_enabled:true,setpoint_entity:"number.pac_consigne"};
  assert.deepEqual(JSON.parse(JSON.stringify(card.rc30PacGaugeLimits())),{min:8,max:32,step:1});
  const ring={getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})};
  const value=card.rc30PacGaugeValueFromPointer({clientX:50,clientY:0},ring);
  assert.equal(Number.isFinite(value),true);
  assert.ok(value>=8&&value<=32);
  assert.equal(value%1,0);
  const confirm=new FakeElement();
  card.shadowRoot.register("[data-rc30-pac-confirm]",[confirm]);
  card._rc30PacDraftSetpoint=29;
  const calls=[];card._hass.callService=async(...args)=>calls.push(args);card.render=()=>{};
  card.bindRc27Controls();
  await confirm.click();
  assert.deepEqual(JSON.parse(JSON.stringify(calls)),[["number","set_value",{entity_id:"number.pac_consigne",value:29}]]);
});

test("PAC FIX11 splits operating mode and regulation in the UX",()=>{
  assert.match(template,/data-rc30-pac-operation/);
  assert.match(template,/☀️ Chauffage/);
  assert.match(template,/🔄 Automatique/);
  assert.match(template,/❄️ Froid/);
  assert.match(template,/data-rc30-pac-regulation/);
  assert.match(template,/🍃 Eco/);
  assert.match(template,/💡 Smart/);
  assert.match(template,/⚡ Boost/);
});

test("PAC FIX11 résout réellement l’option ESPHome combinée puis prépare select_option",async()=>{
  const runtime=loadBundle();
  const card=buildCard(runtime,{states:{"select.pac_mode":state("Heating + Eco",{attributes:{options:["Heating + Eco","Heating + Smart","Cooling + Boost","Auto (heat & cool)"]}})}});
  card._rc27Control.pac={...card._rc27Control.pac,write_enabled:true,mode_entity:"select.pac_mode"};
  assert.equal(card.rc30PacResolveSelectOption("heating","smart"),"Heating + Smart");
  assert.equal(card.rc30PacResolveSelectOption("auto","eco"),"Auto (heat & cool)");
  const operation=new FakeElement();operation.value="heating";
  const regulation=new FakeElement();regulation.value="smart";
  card.shadowRoot.register("[data-rc30-pac-operation]",[operation]);
  card.shadowRoot.register("[data-rc30-pac-regulation]",[regulation]);
  card.shadowRoot.register("[data-rc30-pac-operation],[data-rc30-pac-regulation]",[operation,regulation]);
  const calls=[];card._hass.callService=async(...args)=>calls.push(args);
  card.bindRc27Controls();
  await operation.dispatch("change");
  assert.deepEqual(JSON.parse(JSON.stringify(calls)),[["select","select_option",{entity_id:"select.pac_mode",option:"Heating + Smart"}]]);
});
