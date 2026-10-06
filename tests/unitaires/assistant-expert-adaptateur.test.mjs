import test from "node:test";
import assert from "node:assert/strict";
import {
  construireLibellePlagesAssistantExpert,
  construireModeleAssistantExpertDepuisDonnees,
} from "../../src/interface/assistant-expert/adaptateur-dashboard.js";

function minutesPlage(periode) {
  if (!periode?.enabled) return 0;
  const lire = (valeur) => {
    const [heures, minutes] = String(valeur || "00:00").split(":").map(Number);
    return Math.max(0, Math.min(1439, (heures || 0) * 60 + (minutes || 0)));
  };
  const debut = lire(periode.start);
  const fin = lire(periode.end);
  return debut === fin ? 0 : fin > debut ? fin - debut : 1440 - debut + fin;
}

function heuresProgramme(periodes) {
  return Math.min(24, (periodes || []).reduce((total, periode) => total + minutesPlage(periode), 0) / 60);
}

function donnees(overrides = {}) {
  const base = {
    controle: {
      pump: {
        periods: [
          { enabled: true, start: "08:30", end: "21:30" },
          { enabled: false, start: "00:00", end: "00:00" },
          { enabled: false, start: "00:00", end: "00:00" },
        ],
        extension: { status: "none", minutes: 0 },
      },
      pac: { write_enabled: false },
    },
    profilsSaisonniers: { current: "summer", source: "custom" },
    agregation: {
      result: { score: 90, suspended: false },
      temperature: { number: 27.1 },
      ph: { number: 7.31 },
      orp: { number: 756 },
    },
    etatIntelligent: { label: "Eau équilibrée", message: "Aucune action urgente." },
    confiance: 88,
    comparaisons: [],
    metaComparaison: { state: "unknown", detail: "Comparaison indisponible.", a: null, b: null, timeGapMinutes: null },
    meteo: { available: true },
    alerteMeteo: { available: true, active: false },
    modeleTraitement: { summary: "RAS", confidence: { label: "Bonne" }, filtrationAdvice: "Filtration indicative." },
    recommandationAdaptative: {
      seasonInfo: { libelle: "Été" },
      scheduleLabel: "08:30 → 22:30",
      hours: 14,
      hydraulicHours: 2,
      context: "Conditions estivales",
    },
    conseilsIntelligents: ["Conseil déjà calculé."],
    temperatureAirC: 17.5,
    libelleConditionMeteo: "Partiellement nuageux",
    modelePac: {
      configured: true,
      on: false,
      setpoint: 28.5,
      inlet: 27.1,
      outlet: 27.4,
      communication: "OK",
      fault: "",
      compressorFaultCode: "",
    },
    formaterHeures: (valeur) => `${valeur.toFixed(1)} h`,
    calculerHeuresProgramme: heuresProgramme,
    calculerMinutesPlage: minutesPlage,
  };
  return { ...base, ...overrides };
}

test("le libellé reprend exactement les plages actives", () => {
  const periodes = [
    { enabled: true, start: "08:30", end: "12:00" },
    { enabled: true, start: "14:00", end: "18:00" },
    { enabled: false, start: "20:00", end: "21:00" },
  ];
  assert.equal(
    construireLibellePlagesAssistantExpert(periodes, {
      calculerHeuresProgramme: heuresProgramme,
      calculerMinutesPlage: minutesPlage,
    }),
    "08:30 → 12:00 + 14:00 → 18:00",
  );
});

test("le libellé conserve le cas historique 24 h/24", () => {
  const periodes = [
    { enabled: true, start: "00:00", end: "23:59" },
    { enabled: true, start: "23:59", end: "00:00" },
  ];
  assert.equal(
    construireLibellePlagesAssistantExpert(periodes, {
      calculerHeuresProgramme: () => 24,
      calculerMinutesPlage: minutesPlage,
    }),
    "24 h/24",
  );
});

test("le libellé conserve Aucune plage lorsqu'aucune plage n'est active", () => {
  assert.equal(
    construireLibellePlagesAssistantExpert([], {
      calculerHeuresProgramme: heuresProgramme,
      calculerMinutesPlage: minutesPlage,
    }),
    "Aucune plage",
  );
});

