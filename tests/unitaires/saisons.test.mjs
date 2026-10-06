import test from "node:test";
import assert from "node:assert/strict";
import { detecterSaison } from "../../src/intelligence/saisons/detecter-saison.js";

for (const [date, identifiant, libelle] of [
  [new Date(2026, 0, 15), "hiver", "Hiver"],
  [new Date(2026, 3, 15), "printemps", "Printemps"],
  [new Date(2026, 8, 4), "ete", "Été"],
  [new Date(2026, 9, 15), "automne", "Automne"],
  [new Date(2026, 11, 25), "hiver", "Hiver"],
]) {
  test(`détecte la saison astronomique ${libelle}`, () => {
    const resultat = detecterSaison({ maintenant: date });
    assert.equal(resultat.applicable, true);
    assert.equal(resultat.identifiant, identifiant);
    assert.equal(resultat.libelle, libelle);
    assert.equal(resultat.contributionScore, 0);
    assert.match(resultat.explication, /astronomique/);
  });
}

test("le 4 septembre reste en été astronomique", () => {
  const resultat = detecterSaison({ maintenant: new Date(2026, 8, 4, 12, 0, 0) });
  assert.equal(resultat.identifiant, "ete");
  assert.equal(resultat.prochainIdentifiant, "automne");
});

test("reste non applicable avec une date invalide", () => {
  const resultat = detecterSaison({ maintenant: "date-invalide" });
  assert.equal(resultat.applicable, false);
  assert.equal(resultat.contributionScore, 0);
  assert.match(resultat.explication, /date invalide/);
});
