/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const MARQUEUR_GENERATION = "/*__HA_POOL_GENERATED_EAU_METEO__*/";

export const MODULES_GENERES = Object.freeze([
  "src/configuration/fonctionnalites.js",
  "src/moteur/filtration.js",
  "src/moteur/saisons.js",
  "src/pac/securite-pac.js",
  "src/pac/commandes-pac.js",
  "src/traitement/produits-dosage.js",
  "src/traitement/journal.js",
  "src/programmation/priorites.js",
  "src/programmation/prolongation.js",
  "src/programmation/programme-adaptatif.js",
  "src/intelligence/eau-meteo/configuration-eau-meteo.js",
  "src/intelligence/eau-meteo/normaliser-entrees-eau-meteo.js",
  "src/intelligence/eau-meteo/regles-eau-meteo.js",
  "src/intelligence/eau-meteo/calculer-score-eau-meteo.js",
  "src/intelligence/confiance-capteurs/calculer-confiance-capteurs.js",
  "src/intelligence/optimisation-energetique/evaluer-heures-creuses.js",
  "src/intelligence/saisons/detecter-saison.js",
  "src/intelligence/pac/evaluer-pac.js",
  "src/intelligence/mode-location/evaluer-mode-location.js",
  "src/adaptateurs/home-assistant/construire-entrees-eau-meteo.js",
  "src/controleurs/evaluer-recommandation-eau-meteo-temps-reel.js",
  "src/interface/themes.js",
  "src/interface/composants/sections-repliables.js",
  "src/interface/composants/selecteurs-entites.js",
  "src/interface/coquille-rendu.js",
  "src/interface/historique-capteurs.js",
  "src/interface/recommandation-eau-meteo/rendre-recommandation-eau-meteo.js",
  "src/interface/carte-filtration.js",
  "src/interface/carte-pac.js",
  "src/interface/carte-traitement.js",
  "src/interface/carte-capteurs.js",
  "src/interface/carte-coordination.js",
  "src/interface/carte-programmation.js",
  "src/interface/assistant-expert/assistant-expert.js",
  "src/interface/assistant-expert/adaptateur-dashboard.js",
  "src/interface/assistant-expert/etat-popup.js",
  "src/interface/gemini/gemini-reformulation.js",
  "src/interface/gemini/controleur-gemini.js",
]);

function sha256(texte) {
  return crypto.createHash("sha256").update(texte, "utf8").digest("hex");
}

function retirerSyntaxeModules(source) {
  return source
    .replace(/^import\s+[^;]+;\s*$/gm, "")
    .replace(/^export\s+(?=(const|let|var|function|class)\b)/gm, "")
    .trim();
}

function adapterFonctionnalites(source) {
  return source.replace(
    /const\s+FONCTIONNALITES\s*=/,
    "const FONCTIONNALITES_EXPERIMENTALES =",
  );
}

export function genererBlocEauMeteo({ racine, substitutions = new Map() }) {
  const morceaux = [];
  const empreintes = [];

  for (const relatif of MODULES_GENERES) {
    const contenu = substitutions.has(relatif)
      ? substitutions.get(relatif)
      : fs.readFileSync(path.join(racine, relatif), "utf8");
    empreintes.push(`${relatif}:${sha256(contenu)}`);
    let transforme = retirerSyntaxeModules(contenu);
    if (relatif === "src/configuration/fonctionnalites.js") {
      transforme = adapterFonctionnalites(transforme);
    }
    morceaux.push(`/* Source générée : ${relatif} */\n${transforme}`);
  }

  morceaux.push(`/* Alias de compatibilité RC28.4 */
const calculerScoreEauMeteoRc284 = calculerScoreEauMeteo;
const creerHtmlRecommandationEauMeteoRc284 = creerHtmlRecommandationEauMeteo;
const evaluerRecommandationEauMeteoTempsReelRc285 = evaluerRecommandationEauMeteoTempsReel;`);

  return `/* DÉBUT BLOC GÉNÉRÉ — NE PAS MODIFIER DANS dist/\n * Sources : ${MODULES_GENERES.join(", ")}\n * Empreinte sources : ${sha256(empreintes.join("\n"))}\n */\n${morceaux.join("\n\n")}\n/* FIN BLOC GÉNÉRÉ */`;
}

export function genererBundle({ racine, substitutions = new Map() }) {
  const template = fs.readFileSync(
    path.join(racine, "frontend/pool-dashboard.template.js"),
    "utf8",
  );
  const occurrences = template.split(MARQUEUR_GENERATION).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Le modèle doit contenir exactement un marqueur de génération, trouvé : ${occurrences}`);
  }
  return template.replace(
    MARQUEUR_GENERATION,
    genererBlocEauMeteo({ racine, substitutions }),
  );
}
