import test from "node:test";
import assert from "node:assert/strict";
import {
  CATALOGUE_PRODUITS_TRAITEMENT,
  MODES_PRODUITS_COMPLEMENTAIRES,
  arrondirDoseTraitement,
  bornerNombreTraitement,
  calculerDoseDesalginClassic,
  calculerDosePar10m3,
  calculerDosePar100m3,
  lireNombreTraitement,
  normaliserConfigurationProduitsTraitement,
  preparerDosageCorrectionPh,
  preparerDosageDesinfectantBrome,
  preparerDosageGreaseKiller,
  protocoleFabricantHebdomadaireActif,
} from "../../src/traitement/produits-dosage.js";

const profil = (surcharge = {}) => ({
  ph_plus_product: "axton_ph_plus_powder",
  ph_minus_product: "axton_ph_minus_liquid",
  sanitizer_product: "sunval_bromine_activator",
  algaecide_product: "bayrol_desalgin_classic",
  degreaser_product: "piscimar_grease_killer",
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
  ...surcharge,
});

test("le catalogue conserve exactement les quatre contre-étiquettes vérifiées du projet", () => {
  assert.equal(CATALOGUE_PRODUITS_TRAITEMENT.axton_ph_plus_powder.dosePer10m3Per01, 100);
  assert.equal(CATALOGUE_PRODUITS_TRAITEMENT.sunval_bromine_activator.weeklyPer10m3, 100);
  assert.equal(CATALOGUE_PRODUITS_TRAITEMENT.sunval_bromine_activator.shockPer10m3, 250);
  assert.equal(CATALOGUE_PRODUITS_TRAITEMENT.bayrol_desalgin_classic.weeklyPer10m3, 50);
  assert.equal(CATALOGUE_PRODUITS_TRAITEMENT.piscimar_grease_killer.initialPer100m3, 750);
  assert.equal(CATALOGUE_PRODUITS_TRAITEMENT.piscimar_grease_killer.weeklyPer100m3, 350);
});

test("la conversion numérique conserve les replis historiques", () => {
  assert.equal(lireNombreTraitement("", 16), 16);
  assert.equal(lireNombreTraitement(null, 16), 16);
  assert.equal(lireNombreTraitement(undefined, 16), 16);
  assert.equal(lireNombreTraitement("15.6", 16), 15.6);
  assert.equal(lireNombreTraitement("abc", 16), 16);
});

test("le bornage numérique reste inclusif et sans arrondi implicite", () => {
  assert.equal(bornerNombreTraitement(-1, 0, 10), 0);
  assert.equal(bornerNombreTraitement(4.2, 0, 10), 4.2);
  assert.equal(bornerNombreTraitement(11, 0, 10), 10);
});

test("l'arrondi de dose conserve le multiple de 5 historique et le plancher zéro", () => {
  assert.equal(arrondirDoseTraitement(156), 155);
  assert.equal(arrondirDoseTraitement(158), 160);
  assert.equal(arrondirDoseTraitement(2.4), 0);
  assert.equal(arrondirDoseTraitement(-20), 0);
});

test("une dose par 10 m³ reproduit exactement la formule historique", () => {
  assert.equal(calculerDosePar10m3(100, 15.6), 155);
  assert.equal(calculerDosePar10m3(250, 15.6), 390);
  assert.equal(calculerDosePar10m3(100, 16), 160);
});

test("une dose par 100 m³ reproduit exactement la formule historique", () => {
  assert.equal(calculerDosePar100m3(750, 15.6), 115);
  assert.equal(calculerDosePar100m3(350, 15.6), 55);
});

test("TRAIT-001 : une configuration invalide retombe sur le mode ponctuel et les produits historiques", () => {
  const normalisee = normaliserConfigurationProduitsTraitement({
    ph_plus_product: "inconnu",
    ph_minus_product: "inconnu",
    sanitizer_product: "inconnu",
    algaecide_product: "inconnu",
    degreaser_product: "inconnu",
    supplemental_products_mode: "inconnu",
  });
  assert.equal(normalisee.ph_plus_product, "bayrol_ph_plus");
  assert.equal(normalisee.ph_minus_product, "bayrol_ph_minus");
  assert.equal(normalisee.sanitizer_product, "custom_sanitizer");
  assert.equal(normalisee.algaecide_product, "none");
  assert.equal(normalisee.degreaser_product, "none");
  assert.equal(normalisee.supplemental_products_mode, MODES_PRODUITS_COMPLEMENTAIRES.PONCTUEL_URGENCE);
});

test("le protocole fabricant et les paramètres personnalisés ne sont conservés qu'avec des valeurs valides", () => {
  const normalisee = normaliserConfigurationProduitsTraitement(profil({
    supplemental_products_mode: "manufacturer_schedule",
    custom_ph_plus_rate: 0,
    custom_ph_minus_rate: 99999,
    custom_ph_plus_unit: "L",
    custom_ph_minus_unit: "ml",
    custom_weekly_rate: 0,
    custom_shock_rate: 99999,
  }));
  assert.equal(normalisee.supplemental_products_mode, MODES_PRODUITS_COMPLEMENTAIRES.PROTOCOLE_FABRICANT);
  assert.equal(normalisee.custom_ph_plus_rate, 1);
  assert.equal(normalisee.custom_ph_minus_rate, 5000);
  assert.equal(normalisee.custom_ph_plus_unit, "g");
  assert.equal(normalisee.custom_ph_minus_unit, "ml");
  assert.equal(normalisee.custom_weekly_rate, 1);
  assert.equal(normalisee.custom_shock_rate, 10000);
});

