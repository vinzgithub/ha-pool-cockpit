import test from "node:test";
import assert from "node:assert/strict";
import {
  STATUTS_COMMANDE_PAC,
  calculerConsigneDepuisPointeurPac,
  commandePacEstVerrouillee,
  calculerGeometrieCadranPac,
  calculerLimitesConsignePac,
  choisirValeurAfficheeConsignePac,
  composerOptionModePac,
  preparerCommandeConsignePac,
  preparerCommandeMarcheArretPac,
  preparerCommandeModePac,
  resoudreOptionModePac,
} from "../../src/pac/commandes-pac.js";

const pac = (surcharge = {}) => ({
  write_enabled: false,
  command_entity: "switch.pac",
  setpoint_entity: "number.pac_consigne",
  mode_entity: "select.pac_mode",
  ...surcharge,
});

test("le verrou de commande reproduit exactement le test historique sur write_enabled", () => {
  assert.equal(commandePacEstVerrouillee({ write_enabled: false }), true);
  assert.equal(commandePacEstVerrouillee({ write_enabled: 0 }), true);
  assert.equal(commandePacEstVerrouillee({ write_enabled: "" }), true);
  assert.equal(commandePacEstVerrouillee({ write_enabled: true }), false);
  assert.equal(commandePacEstVerrouillee({ write_enabled: "true" }), false);
});

test("PAC-001 bloque marche et arrêt avant toute construction de service", () => {
  for (const demarrer of [true, false]) {
    assert.deepEqual(
      preparerCommandeMarcheArretPac(pac(), demarrer),
      { statut: STATUTS_COMMANDE_PAC.VERROUILLEE, service: null },
    );
  }
});

test("marche et arrêt produisent les mêmes descripteurs historiques si le verrou était ouvert", () => {
  assert.deepEqual(preparerCommandeMarcheArretPac(pac({ write_enabled: true }), true).service, {
    domaine: "switch", nom: "turn_on", donnees: { entity_id: "switch.pac" },
  });
  assert.deepEqual(preparerCommandeMarcheArretPac(pac({ write_enabled: true }), false).service, {
    domaine: "switch", nom: "turn_off", donnees: { entity_id: "switch.pac" },
  });
});

test("une commande marche sans entité reste indisponible", () => {
  assert.equal(preparerCommandeMarcheArretPac(pac({ write_enabled: true, command_entity: "" }), true).statut, STATUTS_COMMANDE_PAC.INDISPONIBLE);
});

test("la consigne verrouillée distingue simulation et PAC configurée", () => {
  assert.equal(preparerCommandeConsignePac(pac(), 28.5, false).statut, STATUTS_COMMANDE_PAC.SIMULATION);
  assert.equal(preparerCommandeConsignePac(pac(), 28.5, true).statut, STATUTS_COMMANDE_PAC.VERROUILLEE);
});

test("une consigne invalide est rejetée avant tout service", () => {
  for (const valeur of [undefined, "abc", Number.NaN]) {
    assert.equal(preparerCommandeConsignePac(pac(), valeur, true).statut, STATUTS_COMMANDE_PAC.INVALIDE);
  }
});

test("la conversion historique Number(null) reste 0 si ce cas artificiel est présenté", () => {
  const decision = preparerCommandeConsignePac(pac(), null, false);
  assert.equal(decision.statut, STATUTS_COMMANDE_PAC.SIMULATION);
  assert.equal(decision.valeur, 0);
});

test("une consigne autorisée reproduit number.set_value", () => {
  const decision = preparerCommandeConsignePac(pac({ write_enabled: true }), "29.5", true);
  assert.equal(decision.statut, STATUTS_COMMANDE_PAC.PRETE);
  assert.equal(decision.valeur, 29.5);
  assert.deepEqual(decision.service, {
    domaine: "number", nom: "set_value", donnees: { entity_id: "number.pac_consigne", value: 29.5 },
  });
});

test("une consigne sans entité number reste indisponible", () => {
  assert.equal(preparerCommandeConsignePac(pac({ write_enabled: true, setpoint_entity: "" }), 29, true).statut, STATUTS_COMMANDE_PAC.INDISPONIBLE);
});

test("composerOptionModePac conserve les libellés ESPHome historiques", () => {
  assert.equal(composerOptionModePac("heating", "smart"), "Heating + Smart");
  assert.equal(composerOptionModePac("cooling", "boost"), "Cooling + Boost");
  assert.equal(composerOptionModePac("auto", "eco"), "Auto (heat & cool)");
  assert.equal(composerOptionModePac("", "smart"), "");
});

test("resoudreOptionModePac préfère une option réelle correspondante", () => {
  const options = ["Heating + Eco", "Heating + Smart", "Cooling + Boost", "Auto (heat & cool)"];
  assert.equal(resoudreOptionModePac("heating", "smart", options), "Heating + Smart");
  assert.equal(resoudreOptionModePac("auto", "smart", options), "Auto (heat & cool)");
});

