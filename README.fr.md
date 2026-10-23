<div align="center">

# 🌊 Pool Cockpit V4.2.0

### Votre piscine. Un cockpit élégant.

**Surveillance · Conseils · Mesures · Équipements · Planning · Historique**

[**English**](README.md) · **Français**

![Version](https://img.shields.io/badge/version-4.2.0-126caa) ![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Core%20%2F%20Docker-41BDF5) ![Licence](https://img.shields.io/badge/licence-PolyForm%20Noncommercial-0d355d)

![Illustration promotionnelle Pool Cockpit](docs/images/v4-rc1/hero-fr.webp)

<sub>Illustration promotionnelle de Pool Cockpit ; les captures de l'interface V4.2.0 sont disponibles ci-dessous.</sub>

</div>

## Nouveauté V4.2.0 — Un seul JavaScript

La V4.2.0 regroupe le moteur et la Démonstration dans un seul `pool-cockpit.js`, avec la carte `custom:pool-cockpit-card`. Les capteurs et réglages existants sont préservés.

[**Télécharger la V4.2.0**](https://github.com/vinzgithub/ha-pool-cockpit/releases/tag/v4.2.0) · [**Guide de mise à jour**](release/v4.2.0/README.md)

Cette version met à jour le **frontend d'une installation V4.1.0 existante**. Pour une installation neuve, commencer par la V4.1.0 complète ci-dessous.

## Découvrez la V4.2.0

**Pool Cockpit** est un tableau de bord Home Assistant pour suivre les mesures de l'eau, la filtration, la pompe à chaleur, les équipements, les conseils et les programmations depuis une interface unique.

La V4.2.0 réunit le moteur de la piscine et la Démonstration dans **une seule ressource JavaScript**. Une installation équipée démarre en **Piscine réelle** ; une installation sans capteurs peut explorer le mode **Démonstration**, sans action sur les équipements.

## Aperçu de l'interface V4.2.0

Les captures ci-dessous proviennent du **moteur V4.2.0 exécuté dans un navigateur en mode Démonstration**. Les valeurs représentées sont fictives ; la présentation peut différer selon le thème, les appareils et les réglages.

![Vue d'ensemble Pool Cockpit V4.2.0](docs/images/v4.2.0/overview.png)

| Conseils | Mesures |
|:--:|:--:|
| ![Conseils V4.2.0](docs/images/v4.2.0/advice.png) | ![Mesures V4.2.0](docs/images/v4.2.0/measurements.png) |

| Équipements | Planning |
|:--:|:--:|
| ![Équipements V4.2.0](docs/images/v4.2.0/equipment.png) | ![Planning V4.2.0](docs/images/v4.2.0/planning.png) |

![Historique V4.2.0](docs/images/v4.2.0/history.png)

## Fonctionnalités

- **Six rubriques :** Vue d'ensemble, Conseils, Mesures, Équipements, Planning et Historique.
- **Analyse de l'eau :** température, pH, ORP et autres données fournies par Home Assistant.
- **Association des appareils :** paramétrage des capteurs et des entités compatibles.
- **Équipements :** états de filtration, PAC et éclairage ; commandes réelles uniquement après vérification des associations et des sécurités.
- **Planning et historique :** programmations, mesures et tendances disponibles.
- **Interface :** thème Océan, quatre thèmes proposés, neuf choix de langues et présentation adaptée aux différents écrans.
- **Modes Réel / Démonstration isolés :** les commandes et les données fictives ne modifient pas les équipements réels ni leur configuration.

Certaines traductions héritées de la V3 et certaines intégrations matérielles peuvent nécessiter des ajustements selon l'installation.

## Installer la V4.1.0 depuis Git

**Périmètre validé :** Home Assistant Core / Docker, testé sur une instance Home Assistant neuve sans capteur de piscine, avec accès au dossier réel de configuration depuis la machine qui exécute l'installateur. Git et Python 3 sont requis. **Effectuez une sauvegarde complète Home Assistant avant l'installation.** Ce n'est ni une installation HACS ni un outil de migration automatique depuis la V3.

```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
python3 install_v41.py --config /chemin/vers/homeassistant/config --dry-run
python3 install_v41.py --config /chemin/vers/homeassistant/config --yes
```

Remplacez `/chemin/vers/homeassistant/config` par **le dossier accessible depuis la machine qui exécute Python**, contenant `configuration.yaml`. En Docker, le chemin de l'hôte est souvent différent du `/config` visible depuis le conteneur.

- `--dry-run` effectue les vérifications **sans rien modifier**.
- `--yes` autorise explicitement l'installation et crée une sauvegarde datée de la configuration existante.
- L'installateur place le moteur V4, le backend, le module Réel/Démonstration et les ressources graphiques, puis crée le menu **Piscine**.
- **Vérifiez la configuration Home Assistant**, redémarrez Home Assistant manuellement et actualisez le navigateur.
- Ouvrez **Piscine** et utilisez les modes **Piscine réelle** ou **Démonstration**.

Pour protéger les installations existantes, l'installateur refuse les configurations Lovelace incompatibles, les fichiers Pool Cockpit déjà présents et les chemins non pris en charge. Il ne redémarre pas Home Assistant automatiquement.

### Mise à jour depuis une V4.0.0 compatible

Réservée aux **installations officielles V4.0.0 reconnues et non modifiées** :

```bash
python3 install_v41.py --config /chemin/vers/homeassistant/config --upgrade --dry-run
python3 install_v41.py --config /chemin/vers/homeassistant/config --upgrade --yes
```

L'outil refuse les installations modifiées ou incompatibles. Le moteur V4, le backend et les paramètres personnalisés sont préservés. Effectuez une sauvegarde complète et consultez les conditions de mise à jour et de retour arrière.

### Télécharger l'archive ZIP

Le [**paquet V4.1.0**](https://github.com/vinzgithub/ha-pool-cockpit/releases/tag/v4.1.0) propose une archive ZIP complète et son empreinte SHA-256. Vérifiez l'archive et le fichier interne `SHA256SUMS` avant de lancer le même installateur.

📖 [Guide complet d'installation, de mise à jour et de retour arrière](release/v4.1.0/INSTALLATION.md) · [Notes de version](docs/releases/V4.1.0.md)

## Sauvegardes, limites et sécurité

- **Sauvegardes :** copies de l'installateur dans `.pool_cockpit_backups/`, à compléter par une sauvegarde Home Assistant entière. Restaurer uniquement les fichiers YAML **ne constitue pas** une désinstallation complète.
- **V3 :** aucune migration automatique. Ancienne version conservée dans [`old-v3`](https://github.com/vinzgithub/ha-pool-cockpit/tree/old-v3).
- **Autres installations :** Home Assistant OS/Supervised sans accès en écriture au dossier de configuration n'est pas couvert par l'installateur automatique.
- **Confidentialité :** ne partagez jamais vos mots de passe, jetons, identifiants privés ou mesures sensibles.
- **Sécurité :** Pool Cockpit ne remplace ni les dispositifs de protection, ni les automatismes de sécurité, ni l'entretien de la piscine. Vérifiez les commandes des équipements réels avant leur mise en service.

**Licence :** [PolyForm Noncommercial 1.0.0](LICENSE). Tout usage commercial doit respecter les dispositions de la licence.

---

<div align="center"><sub>Pool Cockpit V4.2.0 · Home Assistant · Votre piscine, votre cockpit.</sub></div>
