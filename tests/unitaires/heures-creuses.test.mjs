import test from "node:test";
import assert from "node:assert/strict";
import { evaluerHeuresCreuses } from "../../src/intelligence/optimisation-energetique/evaluer-heures-creuses.js";

const plages = [{ debut: "02:00", fin: "07:00" }, { debut: "14:20", fin: "16:20" }];

test("signale une plage creuse active", () => {
  const resultat = evaluerHeuresCreuses({ plages, maintenant: new Date(2026, 6, 28, 14, 30) });
  assert.equal(resultat.configure, true);
  assert.equal(resultat.active, true);
  assert.equal(resultat.contributionScore, 0);
  assert.match(resultat.explication, /14:20–16:20/);
});

test("annonce la prochaine plage en heures pleines", () => {
  const resultat = evaluerHeuresCreuses({ plages, maintenant: new Date(2026, 6, 28, 10, 0) });
  assert.equal(resultat.active, false);
  assert.equal(resultat.prochainePlage.debutLibelle, "14:20");
});

test("gère une plage traversant minuit", () => {
  const resultat = evaluerHeuresCreuses({ plages: [{ debut: "22:00", fin: "02:00" }], maintenant: new Date(2026, 6, 28, 23, 30) });
  assert.equal(resultat.active, true);
});

test("reste non applicable sans configuration valide", () => {
  for (const plagesInvalides of [[], null, [{ debut: "xx", fin: "07:00" }], [{ debut: "02:00", fin: "02:00" }]]) {
    const resultat = evaluerHeuresCreuses({ plages: plagesInvalides, maintenant: new Date() });
    assert.equal(resultat.configure, false);
    assert.equal(resultat.active, null);
    assert.equal(resultat.contributionScore, 0);
  }
});
