# V4.2.2 — Candidate : moteur adaptatif de filtration

Base : tag `v4.2.1`, commit `752d78fb232b3c28ac7475748de6089b624e1fba`.
Branche : `fix/v4.2.2-adaptive-engine`. Aucune fusion, aucun tag publié et aucune intervention sur une instance de production. La v4.3.0 reste hors périmètre jusqu'à validation.

## Bilan technique

Le patch `v4.2.2-moteur-adaptatif.patch` fourni a été appliqué sur le tag, puis corrigé. Son SHA-256 d'origine est `ce0894cc439ea248d44ee435a2502443b2ea7441c85f65b1ad091e9ef9fa71c8`.

Les changements exécutables sont limités à `schedule_utils.py` et `scheduler.py`. Les fonctions pures de calcul sont appelées par le planificateur existant. Le stockage, les services, les installateurs, les bundles et les priorités de commande conservent leurs contrats existants. Les identifiants de version historiques du moteur restent inchangés, conformément aux tests de cohérence du dépôt.

| Anomalie | Correction et vérification |
| --- | --- |
| La durée précédente empêche une baisse et cumule la majoration fréquentation | `pump.recommended_hours` reste une sortie en mode adaptatif. Eau à 24 °C puis 12,7 °C : 12 h puis 7 h. Fréquentation élevée : 9 h stables sur plusieurs cycles et sauvegardes frontend. |
| Une sonde perdue ou périmée réduit l'été à 2 h | Sans eau exploitable, maximum du profil de base, du profil effectif et du plancher hydraulique. Profil été par défaut : 13 h. Aucun gel de la dernière recommandation. Retour d'une mesure fraîche : calcul normal. |
| Une date absente ou future est considérée fraîche | Fenêtre fermée 0–24 h, dates conscientes du fuseau, comparaison en UTC pour les changements d'heure. `last_reported` prioritaire ; `last_updated` seulement si absent. |
| Valeur restaurée, NaN ou infini | État explicitement `restored` écarté ; nombres non finis rejetés ; calcul hydraulique borné avant débordement. |
| Air ou vigilance périmés orientent le profil | Même contrôle de fraîcheur des états HA ; une entité de vigilance présente mais périmée/indisponible n'est pas remplacée par son ancien booléen frontend. |
| Ancien contexte dashboard impose encore 24 h | Les vigilances de repli et le désinfectant transmis par le dashboard exigent un contexte de 15 min au plus. Le moteur ne confond pas cette date avec celle d'une mesure physique. |
| Régression custom/suspended, prolongations, forçages | Tests comportementaux sur sauvegarde, tick, redémarrage simulé et reprise explicite ; périodes custom/suspended conservées, prolongations approuvées conservées jusqu'au changement de jour, aucune superposition en adaptatif. |

Les règles de renforcement et leur ordre restent : eau verte/trouble ou pollution, canicule avec eau chaude, désinfectant bas avec eau chaude, alerte froid en profil hiver, fréquentation élevée, eau très chaude, eau chaude. Les déclarations utilisateur `water_condition` et `recent_load` restent persistantes jusqu'à modification : elles ne sont pas des mesures automatiques. La majoration fréquentation est appliquée une seule fois.

Le diagnostic `watch.adaptive_water_status` vaut `fresh`, `stale` (fraîcheur non démontrée, y compris date invalide ou état restauré), `unavailable` (aucune valeur numérique admissible) ou `none` (liste transmise vide). Il est inclus dans la signature de recalcul.

## Validation automatisée

Les tests du planificateur utilisent un Home Assistant simulé, sans réseau ni équipement. Les tests navigateur utilisent exclusivement le mode Démo.

```bash
npm ci
npm test
npm run test:smoke
python -m pytest -q
python tools/build_unified_pool_cockpit.py --version 4.2.1 --output /tmp/pool-v422-frontend-check.js
cmp /tmp/pool-v422-frontend-check.js release/v4.2.1/pool-cockpit.js
sha256sum --check SHA256SUMS
```

Test navigateur existant, avec dépendances de test uniquement :

