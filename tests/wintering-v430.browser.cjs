const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const {mkdir}=require('node:fs/promises');
const {tmpdir}=require('node:os');
const {join}=require('node:path');
(async()=>{
 const server=spawn(process.env.PYTHON||'python',['tests/wintering_test_server.py'],{env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},stdio:['ignore','pipe','inherit']});
 const port=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(Number(d.toString().trim())));server.once('exit',code=>reject(Error('Fixture server exited '+code)));});
 const base='http://127.0.0.1:'+port;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const out=join(process.env.RUNNER_TEMP||tmpdir(),'pool-wintering-v430');await mkdir(out,{recursive:true});
 let checks=0;
 try{
  await page.clock.install({time:new Date('2026-11-14T07:00:00Z')});
  await page.goto(base);
  await page.evaluate(async()=>{
   const states=await fetch('/states').then(r=>r.json());
   const host=document.createElement('pool-cockpit-card');document.querySelector('#app').appendChild(host);
   host.setConfig({type:'custom:pool-cockpit-card',initial_mode:'real',language:'fr',devices:[{key:'blue',name:'Blue Connect',brand:'blue_connect',entities:{temperature:'sensor.eau',ph:'sensor.ph',orp:'sensor.orp',last_analysis:'sensor.sample'}}]});
   host.hass={states,locale:{language:'fr-FR'},config:{time_zone:'Europe/Paris'},user:{is_admin:true},
     callWS:async request=>{const response=await fetch('/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});const data=await response.json();if(!response.ok)throw Error(data.message);return data;},
     callService:async()=>{throw Error('Unexpected direct service call');},callApi:async()=>[]};
  });
  const core=()=>page.locator('pool-dashboard-v4-test-card');
  await page.waitForFunction(()=>document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card')?._rc27Control?.winter_status?.backend_version==='4.3.0');
  await page.evaluate(()=>document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card').render());
  await core().locator('[data-v4-view="planning"]').first().click();
  await core().locator('.winter-config summary').click();
  await core().locator('[data-winter-field="mode"]').selectOption('hivernage_actif');
  await core().locator('[data-winter-field="base_hours"]').fill('4');
  await core().locator('[data-winter-field="start"]').fill('02:00');
  await core().locator('[data-winter-equipment="pac"]').selectOption('hiverne');
  await page.evaluate(()=>{const c=document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card');const input=[...c.shadowRoot.querySelectorAll('[data-winter-equipment]')].find(el=>!['pump','pac'].includes(el.dataset.winterEquipment));input.value='hiverne';input.dispatchEvent(new Event('input',{bubbles:true}));});
  // Cancellation must not mutate the backend.
  page.once('dialog',d=>d.dismiss());await core().locator('[data-winter-form] button[type="submit"]').click();
  const get=()=>fetch(base+'/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'ha_pool_dashboard/get_state'})}).then(r=>r.json());
  assert.equal((await get()).winter_status.mode,'normal');checks++;
  page.once('dialog',d=>d.accept());await core().locator('[data-winter-form] button[type="submit"]').click();
  await page.waitForFunction(()=>document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card')._rc27Control.winter_status.mode==='hivernage_actif');
  let result=await get();assert.equal(result.winter_status.calculated_hours,4);assert.equal(result.winter_status.water_temperature_c,null);assert.equal(result.winter_status.water_status,'hiverne');checks+=3;
  // Configure independent frost sensing through the actual form.
  await core().locator('.winter-config summary').click();
  await core().locator('[data-winter-field="frost.enabled"]').check();
  await core().locator('[data-winter-field="frost.temperature_entity"]').fill('sensor.local');
  await core().locator('[data-winter-field="frost.entry_delay_seconds"]').fill('0');
  page.once('dialog',d=>d.accept());await core().locator('[data-winter-form] button[type="submit"]').click();
  await page.waitForFunction(()=>document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card')._rc27Control.winter_status.configuration.frost.enabled);
  await fetch(base+'/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'test/tick',seconds:30,temperature:2})});
  await page.clock.fastForward(30000);
  await page.evaluate(async()=>{const c=document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card');c._rc27LastLoad=0;await c.loadRc27ControlState(false);c.render();});
  result=await get();assert.equal(result.winter_status.runtime.frost.requested,true);assert.equal(result.winter_status.runtime.pump_state,'on');assert.equal(result.winter_status.runtime.flow_verified,false);checks+=3;
  await page.waitForFunction(()=>document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card')._rc27Control.winter_status.runtime.frost.requested);
  await page.evaluate(()=>document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card').render());
  assert.match(await core().locator('[data-winter-card]').innerText(),/non vérifié/);checks++;
  // Responsive visibility and no horizontal overflow on the real rendered card.
  for(const width of [360,390,768,1440]){
   await page.setViewportSize({width,height:1100});
   await page.waitForFunction(width=>{const el=document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card').shadowRoot.querySelector('[data-winter-card]');const box=el?.getBoundingClientRect();return box&&box.width>0&&box.width<=width&&box.x>=0;},width);checks++;
   const overflow=await core().locator('[data-winter-card]').evaluate(el=>el.scrollWidth>el.clientWidth+1);assert.equal(overflow,false);checks++;
   if(width===390||width===1440)await core().locator('[data-winter-card]').screenshot({path:join(out,`wintering-${width}.png`)});
  }
  // Maintenance confirmed in the UI must stop and block the simulated pump.
  await core().locator('.winter-config summary').click();await core().locator('[data-winter-field="mode"]').selectOption('maintenance');
  page.once('dialog',d=>d.accept());await core().locator('[data-winter-form] button[type="submit"]').click();
  await page.waitForFunction(()=>document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card')._rc27Control.winter_status.mode==='maintenance');
  result=await get();assert.equal(result.winter_status.runtime.pump_state,'off');assert.ok(result.winter_status.runtime.alerts.some(a=>a.includes('bloquée')));checks+=2;
  // A network failure cannot silently fall back to a real service call.
  await page.route('**/api',route=>route.abort());
  await page.waitForFunction(()=>!document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card')._rc27Loading);
  await page.evaluate(()=>{const c=document.querySelector('pool-cockpit-card').shadowRoot.querySelector('pool-dashboard-v4-test-card');c._rc27Control.backend_available=false;c.render();});
  assert.match(await core().locator('[data-winter-card]').innerText(),/Backend indisponible/);assert.equal(await core().locator('[data-winter-field="mode"]').isDisabled(),true);checks+=2;
  assert.deepEqual(errors,[]);checks++;
  console.log(`PASS: ${checks} browser/backend assertions, confirmations, wintered probes, frost, maintenance, offline, 4 widths. Screenshots: ${out}`);
 }finally{await browser.close();server.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
