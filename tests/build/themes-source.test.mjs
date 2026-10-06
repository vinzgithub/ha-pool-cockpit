import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { genererBundle } from "../../outils/lib/construction-bundle.mjs";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const chemin = "src/interface/themes.js";

test("une modification du module themes modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, chemin), "utf8");
  const substitutions = new Map([
    [chemin, original.replace("Thèmes visuels historiques", "Thèmes visuels historiques /* TEST BUILD THEMES */")],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD THEMES/);
});
