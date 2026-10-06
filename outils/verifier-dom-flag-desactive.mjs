#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const { loadBundle, state, buildCard } = require("../tests/js/bundle_harness.cjs");

function argument(nom) {
  const index = process.argv.indexOf(nom);
  if (index < 0 || !process.argv[index + 1]) throw new Error(`Argument requis : ${nom}`);
  return path.resolve(process.argv[index + 1]);
}
const reference = argument("--reference");
const candidat = argument("--candidate");
const preuves = path.resolve(process.argv.includes("--preuves") ? process.argv[process.argv.indexOf("--preuves") + 1] : "preuves");
fs.mkdirSync(preuves, { recursive: true });

const instant = "2026-07-27T08:00:00.000Z";
function donneesCompletes() {
  return {
    "sensor.fp": state("7.20", { lastUpdated: instant }), "sensor.fo": state("710", { unit: "mV", lastUpdated: instant }), "sensor.ft": state("30.0", { unit: "°C", lastUpdated: instant }), "sensor.fl": state(instant, { lastUpdated: instant }), "sensor.fs": state("idle", { lastUpdated: instant }), "button.fa": state("unknown", { lastUpdated: instant }),
    "sensor.bp": state("7.30", { lastUpdated: instant }), "sensor.bo": state("720", { unit: "mV", lastUpdated: instant }), "sensor.bt": state("30.0", { unit: "°C", lastUpdated: instant }), "sensor.bl": state(instant, { lastUpdated: instant }), "sensor.bs": state("idle", { lastUpdated: instant }), "button.ba": state("unknown", { lastUpdated: instant }),
  };
}
function donneesManquantes() {
  return {
    "sensor.fp": state("unavailable", { lastUpdated: instant }), "sensor.fo": state("unknown", { lastUpdated: instant }), "sensor.ft": state("unavailable", { lastUpdated: instant }), "sensor.fl": state("unknown", { lastUpdated: instant }), "sensor.fs": state("unavailable", { lastUpdated: instant }), "button.fa": state("unknown", { lastUpdated: instant }),
  };
}
const scenarios = [
  ["donnees-completes", donneesCompletes()],
  ["donnees-manquantes", donneesManquantes()],
];

function rendre(bundle, states) {
  const runtime = loadBundle(bundle);
  const card = buildCard(runtime, { states });
  card.config.fonctionnalites_experimentales = { moteurEauMeteoV1: false };
  card.render();
  return card.shadowRoot.innerHTML;
}

let echec = false;
for (const [nom, states] of scenarios) {
  const htmlReference = rendre(reference, states);
  const htmlCandidat = rendre(candidat, states);
  const fichierReference = path.join(preuves, `dom-flag-false-${nom}-reference.html`);
  const fichierCandidat = path.join(preuves, `dom-flag-false-${nom}-candidat.html`);
  const fichierDiff = path.join(preuves, `dom-flag-false-${nom}.diff`);
  fs.writeFileSync(fichierReference, htmlReference);
  fs.writeFileSync(fichierCandidat, htmlCandidat);
  fs.writeFileSync(fichierDiff, "");
  const diff = spawnSync("diff", ["-u", fichierReference, fichierCandidat], { encoding: "utf8" });
  if (diff.status !== 0) {
    fs.writeFileSync(fichierDiff, diff.stdout || diff.stderr || "Diff non déterminé");
    echec = true;
  }
  const taille = fs.statSync(fichierDiff).size;
  console.log(`${nom}: diff=${taille} octet(s)`);
  if (taille !== 0) echec = true;
  if (htmlCandidat.includes("data-eau-meteo-experimental")) {
    console.error(`${nom}: composant expérimental présent malgré le flag false`);
    echec = true;
  }
}
if (echec) process.exit(1);
console.log("Résultat : DOM IDENTIQUE pour tous les scénarios, fichiers .diff à 0 octet.");
