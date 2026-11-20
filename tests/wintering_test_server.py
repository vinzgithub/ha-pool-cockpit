"""Loopback-only simulated HA bridge for browser/backend contract tests."""
import asyncio
import json
import sys
import os
from urllib.parse import urlsplit
from datetime import timedelta
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
import pytest
from test_adaptive_engine import engine, _State, NOW

ROOT=Path(__file__).resolve().parents[1]
mp=pytest.MonkeyPatch()
sim=engine.__wrapped__(mp)
sim.scheduler.data['pump'].update(entity_id='switch.pump',mode='automatic')
sim.hass.states.items.update({
    'switch.pump':_State('off',NOW),
    'sensor.sample':_State(NOW.isoformat(),NOW),
    'sensor.ph':_State('7.4',NOW),
    'sensor.orp':_State('700',NOW),
    'sensor.local':_State('8',NOW,{'unit_of_measurement':'°C','measurement_timestamp':NOW.isoformat()}),
})
sim.scheduler._refresh_adaptive_schedule(NOW)
asyncio.run(sim.scheduler.async_evaluate('test startup'))


def states():
    return {key:{'entity_id':key,'state':v.state,'attributes':v.attributes,'last_updated':(v.last_updated or NOW).isoformat(),'last_changed':(v.last_updated or NOW).isoformat()} for key,v in sim.hass.states.items.items()}



