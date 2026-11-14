/* Real distribution, simulated HA only. Before/after share the same fixture. */
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const {mkdir}=require('node:fs/promises');
const {join}=require('node:path');
const {tmpdir}=require('node:os');
(async()=>{
 const server=spawn(process.env.PYTHON||'python',['tests/wintering_test_server.py'],{env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},stdio:['ignore','pipe','inherit']});
 let browser;
 try{
 const port=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(Number(d.toString().trim())));server.once('exit',c=>reject(Error('server '+c)));});
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const label=process.env.VISUAL_LABEL||'after',out=process.env.VISUAL_OUT||join(process.env.RUNNER_TEMP||tmpdir(),'pool-wintering-ux');await mkdir(out,{recursive:true});
 await page.clock.install({time:new Date('2026-11-14T07:00:00Z')});
 await page.goto('http://127.0.0.1:'+port);
 await page.evaluate(async()=>{
  const host=document.createElement('pool-cockpit-card');document.querySelector('#app').append(host);
  host.setConfig({type:'custom:pool-cockpit-card',initial_mode:'real',visual_theme:'ocean',language:'fr',devices:[{key:'blue',name:'Blue Connect',brand:'blue_connect',entities:{temperature:'sensor.eau',ph:'sensor.ph',orp:'sensor.orp',last_analysis:'sensor.sample'}}]});
  host.hass={states:await fetch('/states').then(r=>r.json()),locale:{language:'fr-FR'},config:{time_zone:'Europe/Paris'},user:{is_admin:true},callWS:async q=>{const r=await fetch('/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(q)});const d=await r.json();if(!r.ok)throw Error(d.message);return d;},callService:async()=>{throw Error('No physical service allowed');},callApi:async()=>[]};
 });
 await page.waitForFunction(()=>document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card')?._rc27Control?.winter_status?.configuration);
 await page.evaluate(async()=>{
  const c=document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card');
  const state=await c._hass.callWS({type:'ha_pool_dashboard/get_state'});
  const equipment={pac:'hiverne',...Object.fromEntries((state.watch.sensor_sources||[]).map(s=>[s.key,'hiverne']))};
  await c._hass.callWS({type:'ha_pool_dashboard/configure_wintering',payload:{confirmed:true,expected_revision:state.winter_status.configuration.revision,changes:{mode:'hivernage_actif',base_hours:4,start:'02:00',equipment,frost:{enabled:true,temperature_entity:'sensor.local'}}}});
  const host=document.querySelector('pool-cockpit-card');
  host.hass={...host._realHass,states:await fetch('/states').then(r=>r.json())};
  await c.loadRc27ControlState(false);c.render();
 });
 await page.clock.pauseAt(new Date('2026-11-14T07:01:00Z'));
 await page.waitForFunction(()=>{const c=document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card');return !c._rc27Loading&&!c._winterSyncing;});
 const core=()=>page.locator('pool-dashboard-v4-test-card');
 let checks=0;
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1050});
  for(const view of label==='before'?['overview','planning']:['overview','planning','equipment','settings']){
   await core().locator(`[data-v4-view="${view}"]`).first().click();
   await core().locator('[data-winter-card]').waitFor({state:'visible'});
   await page.evaluate(()=>{const c=document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card');const n=c.shadowRoot.querySelector('.v4-navigation');window.scrollBy(0,n.getBoundingClientRect().top-12);});
   // Keep navigation and surrounding native components in the comparison.
   await page.evaluate(()=>{const c=document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card');const n=c.shadowRoot.querySelector('.v4-navigation');window.scrollBy(0,n.getBoundingClientRect().top-12);});
   await page.screenshot({path:join(out,`${label}-${view}-${width}.png`),animations:'disabled'});
   if(label!=='before'){
    const info=await core().locator('[data-winter-card]').evaluate(el=>({width:el.getBoundingClientRect().width,overflow:el.scrollWidth>el.clientWidth+1,forms:el.querySelectorAll('form').length,timelines:el.querySelectorAll('.winter-timeline').length,equipment:el.querySelectorAll('.winter-equipment').length,bg:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
    assert.ok(info.width<=width&&!info.overflow);checks++;
    if(view==='overview'){assert.equal(info.forms+info.timelines+info.equipment,0);checks++;}
    if(view==='planning'){assert.equal(info.timelines,2);assert.equal(info.equipment,0);checks+=2;}
    if(view==='equipment'){assert.equal(info.equipment,1);assert.equal(info.timelines,0);checks+=2;}
    assert.notEqual(info.bg,'rgb(247, 250, 252)');assert.ok(info.color.includes('237')||info.color.includes('244'));checks+=2;
   }
  }
 }
 if(label!=='before'){
  await core().locator('[data-v4-view="settings"]').first().click();
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:1050});
   await core().locator('.winter-config').evaluate(el=>{el.open=true;});
   await core().locator('[data-winter-card]').screenshot({path:join(out,`after-settings-open-${width}.png`)});
   assert.equal(await core().locator('[data-winter-form]').evaluate(el=>el.scrollWidth>el.clientWidth+1),false);checks++;
  }
  for(const theme of ['sky','night','ocean']){
   await core().locator('[data-v4-theme-selector]').selectOption(theme);
   const style=await core().locator('[data-winter-card]').evaluate(el=>({bg:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color,panel:getComputedStyle(el.closest('.pool-cockpit-v4')).getPropertyValue('--v4-panel-background').trim()}));
   assert.ok(style.bg.startsWith('rgba('));assert.ok(style.panel);checks+=2;
   assert.equal(await core().locator('[data-winter-card]').evaluate(el=>el.scrollWidth>el.clientWidth+1),false);checks++;
  }
  // Safety alerts stay visible on every view, including views without a panel.
  await page.route('**/api',route=>route.abort());
  await page.waitForFunction(()=>!document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card')._rc27Loading);
  for(const view of ['overview','planning','equipment','settings','measurements','advice','history']){
   await core().locator(`[data-v4-view="${view}"]`).first().click();
   await page.evaluate(()=>{const c=document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card');c._rc27Control.winter_status.runtime.alerts=['CRITIQUE : demande antigel bloquée'];c.render();});
   assert.match(await core().locator('[data-winter-card] [role="alert"]').allTextContents().then(a=>a.join(' ')),/CRITIQUE/);assert.equal(await core().locator('[data-winter-card] [role="alert"]').filter({hasText:'CRITIQUE'}).isVisible(),true);checks+=2;
  }
  // Display-only demo must not borrow real backend status or claim a failure.
  await page.unroute('**/api');
  await page.evaluate(()=>document.querySelector('pool-cockpit-card')._switch('demo'));
  await core().locator('[data-v4-view="overview"]').first().click();
  const demoTemp=await page.evaluate(()=>document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card').aggregate('temperature').number);
  assert.equal(demoTemp,27.9);checks++;
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:1050});
   await core().locator('[data-winter-card]').waitFor({state:'visible'});
   const text=await core().locator('[data-winter-card]').innerText();assert.match(text,/simul/i);assert.doesNotMatch(text,/Backend indisponible|CRITIQUE/);checks+=2;
   await page.evaluate(()=>{const c=document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card');const n=c.shadowRoot.querySelector('.v4-navigation');window.scrollBy(0,n.getBoundingClientRect().top-12);});
   await page.screenshot({path:join(out,`after-demo-${width}.png`),animations:'disabled'});
  }
 }
 assert.deepEqual(errors,[]);console.log(`PASS: ${checks} UX assertions; screenshots: ${out}`);
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
