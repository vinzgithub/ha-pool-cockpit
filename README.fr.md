<div align="center">

# 🌊 Pool Cockpit V4.2.0

### Votre piscine. Un cockpit élégant.

**Surveillance · Conseils · Mesures · Équipements · Planning · Historique**

[**English**](README.md) · **Français**

![Version](https://img.shields.io/badge/version-4.2.0-126caa) ![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Core%20%2F%20Docker-41BDF5) ![Licence](https://img.shields.io/badge/licence-PolyForm%20Noncommercial-0d355d)

![Illustration promotionnelle Pool Cockpit](docs/images/v4.2.0/pool-cockpit-v4.2-hero.webp)

<sub>Illustration promotionnelle de Pool Cockpit ; les captures de l'interface V4.2.0 sont disponibles ci-dessous.</sub>

</div>

## Nouveauté V4.2.0 — Un seul JavaScript

La V4.2.0 regroupe le moteur et la Démonstration dans un seul `pool-cockpit.js`, avec la carte `custom:pool-cockpit-card`. Les capteurs et réglages existants sont préservés.

[**Télécharger la V4.2.0**](https://github.com/vinzgithub/ha-pool-cockpit/releases/tag/v4.2.0) · [**Guide d'installation / mise à jour**](release/v4.2.0/README.md)

La V4.2.0 propose désormais une installation neuve directe et un chemin de mise à jour distinct pour les utilisateurs de V4.1.0.

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

## Installer directement Pool Cockpit V4.2.0

L'installation neuve utilise **un seul JavaScript**, `pool-cockpit.js`, et la carte `custom:pool-cockpit-card`. Elle installe aussi le backend Home Assistant et les ressources graphiques nécessaires.

**Pré-requis :** Home Assistant Core / Docker avec accès au dossier réel contenant `configuration.yaml`, Python 3 et Git. Il ne s'agit pas d'une installation HACS. **Sauvegardez Home Assistant avant toute intervention.**

```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
python3 install_v42.py --config /chemin/vers/homeassistant/config --dry-run
python3 install_v42.py --config /chemin/vers/homeassistant/config --yes
```

Remplacez ce chemin par celui du dossier de configuration accessible **depuis la machine qui lance Python**. La commande `--dry-run` vérifie sans modifier ; `--yes` autorise l'installation, sauvegarde la configuration, copie les composants et déclare la ressource Lovelace. Vérifiez la configuration Home Assistant avant de redémarrer manuellement.

**Installation existante ?** L'installateur neuf refuse les installations Pool Cockpit et les configurations Lovelace déjà personnalisées pour éviter les écrasements. Pour une V4.1.0 en place, utilisez uniquement le [guide de mise à jour vers V4.2.0](release/v4.2.0/README.md) : vos capteurs et paramètres sont conservés.

📖 [Télécharger le frontend V4.2.0](https://github.com/vinzgithub/ha-pool-cockpit/releases/tag/v4.2.0) · [Documentation de mise à jour](release/v4.2.0/README.md)

## Sauvegardes, limites et sécurité

- **Sauvegardes :** copies de l'installateur dans `.pool_cockpit_backups/`, à compléter par une sauvegarde Home Assistant entière. Restaurer uniquement les fichiers YAML **ne constitue pas** une désinstallation complète.
- **V3 :** aucune migration automatique depuis la V3. Les sources de la V3 restent accessibles via le [tag Git `v3.0.2`](https://github.com/vinzgithub/ha-pool-cockpit/tree/v3.0.2).
- **Autres installations :** Home Assistant OS/Supervised sans accès en écriture au dossier de configuration n'est pas couvert par l'installateur automatique.
- **Confidentialité :** ne partagez jamais vos mots de passe, jetons, identifiants privés ou mesures sensibles.
- **Sécurité :** Pool Cockpit ne remplace ni les dispositifs de protection, ni les automatismes de sécurité, ni l'entretien de la piscine. Vérifiez les commandes des équipements réels avant leur mise en service.

**Licence :** [PolyForm Noncommercial 1.0.0](LICENSE). Tout usage commercial doit respecter les dispositions de la licence.

---

<div align="center"><sub>Pool Cockpit V4.2.0 · Home Assistant · Votre piscine, votre cockpit.</sub></div>
