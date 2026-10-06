const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {loadBundle,buildCard}=require("./bundle_harness.cjs");
const root=path.resolve(__dirname,"../..");
const template=fs.readFileSync(path.join(root,"frontend/pool-dashboard.template.js"),"utf8");

test("FIX10 uses custom searchable pickers for all large entity mappings",()=>{
  const runtime=loadBundle(),card=buildCard(runtime),calls=[];
  card.rc30EntityPicker=(label,path,domains,current,placeholder)=>{calls.push({label,path,domains,current,placeholder});return `<picker data-path="${path}"></picker>`};
  card.rc27ScheduleEditor("pump","Programmation de la pompe");
  card.rc27ScheduleEditor("light","Programmation de l’éclairage");
  assert.ok(calls.some(call=>call.label==="Entité de commande"&&call.path==="pump.entity_id"));
  assert.ok(calls.some(call=>call.label==="Capteur de puissance"&&call.path==="pump.power_entity"));
  assert.ok(calls.some(call=>call.label==="Capteur d’énergie"&&call.path==="pump.energy_entity"));
  assert.ok(calls.some(call=>call.label==="Entité de commande"&&call.path==="light.entity_id"));
  assert.match(template,/this\.rc30EntityPicker\("Caméra","camera_entity"/);
});

test("FIX10 picker filters only allowed HA domains and keeps missing configured entity",()=>{
  const runtime=loadBundle(),card=buildCard(runtime,{states:{
    "switch.pompe":{state:"on",attributes:{friendly_name:"Pompe"}},
    "sensor.temperature":{state:"26",attributes:{friendly_name:"Température"}},
  }});
  const catalogue=card.rc30EntityCatalog(["switch"],"switch.absente");
  assert.deepEqual(Array.from(catalogue,item=>item.entityId),["switch.absente","switch.pompe"]);
  assert.equal(catalogue[0].missing,true);
  const html=card.rc30EntityPicker("Commande","pump.entity_id",["switch"],"switch.absente","Sélectionner une entité");
  assert.match(html,/switch · indisponible/);
  assert.doesNotMatch(html,/sensor\.temperature/);
});

test("FIX10 picker saves without full render and background refresh cannot close it",()=>{
  assert.match(template,/this\.saveRc27Control\(next,\{render:false\}\)/);
  assert.match(template,/\.rc30-entity-picker\.is-open/);
  assert.match(template,/this\._rc30PendingBackgroundRender=true/);
  assert.match(template,/requestAnimationFrame\(\(\)=>search\.focus\(\)\)/);
});

test("FIX10 picker supports search, Enter and Escape",()=>{
  assert.match(template,/search\?\.addEventListener\("input",filter\)/);
  assert.match(template,/event\.key==="Escape"/);
  assert.match(template,/event\.key==="Enter"/);
  assert.match(template,/rc26Normalize\(option\.textContent\|\|""\)\.includes\(query\)/);
});
