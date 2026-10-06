const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBundle, buildCard, FakeElement } = require('./bundle_harness.cjs');

function preparerCarteAvecCommandes() {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control = runtime.rc27SanitizeControl({
    ...card._rc27Control,
    backend_available: true,
    pump: {
      ...card._rc27Control.pump,
      entity_id: 'switch.pompe_piscine',
      mode: 'program',
    },
    overrides: {},
  });
  card._hass.states['switch.pompe_piscine'] = {
    state: 'on',
    attributes: {},
    last_updated: new Date().toISOString(),
    last_changed: new Date().toISOString(),
  };

  const demarrer = new FakeElement();
  demarrer.dataset.rc27Control = 'pump:on';
  const reprendre = new FakeElement();
  reprendre.dataset.rc27Control = 'pump:auto';
  card.shadowRoot.register('[data-rc27-control]', [demarrer, reprendre]);

  const appels = [];
  card._hass.callWS = async (requete) => {
    appels.push(requete);
    if (requete.type !== 'ha_pool_dashboard/control') return {};
    if (requete.target === 'pump' && requete.state === 'on') {
      return {
        ...card._rc27Control,
        overrides: {
          ...card._rc27Control.overrides,
          pump: {
            state: 'on',
            persistent: true,
            since: '2026-09-05T12:00:00.000Z',
          },
        },
      };
    }
    if (requete.target === 'pump' && requete.state === 'auto') {
      return {
        ...card._rc27Control,
        overrides: {},
      };
    }
    return card._rc27Control;
  };

  card.render = () => {};
  card.bindRc27Controls();
  return { runtime, card, demarrer, reprendre, appels };
}

test('un clic réel sur Démarrer crée un forçage manuel persistant et seule la reprise explicite le retire', async () => {
  const { card, demarrer, reprendre, appels } = preparerCarteAvecCommandes();

  await demarrer.click();
  assert.deepEqual(JSON.parse(JSON.stringify(appels[0])), {
    type: 'ha_pool_dashboard/control',
    target: 'pump',
    state: 'on',
  });
  assert.deepEqual(JSON.parse(JSON.stringify(card._rc27Control.overrides.pump)), {
    state: 'on',
    persistent: true,
    since: '2026-09-05T12:00:00.000Z',
  });

  // Aucun recalcul / événement intermédiaire ne supprime le forçage : la carte
  // conserve l'état backend tant que l'utilisateur ne clique pas sur Reprendre.
  assert.equal(card._rc27Control.overrides.pump.persistent, true);

  await reprendre.click();
  assert.deepEqual(JSON.parse(JSON.stringify(appels[1])), {
    type: 'ha_pool_dashboard/control',
    target: 'pump',
    state: 'auto',
  });
  assert.equal(card._rc27Control.overrides.pump, undefined);
});

test('le rendu réel annonce le forçage manuel prioritaire puis revient au programme après le clic Reprendre', async () => {
  const { runtime, card, demarrer, reprendre } = preparerCarteAvecCommandes();
  const model = runtime.rc24TreatmentModel(card._treatmentProfile, {
    ph: 7.3,
    temperature: 28.1,
    history: [],
    weatherAlert: { available: false, alerts: [] },
  });
  const recommandation = {
    hours: 16,
    hydraulicHours: 2,
    scheduleLabel: '08:30 → 00:30',
    seasonInfo: { libelle: 'Été' },
    context: 'Conditions estivales',
    water: 28.1,
    air: 25,
    heatAlert: false,
    coldAlert: false,
    weatherAlert: {},
    periods: [],
    weekdays: [],
    signature: 'test',
  };

  await demarrer.click();
  let html = card.renderRc27Section(model, recommandation);
  assert.match(html, /Forçage manuel prioritaire : marche · programme suspendu/);
  assert.match(html, /Forçage manuel actif/);
  assert.match(html, /data-rc27-control="pump:auto"[^>]*>Reprendre le programme/);

  await reprendre.click();
  html = card.renderRc27Section(model, recommandation);
  assert.doesNotMatch(html, /Forçage manuel prioritaire/);
  assert.doesNotMatch(html, /Forçage manuel actif/);
});
