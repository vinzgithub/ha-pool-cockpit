# Pool Cockpit V4.3.1 — Installation et mise à jour

**V4.3.1 est un correctif de distribution et d'installation : le moteur et le JavaScript restent V4.3.0.** La V4.3.0 originale ne reconnaissait pas certaines configurations Lovelace existantes (ressource enregistrée par l'interface et carte `custom:pool-dashboard-card`). Ce cas est désormais pris en charge avec sauvegarde du fichier `.storage/lovelace_resources` et restauration possible.

Une seule commande d'entrée : `./install.sh`. Le script détecte l'installation neuve ou une V4.2.1 officielle et ne commande jamais de matériel.

## Deux commandes

Depuis le dépôt **tagué V4.3.1** et avec accès au dossier Home Assistant contenant `configuration.yaml` :

```bash
./install.sh --config /chemin/config --dry-run
# Faire une sauvegarde complète HA, puis arrêter Home Assistant.
./install.sh --config /chemin/config --yes
# Redémarrer HA manuellement et contrôler le tableau de bord.
```

Dans un environnement où `/config` est monté, `--config /config` est facultatif. La confirmation `--yes` est obligatoire. `--dry-run` ne modifie aucun fichier. **Arrêter Home Assistant avant la mise à jour**, afin d'éviter toute modification simultanée du stockage. Aucun redémarrage ou arrêt n'est automatisé.

Le script préserve les tableaux de bord déclarés en YAML et les autres ressources Lovelace, sans les recréer. En mode ressources stockées, Home Assistant doit être arrêté avant toute écriture dans `.storage/lovelace_resources`.

Le script sauvegarde les éléments existants sous `.pool_cockpit_backups/v4.3.0-.../` : configuration, tableau de bord, backend, JavaScript, stockage Pool Cockpit et, si nécessaire, fichier des ressources Lovelace. Il préserve les paramètres et les assets lors de la mise à jour. L'intégration réalise la migration de stockage lors du prochain démarrage. Les versions personnalisées ou inconnues sont refusées. Le JavaScript officiel est vérifié par SHA-256.

## Retour arrière

Arrêter Home Assistant avant restauration, puis réutiliser exactement le chemin affiché après `BACKUP:` :

```bash
./install.sh --config /chemin/config --rollback \
  /chemin/config/.pool_cockpit_backups/v4.3.0-DATE --yes
# Redémarrer HA manuellement.
```

La restauration remet **ensemble** le backend, le JavaScript, la configuration et les données d'avant migration. Elle efface les nouvelles données Pool Cockpit créées depuis l'instantané ; conserver également une sauvegarde HA complète. La restauration d'une installation neuve n'est pas proposée comme commande automatique.

## Sécurité

L'antigel n'est pas activé automatiquement. Vérifier les sondes locales, le débit, l'état de la pompe, les sécurités hydrauliques et les prescriptions du fabricant avant utilisation réelle. La PAC reste verrouillée en écriture. Aucun script ne remplace une protection antigel matérielle autonome.

Les installateurs historiques `install_v421.py`, `install_v42.py`, `install_v41.py` restent disponibles ; `install.sh` pointe vers `install_v430.py`.
