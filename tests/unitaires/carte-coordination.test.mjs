import test from "node:test";
import assert from "node:assert/strict";
import { rendreCarteCoordination } from "../../src/interface/carte-coordination.js";

const defaut = Object.freeze({
  role: "master",
  site_name: "",
  peer_name: "",
  allow_satellite_manual: true,
});
const escape = valeur => String(valeur)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function html(coordination) {
  return rendreCarteCoordination({ coordination, coordinationParDefaut: defaut, echapperHtml: escape });
}

test("rend le rôle maître avec les libellés et contrôles historiques", () => {
  const rendu = html({ role: "master", site_name: "Site A", peer_name: "Site B", allow_satellite_manual: true });
  assert.match(rendu, /rc30-coordination is-master/);
  assert.match(rendu, /👑/);
  assert.match(rendu, /Site A · maître de programmation/);
  assert.match(rendu, /<strong>MAÎTRE<\/strong>/);
  assert.match(rendu, /option value=master selected/);
  assert.match(rendu, /Maître · exécute les programmes/);
  assert.match(rendu, /coordination\.allow_satellite_manual" checked/);
  assert.match(rendu, /Pour inverser Site A \/ Site B/);
});

test("rend le rôle satellite et le maître attendu sans changer les textes", () => {
  const rendu = html({ role: "satellite", site_name: "Site B", peer_name: "Site A", allow_satellite_manual: true });
  assert.match(rendu, /rc30-coordination is-satellite/);
  assert.match(rendu, /🛰️/);
  assert.match(rendu, /Site B · satellite/);
  assert.match(rendu, /Le maître attendu est Site A/);
  assert.match(rendu, /<strong>SATELLITE<\/strong>/);
  assert.match(rendu, /option value=satellite selected/);
  assert.match(rendu, /Les horaires restent visibles mais verrouillés/);
});

test("la permission manuelle n'est décochée que pour false booléen", () => {
  assert.doesNotMatch(html({ role: "satellite", site_name: "A", peer_name: "B", allow_satellite_manual: false }), /coordination\.allow_satellite_manual" checked/);
  for (const valeur of [true, 0, "", null, undefined]) {
    assert.match(html({ role: "satellite", site_name: "A", peer_name: "B", allow_satellite_manual: valeur }), /coordination\.allow_satellite_manual" checked/);
  }
});

test("une configuration absente utilise exactement le repli historique", () => {
  const rendu = html(null);
  assert.match(rendu, /Ce Home Assistant · maître de programmation/);
  assert.match(rendu, /value="Autre Home Assistant"/);
});

test("un rôle inconnu reste maître comme dans le template historique", () => {
  const rendu = html({ role: "inconnu", site_name: "Site", peer_name: "Pair", allow_satellite_manual: true });
  assert.match(rendu, /is-master/);
  assert.match(rendu, /option value=master selected/);
});

test("les noms de sites sont échappés avec la fonction fournie", () => {
  const rendu = html({ role: "satellite", site_name: '<Site A & "test">', peer_name: "<Site B>", allow_satellite_manual: true });
  assert.match(rendu, /&lt;Site A &amp; &quot;test&quot;&gt; · satellite/);
  assert.match(rendu, /Le maître attendu est &lt;Site B&gt;/);
  assert.doesNotMatch(rendu, /<Site B>/);
});

test("SEC-000 : les propriétés étrangères hostiles ne sont jamais lues", () => {
  const coordination = { role: "master", site_name: "A", peer_name: "B", allow_satellite_manual: true };
  for (const nom of ["hass", "callService", "callWS", "document", "window", "localStorage"]) {
    Object.defineProperty(coordination, nom, { get() { throw new Error(`lecture interdite: ${nom}`); } });
  }
  assert.doesNotThrow(() => html(coordination));
});

test("une entrée structurellement invalide n'est pas réparée silencieusement", () => {
  assert.throws(() => rendreCarteCoordination({ coordination: null, coordinationParDefaut: null, echapperHtml: escape }), TypeError);
  assert.throws(() => rendreCarteCoordination({ coordination: { role: "master" }, coordinationParDefaut: defaut, echapperHtml: null }), TypeError);
});
