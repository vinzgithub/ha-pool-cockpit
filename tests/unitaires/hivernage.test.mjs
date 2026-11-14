import {test} from 'node:test';
import assert from 'node:assert/strict';
import {winterBackendLive,renderWinterCard,winterTimeline} from '../../src/hivernage/presentation.js';
const now=Date.parse('2026-11-14T08:00:00Z');
const state=()=>({backend_available:true,winter_status:{backend_version:'4.3.0',generated_at:new Date(now).toISOString(),master:true,mode:'hivernage_actif',source:'custom',reason:'Plages personnalisées conservées',calculated_hours:9,applied_hours:12,different:true,configuration:{mode:'hivernage_actif',base_hours:4,equipment:{pac:{status:'hiverne'}}},runtime:{pump_state:'off',frost:{requested:true,status:'requested'},flow_verified:false}}});
test('T05 displays recommendation and applied duration separately',()=>{const html=renderWinterCard({control:state(),now});assert.match(html,/Recommandation : 9 h \/ programme appliqué : 12 h/);assert.match(html,/personnalisées/);});
test('T07 requested circulation never becomes verified flow',()=>{const html=renderWinterCard({control:state(),now});assert.match(html,/arrêtée/);assert.match(html,/non vérifié/);assert.doesNotMatch(html,/protégé/);});
test('T09 stale backend and satellites never claim local execution',()=>{const c=state();assert.equal(winterBackendLive(c,now),true);assert.equal(winterBackendLive(c,now+91000),false);assert.match(renderWinterCard({control:c,now:now+91000}),/Backend indisponible/);c.winter_status.master=false;assert.match(renderWinterCard({control:c,now}),/Satellite · aucune exécution locale/);});
test('T10 wintered PAC requires manual return',()=>{assert.match(renderWinterCard({control:state(),now,view:'equipment'}),/Remise en service manuelle nécessaire/);});
test('T15 25-hour day timeline uses elapsed intervals',()=>{const day={start:'2026-10-25T00:00:00+02:00',end:'2026-10-26T00:00:00+01:00',elapsed_hours:25};const html=winterTimeline(day,[{start:day.start,end:day.end,state:'on'}],Date.parse(day.start)+3600000);assert.match(html,/width:100%/);assert.match(html,/left:4%/);assert.match(html,/25 h réelles/);});
test('rendering escapes equipment names and server diagnostics',()=>{const c=state();c.winter_status.reason='<img onerror=evil>';const html=renderWinterCard({control:c,now,view:'equipment',devices:[{key:'probe',name:'<script>'}]});assert.doesNotMatch(html,/<img onerror|<script>/);assert.match(html,/&lt;script&gt;/);});
test('overview is compact, planning owns schedules, equipment owns statuses',()=>{
 const c=state();
 const overview=renderWinterCard({control:c,now,view:'overview'});
 assert.match(overview,/Hivernage actif/);assert.match(overview,/Filtration/);assert.match(overview,/Antigel/);
 assert.doesNotMatch(overview,/winter-metrics|winter-equipment|winter-timeline|<form|Pourquoi ce calcul/);
 const planning=renderWinterCard({control:c,now,view:'planning'});
 assert.match(planning,/Programme prévu/);assert.doesNotMatch(planning,/winter-equipment/);
 const equipment=renderWinterCard({control:c,now,view:'equipment'});
 assert.match(equipment,/Pompe à chaleur/);assert.doesNotMatch(equipment,/Programme prévu|<form/);
});
test('safety alerts stay outside collapsed details on all seven views',()=>{
 const c=state();c.winter_status.runtime.alerts=['CRITIQUE : demande antigel bloquée'];
 for(const view of ['overview','planning','equipment','settings','advice','measurements','history']){
  const html=renderWinterCard({control:c,now,view,settings:['planning','settings'].includes(view)});
  assert.match(html,/<p role="alert"[^>]*>CRITIQUE/);
  assert.ok(!html.includes('<details')||html.indexOf('CRITIQUE')<html.indexOf('<details'));
 }
});
test('demo never borrows real backend diagnostics, status, or enabled configuration',()=>{
 const c=state();c.winter_status.runtime.alerts=['CRITIQUE : demande réelle'];
 const original=JSON.stringify(c);
 for(const view of ['overview','planning','equipment','settings']){
  const html=renderWinterCard({control:c,now,demo:true,view,settings:true});
  assert.match(html,/Données simulées/);assert.match(html,/Antigel non simulé/);
  assert.doesNotMatch(html,/Backend indisponible|CRITIQUE|<form|Hiverné/);
 }
 assert.equal(JSON.stringify(c),original);
});
test('settings stay collapsed and require live master to enable existing form',()=>{
 const c=state();
 const html=renderWinterCard({control:c,now,view:'settings',settings:true});
 assert.match(html,/<details class="winter-config"><summary>/);assert.match(html,/Vérifier et confirmer/);
 c.winter_status.master=false;
 assert.match(renderWinterCard({control:c,now,view:'settings',settings:true}),/<fieldset disabled>/);
});