PREVIEW_HTML = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pool Cockpit v4.3.0 - Recette locale</title>
<style>
body{margin:0;background:#092239;color:#eef7ff;font-family:system-ui,sans-serif}
.preview-banner{background:#123957;border-bottom:2px solid #4eb3d6;padding:15px 20px;line-height:1.6}
.preview-banner h1{font-size:1.1rem;margin:0 0 6px}
.preview-banner p{margin:2px 0}
.preview-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.preview-actions button{padding:10px 14px;min-height:42px;border-radius:9px;border:1px solid #80cbe2;background:#194b72;color:white;cursor:pointer}
.preview-actions button:focus-visible{outline:3px solid #ffd77a}
#preview-status{font-size:.86rem;color:#c6e8f2}
#app{margin:auto;max-width:1460px;padding:12px}
</style>
</head>
<body>
<header class="preview-banner">
<h1>Pool Cockpit v4.3.0 - Recette locale isolee</h1>
<p><strong>Simulation uniquement :</strong> le mode "Reel" de la carte communique avec un faux backend Home Assistant, jamais avec le Shelly ni la piscine.</p>
<p>Ouvre Planning &gt; Configurer et confirmer pour essayer l'hivernage actif. Les commandes et les confirmations restent simulees.</p>
<div class="preview-actions">
<button data-air="8">Air simule : 8 C</button>
<button data-air="2">Simuler le gel : 2 C</button>
<button data-air="6">Simuler le redoux : 6 C</button>
</div>
<p id="preview-status" role="status">Initialisation du backend simule...</p>
</header>
<main id="app"></main>
<script src="/bundle.js"></script>
<script>
(async function(){
  const status=document.getElementById('preview-status');
  async function request(q){
    const r=await fetch('/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(q)});
    const result=await r.json();
    if(!r.ok)throw Error(result.message||'Erreur du simulateur');
    return result;
  }
  try {
    const host=document.createElement('pool-cockpit-card');
    document.querySelector('#app').appendChild(host);
    host.setConfig({type:'custom:pool-cockpit-card',initial_mode:'real',visual_theme:'ocean',language:'fr',
      devices:[{key:'blue',name:'Blue Connect (fictif)',brand:'blue_connect',
        entities:{temperature:'sensor.eau',ph:'sensor.ph',orp:'sensor.orp',last_analysis:'sensor.sample'}}]});
    host.hass={
      states:await fetch('/states').then(r=>r.json()),
      locale:{language:'fr-FR'},config:{time_zone:'Europe/Paris'},
      user:{is_admin:true},callWS:request,
      callService:async()=>{throw Error('Commande physique interdite en recette');},
      callApi:async()=>[]
    };
    async function refresh(){
      const core=host.shadowRoot&&host.shadowRoot.querySelector('pool-dashboard-v4-test-card');
      host.hass={...host._realHass,states:await fetch('/states').then(r=>r.json())};
      if(core&&core.loadRc27ControlState){
        core._rc27LastLoad=0;
        await core.loadRc27ControlState(false);
        core.render();
      }
    }
    document.querySelectorAll('[data-air]').forEach(btn=>btn.addEventListener('click',async()=>{
      btn.disabled=true;
      try{
        const degrees=Number(btn.dataset.air);
        const value=await request({type:'test/tick',temperature:degrees,seconds:120});
        await refresh();
        const frost=value.winter_status&&value.winter_status.runtime&&value.winter_status.runtime.frost;
        status.textContent='Air simule : '+degrees+' C. Antigel : '+(frost&&frost.status||'inconnu')+'. Aucun equipement physique commande.';
      }catch(error){status.textContent='Erreur : '+error.message;}
      finally{btn.disabled=false;}
    }));
    status.textContent='Backend simule pret. Selectionne le mode hivernage actif dans Planning, puis essaie les boutons gel et redoux.';
  }catch(error){status.textContent='Initialisation impossible : '+error.message;console.error(error);}
})();
</script>
</body></html>"""

class Handler(BaseHTTPRequestHandler):
    def log_message(self,*_args):pass
    def send(self,body,status=200,kind='application/json'):
        payload=body if isinstance(body,bytes) else json.dumps(body).encode()
        self.send_response(status);self.send_header('Content-Type',kind+'; charset=utf-8');self.end_headers();self.wfile.write(payload)
    def do_GET(self):
        if self.path=='/preview':return self.send(PREVIEW_HTML.encode('utf-8'),kind='text/html')
        if self.path=='/':return self.send(b'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><main id="app"></main><script src="/bundle.js"></script></body></html>',kind='text/html')
        if self.path=='/bundle.js':return self.send(Path(os.environ.get('WINTER_BUNDLE', ROOT/'release/v4.3.0/pool-cockpit.js')).read_bytes(),kind='application/javascript')
        if self.path=='/states':return self.send(states())
        if self.path=='/commands':return self.send(sim.hass.commands)
        if self.path.startswith('/local/ha-pool-dashboard/'):
            name=Path(urlsplit(self.path).path).name
            p=ROOT/'release/v4-rc8-2/assets'/name
            if p.exists():return self.send(p.read_bytes(),kind='image/webp' if p.suffix=='.webp' else 'image/png')
        self.send({},404)
    def do_POST(self):
        req=json.loads(self.rfile.read(int(self.headers.get('Content-Length','0'))))
        try:
            kind=req.get('type')
            if kind=='test/tick':
                sim.clock['now']+=timedelta(seconds=req.get('seconds',30))
                if 'temperature' in req:
                    sim.hass.states.items['sensor.local'].state=str(req['temperature'])
                    sim.hass.states.items['sensor.local'].attributes['measurement_timestamp']=sim.clock['now'].isoformat()
                asyncio.run(sim.scheduler.async_tick(sim.clock['now']))
                result=sim.scheduler.public_state()
            elif kind=='ha_pool_dashboard/get_state':result=sim.scheduler.public_state()
            elif kind=='ha_pool_dashboard/save_state':result=asyncio.run(sim.scheduler.async_save_config(req['config']))
            elif kind=='ha_pool_dashboard/configure_wintering':result=asyncio.run(sim.scheduler.async_configure_wintering(req['payload'],'browser-test'))
            elif kind=='ha_pool_dashboard/control':result=asyncio.run(sim.scheduler.async_control(req['target'],req['state']))
            elif kind=='ha_pool_dashboard/boost':result=asyncio.run(sim.scheduler.async_boost(req['hours']))
            elif kind=='ha_pool_dashboard/extension':result=asyncio.run(sim.scheduler.async_extension(req['action']))
            elif kind.endswith('get_device_catalog'):result={'revision':0,'devices':[],'visibility':{}}
            elif kind.endswith('get_treatment_history'):result={'history':[]}
            else:result={}
            self.send(result)
        except Exception as error:self.send({'message':str(error)},400)


server=HTTPServer(('127.0.0.1',int(os.environ.get('WINTER_PREVIEW_PORT','0'))),Handler)
print(server.server_port,flush=True)
try:server.serve_forever()
finally:mp.undo()
