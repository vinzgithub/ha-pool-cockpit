# Testing

## Principe

Le bundle `frontend/dist/pool-dashboard.js` est exécuté dans un environnement DOM simulé construit avec les API standard de Node (`node:vm` et `node:test`). Cet environnement joue le même rôle que jsdom pour les comportements vérifiés ici, sans dépendance externe ni accès réseau.

Les tests frontend ne recherchent pas des fragments de code dans le bundle. Ils instancient la vraie carte, lui injectent des états Home Assistant et vérifient les valeurs ou le HTML produits.

## Exécution locale

```bash
npm ci
npm test
npm run test:smoke
python -m pytest
```

`python -m pytest` fonctionne sans argument supplémentaire :

- `pyproject.toml` désactive le plugin de cache Pytest avec `-p no:cacheprovider` ;
- `conftest.py` distingue les artefacts antérieurs au processus de ceux créés pendant le test ;
- le test statique rejette uniquement les artefacts qui existaient avant le lancement de `python -m pytest`, et non ceux que Pytest crée pour collecter la suite ;
- à la fin de la session, `conftest.py` supprime les caches d’exécution afin qu’un deuxième lancement soit lui aussi propre ;
- la CI définit également `PYTHONDONTWRITEBYTECODE=1` comme protection supplémentaire explicite.

Ainsi, un cache déjà livré ou présent avant le test provoque bien un échec, tandis que le test ne s’accuse plus lui-même à cause de ses fichiers temporaires.

## Couverture frontend actuelle

- confiance et activation des sources ;
- tolérance ORP et proximité temporelle ;
- barème pH ;
- performance de filtration ;
- entretien hebdomadaire du brome ;
- proposition de prolongation avec validation ;
- lancement et minuteur d’analyse ;
- contrôle mobile activé/désactivé.

## Tests statiques conservés

Les seuls tests statiques autorisés portent sur :

1. la cohérence de version ;
2. l’intégrité SHA-256 du paquet ;
3. la présence minimale des fichiers de livraison ;
4. la syntaxe JavaScript du bundle ;
5. l’absence de code mort, caches préexistants et anciens smoke tests.

## Test de mutation manuel

Pour vérifier que la suite détecte une régression, la variable `HA_POOL_BUNDLE` peut pointer vers une copie modifiée du bundle :

```bash
HA_POOL_BUNDLE=/tmp/pool-dashboard-mutated.js \
  node --test --test-name-pattern='tolérance ORP' \
  tests/js/rc28_3_behavior.test.cjs
```
