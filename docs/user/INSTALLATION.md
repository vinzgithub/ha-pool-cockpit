# Pool Cockpit V4.2.1 — Installation et mise à jour

Pool Cockpit est un tableau de bord pour Home Assistant. La V4.2.1 utilise une seule ressource JavaScript et la carte `custom:pool-cockpit-card`. Le backend, les intégrations Home Assistant et les périphériques nécessaires au mode Réel doivent être disponibles.

## Installation neuve (Home Assistant Core / Docker)

Sauvegarder Home Assistant et disposer d'un accès en écriture à son **vrai dossier de configuration**, contenant `configuration.yaml`. Python 3 et Git sont nécessaires :

```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
python3 install_v421.py --config /chemin/vers/config --dry-run
python3 install_v421.py --config /chemin/vers/config --yes
```

L'alternative `./install.sh --config /chemin/vers/config --dry-run`, suivie de `--yes`, utilise le même installateur V4.2.1. `--dry-run` ne modifie aucun fichier. `--yes` crée une sauvegarde de `configuration.yaml`, copie la ressource et les fichiers requis, et configure une seule ressource Lovelace `?v=4.2.1`. Vérifier la configuration, puis redémarrer Home Assistant manuellement si nécessaire.

L'installation est refusée si Pool Cockpit, le dashboard ou la configuration Lovelace correspondante existent déjà. Ne pas forcer : le script **n'est pas un outil de mise à jour**.

## Mise à jour d'une installation existante

La mise à jour V4.2.0 → V4.2.1 est **manuelle** ; `--upgrade` n'est pas disponible. Utiliser exclusivement le [guide complet V4.2.1](../../release/v4.2.1/README.md) avec sauvegarde de l'ancien JavaScript, remplacement, actualisation de `?v=4.2.1`, vérification des caches et procédure de retour arrière `?v=4.2.0-r1`.

Ne jamais charger simultanément les JavaScript V4.2.0 et V4.2.1 dans le même frontend Home Assistant : les deux définissent `pool-cockpit-card`.

## Conditions et sécurité

- Home Assistant OS / Supervised sans accès direct au dossier de configuration n'est pas couvert par l'installateur automatique.
- Un nouveau Home Assistant sans capteurs affiche le mode Démonstration. En mode Réel, associer les entités de vos intégrations déjà installées ; aucune commande réelle n'est émise depuis la Démonstration.
- Les instantanés `.pool_cockpit_backups/` ne remplacent pas une sauvegarde complète de Home Assistant.
- Les versions historiques restent disponibles depuis leurs tags Git ; `install_v4.py`, `install_v41.py` et `install_v42.py` sont des installateurs historiques, pas l'entrée recommandée pour V4.2.1.
