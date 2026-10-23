# Pool Cockpit V4.1.0 — Installation

Pool Cockpit V4.1.0 est distribué en installation **complète** : moteur V4, backend Home Assistant, interface et mode Réel/Démonstration.

## Installation neuve (Home Assistant Core / Docker)

Accès SSH ou terminal sur l'hôte qui peut lire et écrire dans le dossier de configuration Home Assistant ; Git et Python 3 sont requis.

```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
python3 install_v41.py --config /config --dry-run
python3 install_v41.py --config /config --yes
```

Utiliser le chemin réel du dossier Home Assistant vu **depuis l'hôte** : sous Docker, ce n'est pas toujours `/config`. Avant `--yes`, effectuer une sauvegarde complète de Home Assistant.

Alternative : `./install.sh --config /chemin/vers/config --dry-run`, puis `./install.sh --config /chemin/vers/config --yes`.

**Mise à jour d'une V4 officielle compatible :**

```bash
python3 install_v41.py --config /config --upgrade --dry-run
python3 install_v41.py --config /config --upgrade --yes
```

Si l'installateur refuse l'opération, ne pas forcer : il détecte les configurations incompatibles et évite de remplacer des fichiers modifiés.

Sur une installation sans capteur, Pool Cockpit ouvre automatiquement le mode Démonstration ; une piscine configurée démarre en mode Réel. Les données et commandes de démo restent isolées du mode Réel.

Home Assistant OS/Supervised sans accès direct à son dossier de configuration n'est pas couvert par cet installateur. Après installation, vérifier la configuration et redémarrer Home Assistant manuellement.

Consulter le guide détaillé [Installation complète V4.1.0](../../release/v4.1.0/INSTALLATION.md) pour les sauvegardes, les limites et le retour arrière.
