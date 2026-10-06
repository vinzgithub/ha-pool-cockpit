import test from "node:test";
import assert from "node:assert/strict";
import {
  construireModeleAssistantExpert,
  creerHtmlAssistantExpert,
} from "../../src/interface/assistant-expert/assistant-expert.js";

const contexte = {
  general: { libelle: "Eau équilibrée", message: "Aucune action urgente.", score: 90, suspendu: false },
  eau: { temperature: 27.1, ph: 7.31, orp: 756, confiance: 88 },
  meteo: { disponible: true, temperature: 17.5, condition: "Partiellement nuageux", vigilance: "Aucune vigilance" },
  comparaison: { etat: "time_gap", detail: "Les relevés sont espacés de 684 minutes.", sourceA: "Blue Connect", sourceB: "Flipr", ecartMinutes: 684, ecarts: [] },
  filtration: {
    source: "custom",
    horaireCourant: "08:30 → 21:30",
    heuresCourantes: 13,
    horaireRecommande: "08:30 → 22:30",
    heuresRecommandees: 14,
    plancherHydraulique: 2,
    saisonAstronomique: "Été",
    profilReference: "Été · saison de baignade",
    contexte: "Conditions estivales",
    prolongation: "Aucune prolongation ponctuelle active",
  },
  traitement: { resume: "Protocole fabricant hebdomadaire : 160 g", confiance: "Fiabilité moyenne" },
  pac: { configuree: true, etat: "À l'arrêt", consigne: 28.5, entree: 27.1, sortie: 27.4, communication: "OK", defaut: "Aucun", ecrituresVerrouillees: true },
  conclusions: [
    "Aucune action urgente.",
    "Comparaison suspendue : les relevés sont trop éloignés dans le temps.",
    "Eau à 27,1 °C : recommandation indicative 14 h/j.",
  ],
};

test("l'Assistant Expert assemble les conclusions existantes et respecte la priorité personnalisée", () => {
  const modele = construireModeleAssistantExpert(contexte);
  assert.equal(modele.filtration.programme.identifiant, "custom");
  assert.match(modele.conclusion, /Aucune action urgente/);
  assert.match(modele.conclusion, /Comparaison suspendue/);
  assert.match(modele.conclusion, /recommandation indicative 14 h\/j/);
  assert.match(modele.conclusion, /horaires saisis par l'utilisateur restent prioritaires/i);
});

test("le mode adaptatif suspendu est seulement décrit comme figé", () => {
  const modele = construireModeleAssistantExpert({ ...contexte, filtration: { ...contexte.filtration, source: "suspended" } });
  assert.equal(modele.filtration.programme.identifiant, "suspended");
  assert.match(modele.conclusion, /horaires appliqués sont figés/i);
});

test("le rendu distingue saison astronomique et profil de référence", () => {
  const html = creerHtmlAssistantExpert(construireModeleAssistantExpert(contexte));
  assert.match(html, /Saison astronomique/);
  assert.match(html, />Été</);
  assert.match(html, /Profil de référence/);
  assert.match(html, /Été · saison de baignade/);
});

test("le rendu affiche les écarts déjà calculés des analyseurs quand la comparaison est prête", () => {
  const pret = {
    ...contexte,
    comparaison: {
      etat: "ready",
      detail: "Les mesures sont comparables.",
      sourceA: "Blue Connect",
      sourceB: "Flipr",
      ecartMinutes: 2,
      ecarts: [
        { metrique: "temperature", libelle: "Température", valeur: 0.1, unite: "°C", statut: "Cohérent" },
        { metrique: "ph", libelle: "pH", valeur: 0.01, unite: "", statut: "Cohérent" },
        { metrique: "orp", libelle: "ORP", valeur: 42, unite: "mV", statut: "Cohérent" },
      ],
    },
  };
  const html = creerHtmlAssistantExpert(construireModeleAssistantExpert(pret));
  assert.match(html, /Δ Température/);
  assert.match(html, /Δ pH/);
  assert.match(html, /Δ ORP/);
  assert.match(html, /42 mV · Cohérent/);
});

test("le rendu contient les rubriques attendues et aucune action métier", () => {
  const html = creerHtmlAssistantExpert(construireModeleAssistantExpert(contexte));
  assert.match(html, /Assistant Expert Piscine/);
  assert.match(html, /Eau/);
  assert.match(html, /Météo/);
  assert.match(html, /Filtration/);
  assert.match(html, /Analyseurs/);
  assert.match(html, /Traitement/);
  assert.match(html, /PAC/);
  assert.match(html, /aucune commande Home Assistant/i);
  assert.doesNotMatch(html, /callService|turn_on|turn_off|set_value|select_option/);
});

test("le rendu échappe les données non fiables", () => {
  const modele = construireModeleAssistantExpert({ ...contexte, general: { ...contexte.general, libelle: '<script>alert("x")</script>' } });
  const html = creerHtmlAssistantExpert(modele);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
