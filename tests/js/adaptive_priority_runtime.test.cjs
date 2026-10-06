const test=require('node:test');
const assert=require('node:assert/strict');
const {loadBundle,buildCard,FakeElement}=require('./bundle_harness.cjs');

function adaptiveControl(card){
  card._rc27Control={
    ...card._rc27Control,
    seasonal_profiles:{
      schema:3,
      current:'summer',
      follow_astronomical:true,
      source:'adaptive',
      initialized:true,
      profiles:{},
      last_adaptive_signature:'x',
      suspended_at:'',
      manual_revision:0,
    },
    pump:{
      ...card._rc27Control.pump,
      weekdays:['mon','tue','wed','thu','fri','sat','sun'],
      periods:[
        {enabled:true,start:'08:30',end:'22:30'},
        {enabled:false,start:'00:00',end:'00:00'},
        {enabled:false,start:'00:00',end:'00:00'},
      ],
    },
  };
}

test('une modification manuelle de fin de plage coupe réellement l’adaptatif et rend immédiatement',async()=>{
  const runtime=loadBundle();
  const card=buildCard(runtime);
  adaptiveControl(card);

  const input=new FakeElement();
  input.type='time';
  input.value='21:30';
  input.dataset.rc27Path='pump.periods.0.end';
  card.shadowRoot.register('select[data-rc27-path],input[data-rc27-path]',[input]);

  let saved=null,options=null;
  card.saveRc27Control=async(next,opts)=>{saved=next;options=opts;card._rc27Control=next;};
  card.bindRc27Controls();
  await input.dispatch('change');

  assert.ok(saved);
  assert.equal(saved.pump.periods[0].end,'21:30');
  assert.equal(saved.seasonal_profiles.source,'custom');
  assert.equal(saved.seasonal_profiles.suspended_at,'');
  assert.ok(saved.seasonal_profiles.manual_revision>0);
  assert.equal(options.render,true);
});

test('suspendre l’adaptatif fige les plages sans les convertir en personnalisé',async()=>{
  const runtime=loadBundle();
  const card=buildCard(runtime);
  adaptiveControl(card);
  const before=JSON.stringify(card._rc27Control.pump.periods);
  let saved=null;
  card.saveRc27Control=async(next)=>{saved=next;card._rc27Control=next;};
  await card.rc30SuspendAdaptiveSchedule();
  assert.ok(saved);
  assert.equal(saved.seasonal_profiles.source,'suspended');
  assert.ok(saved.seasonal_profiles.suspended_at);
  assert.equal(JSON.stringify(saved.pump.periods),before);
});

test('une configuration FIX14.1 personnalisée reste personnalisée et garde ses horaires lors de la normalisation FIX14.2',()=>{
  const runtime=loadBundle();
  const periods=[
    {enabled:true,start:'08:30',end:'21:30'},
    {enabled:false,start:'00:00',end:'00:00'},
    {enabled:false,start:'00:00',end:'00:00'},
  ];
  const normalized=runtime.rc27SanitizeControl({
    pump:{periods,weekdays:['mon','tue','wed','thu','fri','sat','sun']},
    seasonal_profiles:{
      schema:2,
      current:'summer',
      follow_astronomical:false,
      source:'custom',
      profiles:{summer:{periods,weekdays:['mon','tue','wed','thu','fri','sat','sun']}},
    },
  });
  assert.equal(normalized.seasonal_profiles.schema,3);
  assert.equal(normalized.seasonal_profiles.source,'custom');
  assert.equal(normalized.pump.periods[0].start,'08:30');
  assert.equal(normalized.pump.periods[0].end,'21:30');
});
