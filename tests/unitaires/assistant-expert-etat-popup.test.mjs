import test from "node:test";
import assert from "node:assert/strict";
import {
  appliquerEtatPopupAssistantExpert,
  capturerDefilementAssistantExpert,
  fermerPopupAssistantExpert,
  ouvrirPopupAssistantExpert,
} from "../../src/interface/assistant-expert/etat-popup.js";

function creerElement() {
  return {
    hidden: true,
    scrollTop: 0,
    attributs: new Map(),
    focusCount: 0,
    setAttribute(nom, valeur) { this.attributs.set(nom, valeur); },
    focus() { this.focusCount += 1; },
    querySelector() { return null; },
  };
}

function creerComposant() {
  const bouton = creerElement();
  const modal = creerElement();
  const panneau = creerElement();
  modal.querySelector = (selecteur) => selecteur === ".rc30-expert-modal__panel" ? panneau : null;
  const racine = {
    querySelector(selecteur) {
      if (selecteur === "[data-assistant-expert-modal]") return modal;
      if (selecteur === "[data-assistant-expert-open]") return bouton;
      if (selecteur === ".rc30-expert-modal__panel") return panneau;
      return null;
    },
  };
  return {
    composant: {
      shadowRoot: racine,
      _rc30ExpertOpen: false,
      _rc30ExpertScrollTop: 0,
      _rc30ExpertReturnFocus: null,
    },
    bouton,
    modal,
    panneau,
  };
}

test("une popup fermée ne capture pas le défilement", () => {
  const { composant, panneau } = creerComposant();
  panneau.scrollTop = 437;
  capturerDefilementAssistantExpert(composant);
  assert.equal(composant._rc30ExpertScrollTop, 0);
});

test("une popup ouverte capture la position avant reconstruction", () => {
  const { composant, panneau } = creerComposant();
  composant._rc30ExpertOpen = true;
  panneau.scrollTop = 437;
  capturerDefilementAssistantExpert(composant);
  assert.equal(composant._rc30ExpertScrollTop, 437);
});

test("réappliquer l'état fermé masque la popup et met aria-hidden à true", () => {
  const { composant, modal } = creerComposant();
  appliquerEtatPopupAssistantExpert(composant);
  assert.equal(modal.hidden, true);
  assert.equal(modal.attributs.get("aria-hidden"), "true");
});

test("réappliquer l'état ouvert restaure focus, bouton et ascenseur", () => {
  const { composant, bouton, modal, panneau } = creerComposant();
  composant._rc30ExpertOpen = true;
  composant._rc30ExpertScrollTop = 321;
  appliquerEtatPopupAssistantExpert(composant, { focus: true });
  assert.equal(modal.hidden, false);
  assert.equal(modal.attributs.get("aria-hidden"), "false");
  assert.equal(modal.focusCount, 1);
  assert.equal(panneau.scrollTop, 321);
  assert.equal(composant._rc30ExpertReturnFocus, bouton);
});

test("ouvrir la popup remet l'ascenseur à zéro et mémorise le déclencheur", () => {
  const { composant, modal } = creerComposant();
  const declencheur = creerElement();
  composant._rc30ExpertScrollTop = 999;
  ouvrirPopupAssistantExpert(composant, declencheur);
  assert.equal(composant._rc30ExpertOpen, true);
  assert.equal(composant._rc30ExpertScrollTop, 0);
  // Le comportement historique remémorise le nouveau bouton du DOM lors de l'application.
  assert.notEqual(composant._rc30ExpertReturnFocus, null);
  assert.equal(modal.hidden, false);
});

test("fermer la popup remet l'état à zéro et rend le focus", () => {
  const { composant, bouton, modal } = creerComposant();
  composant._rc30ExpertOpen = true;
  composant._rc30ExpertScrollTop = 123;
  composant._rc30ExpertReturnFocus = bouton;
  fermerPopupAssistantExpert(composant);
  assert.equal(composant._rc30ExpertOpen, false);
  assert.equal(composant._rc30ExpertScrollTop, 0);
  assert.equal(composant._rc30ExpertReturnFocus, null);
  assert.equal(bouton.focusCount, 1);
  assert.equal(modal.hidden, true);
});

test("une position de défilement invalide ne remplace pas la valeur mémorisée", () => {
  const { composant, panneau } = creerComposant();
  composant._rc30ExpertOpen = true;
  composant._rc30ExpertScrollTop = 52;
  panneau.scrollTop = Number.NaN;
  capturerDefilementAssistantExpert(composant);
  assert.equal(composant._rc30ExpertScrollTop, 52);
});

test("SEC-000 : la gestion de popup ne lit ni hass, callService ni callWS", () => {
  const { composant } = creerComposant();
  for (const nom of ["_hass", "hass", "callService", "callWS"]) {
    Object.defineProperty(composant, nom, {
      enumerable: false,
      get() {
        throw new Error(`lecture interdite: ${nom}`);
      },
    });
  }
  assert.doesNotThrow(() => ouvrirPopupAssistantExpert(composant));
  assert.doesNotThrow(() => capturerDefilementAssistantExpert(composant));
  assert.doesNotThrow(() => fermerPopupAssistantExpert(composant));
});
