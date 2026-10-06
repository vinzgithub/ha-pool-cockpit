const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBundle, buildCard, FakeElement } = require('./bundle_harness.cjs');

function modeleMinimal(runtime, card) {
  return runtime.rc24TreatmentModel(card._treatmentProfile, {
    ph: 7.3,
    temperature: 27.1,
    history: [],
    weatherAlert: { available: false, alerts: [] },
  });
}

function recommandationFixe() {
  return {
    hours: 14,
    hydraulicHours: 2,
    scheduleLabel: '08:30 → 22:30',
    seasonInfo: { libelle: 'Été' },
    context: 'Conditions cohérentes avec la base de profil',
    water: 27.1,
    air: 24,
    heatAlert: false,
    coldAlert: false,
    weatherAlert: {},
    periods: [{ enabled: true, start: '08:30', end: '22:30' }],
    weekdays: ['mon','tue','wed','thu','fri','sat','sun'],
    signature: 'test-saisons',
  };
}

test('le rendu réel expose les cinq profils saisonniers et leurs libellés validés', () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control = runtime.rc27SanitizeControl({
    ...card._rc27Control,
    seasonal_profiles: {
      schema: 3,
      current: 'summer',
      follow_astronomical: false,
      source: 'custom',
      profiles: {},
    },
  });

  const html = card.rc30SeasonalProfileCard(
    card._rc27Control,
    modeleMinimal(runtime, card),
    recommandationFixe(),
  );

  for (const label of [
    'Printemps · remise en route',
    'Été · saison de baignade',
    'Automne · fin de saison',
    'Hivernage actif',
    'Maintenance',
  ]) assert.match(html, new RegExp(label));
  assert.equal((html.match(/<option value=/g) || []).length, 5);
});

test('des clics réels permettent la reprise explicite de l’adaptatif puis le suivi astronomique', async () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control = runtime.rc27SanitizeControl({
    ...card._rc27Control,
    seasonal_profiles: {
      schema: 3,
      current: 'maintenance',
      follow_astronomical: false,
      source: 'custom',
      profiles: {},
    },
  });

  // Maintenance reste volontairement manuel : on choisit d'abord un profil saisonnier
  // via l'état déjà normalisé, puis on déclenche les vraies actions de l'interface.
  card._rc27Control.seasonal_profiles.current = 'spring';
  card._rc27Control.seasonal_profiles.follow_astronomical = false;

  const reprendre = new FakeElement();
  reprendre.dataset.rc30ResumeAdaptive = '';
  const suivre = new FakeElement();
  suivre.dataset.rc30FollowAstronomical = '';
  card.shadowRoot.register('[data-rc30-resume-adaptive]', [reprendre]);
  card.shadowRoot.register('[data-rc30-follow-astronomical]', [suivre]);

  card.rc30AdaptiveRecommendation = () => recommandationFixe();
  card.saveRc27Control = async (next) => { card._rc27Control = runtime.rc27SanitizeControl(next); };
  card.render = () => {};
  card.bindRc27Controls();

  await reprendre.click();
  assert.equal(card._rc27Control.seasonal_profiles.source, 'adaptive');
  assert.equal(card._rc27Control.seasonal_profiles.follow_astronomical, false);

  // Revenir volontairement en personnalisé avant de tester l'action distincte
  // « Suivre la saison astronomique » sans déclencher de recalcul adaptatif.
  card._rc27Control.seasonal_profiles.source = 'custom';
  card._rc27Control.seasonal_profiles.current = 'maintenance';
  card._rc27Control.seasonal_profiles.follow_astronomical = false;
  await suivre.click();

  assert.equal(card._rc27Control.seasonal_profiles.follow_astronomical, true);
  assert.notEqual(card._rc27Control.seasonal_profiles.current, 'maintenance');
  assert.ok(['spring','summer','autumn','winter'].includes(card._rc27Control.seasonal_profiles.current));
});

test('le rendu réel ne réintroduit pas le mode automatique historique sans validation', () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  const html = card.renderRc27Section(modeleMinimal(runtime, card), recommandationFixe());
  assert.match(html, /option value=automatic /);
  assert.doesNotMatch(html, /option value=automatic_full/);
});
