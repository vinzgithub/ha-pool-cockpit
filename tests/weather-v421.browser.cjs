#!/usr/bin/env node
"use strict";
/* Loads the actual V4.2.1 single-file bundle. Only the DEMO fictional HA fixture is used. */
const assert=require("node:assert/strict");
const {createServer}=require("node:http");
const {readFile,mkdir}=require("node:fs/promises");
const {join,resolve,extname}=require("node:path");
const {tmpdir}=require("node:os");
const {chromium}=require("playwright");
const {PNG}=require("pngjs");
(async()=>{
 const root=resolve("."),out=join(process.env.RUNNER_TEMP||tmpdir(),"pool-weather-v421");
 await mkdir(out,{recursive:true});
 const server=createServer(async(req,res)=>{
  const path=new URL(req.url,"http://localhost").pathname;
  if(path==="/"){res.setHeader("Content-Type","text/html");res.end('<!doctype html><html lang="fr"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#f5f9fc;font-family:Arial,sans-serif}</style></head><body><main id="app"></main><script src="/pool-cockpit.js"></script></body></html>');return;}
  const p=path==="/pool-cockpit.js"?join(root,"release/v4.2.1/pool-cockpit.js"):path.startsWith("/local/ha-pool-dashboard/assets/")?join(root,"release/v4-rc8-2/assets",path.split("/").pop()):path==="/local/ha-pool-dashboard/hero-ocean.svg"?join(root,"release/v4-rc8-2/hero-ocean.svg"):null;
  if(!p){res.writeHead(404);res.end();return;}
  try{res.setHeader("Content-Type",extname(p)===".js"?"application/javascript":"image/png");res.end(await readFile(p));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 let checks=0; const widths=[360,390,430,768,1024,1440],tabs=["overview","advice","measurements","equipment","planning","history","settings"],levels=[["yellow",1,"Jaune"],["orange",2,"Orange"],["red",3,"Rouge"],["green",0,"Verte"]];
 const ratio=(png,level)=>{let count=0,n=0;for(let y=5;y<png.height-5;y+=3)for(let x=5;x<png.width-5;x+=3){const i=(y*png.width+x)*4,r=png.data[i],g=png.data[i+1],b=png.data[i+2];n++;if(level==="yellow"&&r>195&&g>145&&b<175||level==="orange"&&r>170&&g>65&&g<205&&b<140||level==="red"&&r>125&&r>g*1.3&&r>b*1.2&&g<160)count++;}return count/Math.max(n,1);};
 try{
  const page=await browser.newPage({viewport:{width:390,height:960},deviceScaleFactor:1,reducedMotion:"reduce"}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:"+server.address().port+"/");
  await page.waitForFunction(()=>Boolean(customElements.get("pool-cockpit-card")));
  await page.evaluate(()=>{const host=document.createElement("pool-cockpit-card");document.querySelector("#app").appendChild(host);host.setConfig({type:"custom:pool-cockpit-card",initial_mode:"demo",devices:[],language:"fr",visual_theme:"ocean"});});
  await page.waitForFunction(()=>!!document.querySelector("pool-cockpit-card")?.shadowRoot?.querySelector("pool-dashboard-v4-test-card")?.shadowRoot?.querySelector(".v4-navigation"));
  for(const width of widths){
   await page.setViewportSize({width,height:960});
   for(const [level,severity,label] of levels){
    await page.evaluate(({level,severity,label})=>{const c=document.querySelector("pool-cockpit-card").shadowRoot.querySelector("pool-dashboard-v4-test-card");c._preferences={...c._preferences,animations:false};c.currentWeatherAlert=()=>({configured:true,available:true,active:severity>0,severity,levelKey:level,levelLabel:label,department:"Sainte-Gemme-la-Plaine — Vendée",source:"Capteur fictif de test",alerts:severity?[{key:"wind",icon:"🌬️",label:"Vent violent",levelLabel:label,severity}]:[]});c.render();},{level,severity,label});
    for(const tab of tabs){
     const state=await page.evaluate(tab=>{const c=document.querySelector("pool-cockpit-card").shadowRoot.querySelector("pool-dashboard-v4-test-card"),root=c.shadowRoot;const nav=root.querySelector('[data-v4-view="'+tab+'"]');if(!nav)return{error:"No tab "+tab};nav.click();const shell=root.querySelector(".pool-cockpit-v4"),alert=shell?.querySelector(":scope>.rc26-weather-banner"),r=alert?.getBoundingClientRect();return{tab:c._v4Ui.ongletActif,count:root.querySelectorAll(".rc26-weather-banner").length,direct:shell?.querySelectorAll(":scope>.rc26-weather-banner").length||0,legacy:root.querySelectorAll(".v4-legacy-stage .rc26-weather-banner").length,before:alert?.nextElementSibling?.classList.contains("v4-navigation"),link:alert?.querySelector("a")?.href,location:alert?.querySelector("small")?.textContent,rect:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null};},tab);
     assert.equal(state.error,undefined);assert.equal(state.tab,tab);assert.equal(state.count,severity?1:0);assert.equal(state.direct,state.count);assert.equal(state.legacy,0);checks+=5;
     if(severity){
      assert.equal(state.before,true);assert.ok(state.link?.startsWith("https://vigilance.meteofrance.fr/fr"));assert.ok(state.location?.includes("Vendée"));checks+=3;
      const r=state.rect;assert.ok(r&&r.height>20&&r.width>30&&r.y>=0&&r.y+r.height<=960,"Alert not in viewport: "+JSON.stringify({width,level,tab,r}));checks++;
      const screenshot=await page.screenshot({clip:{x:Math.max(0,r.x),y:Math.max(0,r.y),width:Math.min(r.width,width-Math.max(0,r.x)),height:r.height},animations:"disabled"});
      const painted=ratio(PNG.sync.read(screenshot),level);
      assert.ok(painted>0.12,"NOT PAINTED: "+width+"px "+tab+" "+level+" ratio="+painted.toFixed(3));checks++;
      if(width===390&&level==="orange"&&["equipment","advice"].includes(tab))await page.screenshot({path:join(out,"after-"+tab+"-390.png"),animations:"disabled"});
     }
    }
    if(severity===2&&[390,1440].includes(width))for(const from of tabs){
     const result=await page.evaluate(from=>{const c=document.querySelector("pool-cockpit-card").shadowRoot.querySelector("pool-dashboard-v4-test-card");c.shadowRoot.querySelector('[data-v4-view="'+from+'"]').click();const a=c.shadowRoot.querySelector(".pool-cockpit-v4>.rc26-weather-banner [data-weather-alert-focus]");a?.click();const card=c.shadowRoot.querySelector('.v4-legacy-stage[data-v4-legacy-view="advice"] #rc26-weather-card'),d=card?.querySelector("[data-weather-alert-details]"),box=card?.getBoundingClientRect();let hidden=false;for(let p=card;p;p=p.parentElement){const st=getComputedStyle(p);if(st.display==="none"||st.visibility==="hidden"){hidden=true;break;}}return {tab:c._v4Ui.ongletActif,open:d?.open,visible:!!box&&box.height>30&&!hidden,onscreen:!!box&&box.top<innerHeight&&box.bottom>0};},from);
     assert.equal(result.tab,"advice");assert.equal(result.open,true);assert.equal(result.visible,true,"Hidden detail from "+from);assert.equal(result.onscreen,true);checks+=4;
    }
   }
  }
  assert.deepEqual(errors,[],"Browser JavaScript errors");
  console.log("PASS: "+checks+" assertions, 7 views, 6 widths, yellow/orange/red/none; screenshots in "+out);
 }finally{await browser.close();await new Promise(ok=>server.close(ok));}
})().catch(e=>{console.error(e);process.exitCode=1;});