test("AXTON pH+ conserve 155 g pour 15,6 m³ par palier de +0,1", () => {
  const dosage = preparerDosageCorrectionPh(profil(), "plus", 15.6);
  assert.equal(dosage.nom, "AXTON pH+ poudre");
  assert.equal(dosage.unite, "g");
  assert.equal(dosage.taux, 100);
  assert.equal(dosage.dose, 155);
});

test("AXTON pH− liquide conserve 480 ml pour 16 m³ par palier de -0,1", () => {
  const dosage = preparerDosageCorrectionPh(profil(), "minus", 16);
  assert.equal(dosage.nom, "AXTON pH− liquide 14 %");
  assert.equal(dosage.unite, "ml");
  assert.equal(dosage.taux, 300);
  assert.equal(dosage.dose, 480);
});

test("un produit pH personnalisé conserve son nom, son taux et son unité persistés", () => {
  const dosage = preparerDosageCorrectionPh(profil({
    ph_plus_product: "custom_ph_plus",
    custom_ph_plus_name: "Produit maison",
    custom_ph_plus_rate: 175,
    custom_ph_plus_unit: "ml",
  }), "plus", 16);
  assert.equal(dosage.nom, "Produit maison");
  assert.equal(dosage.taux, 175);
  assert.equal(dosage.unite, "ml");
  assert.equal(dosage.dose, 280);
});

test("Sunval conserve 160 g hebdomadaires et 400 g choc pour le profil 16 m³", () => {
  const dosage = preparerDosageDesinfectantBrome(profil(), 16);
  assert.equal(dosage.nom, "Sunval Activateur de brome");
  assert.equal(dosage.tauxHebdomadaire, 100);
  assert.equal(dosage.tauxChoc, 250);
  assert.equal(dosage.doseHebdomadaire, 160);
  assert.equal(dosage.doseChoc, 400);
});

test("un désinfectant personnalisé conserve ses deux taux sans inventer de valeur", () => {
  const dosage = preparerDosageDesinfectantBrome(profil({
    sanitizer_product: "custom_sanitizer",
    custom_sanitizer_name: "Produit perso",
    custom_weekly_rate: 125,
    custom_shock_rate: 300,
  }), 16);
  assert.equal(dosage.nom, "Produit perso");
  assert.equal(dosage.doseHebdomadaire, 200);
  assert.equal(dosage.doseChoc, 480);
});

test("Desalgin Classic conserve environ 80 ml pour 15,6 m³", () => {
  assert.equal(calculerDoseDesalginClassic(15.6), 80);
});

test("Grease Killer conserve ses doses et exige une mesure dédiée compatible", () => {
  const sansMesure = preparerDosageGreaseKiller({ volumeM3: 15.6, brome: true, niveauDesinfectant: null });
  assert.equal(sansMesure.doseInitiale, 115);
  assert.equal(sansMesure.doseHebdomadaire, 55);
  assert.equal(sansMesure.limite, 3);
  assert.equal(sansMesure.mesureCompatible, false);
  assert.equal(preparerDosageGreaseKiller({ volumeM3: 15.6, brome: true, niveauDesinfectant: 3 }).mesureCompatible, true);
  assert.equal(preparerDosageGreaseKiller({ volumeM3: 15.6, brome: true, niveauDesinfectant: 3.1 }).mesureCompatible, false);
  assert.equal(preparerDosageGreaseKiller({ volumeM3: 15.6, brome: false, niveauDesinfectant: 1.5 }).limite, 1.5);
});

test("TRAIT-001 : seul le choix explicite fabricant active les rappels hebdomadaires", () => {
  assert.equal(protocoleFabricantHebdomadaireActif("manufacturer_schedule"), true);
  assert.equal(protocoleFabricantHebdomadaireActif("on_demand"), false);
  assert.equal(protocoleFabricantHebdomadaireActif(undefined), false);
  assert.equal(protocoleFabricantHebdomadaireActif(true), false);
});

test("SEC-000 : les calculs produit n'accèdent à aucun getter Home Assistant ou DOM", () => {
  const hostile = profil();
  for (const nom of ["hass", "callService", "callWS", "shadowRoot"]) {
    Object.defineProperty(hostile, nom, {
      enumerable: true,
      get() { throw new Error(`${nom} interdit`); },
    });
  }
  assert.doesNotThrow(() => normaliserConfigurationProduitsTraitement(hostile));
  assert.doesNotThrow(() => preparerDosageCorrectionPh(hostile, "plus", 16));
  assert.doesNotThrow(() => preparerDosageDesinfectantBrome(hostile, 16));
});