test("l'adaptateur sépare profil de référence et saison astronomique", () => {
  const modele = construireModeleAssistantExpertDepuisDonnees(
    donnees({
      profilsSaisonniers: { current: "summer", source: "custom" },
      recommandationAdaptative: {
        seasonInfo: { libelle: "Automne" },
        scheduleLabel: "08:30 → 22:30",
        hours: 14,
        hydraulicHours: 2,
        context: "Chaleur tardive déjà évaluée",
      },
    }),
  );
  assert.equal(modele.filtration.saisonAstronomique, "Automne");
  assert.match(modele.filtration.profilReference, /Été/);
  assert.equal(modele.filtration.contexte, "Chaleur tardive déjà évaluée");
});

test("une prolongation validée conserve son libellé historique", () => {
  const entree = donnees();
  entree.controle = {
    ...entree.controle,
    pump: { ...entree.controle.pump, extension: { status: "approved", minutes: 90 } },
  };
  const modele = construireModeleAssistantExpertDepuisDonnees(entree);
  assert.equal(modele.filtration.prolongation, "Prolongation ponctuelle validée : +1.5 h");
});

test("une prolongation ignorée conserve son libellé historique", () => {
  const entree = donnees();
  entree.controle = {
    ...entree.controle,
    pump: { ...entree.controle.pump, extension: { status: "ignored", minutes: 120 } },
  };
  const modele = construireModeleAssistantExpertDepuisDonnees(entree);
  assert.equal(modele.filtration.prolongation, "Prolongation ponctuelle ignorée aujourd'hui");
});

test("la vigilance active réutilise uniquement les informations déjà calculées", () => {
  const modele = construireModeleAssistantExpertDepuisDonnees(
    donnees({
      alerteMeteo: {
        available: true,
        active: true,
        levelLabel: "orange",
        alerts: [{ label: "Orages" }, { label: "Vent" }],
      },
    }),
  );
  assert.equal(modele.meteo.vigilance, "Vigilance orange · Orages · Vent");
});

test("les écarts analyseurs sont transmis sans recalcul", () => {
  const modele = construireModeleAssistantExpertDepuisDonnees(
    donnees({
      comparaisons: [
        { metric: "temperature", label: "Température", delta: 0.1, unit: "°C", statusLabel: "Cohérent" },
        { metric: "orp", label: "ORP", delta: 42, unit: "mV", statusLabel: "Cohérent" },
      ],
      metaComparaison: {
        state: "ready",
        detail: "Mesures comparables.",
        a: { name: "Blue Connect" },
        b: { name: "Flipr" },
        timeGapMinutes: 2,
      },
    }),
  );
  assert.deepEqual(modele.comparaison.ecarts, [
    { metrique: "temperature", libelle: "Température", valeur: 0.1, unite: "°C", statut: "Cohérent" },
    { metrique: "orp", libelle: "ORP", valeur: 42, unite: "mV", statut: "Cohérent" },
  ]);
});

test("le verrou PAC reçu est seulement reflété dans le modèle", () => {
  const entree = donnees();
  const modeleVerrouille = construireModeleAssistantExpertDepuisDonnees(entree);
  assert.equal(modeleVerrouille.pac.ecrituresVerrouillees, true);

  const entreeFalsifiee = donnees();
  entreeFalsifiee.controle = { ...entreeFalsifiee.controle, pac: { write_enabled: true } };
  const modeleFalsifie = construireModeleAssistantExpertDepuisDonnees(entreeFalsifiee);
  assert.equal(modeleFalsifie.pac.ecrituresVerrouillees, false);
  assert.equal(entreeFalsifiee.controle.pac.write_enabled, true);
});

test("les conclusions restent celles déjà fournies par les moteurs", () => {
  const modele = construireModeleAssistantExpertDepuisDonnees(donnees());
  assert.match(modele.conclusion, /Aucune action urgente/);
  assert.match(modele.conclusion, /Conseil déjà calculé/);
  assert.match(modele.conclusion, /Filtration indicative/);
  assert.match(modele.conclusion, /Conditions estivales/);
});

test("SEC-000 : l'adaptateur ne lit aucun piège Home Assistant ou DOM", () => {
  const entree = donnees();
  for (const nom of ["hass", "callService", "callWS", "document", "window", "shadowRoot"]) {
    Object.defineProperty(entree, nom, {
      enumerable: false,
      get() {
        throw new Error(`lecture interdite: ${nom}`);
      },
    });
  }
  assert.doesNotThrow(() => construireModeleAssistantExpertDepuisDonnees(entree));
});
