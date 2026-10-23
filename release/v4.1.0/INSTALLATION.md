# Pool Cockpit V4.1.0 — Installation complète
La V4.1.0 contient le moteur V4, le composant Home Assistant, le mode Réel/Démo et les ressources graphiques.

## Installation via Git (Home Assistant Core / Docker)
Sur une machine disposant du chemin de configuration Home Assistant et de Python 3 :

```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
python3 install_v41.py --config /config --dry-run
python3 install_v41.py --config /config --yes
```

Adapter `/config` au chemin sur l'hôte. La première commande Python **ne modifie rien**. La seconde nécessite un accord explicite. Vérifier la configuration Home Assistant avant redémarrage.

## Installation avec le ZIP
Télécharger les deux fichiers de la release V4.1.0, contrôler l'empreinte externe, extraire le ZIP, puis exécuter les mêmes commandes Python dans le dossier extrait. Vérifier le manifeste interne `sha256sum -c SHA256SUMS`.

## Mise à jour d'une V4.0.0 compatible
```bash
python3 install_v41.py --config /config --upgrade --dry-run
python3 install_v41.py --config /config --upgrade --yes
```

L'outil exige le bundle V4 RC8.2 officiel intact et la configuration Lovelace YAML connue. Il sauvegarde `configuration.yaml` et `pool-dashboard.yaml`, conserve les entités personnalisées et ne remplace ni le moteur ni le backend existants. Toute installation personnalisée ou incompatible est refusée sans modification.

## Sécurité et retour arrière
L'outil enregistre les sauvegardes dans `.pool_cockpit_backups/v4.1.0-<date>/`. Avant opération, réaliser également une sauvegarde complète Home Assistant. Pour revenir en arrière après une mise à jour, restaurer les deux fichiers YAML sauvegardés, retirer la ressource V4.1 et les fichiers `pool-cockpit-dual-mode-card.js` et `demo-pool-camera.jpg` ajoutés, puis vérifier la configuration et redémarrer HA. Le moteur et le backend V4 restent inchangés.

Une installation neuve n'écrase jamais une installation existante et refuse les blocs Lovelace préexistants demandant une intégration manuelle. L'outil n'effectue aucun redémarrage ou contrôle des équipements. L'installation Home Assistant OS/Supervised sans accès à son dossier de configuration n'est pas automatisée.

Aucun capteur n'est requis pour ouvrir l'interface. **Sans capteur configuré, la Démonstration est ouverte automatiquement** avec une bannière signalant explicitement les données fictives. Cliquer sur Piscine réelle affiche une aide de première configuration et jamais des mesures fictives. Avec des appareils configurés, le mode Réel est sélectionné au démarrage. La Démo utilise des commandes fictives isolées, sans écrire sa liste d'appareils dans les réglages réels du navigateur ; la commande d'un équipement réel nécessite une configuration séparée.
