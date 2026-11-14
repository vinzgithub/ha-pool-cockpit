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


class Handler(BaseHTTPRequestHandler):
    def log_message(self,*_args):pass
    def send(self,body,status=200,kind='application/json'):
        payload=body if isinstance(body,bytes) else json.dumps(body).encode()
        self.send_response(status);self.send_header('Content-Type',kind+'; charset=utf-8');self.end_headers();self.wfile.write(payload)
    def do_GET(self):
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


server=HTTPServer(('127.0.0.1',0),Handler)
print(server.server_port,flush=True)
try:server.serve_forever()
finally:mp.undo()
