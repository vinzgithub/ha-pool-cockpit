import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { genererBundle } from "../../outils/lib/construction-bundle.mjs";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cheminDist = path.join(racine, "frontend/dist/pool-dashboard.js");
const cheminInterface = "src/interface/recommandation-eau-meteo/rendre-recommandation-eau-meteo.js";

test("le bundle commité est exactement celui généré depuis src et le modèle", () => {
  const genere = genererBundle({ racine });
  const commite = fs.readFileSync(cheminDist, "utf8");
  assert.equal(commite, genere);
});

test("une modification de src/interface modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminInterface), "utf8");
  const substitutions = new Map([
    [cheminInterface, original.replace("Assistant Eau + Météo", "Assistant Eau + Météo MODIFIÉ")],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /Assistant Eau \+ Météo MODIFIÉ/);
});

test("le bloc généré expose les alias attendus par le dashboard historique", () => {
  const genere = genererBundle({ racine });
  assert.match(genere, /const calculerScoreEauMeteoRc284 = calculerScoreEauMeteo;/);
  assert.match(genere, /const creerHtmlRecommandationEauMeteoRc284 = creerHtmlRecommandationEauMeteo;/);
});

const cheminMoteurFiltration = "src/moteur/filtration.js";

test("une modification du moteur de filtration modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminMoteurFiltration), "utf8");
  const substitutions = new Map([
    [
      cheminMoteurFiltration,
      original.replace(
        "Math.ceil(temperatureEauC / 2)",
        "Math.ceil(temperatureEauC / 2) /* TEST BUILD */",
      ),
    ],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD/);
});

const cheminPrioritesProgrammation = "src/programmation/priorites.js";

test("une modification du module de priorités modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminPrioritesProgrammation), "utf8");
  const substitutions = new Map([
    [
      cheminPrioritesProgrammation,
      original.replace(
        'MANUEL_FORCE: "manuel_force"',
        'MANUEL_FORCE: "manuel_force" /* TEST BUILD PRIORITES */',
      ),
    ],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD PRIORITES/);
});


const cheminProlongationProgrammation = "src/programmation/prolongation.js";

test("une modification du module de prolongation modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminProlongationProgrammation), "utf8");
  const substitutions = new Map([
    [
      cheminProlongationProgrammation,
      original.replace(
        "RÈGLE FILT-006",
        "RÈGLE FILT-006 /* TEST BUILD PROLONGATION */",
      ),
    ],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD PROLONGATION/);
});

const cheminMoteurSaisons = "src/moteur/saisons.js";

test("une modification du moteur de saisons modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminMoteurSaisons), "utf8");
  const substitutions = new Map([
    [
      cheminMoteurSaisons,
      original.replace(
        "RÈGLE SAISON-001",
        "RÈGLE SAISON-001 /* TEST BUILD SAISONS */",
      ),
    ],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD SAISONS/);
});


const cheminSecuritePac = "src/pac/securite-pac.js";

test("une modification du verrou PAC modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminSecuritePac), "utf8");
  const substitutions = new Map([
    [
      cheminSecuritePac,
      original.replace(
        "RÈGLE PAC-001",
        "RÈGLE PAC-001 /* TEST BUILD SECURITE PAC */",
      ),
    ],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD SECURITE PAC/);
});

const cheminCommandesPac = "src/pac/commandes-pac.js";

test("une modification du module de commandes PAC modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminCommandesPac), "utf8");
  const substitutions = new Map([
    [
      cheminCommandesPac,
      original.replace(
        "RÈGLE PAC-002",
        "RÈGLE PAC-002 /* TEST BUILD COMMANDES PAC */",
      ),
    ],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD COMMANDES PAC/);
});

const cheminProduitsDosage = "src/traitement/produits-dosage.js";

test("une modification du module produits-dosage modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminProduitsDosage), "utf8");
  const substitutions = new Map([
    [
      cheminProduitsDosage,
      original.replace(
        "RÈGLE TRAIT-001",
        "RÈGLE TRAIT-001 /* TEST BUILD PRODUITS DOSAGE */",
      ),
    ],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD PRODUITS DOSAGE/);
});

const cheminJournalTraitement = "src/traitement/journal.js";

test("une modification du module journal modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminJournalTraitement), "utf8");
  const substitutions = new Map([
    [
      cheminJournalTraitement,
      original.replace(
        "RÈGLE TRAIT-002",
        "RÈGLE TRAIT-002 /* TEST BUILD JOURNAL */",
      ),
    ],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD JOURNAL/);
});

const cheminAssistantExpertAdaptateur = "src/interface/assistant-expert/adaptateur-dashboard.js";
const cheminAssistantExpertEtatPopup = "src/interface/assistant-expert/etat-popup.js";

test("une modification de l'adaptateur Assistant Expert modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminAssistantExpertAdaptateur), "utf8");
  const substitutions = new Map([
    [
      cheminAssistantExpertAdaptateur,
      original.replace(
        "RÈGLE FILT-004",
        "RÈGLE FILT-004 /* TEST BUILD ASSISTANT EXPERT ADAPTATEUR */",
      ),
    ],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD ASSISTANT EXPERT ADAPTATEUR/);
});

test("une modification de l'état de popup Assistant Expert modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminAssistantExpertEtatPopup), "utf8");
  const substitutions = new Map([
    [
      cheminAssistantExpertEtatPopup,
      original.replace(
        "RÈGLE SEC-000",
        "RÈGLE SEC-000 /* TEST BUILD ASSISTANT EXPERT POPUP */",
      ),
    ],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD ASSISTANT EXPERT POPUP/);
});

const cheminControleurGemini = "src/interface/gemini/controleur-gemini.js";

test("une modification du contrôleur Gemini modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, cheminControleurGemini), "utf8");
  const substitutions = new Map([
    [
      cheminControleurGemini,
      original.replace(
        "RÈGLE GEMINI-001",
        "RÈGLE GEMINI-001 /* TEST BUILD GEMINI */",
      ),
    ],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD GEMINI/);
});
