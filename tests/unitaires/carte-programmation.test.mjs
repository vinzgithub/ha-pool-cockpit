import test from "node:test";
import assert from "node:assert/strict";
import {
  rendreEditeurProgrammationEquipement,
  rendreCarteProfilProgrammationSaisonniere,
} from "../../src/interface/carte-programmation.js";

const jours = [["mon", "L"], ["tue", "M"], ["wed", "M"]];
const echapperHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");
const formaterDuree = (hours) => `${hours} h`;
const profils = {
  spring: { icon: "🌱", label: "Printemps", reason: "Remise en route" },
  summer: { icon: "☀️", label: "Été", reason: "Usage soutenu" },
  autumn: { icon: "🍂", label: "Automne", reason: "Baisse progressive" },
  winter: { icon: "❄️", label: "Hiver", reason: "Faible besoin" },
  maintenance: { icon: "🛠️", label: "Maintenance", reason: "Mode manuel" },
};

function selecteur(calls) {
  return (label, path, domains, current, placeholder) => {
    calls.push({ label, path, domains, current, placeholder });
    return `<picker data-path="${path}"></picker>`;
  };
}

function blocPompe(overrides = {}) {
  return {
    entity_id: "switch.pompe",
    power_entity: "sensor.pompe_power",
    energy_entity: "sensor.pompe_energy",
    mode: "automatic",
    weekdays: ["mon", "wed"],
    periods: [
      { enabled: true, start: "08:30", end: "12:00" },
      { enabled: false, start: "14:00", end: "18:00" },
    ],
    ...overrides,
  };
}

function blocLumiere(overrides = {}) {
  return {
    entity_id: "light.piscine",
    power_entity: "sensor.light_power",
    auto_off_minutes: 45,
    mode: "program",
    weekdays: ["tue"],
    periods: [{ enabled: true, start: "20:00", end: "23:00" }],
    ...overrides,
  };
}

function recommandation(overrides = {}) {
  return {
    hours: 14,
    hydraulicHours: 2,
    scheduleLabel: "08:30 → 22:30",
    seasonInfo: { libelle: "Été" },
    context: "Conditions cohérentes avec la base de profil",
    water: 27.1,
    air: 24,
    heatAlert: false,
    coldAlert: false,
    weatherAlert: {},
    ...overrides,
  };
}

function saisonnalite(overrides = {}) {
  return {
    current: "summer",
    source: "custom",
    follow_astronomical: false,
    ...overrides,
  };
}

test("la programmation pompe conserve les domaines, le mode automatic et les trois sélecteurs historiques", () => {
  const calls = [];
  const html = rendreEditeurProgrammationEquipement({
    cible: "pump",
    libelle: "Programmation de la pompe",
    bloc: blocPompe(),
    coordination: { role: "master" },
    joursSemaine: jours,
    rendreSelecteurEntite: selecteur(calls),
    echapperHtml,
  });
  assert.match(html, /Programmation de la pompe/);
  assert.match(html, /value=automatic selected>Conseillé avec validation/);
  assert.match(html, /data-rc27-weekday="mon"[^>]*>L<\/button>/);
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[0].domains, ["switch", "input_boolean"]);
  assert.equal(calls[2].path, "pump.energy_entity");
});

test("la programmation éclairage conserve le minuteur et n'affiche jamais l'option automatic", () => {
  const calls = [];
  const html = rendreEditeurProgrammationEquipement({
    cible: "light",
    libelle: "Programmation de l’éclairage",
    bloc: blocLumiere(),
    coordination: { role: "master" },
    joursSemaine: jours,
    rendreSelecteurEntite: selecteur(calls),
    echapperHtml,
  });
  assert.match(html, /value="45"/);
  assert.match(html, /Extinction automatique/);
  assert.doesNotMatch(html, /Conseillé avec validation/);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].domains, ["light", "switch", "input_boolean"]);
});

test("un satellite verrouille réellement tous les champs et échappe le nom du maître", () => {
  const html = rendreEditeurProgrammationEquipement({
    cible: "pump",
    libelle: "Programmation de la pompe",
    bloc: blocPompe(),
    coordination: { role: "satellite", peer_name: "Site A <Nord> & Sud" },
    joursSemaine: jours,
    rendreSelecteurEntite: () => "<picker></picker>",
    echapperHtml,
  });
  assert.match(html, /is-satellite-locked/);
  assert.match(html, /Site A &lt;Nord&gt; &amp; Sud/);
  assert.match(html, /select data-rc27-path="pump\.mode" disabled/);
  assert.match(html, /data-rc27-weekday="mon"[^>]*disabled/);
  assert.match(html, /Cette instance n’exécute aucune plage horaire/);
});

test("le profil personnalisé reste prioritaire et propose explicitement la reprise adaptative", () => {
  const html = rendreCarteProfilProgrammationSaisonniere({
    saisonnalite: saisonnalite(),
    profilsSaisonniers: profils,
    profilSuggere: "summer",
    recommandationAdaptative: recommandation(),
    coordination: { role: "master" },
    formaterDuree,
    echapperHtml,
  });
  assert.match(html, /Programmation personnalisée prioritaire/);
  assert.match(html, /Reprendre le programme adaptatif/);
  assert.match(html, /Suivre la saison astronomique/);
  assert.match(html, /Mémoriser les horaires actuels comme base du profil/);
});

