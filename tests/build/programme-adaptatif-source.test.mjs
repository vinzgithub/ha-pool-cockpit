import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { genererBundle } from "../../outils/lib/construction-bundle.mjs";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const chemin = "src/programmation/programme-adaptatif.js";

test("une modification du programme adaptatif modifie nécessairement le bundle généré", () => {
  const original = fs.readFileSync(path.join(racine, chemin), "utf8");
  const substitutions = new Map([
    [chemin, original.replace("RÈGLE FILT-004", "RÈGLE FILT-004 /* TEST BUILD PROGRAMME ADAPTATIF */")],
  ]);
  const genereOriginal = genererBundle({ racine });
  const genereModifie = genererBundle({ racine, substitutions });
  assert.notEqual(genereModifie, genereOriginal);
  assert.match(genereModifie, /TEST BUILD PROGRAMME ADAPTATIF/);
});
