# Bilan technique v4.3.0 — 14 novembre 2026

Base : correctif v4.2.2, commit `34ac6cdf0ed7bdee4050070bc375d74f3470dd25`, PR #16. Branche de livraison : `feat/v4.3.0-active-wintering`. PR empilée sur la branche v4.2.2 ; aucune fusion automatique.

## Résultats locaux

| Commande | Résultat |
|---|---|
| `PYTHONDONTWRITEBYTECODE=1 python -m pytest -q` | 156 tests réussis |
| `npm test` | 484 tests réussis (155 dashboard, 298 fonctions, 5 interface, 26 build) |
| `npm run test:smoke` | `rc28.3-runtime-ok` |
| `node tests/wintering-v430.browser.cjs` | 21 assertions, Chromium, interface V4.3 reliée au backend Python simulé |
| `HA_POOL_BROWSER_BUNDLE=release/v4.3.0/pool-cockpit.js node tests/weather-v421.browser.cjs` | 1 529 assertions, 7 vues, 6 largeurs, niveaux jaune/orange/rouge/absent |
| `python tools/build_wintering_v430.py --output /tmp/pool-v430-check.js` puis `cmp` | Distribution reproductible |
| `node --check release/v4.3.0/pool-cockpit.js` | Syntaxe valide |
| `sha256sum --check SHA256SUMS` | Intégrité contrôlée |
| `git diff --check` | Aucun défaut d'espacement |

Environnement local : Python 3.12, Node 24, Playwright 1.56.1 / Chromium 141. CI déclarée : Ubuntu 24.04, Python 3.12, Node 22. Un avertissement local de dépréciation du plugin anyio avec pytest 9 ne concerne pas le code applicatif. Les résultats de CI sont consultables sur la PR ; les résultats ci-dessus décrivent les exécutions locales.

## Correspondance de recette

| Cas du cahier des charges | Couverture |
|---|---|
| T01 novembre, eau hors bassin, sondes hivernées | Exclusion température/pH, base confirmée 4 h, programme 02:00–06:00 |
| T02–T04 normal, fréquentation, refroidissement | 12,7 °C → 7 h ; fréquentation → 9 h sans cumul ; 24 → 12,7 °C réduit la recommandation |
| T05 divergence calcul/appliqué | Proposition 9 h face à programme personnalisé 12 h, différence et raison explicites |
| T06 antigel hors plage/quota | Demande indépendante des jours/plages et prioritaire sur arrêt ordinaire conservé |
| T07 commande sans effet | Alerte après délai ; marche observée et débit distincts ; absence de débit signalée |
| T08 hystérésis/temporisations | Entrée, sortie, maintien minimal, pas de bascule à chaque échantillon |
| T09 mesure/liaison indisponible | Pas de nouvelle protection inventée ; demande active maintenue ; frontend hors ligne désactivé |
| T10–T11 PAC/sondes hivernées | PAC verrouillée, sondes exclues, nouvel échantillon requis après réactivation |
| T12 édition manuelle | Passage en personnalisé ; proposition ne modifie pas les plages |
| T13 maintenance/hydraulique | Blocage absolu, y compris sous gel ; arrêt externe/de sécurité conservé |
| T14 redémarrage/multiclient/satellite | Persistance et absence de continuité inventée, conflit de révision rejeté, satellite sans exécution antigel |
| T15 date/fuseau | Minuit, plages chevauchantes et journées Europe/Paris de 23/25 h |
| T16 sortie hivernage | Restauration du programme, équipements restant hivernés ; détour par maintenance couvert |

Les tests navigateur utilisent le vrai bundle distribué et le vrai planificateur Python avec des états/services HA simulés sur loopback. Ils couvrent notamment l'annulation puis l'acceptation de la confirmation, le passage en hivernage, l'antigel, la maintenance, l'indisponibilité du backend et l'absence de débordement aux largeurs 360, 390, 768 et 1 440 px. Les captures de la nouvelle carte ont été examinées ; les captures CI sont publiées comme artefacts.

## Réserves et vérifications utilisateur

- Aucun HA complet ni équipement physique n'a été utilisé : disponibilité de l'entité, horodatage réel, polarité du verrou, débit et comportement au redémarrage doivent être vérifiés en recette isolée avant usage réel.
- Les capteurs ne fournissant pas d'horodatage d'acquisition restent non confirmés. Ne pas fabriquer une date « maintenant » à partir d'une ancienne mesure pour contourner ce contrôle.
- La surveillance dépend de HA et du capteur local. Une pompe hors tension, un réseau perdu ou un débit absent ne sont pas réparés par le logiciel.
- Les observations sont celles d'états HA, échantillonnées par le backend ; elles ne constituent pas un relevé électrique continu ni une mesure physique de débit.
- La surveillance antigel est initialement désactivée et nécessite un choix/une confirmation de ses paramètres. La durée de 4 h ne constitue pas une protection hors-gel.
- L'hivernage passif et les intégrations futures de matériel ne font pas partie de cette livraison.

Guide utilisateur, priorités, migration et retour arrière : [README.md](README.md).
