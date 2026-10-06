import test from "node:test";
import assert from "node:assert/strict";
import {
  rendreOptionsTraitement,
  rendreCarteTraitement,
} from "../../src/interface/carte-traitement.js";

const echapperHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
}[char]));

const doseurs = {
  astralpool_dossi3_inline: { label: "AstralPool Dossi-3 · en ligne" },
  custom: { label: "Autre doseur" },
};

const produits = {
  bayrol_ph_plus: { kind: "ph_plus", label: "Bayrol pH-Plus" },
  bayrol_ph_minus: { kind: "ph_minus", label: "Bayrol pH-Minus" },
  custom_ph_plus: { kind: "ph_plus", label: "Produit pH+ personnalisé" },
  custom_ph_minus: { kind: "ph_minus", label: "Produit pH- personnalisé" },
};

function profil(overrides = {}) {
  return {
    volume_m3: 16,
    treatment: "bromine",
    feeder_model: "astralpool_dossi3_inline",
    feeder_setting: 3,
    feeder_scale_max: 8,
    sanitizer_level: 2,
    water_condition: "clear",
    ph_plus_product: "bayrol_ph_plus",
    ph_minus_product: "bayrol_ph_minus",
    sanitizer_product: "sunval_bromine_activator",
    algaecide_product: "none",
    degreaser_product: "none",
    supplemental_products_mode: "on_demand",
    custom_ph_plus_name: "Mon pH+",
    custom_ph_minus_name: "Mon pH-",
    custom_sanitizer_name: "Mon produit",
    custom_ph_plus_rate: 100,
    custom_ph_minus_rate: 100,
    custom_ph_plus_unit: "g",
    custom_ph_minus_unit: "g",
    custom_weekly_rate: 100,
    custom_shock_rate: 250,
    pump_flow_m3h: 10,
    total_alkalinity: "",
    calcium_hardness: "",
    filter_type: "sand",
    filter_clean_pressure: "",
    filter_current_pressure: "",
    filter_pressure_threshold: "",
    pool_mode: "active",
    recent_load: "normal",
    sanitizer_stock_g: "",
    remeasure_delay_hours: "",
    ...overrides,
  };
}

function modele(overrides = {}) {
  return {
    sanitizerTarget: { label: "Brome" },
    filterThreshold: null,
    filterAdvice: { tone: "good", state: "Filtre stable", title: "Filtre stable", detail: "Aucun contre-lavage suggéré." },
    confidence: { tone: "good", label: "Bonne", detail: "Mesures cohérentes" },
    summary: "Équilibre correct",
    volume: 16,
    phAdvice: { tone: "good", title: "pH 7,30", detail: "Zone cible" },
    feederAdvice: { tone: "good", title: "Doseur conservé", detail: "Réglage 3/8" },
    sanitizerAdvice: { tone: "good", title: "Brome correct", detail: "Mesure 2 mg/L" },
    isBromine: true,
    filtrationTone: "info",
    filtrationAdvice: "Recommandation indicative 13,5 h/j.",
    balanceAdvice: { tone: "pending", title: "TAC à renseigner", detail: "Mesure facultative" },
    stockAdvice: { tone: "pending", title: "Stock non renseigné", detail: "Aucun calcul de stock" },
    remeasureAdvice: { tone: "info", title: "Nouveau contrôle", detail: "Selon besoin" },
    supplementalAdvice: [],
    actions: [],
    ...overrides,
  };
}

function rendre({ profilValeur = profil(), modeleValeur = modele(), etatDetails = {}, historique = [] } = {}) {
  return rendreCarteTraitement({
    modele: modeleValeur,
    profil: profilValeur,
    etatDetails,
    historique,
    doseurs,
    produits,
    classeSection: "is-collapsed",
    attributsEntete: 'data-rc271-toggle="treatment" aria-expanded="false"',
    chevronHtml: '<span class="chevron">›</span>',
    echapperHtml,
  });
}

test("rend les options de catalogue avec sélection et échappement historiques", () => {
  const html = rendreOptionsTraitement({
    a: { label: "A&B" },
    b: { label: "<B>" },
  }, "a", echapperHtml);
  assert.equal(html, '<option value="a" selected>A&amp;B</option><option value="b" >&lt;B&gt;</option>');
});

