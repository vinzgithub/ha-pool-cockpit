"use strict";
// Browser-lifecycle regression checks for a fresh, sensor-free Home Assistant.
// No actual HA session, credentials, hardware or browser are touched.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {test} = require("node:test");

const moduleCode = fs.readFileSync(
  path.join(__dirname,"../release/v4.1.0/pool-cockpit-dual-mode-card.js"),"utf8"
);

function setup(){
  const memory = new Map();
  const children = [];
  class Shadow{
    constructor(){this.innerHTML="";this.children=[];this.mount={innerHTML:"",children:[],appendChild(node){this.children.push(node)}};}
    querySelector(selector){return selector===".mount"?this.mount:null;}
    querySelectorAll(){return [];}
  }
  class Element{
    constructor(){this.isConnected=true;this.shadowRoot=null;}
    attachShadow(){this.shadowRoot=new Shadow();return this.shadowRoot;}
  }
  class Base extends Element{
    setConfig(config){
      this.config=config;
      // Model the real V4 engine's global cached config behavior.
      if(Array.isArray(config.devices)&&config.devices.length>0){
        this.rc30RememberValidConfig?.(config);
      } else {
        this.config=this.rc30ReadLastValidConfig?.()||config;
      }
    }
    set hass(value){this._hass=value;}
    rc30RememberValidConfig(c){memory.set("ha_pool_dashboard_last_valid_config",JSON.stringify(c));}
    rc30ReadLastValidConfig(){try{return JSON.parse(memory.get("ha_pool_dashboard_last_valid_config")||"null");}catch{return null;}}
    addEventListener(){}
  }
  const registry=new Map([["pool-dashboard-v4-test-card",Base]]);
  const customElements={
    get:key=>registry.get(key),
    define:(key,cls)=>registry.set(key,cls)
  };
  const localStorage={
    getItem:key=>memory.get(key)||null,
    setItem:(key,value)=>memory.set(key,String(value))
  };
  const document={
    createElement:key=>{
      const C=registry.get(key);
      assert.ok(C,"missing child custom element "+key);
      const child=new C();
      children.push(child);
      return child;
    },
    querySelector:()=>null
  };
  vm.runInNewContext(moduleCode,
    {customElements,HTMLElement:Element,document,localStorage,console,Date,
      URLSearchParams,setTimeout,clearTimeout},
    {filename:"pool-cockpit-dual-mode-card.js"});
  return {Host:registry.get("pool-cockpit-dual-mode-card"),Standalone:registry.get("pool-cockpit-v4-demo-card"),memory,children};
}

test("fresh install displays Demo without blank Real and does not cache fake devices",()=>{
  const {Host,memory,children}=setup();
  const card=new Host();
  card.setConfig({devices:[],title:"Ma Piscine",visual_theme:"ocean"});
  assert.equal(card._mode,"demo");
  assert.equal(children.length,1);
  assert.ok(children[0].config.devices.length>0,"Demo has virtual sensors");
  assert.ok(card.shadowRoot.innerHTML.includes('data-mode="demo" aria-pressed="true"'));
  assert.equal(memory.has("ha_pool_dashboard_last_valid_config"),false,"no demo config in browser cache");
  const hass={states:{"sensor.real":{state:"30"}}};
  card.hass=hass;
  assert.notEqual(children[0]._hass,hass,"Demo must never receive live Home Assistant object");
  card._switch("real");
  assert.equal(card._mode,"real");
  assert.equal(card._child,null);
  assert.match(card.shadowRoot.mount.innerHTML,/aucun appareil configuré/);
  assert.equal(memory.has("ha_pool_dashboard_last_valid_config"),false);
  card._switch("demo");
  assert.equal(card._mode,"demo");
  assert.equal(memory.has("ha_pool_dashboard_last_valid_config"),false);
});

test("configured pool starts in Real with its real hass and retains real configuration",()=>{
  const {Host,memory}=setup();
  const card=new Host();
  const device={key:"real-pool",entities:{temperature:"sensor.real_temperature"}};
  const settings={devices:[device],title:"Piscine personnelle"};
  card.hass={states:{"sensor.real_temperature":{state:"23"}}};
  card.setConfig(settings);
  assert.equal(card._mode,"real");
  assert.equal(card._child.config.title,settings.title);
  assert.equal(card._child._hass,card._realHass);
  assert.equal(JSON.parse(memory.get("ha_pool_dashboard_last_valid_config")).devices[0].key,"real-pool");
  card._switch("demo");
  assert.equal(card._mode,"demo");
  assert.equal(JSON.parse(memory.get("ha_pool_dashboard_last_valid_config")).devices[0].key,"real-pool",
    "switching to Demo must not overwrite real browser settings");
});

test("explicit initial_mode real with no sensors shows a clear empty-state, not a grey card",()=>{
  const {Host,memory}=setup();
  // Even a stale DEMO cache from older versions must not be reused.
  memory.set("ha_pool_dashboard_last_valid_config",JSON.stringify({devices:[{key:"pool_cockpit_demo"}]}));
  const card=new Host();
  card.setConfig({devices:[],initial_mode:"real"});
  assert.equal(card._mode,"real");
  assert.equal(card._child,null);
  assert.match(card.shadowRoot.mount.innerHTML,/Aucune mesure réelle disponible/);
  assert.ok(card.shadowRoot.innerHTML.includes('data-mode="real" aria-pressed="true"'));
});
