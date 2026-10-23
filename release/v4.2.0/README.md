# Pool Cockpit 4.2 — Unification du JavaScript (travail en cours)

**Branche de développement :** `feat/v4.2-unified-js`. **Ne pas déployer en production.**
La V4.1.0 publiée reste la version stable.

## Objectif

Home Assistant ne doit charger **qu'une ressource JavaScript** :

```text
/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.0
```

Le type de carte Lovelace est `custom:pool-cockpit-card`.
La Démonstration est intégrée dans le même bundle et conserve son isolation des équipements réels.

## Génération du bundle

```bash
python3 tools/build_unified_pool_cockpit.py
node --check release/v4.2.0/pool-cockpit.js
python3 -m unittest tests.test_v42_single_bundle -v
```

Ce code génère un fichier de distribution autonome, à partir du moteur déjà testé et de l'enveloppe V4.1.0.
Il n'installe rien dans Home Assistant.

## Références aux anciennes RC et aux prototypes

Le nom `RC8.2` ne doit plus apparaître **dans les noms publics** des ressources installées,
dans les cartes proposées aux utilisateurs ou dans la procédure de la future version stable.

En revanche, le moteur actuel utilise de très nombreux identifiants internes historiques :
fonctions `rcXX...`, clés `data-rcXX`, classes CSS, clés de stockage et noms de composants
personnalisés. **Il est interdit de les supprimer par recherche/remplacement global** :
ces identifiants font partie des contrats fonctionnels et du chargement existant.

Pour supprimer toutes leurs occurrences *dans le code source*, il faut successivement :
1. inventorier chaque identifiant et son usage (code, CSS, stockage, attributs, tests) ;
2. fournir des alias et migrations pour les configurations enregistrées ;
3. refactoriser progressivement, avec vérification fonctionnelle des six onglets et des deux modes ;
4. tester une installation neuve puis une migration conservant capteurs et réglages.

Le présent lot supprime les noms de RC au **niveau de la distribution publique**, mais
ne prétend pas encore avoir refactorisé tous ces identifiants internes.

## Compatibilité / déploiement

Aucun remplacement automatique de la V4.1.0 ou du dashboard de production d'Épinay
n'est fourni par ce prototype. La migration devra remplacer deux ressources
par une seule **après** validation sur une instance distincte et sauvegarde de la configuration.

## Installation manuelle sur une V4.1.0 existante (Épinay)

**Pré-requis :** moteur/backend existants inchangés, sauvegarde de `pool-dashboard-v4-test.yaml` et `.storage/lovelace_resources`. La V4.2 unifiée n'est pas encore une release stable.

1. Télécharger seulement `release/v4.2.0/pool-cockpit.js` depuis cette branche de développement sous le nom `www/ha-pool-dashboard/pool-cockpit.js`, sans supprimer les fichiers V4.1.0.
2. Dans Lovelace → Ressources, **ajouter d'abord** `/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.0` comme module JavaScript, en conservant les deux ressources V4.1.0 pendant le test.
3. Dans `pool-dashboard-v4-test.yaml`, changer **seulement** le type de carte, de `custom:pool-cockpit-dual-mode-card` à `custom:pool-cockpit-card`. Ne pas modifier les capteurs, la météo, les équipements ni les autres paramètres.
4. Forcer le rechargement du navigateur, contrôler l'affichage et les deux modes.
5. **Seulement après validation**, supprimer les deux anciennes ressources V4/4.1 du gestionnaire Lovelace. Garder les fichiers sur disque pour faciliter le retour arrière.

Retour arrière : restaurer `type: custom:pool-cockpit-dual-mode-card` dans le YAML et conserver/recréer les deux ressources JavaScript antérieures. Le moteur et le backend ne changent pas.

**Ne pas activer de commande de filtration, de PAC ou d'éclairage pendant le contrôle initial.**