test("resoudreOptionModePac retombe sur la valeur composée si nécessaire", () => {
  assert.equal(resoudreOptionModePac("cooling", "eco", []), "Cooling + Eco");
  assert.equal(resoudreOptionModePac("cooling", "eco", ["Mode propriétaire"]), "Cooling + Eco");
});

test("PAC-001 bloque le changement de mode avant de résoudre une option", () => {
  const optionsHostiles = new Proxy([], { get() { throw new Error("les options ne doivent pas être lues quand la PAC est verrouillée"); } });
  assert.doesNotThrow(() => preparerCommandeModePac(pac(), "heating", "smart", optionsHostiles));
  assert.equal(preparerCommandeModePac(pac(), "heating", "smart", []).statut, STATUTS_COMMANDE_PAC.VERROUILLEE);
});

test("un mode autorisé reproduit select.select_option", () => {
  const decision = preparerCommandeModePac(pac({ write_enabled: true }), "heating", "smart", ["Heating + Smart"]);
  assert.equal(decision.statut, STATUTS_COMMANDE_PAC.PRETE);
  assert.deepEqual(decision.service, {
    domaine: "select", nom: "select_option", donnees: { entity_id: "select.pac_mode", option: "Heating + Smart" },
  });
});

test("un mode autorisé sans entité ou option exploitable reste indisponible", () => {
  assert.equal(preparerCommandeModePac(pac({ write_enabled: true, mode_entity: "" }), "heating", "smart", []).statut, STATUTS_COMMANDE_PAC.INDISPONIBLE);
  assert.equal(preparerCommandeModePac(pac({ write_enabled: true }), "", "", []).statut, STATUTS_COMMANDE_PAC.INDISPONIBLE);
});

test("les limites du cadran conservent 8–32 °C et le pas historique", () => {
  assert.deepEqual(calculerLimitesConsignePac(undefined), { min: 8, max: 32, step: 0.5 });
  assert.deepEqual(calculerLimitesConsignePac("1"), { min: 8, max: 32, step: 1 });
  assert.deepEqual(calculerLimitesConsignePac(0), { min: 8, max: 32, step: 0.5 });
});

test("la valeur affichée conserve la priorité brouillon > réel > simulation > 28,5", () => {
  assert.equal(choisirValeurAfficheeConsignePac({ brouillon: 30, pacConfiguree: true, consigne: 29, simulation: 28 }), 30);
  assert.equal(choisirValeurAfficheeConsignePac({ pacConfiguree: true, consigne: 29, simulation: 28 }), 29);
  assert.equal(choisirValeurAfficheeConsignePac({ pacConfiguree: false, consigne: 29, simulation: 28 }), 28);
  assert.equal(choisirValeurAfficheeConsignePac({}), 28.5);
});

test("la géométrie du cadran conserve les bornes et la progression historique", () => {
  const limites = { min: 8, max: 32, step: 0.5 };
  const minimum = calculerGeometrieCadranPac(8, limites);
  const maximum = calculerGeometrieCadranPac(32, limites);
  assert.equal(minimum.ratio, 0);
  assert.equal(minimum.progress, 0);
  assert.equal(maximum.ratio, 1);
  assert.equal(maximum.progress, 77.8);
  assert.equal(calculerGeometrieCadranPac("invalide", limites).ratio, 0);
});

test("la conversion pointeur conserve null sur géométrie invalide et le snap du pas", () => {
  const limites = { min: 8, max: 32, step: 0.5 };
  assert.equal(calculerConsigneDepuisPointeurPac({ clientX: 0, clientY: 0, rect: null, limites }), null);
  const rect = { left: 0, top: 0, width: 100, height: 100 };
  const valeur = calculerConsigneDepuisPointeurPac({ clientX: 50, clientY: 0, rect, limites });
  assert.equal(Number.isFinite(valeur), true);
  assert.equal((valeur * 2) % 1, 0);
  assert.ok(valeur >= 8 && valeur <= 32);
});

test("SEC-000 : le module n'accède à aucun getter Home Assistant étranger", () => {
  const configuration = {
    write_enabled: false,
    command_entity: "switch.pac",
    get hass() { throw new Error("interdit"); },
    get callService() { throw new Error("interdit"); },
    get callWS() { throw new Error("interdit"); },
  };
  assert.doesNotThrow(() => preparerCommandeMarcheArretPac(configuration, true));
  assert.doesNotThrow(() => preparerCommandeConsignePac(configuration, 28.5, true));
  assert.doesNotThrow(() => preparerCommandeModePac(configuration, "heating", "smart", []));
});
