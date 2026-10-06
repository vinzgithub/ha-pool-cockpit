import test from "node:test";
import assert from "node:assert/strict";
import { calculerDureeFiltrationDeBase } from "../../src/moteur/filtration.js";

test("calcule température ÷ 2 et plancher hydraulique puis retient le plus long", () => {
  assert.deepEqual(
    calculerDureeFiltrationDeBase({
      temperatureEauC: 28.1,
      volumeBassinM3: 16,
      debitPompeM3H: 10,
    }),
    {
      dureeTemperatureHeures: 15,
      plancherHydrauliqueHeures: 2,
      dureeRecommandeeHeures: 15,
    },
  );
});

test("utilise le plancher hydraulique seul lorsque la température manque", () => {
  assert.deepEqual(
    calculerDureeFiltrationDeBase({
      temperatureEauC: null,
      volumeBassinM3: 16,
      debitPompeM3H: 10,
    }),
    {
      dureeTemperatureHeures: null,
      plancherHydrauliqueHeures: 2,
      dureeRecommandeeHeures: 2,
    },
  );
});

test("utilise la durée thermique seule lorsque le débit est absent ou invalide", () => {
  for (const debitPompeM3H of [null, "", 0, -1, "invalide"]) {
    const resultat = calculerDureeFiltrationDeBase({
      temperatureEauC: 27.1,
      volumeBassinM3: 16,
      debitPompeM3H,
    });
    assert.equal(resultat.dureeTemperatureHeures, 14);
    assert.equal(resultat.plancherHydrauliqueHeures, null);
    assert.equal(resultat.dureeRecommandeeHeures, 14);
  }
});

test("renvoie des repères indisponibles lorsque les données nécessaires manquent", () => {
  assert.deepEqual(calculerDureeFiltrationDeBase(), {
    dureeTemperatureHeures: null,
    plancherHydrauliqueHeures: null,
    dureeRecommandeeHeures: null,
  });
});

test("conserve le minimum historique d'une heure aux bornes basses", () => {
  assert.deepEqual(
    calculerDureeFiltrationDeBase({
      temperatureEauC: 0,
      volumeBassinM3: 1,
      debitPompeM3H: 200,
    }),
    {
      dureeTemperatureHeures: 1,
      plancherHydrauliqueHeures: 1,
      dureeRecommandeeHeures: 1,
    },
  );
});

test("n'accède jamais à Home Assistant", () => {
  const descripteurInitial = Object.getOwnPropertyDescriptor(globalThis, "hass");
  Object.defineProperty(globalThis, "hass", {
    configurable: true,
    get() {
      throw new Error("Le moteur de filtration ne doit jamais lire hass");
    },
  });

  try {
    assert.equal(
      calculerDureeFiltrationDeBase({
        temperatureEauC: 24,
        volumeBassinM3: 16,
        debitPompeM3H: 10,
      }).dureeRecommandeeHeures,
      12,
    );
  } finally {
    if (descripteurInitial) {
      Object.defineProperty(globalThis, "hass", descripteurInitial);
    } else {
      delete globalThis.hass;
    }
  }
});

test("reste équivalent à la formule historique sur une grille de valeurs normalisées", () => {
  const temperatures = [null, -5, 0, 1, 22, 27.1, 28, 28.1, 30, 30.1, 40];
  const volumes = [1, 16, 37.5, 500];
  const debits = [null, 0, 0.1, 3.2, 10, 200];

  for (const temperature of temperatures) {
    for (const volume of volumes) {
      for (const debit of debits) {
        const temperatureHistorique =
          temperature === null ? null : Math.max(1, Math.ceil(temperature / 2));
        const hydrauliqueHistorique =
          debit && debit > 0 ? Math.max(1, Math.ceil(volume / debit)) : null;
        const recommandeeHistorique =
          temperatureHistorique === null
            ? hydrauliqueHistorique
            : hydrauliqueHistorique === null
              ? temperatureHistorique
              : Math.max(temperatureHistorique, hydrauliqueHistorique);

        assert.deepEqual(
          calculerDureeFiltrationDeBase({
            temperatureEauC: temperature,
            volumeBassinM3: volume,
            debitPompeM3H: debit,
          }),
          {
            dureeTemperatureHeures: temperatureHistorique,
            plancherHydrauliqueHeures: hydrauliqueHistorique,
            dureeRecommandeeHeures: recommandeeHistorique,
          },
        );
      }
    }
  }
});
