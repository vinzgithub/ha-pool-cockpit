# v4.3.0 — Hivernage actif (candidate à la recette)

Cette version est construite sur le correctif v4.2.2, PR #16. Elle ajoute les modes persistants `normal`, `hivernage_actif` et `maintenance`, les statuts séparés des équipements et une surveillance antigel locale indépendante du quota journalier. Aucun équipement réel n'a été commandé pendant le développement. Aucune fusion ou publication de version stable n'est autorisée implicitement par cette livraison.

## Utilisation

Dans **Planning → Configurer et confirmer**, choisir le mode, la durée et l'heure de départ. Les **4 h à 02:00** sont une suggestion, jamais une garantie hors-gel. L'entrée en hivernage demande une confirmation explicite et active les plages hivernales. La durée suggérée ne réduit pas un programme existant avant confirmation.

Déclarer séparément la PAC, Blue Connect et Flipr « Hiverné ». Une sonde hivernée est exclue des calculs de température et des alertes de traitement ; ses historiques restent conservés. Une PAC hivernée n'est pas commandée. La pompe de filtration conserve son propre statut. Sortir du mode hivernage ne réactive aucun équipement : chaque remise en service est explicite et une sonde réactivée attend une mesure acquise après cette opération.

Le programme précédant l'hivernage est conservé et restauré à la sortie, y compris après un passage en maintenance. Une modification manuelle des plages devient `custom`. `suspended` et `custom` conservent leurs plages ; la recommandation est affichée séparément. Les majorations sont calculées une seule fois par le backend. Une prolongation confirmée reste un mécanisme distinct.

Pour l'antigel, choisir un **capteur local représentatif de la zone à protéger**, sa date d'acquisition, puis confirmer l'activation. La météo distante seule n'est pas une preuve de température locale. Valeurs initiales proposées : entrée ≤ 3 °C pendant 60 s, sortie ≥ 5 °C pendant 600 s, maintien minimal 900 s après observation de marche ; échantillon âgé de 15 min au maximum ; alerte de commande sans effet après 120 s. Tous ces réglages sont configurables. L'antigel est **désactivé lors de la migration**.

La date d'acquisition vient d'une entité timestamp configurée ou des attributs `measurement_timestamp`, `last_measurement`, `last_sample`. Une valeur numérique en cache, `last_updated` ou un état restauré ne suffit pas à valider une nouvelle mesure. Les sondes d'eau utilisent le mapping `last_analysis` et une limite de 24 h. Après réactivation, le timestamp doit être strictement postérieur à celle-ci.

Si la mesure antigel disparaît, une demande déjà active est maintenue et signalée comme non confirmée ; aucune nouvelle demande n'est inventée sans mesure valide. Les verrouillages restent prioritaires. HA indisponible ou pompe hors tension : le logiciel ne peut pas garantir le hors-gel. Une protection matérielle indépendante peut être nécessaire.

## Priorités

| Rang | Situation | Effet |
|---|---|---|
| 1 | Maintenance, hydraulique interdite, pompe hors service, verrou à sec actif/inconnu, arrêt externe/de sécurité | Interdit la marche, même en risque de gel ; alerte si demande antigel |
| 2 | Demande antigel valide ou maintenue après perte du capteur | Demande la circulation indépendamment du quota et des plages |
| 3 | Forçage utilisateur ordinaire | Conservé ; reprend effet après l'antigel |
| 4 | Source `custom`, `suspended`, `adaptive` | Détermine les plages habituelles sans écrasement des choix manuels |
| 5 | Optimisations / prolongations acceptées | Respectent les rangs supérieurs |

Un arrêt de sécurité/externe n'est jamais supprimé par un boost ou un calcul. La reprise explicite du programme peut le lever après vérification. Le statut « commande envoyée » est distinct de « pompe observée en marche » et de « débit vérifié ». Sans capteur de débit, ce dernier reste non vérifié. Les frises distinguent programme prévu, marche/arrêt observés et périodes sans observation ; elles suivent la journée locale réelle, y compris les journées de 23/25 h.

## Architecture et traçabilité

- `wintering.py` : validation, qualité des échantillons, machine d'état antigel, journée locale.
- `wintering_runtime.py` : frontières HA, configuration confirmée/révisionnée, observations, alertes et résultat public `winter_status` versionné.
- `scheduler.py` : autorité unique de calcul et arbitre final des commandes.
- `src/hivernage/presentation.js` et `frontend/v4.3.0/host.js` : présentation du résultat backend et formulaires, sans autorité d'exécution locale.
- `tools/build_wintering_v430.py` : distribution reproductible à partir des sources et du socle V4.2.1 conservé.

Les changements de mode/statut/paramètre, confirmations (identifiant HA), commandes, confirmations de marche, transitions antigel et alertes sont journalisés dans le journal existant, limité à 100 entrées. Les observations sont conservées sur 48 h, au plus 2 000 segments ; aucune continuité n'est inventée après un redémarrage ou une lacune de plus de 90 s. La révision empêche une confirmation écrasant une modification plus récente d'un autre client. La configuration hivernage est réservée à l'administrateur du maître. Un satellite n'exécute pas la protection locale.

## Migration et retour arrière

Effectuer d'abord la recette sur une **instance isolée**, avec des entités simulées et sans identifiants donnant accès à des équipements réels. Ne pas installer automatiquement sur le Pi de production.

1. Sauvegarder la configuration HA complète, la ressource JS utilisée, le dossier `custom_components/ha_pool_dashboard` et `.storage/ha_pool_dashboard.rc27` avant remplacement.
2. Copier le dossier complet `home_assistant/custom_components/ha_pool_dashboard` de cette branche dans le `custom_components` de l'instance de recette. Les deux nouveaux modules Python doivent être présents.
3. Remplacer la ressource frontend par `release/v4.3.0/pool-cockpit.js` ; conserver les assets existants. Charger **une seule ressource** `pool-cockpit.js` (par exemple avec `?v=4.3.0`), pas les bundles historiques simultanément.
4. Redémarrer HA, recharger complètement le navigateur. Vérifier le backend v4.3.0, les entités, les modes existants et l'absence de changement non confirmé.
5. Le stockage interne passe au schéma 2 ; avant cette migration, une copie HA Store est créée sous `.storage/ha_pool_dashboard.rc27.pre_v430` si elle n'existe pas. Les modes initiaux restent normaux, l'antigel désactivé et les plages conservées.
6. Pour revenir en v4.2.2, arrêter l'instance isolée, restaurer ensemble le dossier Python, le JS et le stockage d'avant migration, puis redémarrer. Ne pas faire lire directement le schéma 2 à un ancien backend. La copie automatique ne remplace pas la sauvegarde complète préalable. Vérifier physiquement les équipements avant tout retour sur une installation réelle.

Le manifest de l'intégration conserve son numéro historique 3.0.2 comme les distributions V4 précédentes ; la version de cette distribution et du contrat backend est 4.3.0.

## Vérification

Voir [TEST_REPORT.md](TEST_REPORT.md) pour les commandes, résultats et limites. Aucun test sur Home Assistant réel, le Pi Vendée, une pompe physique ou un épisode de gel réel n'est revendiqué. La recette utilisateur reste nécessaire avant fusion et installation de production.

## Révision ergonomique

La synthèse compacte est dans Vue d’ensemble ; durées et frises dans Planning ; statuts dans Équipements. Les paramètres restent repliables et soumis à confirmation. Les alertes pertinentes restent visibles sur tous les onglets. [Captures avant/après et bilan](UX_REVIEW.md).
