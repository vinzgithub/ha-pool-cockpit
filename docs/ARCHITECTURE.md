# Architecture de la RC28.3

## Backend Python

- `ha_pool_dashboard/discovery.py` : détection des appareils et entités.
- `ha_pool_dashboard/dashboard_generator.py` : génération de la carte `custom:pool-dashboard-card`.
- `ha_pool_dashboard/installer.py` : sauvegarde, copie du bundle et génération YAML.

## Frontend canonique

Pour la RC28.3, le frontend réellement exécuté et livré est :

- `frontend/dist/pool-dashboard.js` : bundle autonome installé dans `/config/www/ha-pool-dashboard/`.
- `frontend/dist/assets/` : ressources visuelles utilisées par le bundle.
- `frontend/dist/hero-ocean.svg` : ressource graphique livrée.

Le dossier historique `frontend/src/` a été supprimé : son contenu datait des anciennes versions beta et ne permettait pas de régénérer le bundle actuel. Le conserver aurait donné l'impression erronée qu'il constituait la source de vérité.

## Règle de maintenance

Tant qu'une vraie chaîne de build modulaire n'a pas été reconstruite et validée :

1. `frontend/dist/pool-dashboard.js` est la source frontend canonique de la RC28.3 ;
2. aucune modification fonctionnelle ne doit être introduite pendant le présent nettoyage ;
3. les changements de logique doivent être protégés par des tests JavaScript comportementaux ;
4. une future remodularisation sera un chantier séparé, avec génération reproductible de `dist/` et preuve de non-régression.

## Tests

- Les tests Python couvrent l'installateur et les modules backend.
- Les tests JavaScript chargent réellement le bundle dans un environnement DOM simulé et vérifient ses sorties observables.
- Les tests statiques sont limités à la cohérence de version, l'intégrité du paquet, la présence minimale de livraison, la syntaxe du bundle et l'absence d'artefacts interdits.

## Identité des appareils RC28.3

Chaque appareil de mesure possède une clé stable générée par le backend et écrite dans `pool-dashboard.yaml`. Le frontend utilise cette clé pour stocker l’état d’activation. La marque (`blue_connect`, `flipr`) ne sert plus d’identifiant unique.

## Refactor maintenabilité v3 — modules extraits

La chaîne `src → frontend/dist/pool-dashboard.js` est désormais reproductible.
Le bundle `dist` reste généré et ne doit pas être édité à la main.

Modules extraits et validés à ce stade :

- `src/moteur/filtration.js` : calcul pur des repères de filtration de base ;
- `src/programmation/priorites.js` : hiérarchie pure personnalisé / adaptatif /
  adaptatif suspendu / forçage manuel persistant.
- `src/programmation/prolongation.js` : lecture pure de la prolongation ponctuelle
  et anti-double-comptage lorsque l’adaptatif possède déjà les horaires ;
- `src/programmation/programme-adaptatif.js` : primitives horaires et construction
  pure de la recommandation de programme adaptatif à partir de données déjà lues ;
- `src/moteur/saisons.js` : catalogue pur des profils saisonniers de référence et
  correspondance avec la saison astronomique détectée ;
- `src/pac/securite-pac.js` : normalisation défensive et verrou inconditionnel
  `write_enabled=false` ;
- `src/pac/commandes-pac.js` : préparation pure marche/arrêt, consigne, mode et
  calculs du cadran de consigne.
- `src/traitement/produits-dosage.js` : catalogue vérifié des produits,
  normalisation des choix et calculs purs des doses pH / activateur de brome /
  Desalgin / Grease Killer, sans décision d'ajout ni accès Home Assistant.
- `src/traitement/journal.js` : miroir navigateur, clé de déduplication,
  fusion chronologique backend/local et préparation pure des décisions de
  synchronisation du journal ; aucun appel Home Assistant n'est effectué dans le module.
- `src/interface/carte-filtration.js` : présentation pure de la performance de filtration ;
- `src/interface/carte-pac.js` : présentation pure de la PAC, sans commande ;
- `src/interface/carte-traitement.js` : présentation pure du profil, des conseils et du journal de traitement, sans calcul, décision, persistance ni accès HA ;
- `src/interface/carte-programmation.js` : présentation pure des profils saisonniers et des éditeurs de plages pompe/éclairage ; les transitions, calculs et sauvegardes restent hors du module ;
- `src/interface/themes.js` : catalogue visuel et résolution pure du mode `auto` ;
- `src/interface/composants/sections-repliables.js` : état normalisé desktop/mobile,
  fragments ARIA/chevrons et barre de contrôle des sections, sans accès navigateur ou HA.

Ces modules n'accèdent ni à Home Assistant ni au DOM. Les transitions qui
nécessitent une persistance ou une commande restent pour l'instant dans leurs
couches historiques ; elles seront déplacées seulement lors de l'étape du module
auquel elles appartiennent.

## Interface Gemini — refactor étape 10

Le frontend Gemini est maintenant réparti en deux fichiers complémentaires :

- `src/interface/gemini/gemini-reformulation.js` : contrat pur issu du modèle Assistant Expert et rendu HTML ;
- `src/interface/gemini/controleur-gemini.js` : frontière d'intégration WebSocket, état de chargement/réponse, verrou de concurrence et rejet des réponses obsolètes.

Le contrôleur n'effectue aucun calcul métier et ne possède aucun chemin de commande d'équipement. La clé API, l'appel HTTP distant et la validation de reformulation restent exclusivement dans le backend Python.
