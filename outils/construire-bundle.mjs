#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { genererBundle } from "./lib/construction-bundle.mjs";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destination = path.join(racine, "frontend/dist/pool-dashboard.js");
const genere = genererBundle({ racine });
const verification = process.argv.includes("--verifier");

if (verification) {
  const commite = fs.readFileSync(destination, "utf8");
  if (commite !== genere) {
    console.error("ERREUR : frontend/dist/pool-dashboard.js diverge des sources et du modèle.");
    console.error("Exécuter : npm run build");
    process.exit(1);
  }
  console.log("OK : bundle commité identique octet par octet au bundle régénéré.");
  process.exit(0);
}

fs.writeFileSync(destination, genere);
console.log(`Bundle généré : ${path.relative(racine, destination)}`);