test("le profil adaptatif actif conserve les actions Suspendre et Passer en personnalisé", () => {
  const html = rendreCarteProfilProgrammationSaisonniere({
    saisonnalite: saisonnalite({ source: "adaptive", follow_astronomical: true }),
    profilsSaisonniers: profils,
    profilSuggere: "summer",
    recommandationAdaptative: recommandation(),
    coordination: { role: "master" },
    formaterDuree,
    echapperHtml,
  });
  assert.match(html, /Programme adaptatif actif/);
  assert.match(html, /Suspendre l’adaptatif/);
  assert.match(html, /Passer en personnalisé/);
  assert.doesNotMatch(html, /Suivre la saison astronomique/);
});

test("le profil adaptatif suspendu conserve la reprise explicite sans devenir personnalisé", () => {
  const html = rendreCarteProfilProgrammationSaisonniere({
    saisonnalite: saisonnalite({ source: "suspended" }),
    profilsSaisonniers: profils,
    profilSuggere: "autumn",
    recommandationAdaptative: recommandation({ seasonInfo: { libelle: "Automne" } }),
    coordination: { role: "master" },
    formaterDuree,
    echapperHtml,
  });
  assert.match(html, /Programme adaptatif suspendu/);
  assert.match(html, /Les plages actuellement appliquées sont figées/);
  assert.match(html, /Reprendre l’adaptatif/);
  assert.match(html, /Passer en personnalisé/);
});

test("le profil Maintenance n'affiche pas de reprise adaptative", () => {
  const html = rendreCarteProfilProgrammationSaisonniere({
    saisonnalite: saisonnalite({ current: "maintenance" }),
    profilsSaisonniers: profils,
    profilSuggere: "winter",
    recommandationAdaptative: recommandation({ seasonInfo: { libelle: "Hiver" } }),
    coordination: { role: "master" },
    formaterDuree,
    echapperHtml,
  });
  assert.match(html, /🛠️/);
  assert.match(html, /Maintenance/);
  assert.doesNotMatch(html, /Reprendre le programme adaptatif/);
  assert.match(html, /Mémoriser les horaires actuels comme base du profil/);
});

test("un satellite affiche le profil mais masque toutes les actions de programmation", () => {
  const html = rendreCarteProfilProgrammationSaisonniere({
    saisonnalite: saisonnalite({ source: "adaptive" }),
    profilsSaisonniers: profils,
    profilSuggere: "summer",
    recommandationAdaptative: recommandation(),
    coordination: { role: "satellite", peer_name: "Site A & <maître>" },
    formaterDuree,
    echapperHtml,
  });
  assert.match(html, /data-rc30-profile disabled/);
  assert.match(html, /Site A &amp; &lt;maître&gt;/);
  assert.doesNotMatch(html, /data-rc30-suspend-adaptive/);
  assert.doesNotMatch(html, /data-rc30-save-profile-base/);
});

test("la proposition adaptative rend les températures, le plancher hydraulique et l'alerte sans recalculer", () => {
  const html = rendreCarteProfilProgrammationSaisonniere({
    saisonnalite: saisonnalite({ source: "adaptive", follow_astronomical: true }),
    profilsSaisonniers: profils,
    profilSuggere: "summer",
    recommandationAdaptative: recommandation({
      hours: 24,
      hydraulicHours: 2,
      scheduleLabel: "00:00 → 12:00 + 12:00 → 00:00",
      water: 29.4,
      air: 33.2,
      heatAlert: true,
      weatherAlert: { levelLabel: "Orange" },
    }),
    coordination: { role: "master" },
    formaterDuree,
    echapperHtml,
  });
  assert.match(html, /00:00 → 12:00 \+ 12:00 → 00:00 · 24 h/);
  assert.match(html, /Eau 29\.4 °C · Air 33\.2 °C · Plancher hydraulique 2 h/);
  assert.match(html, /🔥 Orange canicule/);
});

test("SEC-000 : le module ne lit aucune API HA, DOM, fenêtre ou stockage cachée", () => {
  const hostile = {};
  for (const cle of ["hass", "callService", "callWS", "document", "window", "localStorage"]) {
    Object.defineProperty(hostile, cle, {
      enumerable: false,
      get() { throw new Error(`lecture interdite: ${cle}`); },
    });
  }
  const coordination = { role: "master" };
  Object.setPrototypeOf(coordination, hostile);
  assert.doesNotThrow(() => rendreEditeurProgrammationEquipement({
    cible: "pump",
    libelle: "Pompe",
    bloc: blocPompe(),
    coordination,
    joursSemaine: jours,
    rendreSelecteurEntite: () => "<picker></picker>",
    echapperHtml,
  }));
  assert.doesNotThrow(() => rendreCarteProfilProgrammationSaisonniere({
    saisonnalite: saisonnalite(),
    profilsSaisonniers: profils,
    profilSuggere: "summer",
    recommandationAdaptative: recommandation(),
    coordination,
    formaterDuree,
    echapperHtml,
  }));
});
