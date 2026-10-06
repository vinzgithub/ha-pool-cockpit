const test=require("node:test");
const assert=require("node:assert/strict");
const {loadBundle,buildCard,state}=require("./bundle_harness.cjs");

function cardAvecEntites(){
  const runtime=loadBundle();
  const card=buildCard(runtime,{states:{
    "switch.pompe":state("on",{attributes:{friendly_name:"Pompe principale"}}),
    "sensor.puissance":state("123",{attributes:{friendly_name:"Puissance pompe"}}),
    "light.piscine":state("off",{attributes:{friendly_name:"Éclairage piscine"}}),
    "camera.piscine":state("idle",{attributes:{friendly_name:"Caméra piscine"}}),
  }});
  return {runtime,card};
}

test("étape 20 expose toujours les vrais points d'entrée rc30EntityCatalog et rc30EntityPicker",()=>{
  const {runtime}=cardAvecEntites();
  const noms=Object.getOwnPropertyNames(runtime.PoolDashboardCard.prototype);
  assert.ok(noms.includes("rc30EntityCatalog"));
  assert.ok(noms.includes("rc30EntityPicker"));
});

test("le vrai bundle filtre les domaines et garde une entité configurée disparue",()=>{
  const {card}=cardAvecEntites();
  const catalogue=card.rc30EntityCatalog(["switch"],"switch.disparue");
  assert.deepEqual(Array.from(catalogue,item=>item.entityId),["switch.disparue","switch.pompe"]);
  assert.equal(catalogue[0].missing,true);
});

test("le vrai sélecteur rend le friendly_name, entity_id et l'état indisponible sans appel de service",()=>{
  const {card}=cardAvecEntites();
  let service=0,ws=0;
  card._hass.callService=async()=>{service+=1};
  card._hass.callWS=async()=>{ws+=1};
  const present=card.rc30EntityPicker("Commande","pump.entity_id",["switch"],"switch.pompe","Sélectionner une entité");
  const absent=card.rc30EntityPicker("Commande","pump.entity_id",["switch"],"switch.disparue","Sélectionner une entité");
  assert.match(present,/Pompe principale/);
  assert.match(present,/switch\.pompe/);
  assert.match(absent,/switch · indisponible/);
  assert.equal(service,0);
  assert.equal(ws,0);
});

test("la vue de programmation étape 19 consomme réellement le sélecteur étape 20",()=>{
  const {card}=cardAvecEntites();
  card._rc27Control.pump.entity_id="switch.pompe";
  const html=card.rc27ScheduleEditor("pump","Programmation de la pompe");
  assert.match(html,/data-rc27-path="pump\.entity_id"/);
  assert.match(html,/Pompe principale/);
  assert.match(html,/data-rc30-entity-search/);
});
