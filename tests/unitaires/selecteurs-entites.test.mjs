import test from "node:test";
import assert from "node:assert/strict";
import {
  construireCatalogueEntites,
  rendreSelecteurEntiteConfiguration,
} from "../../src/interface/composants/selecteurs-entites.js";

const echapperHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function state(name) {
  return { state: "on", attributes: { friendly_name: name } };
}

const etats = {
  "sensor.zeta": state("zéta"),
  "switch.pompe": state("Pompe principale"),
  "input_boolean.pompe_forcee": state("Pompe forcée"),
  "sensor.alpha": state("Alpha"),
  "light.piscine": state("Éclairage piscine"),
};

test("le catalogue ne conserve que les domaines explicitement autorisés", () => {
  const catalogue = construireCatalogueEntites({ etats, domaines: ["switch", "input_boolean"] });
  assert.deepEqual(catalogue.map((item) => item.entityId), ["input_boolean.pompe_forcee", "switch.pompe"]);
});

test("le catalogue conserve le tri historique par friendly_name puis entity_id", () => {
  const catalogue = construireCatalogueEntites({ etats, domaines: ["sensor"] });
  assert.deepEqual(catalogue.map((item) => item.entityId), ["sensor.alpha", "sensor.zeta"]);
});

test("l'entité configurée absente du catalogue reste visible et marquée indisponible", () => {
  const catalogue = construireCatalogueEntites({ etats, domaines: ["switch"], courant: "switch.absente" });
  assert.equal(catalogue[0].entityId, "switch.absente");
  assert.equal(catalogue[0].label, "switch.absente");
  assert.equal(catalogue[0].missing, true);
});

test("une entité courante existante mais hors domaine est conservée sans être marquée absente", () => {
  const catalogue = construireCatalogueEntites({ etats, domaines: ["switch"], courant: "sensor.alpha" });
  assert.equal(catalogue[0].entityId, "sensor.alpha");
  assert.equal(catalogue[0].missing, false);
  assert.equal(catalogue[0].domain, "sensor");
});

test("le rendu conserve le placeholder, les métadonnées de domaines et le rôle listbox", () => {
  const html = rendreSelecteurEntiteConfiguration({
    libelle: "Capteur de puissance",
    chemin: "pump.power_entity",
    domaines: ["sensor"],
    courant: "",
    placeholder: "Facultatif",
    etats,
    echapperHtml,
  });
  assert.match(html, /Capteur de puissance/);
  assert.match(html, /data-rc27-path="pump\.power_entity"/);
  assert.match(html, /<b>Facultatif<\/b><small>Types : sensor<\/small>/);
  assert.match(html, /role=listbox/);
  assert.match(html, /data-rc30-entity-option="sensor\.alpha"/);
});

test("le rendu conserve l'entité absente et le libellé indisponible", () => {
  const html = rendreSelecteurEntiteConfiguration({
    libelle: "Commande",
    chemin: "pump.entity_id",
    domaines: ["switch"],
    courant: "switch.disparue",
    placeholder: "Sélectionner une entité",
    etats,
    echapperHtml,
  });
  assert.match(html, /switch\.disparue/);
  assert.match(html, /switch · indisponible/);
  assert.match(html, /class="rc30-entity-picker__option is-selected"/);
});

test("le rendu échappe les entity_id, friendly_name, chemin et placeholder sans altérer le libellé historique", () => {
  const html = rendreSelecteurEntiteConfiguration({
    libelle: "Entité de commande",
    chemin: 'pump.<entity>&"',
    domaines: ["switch"],
    courant: "switch.dangereuse",
    placeholder: 'Aucune <entité> & "test"',
    etats: { "switch.dangereuse": state('Pompe <Nord> & "Sud"') },
    echapperHtml,
  });
  assert.match(html, /Pompe &lt;Nord&gt; &amp; &quot;Sud&quot;/);
  assert.match(html, /data-rc27-path="pump\.&lt;entity&gt;&amp;&quot;"/);
  assert.match(html, /Aucune &lt;entité&gt; &amp; &quot;test&quot;/);
  assert.doesNotMatch(html, /Pompe <Nord>/);
});

test("SEC-000 : le module ne lit aucune API HA, DOM, fenêtre, stockage ou commande cachée", () => {
  const hostile = {};
  for (const cle of ["hass", "callService", "callWS", "document", "window", "localStorage"]) {
    Object.defineProperty(hostile, cle, {
      enumerable: false,
      get() { throw new Error(`lecture interdite: ${cle}`); },
    });
  }
  const photographie = Object.create(hostile);
  photographie["switch.pompe"] = state("Pompe");
  assert.doesNotThrow(() => construireCatalogueEntites({ etats: photographie, domaines: ["switch"] }));
  assert.doesNotThrow(() => rendreSelecteurEntiteConfiguration({
    libelle: "Commande",
    chemin: "pump.entity_id",
    domaines: ["switch"],
    courant: "switch.pompe",
    etats: photographie,
    echapperHtml,
  }));
});
