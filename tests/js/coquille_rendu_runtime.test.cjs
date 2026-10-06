const test=require("node:test");
const assert=require("node:assert/strict");
const {loadBundle,buildCard,state}=require("./bundle_harness.cjs");

function cardRendu(){
  const runtime=loadBundle();
  const now="2026-09-06T19:55:00.000Z";
  const card=buildCard(runtime,{states:{
    "sensor.fp":state("7.31",{lastUpdated:now}),"sensor.fo":state("756",{unit:"mV",lastUpdated:now}),"sensor.ft":state("27.1",{unit:"°C",lastUpdated:now}),"sensor.fl":state(now,{lastUpdated:now}),"sensor.fs":state("idle",{lastUpdated:now}),"button.fa":state("unknown",{lastUpdated:now}),
    "sensor.bp":state("7.32",{lastUpdated:now}),"sensor.bo":state("760",{unit:"mV",lastUpdated:now}),"sensor.bt":state("27.2",{unit:"°C",lastUpdated:now}),"sensor.bl":state(now,{lastUpdated:now}),"sensor.bs":state("idle",{lastUpdated:now}),"button.ba":state("unknown",{lastUpdated:now}),
  }});
  return {runtime,card};
}

test("étape 21 conserve le vrai point d'entrée render et l'ordre des grandes zones",()=>{
  const {runtime,card}=cardRendu();
  assert.ok(Object.getOwnPropertyNames(runtime.PoolDashboardCard.prototype).includes("render"));
  card.render();
  const html=card.shadowRoot.innerHTML;
  const marqueurs=["hero-v2","Pilotage & actions","Performance de filtration","Mes appareils de mesure","Évolutions · 24 heures","Résumé actuel","Détail du score","Santé générale","Traitement & dosage","Informations utiles","Assistant Expert Piscine"];
  let precedent=-1;
  for(const marqueur of marqueurs){
    const index=html.indexOf(marqueur);
    assert.ok(index>precedent,`${marqueur} doit rester dans l'ordre historique`);
    precedent=index;
  }
});

test("SEC-000 runtime : un render complet de la coquille n'envoie aucune commande Home Assistant",()=>{
  const {card}=cardRendu();
  let services=0,ws=0;
  card._hass.callService=async()=>{services+=1};
  card._hass.callWS=async()=>{ws+=1;return{}};
  card.render();
  assert.equal(services,0);
  // Le render historique effectue déjà une lecture backend via callWS dans syncRc27Context.
  // L'étape 21 ne doit ni l'augmenter ni introduire de callService.
  assert.equal(ws,1);
  assert.match(card.shadowRoot.innerHTML,/Informations utiles/);
});

test("les préférences continuent à piloter les classes de la vraie coquille",()=>{
  const {card}=cardRendu();
  card._preferences={...card._preferences,compact_mobile:false,animations:false,advanced_measurements:true,temperature_unit:"F"};
  card.render();
  assert.match(card.shadowRoot.innerHTML,/<main class="app  pref-no-animations pref-advanced">/);
  assert.match(card.shadowRoot.innerHTML,/°F/);
});
