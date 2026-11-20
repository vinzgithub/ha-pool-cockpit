# v4.3.0 — Hivernage actif et protection antigel supervisée

Cette version est construite sur le socle V4.2.2. Elle ajoute les modes persistants `normal`, `hivernage_actif` et `maintenance`, les statuts séparés des équipements et une surveillance antigel locale indépendante du quota journalier. Elle a été validée sur une installation Home Assistant de recette isolée avec des équipements simulés, **sans commander d'équipement physique**.

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

## Installation et retour arrière simplifiés

**L'installation ou la mise à jour V4.3.0 utilise désormais `install.sh`, sans recopier les fichiers manuellement.** Elle prend en charge une installation neuve et une migration reconnue depuis la V4.2.1 officielle sur Home Assistant Core / Docker.

```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
sh install.sh --config /chemin/vers/config --dry-run
# Sauvegarde complète, puis arrêt de Home Assistant avant installation :
sh install.sh --config /chemin/vers/config --yes
# Redémarrer Home Assistant manuellement, puis actualiser le navigateur.
```

Le mode `--dry-run` ne modifie rien. Le mode `--yes` crée une sauvegarde datée du fichier YAML, du tableau de bord, du JavaScript, du backend et du stockage Pool Cockpit avant toute migration reconnue. Le logiciel de recette et les essais GitHub ne remplacent pas une vérification de la configuration et des équipements réels.

**Retour arrière :** arrêter Home Assistant et réutiliser le chemin `BACKUP:` renvoyé par le programme :

```bash
sh install.sh --config /chemin/vers/config --rollback \
  /chemin/vers/config/.pool_cockpit_backups/v4.3.0-DATE --yes
```

Le stockage passe au schéma 2 lors du redémarrage avec V4.3.0. L'installateur préserve les données existantes et rétablit **ensemble** les composants Python, JS et le stockage lors d'un retour arrière. Il ne gère ni l'arrêt ni le redémarrage de Home Assistant.

Le manifest de l'intégration conserve son numéro technique historique `3.0.2`, comme les distributions précédentes ; la version de distribution et du backend hivernage est **4.3.0**.

Pour une explication détaillée : [guide d'installation et de restauration](../../docs/user/INSTALLATION.md).

## Vérifications et portée

La V4.3.0 a passé les tests GitHub Actions, les essais d'hivernage et la recette visuelle sur un Raspberry Pi exécutant **une instance Home Assistant isolée avec des appareils simulés**. Voir le [rapport de tests](TEST_REPORT.md).

**Aucune protection physique d'une piscine contre le gel n'a été démontrée** : valider les sondes locales, la pompe, les verrouillages hydrauliques et le débit réel avant activation. L'antigel reste désactivé par défaut et la météo distante ne suffit pas pour l'activer.

## Révision ergonomique

La synthèse compacte est dans Vue d’ensemble ; durées et frises dans Planning ; statuts dans Équipements. Les paramètres restent repliables et soumis à confirmation. Les alertes pertinentes restent visibles sur tous les onglets. [Captures avant/après et bilan](UX_REVIEW.md).
