/* V4.1 experimental: render the authentic Pool Cockpit V4 card with fake data.
 * No live Home Assistant object is ever forwarded to a demo card.
 */
(() => {
  "use strict";
  const REAL="pool-dashboard-v4-test-card";
  const DUAL="pool-cockpit-dual-mode-card";
  const STANDALONE="pool-cockpit-v4-demo-card";
  const ids=Object.freeze({
    temperature:"sensor.pool_cockpit_demo_temperature",
    ph:"sensor.pool_cockpit_demo_ph",
    orp:"sensor.pool_cockpit_demo_orp",
    battery:"sensor.pool_cockpit_demo_battery",
    filtration:"switch.pool_cockpit_demo_filtration",
    pac:"switch.pool_cockpit_demo_pac",
    light:"light.pool_cockpit_demo_light",
    camera:"camera.pool_cockpit_demo",
    signal:"sensor.pool_cockpit_demo_signal",
    weather:"weather.pool_cockpit_demo"
  });
  const devices=()=>[{key:"pool_cockpit_demo",name:"Blue Connect · Démo",brand:"blue_connect",
    entities:{temperature:ids.temperature,ph:ids.ph,orp:ids.orp,battery:ids.battery,bluetooth_signal:ids.signal}}];
  function fakeHass(language="fr",notify=()=>{}){
    const at=new Date().toISOString();
    const state=(id,value,unit="")=>Object.freeze({entity_id:id,state:String(value),
      attributes:Object.freeze({friendly_name:id.split(".")[1].replaceAll("_"," "),unit_of_measurement:unit}),
      last_changed:at,last_updated:at});
    let states=Object.freeze({
      [ids.temperature]:state(ids.temperature,27.9,"°C"),
      [ids.ph]:state(ids.ph,7.34),
      [ids.orp]:state(ids.orp,735,"mV"),
      [ids.battery]:state(ids.battery,86,"%"),
      [ids.signal]:state(ids.signal,-58,"dBm"),
      [ids.weather]:Object.freeze({...state(ids.weather,"sunny"),attributes:Object.freeze({temperature:25,temperature_unit:"°C",humidity:52,wind_speed:12})}),
      [ids.filtration]:state(ids.filtration,"on"),
      [ids.pac]:state(ids.pac,"off"),
      "binary_sensor.pool_cockpit_demo_pac_active":state("binary_sensor.pool_cockpit_demo_pac_active","off"),
      [ids.light]:state(ids.light,"off"),
      [ids.camera]:Object.freeze({...state(ids.camera,"idle"),attributes:Object.freeze({friendly_name:"Caméra fictive",entity_picture:"/local/ha-pool-dashboard/assets/demo-pool-camera.jpg",supported_features:0})})
    });
    const blocked=async()=>{throw Error("Démonstration : API Home Assistant indisponible");};
    const history=()=>{
      const now=Date.now(),hour=3600000;
      return [ids.temperature,ids.ph,ids.orp].map((id,index)=>
        Array.from({length:25},(_,i)=>{
          const time=now-(24-i)*hour,phase=time/(90*60000);
          const value=index===0?(27.9+Math.sin(phase)*0.45).toFixed(1)
            :index===1?(7.30+Math.sin(phase/3)*0.07).toFixed(2)
            :String(Math.round(735+Math.cos(phase/2)*28));
          return {entity_id:id,state:value,last_changed:new Date(time).toISOString()};
        })
      );
    };
    const demoApi=async(method,path)=>{
      if(method!=="GET"||typeof path!=="string"||!path.startsWith("history/period/"))return blocked();
      const query=new URLSearchParams(path.split("?")[1]||"");
      const filter=(query.get("filter_entity_id")||"").split(",");
      return history().filter(series=>filter.includes(series[0].entity_id));
    };
    const context={
      get states(){return states;},locale:Object.freeze({language}),
      config:Object.freeze({unit_system:Object.freeze({temperature:"°C"})}),
      themes:Object.freeze({darkMode:false}),
      user:Object.freeze({name:"Démo",is_admin:false}),
      connection:null, // Prevent the native live-camera player from loading in demonstration mode.
      callService:async(domain,service,data={})=>{
        const id=data?.entity_id;
        const allowed=[ids.filtration,ids.pac,ids.light];
        if(!allowed.includes(id)||!["switch","light","homeassistant"].includes(domain)||
           !["turn_on","turn_off","toggle"].includes(service))return blocked();
        const old=states[id].state==="on";
        const on=service==="toggle"?!old:service==="turn_on";
        states=Object.freeze({...states,[id]:state(id,on?"on":"off"),...(id===ids.pac?{"binary_sensor.pool_cockpit_demo_pac_active":state("binary_sensor.pool_cockpit_demo_pac_active",on?"on":"off")}:{})});
        notify(context);
      },callWS:async(request)=>{
        // Simulate pump/light control in memory; never contact a live HA backend.
        if(request?.type==="ha_pool_dashboard/control"){
          if(!["pump","light"].includes(request.target)||!["on","off"].includes(request.state))return blocked();
          const entity=request.target==="pump"?ids.filtration:ids.light;
          states=Object.freeze({...states,[entity]:state(entity,request.state)});
          notify(context);
        }
        if(request?.type==="ha_pool_dashboard/get_state"||
           request?.type==="ha_pool_dashboard/control")return {
          backend_available:true,
          pump:{entity_id:ids.filtration,mode:"program",periods:[
            {enabled:true,start:"07:00",end:"14:00"},
            {enabled:true,start:"15:00",end:"22:00"},
            {enabled:false,start:"00:00",end:"00:00"}]},
          pac:{entity_id:ids.pac,command_entity:ids.pac,status_entity:"binary_sensor.pool_cockpit_demo_pac_active",mode:"manual"},
          light:{entity_id:ids.light,mode:"manual"},camera_entity:ids.camera,history:[],watch:{}
        };
        return blocked();
      },callApi:demoApi,fetchWithAuth:blocked
    };
    return Object.freeze(context);
  }
  class PoolCockpitV4DemoHost extends HTMLElement {
    constructor(standalone=false){
      super();this.attachShadow({mode:"open"});this._standalone=standalone;
      this._mode=standalone?"demo":"real";this._collapsed=false;try{this._collapsed=localStorage.getItem("pool-cockpit-v41-modebar-collapsed")==="1";}catch{}this._config={};this._realHass=null;this._child=null;
    }
    setConfig(config){
      if(!config||typeof config!=="object")throw Error("Configuration Pool Cockpit requise");
      this._config={...config};
      // On a fresh HA instance with no pool devices, show a safe, clearly
      // labelled simulation instead of an uninitialized real dashboard.
      // Explicit initial_mode takes precedence; configured pools start in Real.
      const configured=Array.isArray(config.devices)&&config.devices.length>0;
      this._mode=this._standalone||config.initial_mode==="demo"||
        (config.initial_mode!=="real"&&!configured)?"demo":"real";
      this._render();
    }
    set hass(value){
      if(this._standalone)return;
      this._realHass=value;
      if(this._mode==="real"&&this._child)this._child.hass=value;
    }
    getCardSize(){return this._child?.getCardSize?.()||9;}
    connectedCallback(){this._render();}
    _switch(mode){
      if(this._standalone||!["real","demo"].includes(mode)||mode===this._mode)return;
      this._mode=mode;this._render();
    }
    _render(){
      if(!this.isConnected)return;
      this._v41ConfigObserver?.disconnect();
      this._v41ConfigObserver=null;
      const demo=this._mode==="demo";
      const words=this._config.language==="en"
        ?["Real pool","Demonstration","DEMO MODE — SIMULATED DATA"]
        :["Piscine réelle","Démonstration","MODE DÉMO — DONNÉES FICTIVES"];
      this.shadowRoot.innerHTML=`<style>
        :host{display:block}.bar{display:flex;align-items:center;justify-content:flex-end;gap:4px;padding:2px 10px;margin-bottom:3px;background:transparent;color:var(--primary-text-color,#fff)}
        button{font:inherit;font-size:12px;font-weight:600;min-height:32px;padding:4px 10px;border:0;border-radius:9px;background:rgba(45,101,153,.12);color:inherit;cursor:pointer}
        button[aria-pressed=true]{background:var(--primary-color,#367fae);color:white}
        button:focus-visible{outline:3px solid #ffe080;outline-offset:2px}
        .bar.is-collapsed{padding:0 7px;margin:0;min-height:0}.bar.is-collapsed [data-mode]{display:none}\n        .bar .collapse-toggle{min-width:30px;min-height:30px;padding:3px 7px;background:rgba(45,101,153,.12)}\n        .notice{background:#ffe4a0;color:#2a240c;border-radius:8px;padding:7px 12px;font-weight:bold;margin:0 0 8px;display:inline-block}
      </style>${this._standalone?"":`<div class="bar ${this._collapsed?"is-collapsed":""}" role="group" aria-label="Mode Pool Cockpit">
        <button type="button" data-mode="real" aria-pressed="${!demo}">${words[0]}</button>
        <button type="button" data-mode="demo" aria-pressed="${demo}">${words[1]}</button>\n        <button type="button" class="collapse-toggle" data-collapse aria-expanded="${!this._collapsed}" aria-label="${this._collapsed?"Afficher la barre Réel / Démo":"Masquer la barre Réel / Démo"}" title="${this._collapsed?"Afficher":"Masquer"} la barre">${this._collapsed?"⌄":"⌃"}</button>
      </div>`}${demo?`<div class="notice" role="status">${words[2]}</div>`:""}<div class="mount"></div>`;
      this.shadowRoot.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>this._switch(b.dataset.mode)));
      const toggle=this.shadowRoot.querySelector("[data-collapse]");
      if(toggle)toggle.addEventListener("click",()=>{this._collapsed=!this._collapsed;try{localStorage.setItem("pool-cockpit-v41-modebar-collapsed",this._collapsed?"1":"0");}catch{}const bar=this.shadowRoot.querySelector(".bar");bar.classList.toggle("is-collapsed",this._collapsed);toggle.setAttribute("aria-expanded",String(!this._collapsed));toggle.setAttribute("aria-label",this._collapsed?"Afficher la barre Réel / Démo":"Masquer la barre Réel / Démo");toggle.textContent=this._collapsed?"⌄":"⌃";});
      // Never feed an empty Real configuration into the V4 engine: its
      // first-run path has no initialized device state, and its global
      // last-valid-config fallback could otherwise reuse DEMO device IDs.
      if(!demo&&(!Array.isArray(this._config.devices)||this._config.devices.length===0)){
        this._child=null;
        const mount=this.shadowRoot.querySelector(".mount");
        mount.innerHTML='<section data-v41-real-empty role="status" style="padding:24px;border-radius:18px;background:linear-gradient(135deg,#08355b,#12648b);color:#f3fbff;font-family:Arial,sans-serif;line-height:1.6"><h2 style="margin:0 0 10px;font-size:1.2rem">Piscine réelle : aucun appareil configuré</h2><p style="margin:0">Aucune mesure réelle disponible. Ajoutez vos appareils dans la configuration de cette carte Home Assistant, ou sélectionnez Démonstration pour découvrir Pool Cockpit avec des données fictives.</p></section>';
        return;
      }
      const child=document.createElement(REAL);
      const config={...this._config,type:"custom:"+REAL};
      delete config.initial_mode;
      if(demo){
        // V4 caches the last valid card config in browser localStorage.
        // Prevent demo sensors from polluting that global Real-mode cache.
        child.rc30ReadLastValidConfig=()=>null;
        child.rc30RememberValidConfig=()=>{};
        for(const key of Object.keys(config))delete config[key];
        config.type="custom:"+REAL;
        config.language=this._config.language||"fr";
        config.title="Piscine de démonstration";
        config.pool_id="pool_cockpit_demo";
        config.view_id="pool_cockpit_demo";
        config.devices=devices();
        config.visual_theme=this._config.visual_theme||"ocean";
        config.camera_entity=ids.camera;
        config.weather_entity=ids.weather;
        child.setConfig(config);
        child.hass=fakeHass(this._config.language||"fr",(updated)=>{
          if(this._mode==="demo"&&this._child===child)child.hass=updated;
        });
      }else{
        child.setConfig(config);
        if(this._realHass)child.hass=this._realHass;
      }
      this._child=child;
      this.shadowRoot.querySelector(".mount").appendChild(child);
      // Camera portal lives outside this shadow root; label it as fictional in demo.
      if(demo){
        const setDemoCameraLabel=()=>{
          const popup=document.querySelector('[data-pool-rc8-camera]');
          const status=popup?.shadowRoot?.querySelector('.status');
          if(status&&this._mode==="demo")status.textContent="Image fictive de démonstration — aucun flux réel";
        };
        this._demoCameraListener=()=>setTimeout(setDemoCameraLabel,200);
        child.addEventListener("click",this._demoCameraListener);
      }
      // Demo wrapper only: retain six original tabs, soften their outer Ocean shell.
      const root=child.shadowRoot;
      if(root&&typeof CSSStyleSheet!=="undefined"&&"adoptedStyleSheets" in root){
        const sheet=new CSSStyleSheet();
        sheet.replaceSync('.pool-cockpit-v4[data-v4-theme="ocean"] .v4-navigation{border:0!important;outline:0!important;box-shadow:0 5px 14px rgba(0,26,61,.14)!important;}');
        sheet.insertRule(
          '.pool-cockpit-v4[data-v4-theme="ocean"] .v4-navigation__settings{background:rgba(9,47,91,.67)!important;border:1px solid rgba(185,225,255,.18)!important;border-radius:15px!important;box-shadow:0 2px 7px rgba(0,20,50,.12)!important}',
          sheet.cssRules.length
        );
        sheet.insertRule(
          '.pool-cockpit-v4[data-v4-theme="ocean"] .v4-navigation__settings .rc81-nav-icon{width:22px!important;height:22px!important;flex-basis:22px!important;stroke-width:1.4!important}',
          sheet.cssRules.length
        );
        // Persist across child.render(): the V4 engine itself shows this legacy
        // panel with display:block!important; an observer runs only afterwards.
        sheet.insertRule(
          '.pool-cockpit-v4 .v4-legacy-stage[data-v4-legacy-view="history"] .v3-section[data-rc271-section="information"]{display:none!important}',
          sheet.cssRules.length
        );
        root.adoptedStyleSheets=[...root.adoptedStyleSheets,sheet];
      }
      // V4.1: keep the original V3 weather banner and its bound controls intact,
      // but display it ahead of the V4 navigation, as it was in the V3 cockpit.
      // Never clone it: the V3 alert level, source, action handlers and links remain authoritative.
      const promoteWeatherAlert=()=>{
        const cockpit=root?.querySelector(".pool-cockpit-v4");
        const navigation=cockpit?.querySelector(".v4-navigation");
        const banner=cockpit?.querySelector(".v4-legacy-stage .rc26-weather-banner");
        if(cockpit && navigation && banner){
          // Keep the Météo-France warning authoritative; only shorten a raw
          // Home Assistant sensor friendly_name rendered as the location.
          const location=banner.querySelector("small");
          const original=location?.textContent?.trim()||"";
          const match=original.match(/^Météo-France forecast for city\s+(.+?)\s+-\s+(.+?)\s+-\s+FR\s+\d{2,3}\s+Weather alert$/i);
          if(match)location.textContent=match[1]+" — "+match[2];
          cockpit.insertBefore(banner,navigation);
        }
      };
      // V4.1 : conserver les retouches validées après chaque rendu du moteur V4.
      if(root && typeof MutationObserver==="function" && typeof root.appendChild==="function"){
        const applyConfigStyle=()=>{
          if(root.querySelector("style[data-v41-config-css]"))return;
          const st=document.createElement("style");
          st.setAttribute("data-v41-config-css","");
          st.textContent=`
            /* V4.1 : retirer Informations utiles dans Historique uniquement. */
            .pool-cockpit-v4 .v4-legacy-stage[data-v4-legacy-view="history"]
              .v3-section[data-rc271-section="information"]{
              display:none!important;
            }

            .pool-cockpit-v4[data-v4-theme="ocean"]{
              background-attachment:fixed!important;
              background-size:cover!important;
              background-position:center!important;
              background-repeat:no-repeat!important;
            }
            .pool-cockpit-v4 .v4-navigation__settings > span {
              display:none!important;
            }
            .pool-cockpit-v4 .v4-navigation__settings {
              display:flex!important;
              align-items:center!important;
              justify-content:center!important;
              padding:0!important;
            }
            .pool-cockpit-v4[data-v4-theme="ocean"] .v4-navigation .v4-navigation__settings{
              background:#0c609b44!important;
              border:1px solid #b5e7ff26!important;
              border-radius:18px!important;
              box-shadow:none!important;
            }
            .pool-cockpit-v4[data-v4-theme="ocean"] .v4-navigation .v4-navigation__settings svg.rc81-nav-icon{
              width:22px!important;
              height:22px!important;
              flex:0 0 22px!important;
              stroke-width:1.05px!important;
            }
            .pool-cockpit-v4[data-v4-theme="ocean"] .v4-navigation .v4-navigation__item svg.rc81-nav-icon{
              width:22px!important;
              height:22px!important;
              flex:0 0 22px!important;
            }

            /* V4.1 : en-tête Configuration harmonisé. */
            .pool-cockpit-v4[data-v4-theme="ocean"] .v4-settings > .v4-view__header {
              background:transparent!important;
              border:none!important;
              border-radius:0!important;
              padding:0!important;
              box-shadow:none!important;
            }
`;
          root.appendChild(st);
        };
        const restoreVisuals=()=>{
          applyConfigStyle();
          promoteWeatherAlert();
        };
        restoreVisuals();
        this._v41ConfigObserver=new MutationObserver(restoreVisuals);
        this._v41ConfigObserver.observe(root,{childList:true});
      }
    }
  }
  class Integrated extends PoolCockpitV4DemoHost{constructor(){super(false);}}
  class Standalone extends PoolCockpitV4DemoHost{constructor(){super(true);}}
  if(!customElements.get(DUAL))customElements.define(DUAL,Integrated);
  if(!customElements.get(STANDALONE))customElements.define(STANDALONE,Standalone);
})();
