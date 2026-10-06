const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {loadBundle,buildCard}=require("./bundle_harness.cjs");
const root=path.resolve(__dirname,"../..");
const template=fs.readFileSync(path.join(root,"frontend/pool-dashboard.template.js"),"utf8");

test("FIX10 replaces native select menus with the dashboard choice picker",()=>{
  assert.match(template,/rc30EnhanceChoiceSelects\(\)/);
  assert.match(template,/select:not\(\[data-rc30-choice-enhanced\]\)/);
  assert.match(template,/rc30-choice-picker__trigger/);
  assert.match(template,/rc30-choice-picker__panel/);
  assert.match(template,/rc30-native-select/);
});

test("FIX10 custom choices protect an open interaction from background rerender",()=>{
  assert.match(template,/\.rc30-entity-picker\.is-open,\.rc30-choice-picker\.is-open/);
  assert.match(template,/this\._rc27ConfigOpen=true/);
  assert.match(template,/event\.key==="Escape"/);
  assert.match(template,/event\.key==="ArrowDown"/);
});

test("FIX10 exposes invertible master satellite mode",()=>{
  // Le défaut reste vérifié dans le template historique ; les libellés déplacés
  // en étape 17 sont désormais vérifiés sur le comportement réel du bundle.
  assert.match(template,/coordination:\{role:"master",site_name:"Site A",peer_name:"Site B"/);
  assert.match(template,/rc30CoordinationCard\(control\)/);
  assert.match(template,/is-satellite-locked/);

  const runtime=loadBundle();
  const card=buildCard(runtime);
  card._rc27Control.coordination={role:"master",site_name:"Site A",peer_name:"Site B",allow_satellite_manual:true};
  const master=card.rc30CoordinationCard(card._rc27Control);
  assert.match(master,/Maître · exécute les programmes/);
  assert.match(master,/option value=master selected/);

  card._rc27Control.coordination={role:"satellite",site_name:"Site B",peer_name:"Site A",allow_satellite_manual:true};
  const satellite=card.rc30CoordinationCard(card._rc27Control);
  assert.match(satellite,/Satellite · affichage \/ commandes manuelles/);
  assert.match(satellite,/option value=satellite selected/);
});
