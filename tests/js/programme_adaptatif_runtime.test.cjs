const test=require('node:test');
const assert=require('node:assert/strict');
const {loadBundle,buildCard}=require('./bundle_harness.cjs');

function configurer(card,runtime,{current='summer',follow=false,source='custom'}={}){
  card._rc27Control=runtime.rc27SanitizeControl({
    ...card._rc27Control,
    pump:{...card._rc27Control.pump,recommended_hours:0},
    seasonal_profiles:{schema:3,current,follow_astronomical:follow,source,profiles:{}},
  });
  card._treatmentProfile={...card._treatmentProfile,volume_m3:16,pump_flow_m3h:10};
}

test('étape 18 utilise le vrai point d’entrée rc30AdaptiveRecommendation du bundle',()=>{
  const runtime=loadBundle();
  const noms=Object.getOwnPropertyNames(runtime.PoolDashboardCard.prototype);
  assert.ok(noms.includes('rc30AdaptiveRecommendation'));
});

test('le vrai dashboard conserve la recommandation nominale 14 h 08:30 → 22:30',()=>{
  const runtime=loadBundle();
  const card=buildCard(runtime);
  configurer(card,runtime);
  card.aggregate=(metric)=>metric==='temperature'?{number:27.1}:null;
  card.rc30AirTemperatureC=()=>24;
  card.currentWeatherAlert=()=>({available:true,alerts:[],levelLabel:'Aucune'});
  const resultat=card.rc30AdaptiveRecommendation(card._rc27Control,{filtrationHours:14});
  assert.equal(resultat.hours,14);
  assert.equal(resultat.scheduleLabel,'08:30 → 22:30');
  assert.equal(resultat.hydraulicHours,2);
});

test('le vrai dashboard conserve le placement Été lors d’une chaleur tardive en Automne',()=>{
  const runtime=loadBundle();
  const card=buildCard(runtime);
  configurer(card,runtime,{current:'autumn'});
  card.aggregate=()=>({number:27.1});
  card.rc30AirTemperatureC=()=>31;
  card.currentWeatherAlert=()=>({alerts:[]});
  const resultat=card.rc30AdaptiveRecommendation(card._rc27Control,{filtrationHours:14});
  assert.equal(resultat.base,'autumn');
  assert.equal(resultat.effective,'summer');
  assert.equal(resultat.scheduleLabel,'08:30 → 22:30');
});

test('le vrai dashboard conserve 24 h/24 sous canicule avec eau chaude',()=>{
  const runtime=loadBundle();
  const card=buildCard(runtime);
  configurer(card,runtime);
  card.aggregate=()=>({number:28.4});
  card.rc30AirTemperatureC=()=>32;
  card.currentWeatherAlert=()=>({alerts:[{key:'heatwave',severity:2}],levelLabel:'Orange'});
  const resultat=card.rc30AdaptiveRecommendation(card._rc27Control,{filtrationHours:14});
  assert.equal(resultat.heatAlert,true);
  assert.equal(resultat.hours,24);
  assert.equal(resultat.scheduleLabel,'24 h/24');
});