test("rend le profil brome nominal sans inventer d'action", () => {
  const html = rendre();
  assert.match(html, /<h2>Traitement & dosage<\/h2>/);
  assert.match(html, /Brome<\/option>/);
  assert.match(html, /Ponctuel \/ urgence · aucun rappel hebdomadaire/);
  assert.match(html, /Aucune action à enregistrer pour le moment\./);
  assert.match(html, /Le dashboard conseille uniquement\. Il ne commande pas le doseur/);
  assert.match(html, /aria-expanded="false"/);
});

test("conserve l'ouverture indépendante des panneaux produits et maintenance", () => {
  const html = rendre({ etatDetails: { products: true, maintenance: false } });
  assert.match(html, /data-treatment-details=products open>/);
  assert.match(html, /data-treatment-details=maintenance >/);
});

test("affiche les champs personnalisés seulement lorsqu'ils sont explicitement sélectionnés", () => {
  const html = rendre({
    profilValeur: profil({
      ph_plus_product: "custom_ph_plus",
      ph_minus_product: "custom_ph_minus",
      sanitizer_product: "custom_sanitizer",
      custom_ph_plus_name: '<pH+ & perso>',
      custom_ph_minus_name: '<pH- & perso>',
      custom_sanitizer_name: '<choc & perso>',
    }),
  });
  assert.match(html, /Nom du pH\+/);
  assert.match(html, /&lt;pH\+ &amp; perso&gt;/);
  assert.match(html, /Nom du pH-/);
  assert.match(html, /&lt;pH- &amp; perso&gt;/);
  assert.match(html, /&lt;choc &amp; perso&gt;/);
});

test("le profil chlore garde le message historique sans dosage de galet", () => {
  const html = rendre({
    profilValeur: profil({ treatment: "chlorine", sanitizer_product: "custom_sanitizer" }),
    modeleValeur: modele({ sanitizerTarget: { label: "Chlore" }, isBromine: false }),
  });
  assert.match(html, /Le réglage chlore est calculé depuis la mesure manuelle/);
  assert.match(html, /Aucun dosage de galet n’est proposé/);
  assert.doesNotMatch(html, /Activateur \/ produit choc/);
});

test("rend actions et journal sans modifier les données reçues", () => {
  const historique = [{
    date: "2026-09-01T10:15:00.000Z",
    kind: "sanitizer_measurement",
    sanitizer_level: 2.2,
    product: "Mesure manuelle",
    detail: "Mesure brome",
  }];
  const modeleValeur = modele({
    actions: [{ kind: "bromine_shock", label: "J’ai ajouté 400 g", manualConfirmation: false }],
    supplementalAdvice: [{ tone: "info", title: "Produit <test>", detail: "Repère & notice" }],
  });
  const avantHistorique = structuredClone(historique);
  const avantModele = structuredClone(modeleValeur);
  const html = rendre({ historique, modeleValeur });
  assert.match(html, /data-treatment-action="0"/);
  assert.match(html, /is-critical/);
  assert.match(html, /Mesure brome : 2\.2 mg\/L/);
  assert.match(html, /Produit &lt;test&gt;/);
  assert.match(html, /Repère &amp; notice/);
  assert.deepEqual(historique, avantHistorique);
  assert.deepEqual(modeleValeur, avantModele);
});

test("SEC-000 : les getters Home Assistant, DOM et stockage ajoutés aux entrées ne sont jamais lus", () => {
  const profilValeur = profil();
  const modeleValeur = modele();
  const historique = [];
  for (const [objet, nom] of [
    [profilValeur, "hass"],
    [profilValeur, "callService"],
    [modeleValeur, "callWS"],
    [modeleValeur, "document"],
    [historique, "localStorage"],
  ]) {
    Object.defineProperty(objet, nom, { get() { throw new Error(`lecture interdite: ${nom}`); } });
  }
  assert.doesNotThrow(() => rendre({ profilValeur, modeleValeur, historique }));
});

test("refuse explicitement l'absence de fonction d'échappement", () => {
  assert.throws(
    () => rendreCarteTraitement({ modele: modele(), profil: profil(), doseurs, produits }),
    /echapperHtml/,
  );
  assert.throws(
    () => rendreOptionsTraitement(doseurs, "custom"),
    /echapperHtml/,
  );
});