```bash
npm install --no-save --package-lock=false playwright@1.56.1 pngjs@7.0.0
npx playwright install --with-deps chromium
node tests/weather-v421.browser.cjs
```

Résultats locaux (14 novembre 2026, Python 3.12, Node 24, Chromium 141) :

| Contrôle | Résultat |
| --- | --- |
| `python -m pytest -q` | 128 tests réussis, dont 57 dans `test_adaptive_engine.py` |
| `npm test` | 472 tests réussis : 149 dashboard, 292 moteur, 5 interface, 26 build |
| `npm run test:smoke` | `rc28.3-runtime-ok` |
| Navigateur Démo | 1 529 assertions réussies, 7 vues et 6 largeurs |
| Reconstruction frontend v4.2.1 | Identique octet pour octet au bundle existant |
| SHA-256 et `git diff --check` | Réussis |

Un avertissement de dépréciation provient du plugin pytest `anyio` préinstallé dans l'environnement local ; aucun test n'est ignoré ou en échec. L'état final des contrôles GitHub est consigné dans la PR.

## Réserves et recette à effectuer

- `last_reported` prouve un signalement HA, pas une nouvelle acquisition physique. Une intégration qui republie son cache ou restaure une valeur sans attribut `restored` peut la faire paraître récente. Le backend actuel ne reçoit pas la correspondance des entités `last_analysis` ; ce correctif ne prétend pas la reconstituer.
- Le frontend v4.2.1 filtre déjà les capteurs périmés et peut envoyer `temperature_entities=[]`. Le repli fonctionne dans ce cas ; le diagnostic ne peut distinguer une suppression volontaire d'une exclusion par le frontend. Le retour automatique d'un capteur retiré de cette liste nécessite une nouvelle synchronisation du dashboard.
- Le délai de 15 min concerne la réception du contexte. Un dashboard ouvert peut republier une ancienne saisie de désinfectant : sa date d'acquisition n'est pas fournie au backend. Les déclarations manuelles persistantes doivent être mises à jour par l'utilisateur.
- Le repli dépend des profils configurés et ne garantit pas le maintien de la dernière durée à eau chaude. Il préserve les jours sélectionnés ; ce correctif n'introduit pas de protection antigel hors des règles existantes, ni de mode Hivernage actif.
- Les tests ne constituent pas une recette sur une instance Home Assistant réelle. Avant validation, contrôler sur une instance isolée : eau fraîche puis indisponible/périmée et retour, profil été, dashboard fermé puis ouvert, custom/suspended, prolongation et forçage après redémarrage. Examiner `watch.adaptive_*` et `pump.recommended_hours` dans l'état backend ; l'interface conserve son propre moteur de conseil.

## Installation de recette et retour arrière

Cette candidate est un correctif backend pour une installation v4.2.1 existante. Ne pas utiliser un installateur de première installation pour la mettre à jour. Ne pas appliquer la procédure à la production pendant cette phase.

1. Préparer une instance HA isolée, sans accès aux équipements réels. Faire une sauvegarde de sa configuration et de son stockage `.storage/ha_pool_dashboard.rc27`.
2. Arrêter cette instance de recette. Sauvegarder son répertoire `custom_components/ha_pool_dashboard` et relever les SHA-256 des deux fichiers concernés.
3. Depuis le commit exact de la PR validée, remplacer ensemble `schedule_utils.py` et `scheduler.py` dans ce répertoire. Conserver la ressource JavaScript v4.2.1 et les autres fichiers.
4. Vérifier la configuration Home Assistant, redémarrer uniquement l'instance de recette et exécuter les scénarios ci-dessus. Le diagnostic est disponible côté backend ; aucun nouvel écran n'est ajouté.
5. Retour arrière : arrêter l'instance de recette, restaurer les deux fichiers v4.2.1 sauvegardés, puis redémarrer. Si l'on veut aussi retrouver exactement les périodes/recommandations préalables, restaurer le stockage sauvegardé pendant l'arrêt. Aucun changement de schéma n'est requis.

La fusion et la publication de v4.2.2 nécessitent une validation explicite. La v4.3.0 n'est pas commencée.
