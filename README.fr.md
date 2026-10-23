# Pool Cockpit V4.1.0 — Installation complète

Installer depuis Git (Home Assistant Core/Docker) :
```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
python3 install_v41.py --config /config --dry-run
python3 install_v41.py --config /config --yes
```
Pour mettre à jour une V4.0.0 reconnue, ajouter `--upgrade` à l'installation (toujours tester avec `--dry-run`). Adapter le chemin `/config`. Le paquet inclut le moteur, le backend et Réel/Démo. [Documentation](release/v4.1.0/INSTALLATION.md).

---

<div align="center">

# 🌊 Pool Cockpit V4.0.0

### Votre piscine. Un cockpit élégant.

**Surveillance de l’eau · Conseils · Appareils · Équipements · Planning · Historique**

[**English**](README.md) · **Français**

![Version](https://img.shields.io/badge/version-4.0.0-126caa) ![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Core%20%2F%20Docker-41BDF5) ![Licence](https://img.shields.io/badge/licence-PolyForm%20Noncommercial-0d355d)

![Présentation de Pool Cockpit V4](docs/images/v4-rc1/hero-fr.webp)

<sub>Illustration promotionnelle issue de la RC1. Les captures ci-dessous présentent cette interface de préversion ; certains éléments ont évolué depuis.</sub>

</div>

## ✨ Découvrez Pool Cockpit

Pool Cockpit transforme Home Assistant en tableau de bord dédié à la piscine. Il centralise les mesures, les conseils de traitement, les appareils connectés, les équipements et la programmation. **Une piscine entièrement connectée n'est pas indispensable pour ouvrir le dashboard** : les valeurs absentes sont signalées, jamais inventées.

### Vue d'ensemble

![Capture de l'interface V4 RC1 — Vue d'ensemble](docs/images/v4-rc1/overview.webp)

### Conseils et mesures

| Conseils | Appareils de mesure |
|:---:|:---:|
| ![Capture V4 RC1 — Conseils](docs/images/v4-rc1/advice.webp) | ![Capture V4 RC1 — Mesures](docs/images/v4-rc1/measurements.webp) |

### Équipements et planning

| Équipements | Planning |
|:---:|:---:|
| ![Capture V4 RC1 — Équipements](docs/images/v4-rc1/equipment.webp) | ![Capture V4 RC1 — Planning](docs/images/v4-rc1/planning.webp) |

La V4.0.0 comporte **six onglets** : Vue d'ensemble, Conseils, Mesures, Équipements, Planning et Historique. L'ancien onglet « Eau » de la RC1 a été supprimé ; ses informations essentielles sont regroupées dans les vues pertinentes. Les captures historiques RC1 sont conservées à titre illustratif ; elles ne documentent pas les corrections finales RC8.2.

## 🚀 Fonctionnalités

- **Mesures de l'eau** : température, pH, ORP et autres métriques lorsqu'elles sont exposées par Home Assistant.
- **Découverte dynamique** : rechercher et associer des appareils de mesure et d'autres équipements compatibles, puis gérer leur visibilité.
- **Équipements** : visualiser les états et, après configuration et validation, accéder aux commandes de filtration, PAC et éclairage.
- **Planning et historique** : programmation, suivi des mesures et tendances selon les données disponibles.
- **Interface premium** : quatre thèmes, neuf langues proposées et affichage adapté aux mobiles.
- **Gestion des indisponibilités** : absence de capteur ≠ mesure à zéro ; pas de données fictives en mode réel.

Certaines traductions héritées du moteur V3 et certaines fonctionnalités matérielles peuvent nécessiter des ajustements selon l'installation.

## 📦 Installation simplifiée — Nouvelle installation

> **Périmètre validé : Home Assistant Core / Docker**, avec accès au dossier de configuration `/config` (ou son chemin correspondant sur l'hôte). La V4 a été testée sur un Home Assistant neuf avec Docker, sans V3 et sans capteur. **L'installateur `install_v4.py` refuse volontairement de remplacer une installation Pool Cockpit existante.** Ce n'est pas encore un outil de migration de V3 vers V4.

### 1. Prérequis

- Une instance Home Assistant opérationnelle, avec accès au dossier de configuration et possibilité de redémarrer Home Assistant.
- Python 3 sur la machine exécutant l'installateur et Git pour récupérer le dépôt.
- Une **sauvegarde Home Assistant** réalisée avant installation.

### 2. Récupérer Pool Cockpit

Sur la machine ayant accès au dossier de configuration Home Assistant :

```bash
git clone --branch main https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
```

### 3. Vérifier sans modifier

Indiquez **le chemin réel du dossier de configuration Home Assistant vu depuis cette machine**. Exemple lorsque `/config` est accessible :

```bash
python3 install_v4.py --config /config --dry-run
```

Un message `PRÊT` confirme que les contrôles préalables sont passés. Si le script refuse l'installation, **ne forcez pas la modification manuelle** : vérifiez notamment la présence éventuelle d'une installation antérieure ou d'un bloc `lovelace:` existant.

### 4. Installer et vérifier

```bash
python3 install_v4.py --config /config
```

L'installateur copie le bundle JavaScript, ses assets et le backend, crée le dashboard et ajoute sa configuration Lovelace. Il sauvegarde au préalable `configuration.yaml` dans `.pool_cockpit_backups/`.

**Avant de redémarrer Home Assistant**, utilisez la vérification de configuration disponible dans votre installation. Redémarrez ensuite Home Assistant, rechargez le navigateur et ouvrez le menu **Piscine**. Vous pouvez ensuite associer vos appareils depuis la configuration du dashboard.

**Important :** les commandes d'équipements réels demandent une configuration explicite et une validation sur le matériel. Ne présumez jamais qu'une commande est sûre sans vérification locale.

### Vérification d'intégrité

Les fichiers de la distribution frontend historique RC8.2 se trouvent dans `release/v4-rc8-2/` et sont contrôlables avec :

```bash
cd release/v4-rc8-2
sha256sum -c SHA256SUMS
```

Le nom de fichier `pool-dashboard-v4-rc8-2.js` est conservé pour la traçabilité du bundle validé ; l'installateur de la version publique annonce **4.0.0**.

## 🔁 Sauvegarde, migration et retour arrière

- **Nouvelle installation uniquement** pour `install_v4.py`. Ne l'utilisez pas pour écraser une V3 ou une V4 déjà installée.
- Le dossier `.pool_cockpit_backups/` contient une copie de `configuration.yaml` antérieure à l'installation. Pour revenir à l'état précédent, il faut également retirer les fichiers et le dashboard créés par l'installateur, puis vérifier la configuration et redémarrer Home Assistant. **La sauvegarde du seul YAML ne constitue pas une désinstallation complète.**
- Conservez aussi une sauvegarde complète Home Assistant avant chaque opération.
- La **V3 historique est conservée** sur la branche [`old-v3`](https://github.com/vinzgithub/ha-pool-cockpit/tree/old-v3). Elle n'est pas automatiquement migrée par cet installateur.

## 🛡️ Confidentialité et sécurité

Pool Cockpit exploite les entités et services de votre propre Home Assistant. Il ne remplace pas les automatismes de sécurité, interverrouillages ni procédures de maintenance des équipements. N'ajoutez jamais au dépôt GitHub vos secrets, jetons, mots de passe, identifiants d'appareil ou données privées.

**Licence :** [PolyForm Noncommercial 1.0.0](LICENSE). Usage commercial soumis aux dispositions de la licence.

---

<div align="center"><sub>Pool Cockpit V4.0.0 · Home Assistant · Votre piscine, votre cockpit.</sub></div>
