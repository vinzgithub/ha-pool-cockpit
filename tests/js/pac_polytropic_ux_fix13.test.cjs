const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const template = fs.readFileSync(path.join(__dirname, "../../frontend/dist/pool-dashboard.js"), "utf8");

test("FIX13 harmonise les commandes PAC avec la filtration", () => {
  assert.match(template, /data-rc30-pac-sim="on">Démarrer<\/button>/);
  assert.match(template, /data-rc30-pac-sim="off">Arrêter<\/button>/);
  assert.doesNotMatch(template, /data-rc30-pac-sim="on">Allumer<\/button>/);
});

test("FIX13 garde une validation de consigne compacte et accessible", () => {
  assert.match(template, /class=rc30-pac-gauge__confirm[^>]*aria-label="Valider/);
  assert.match(template, /rc30-pac-gauge__confirm\{[^}]*width:52px!important;[^}]*height:40px!important;/);
  assert.doesNotMatch(template, /rc30-pac-gauge__confirm[^>]*><b>✓<\/b><span>/);
});
