<div align="center">

# 🌊 Pool Cockpit V4.2.1

### Votre piscine. Un cockpit élégant.

**Surveillance · Conseils · Mesures · Équipements · Planning · Historique**

[**English**](README.md) · **Français**

![Version](https://img.shields.io/badge/version-4.2.1-126caa) ![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Core%20%2F%20Docker-41BDF5) ![Licence](https://img.shields.io/badge/licence-PolyForm%20Noncommercial-0d355d)

![Illustration promotionnelle Pool Cockpit](docs/images/v4.2.0/pool-cockpit-v4.2-hero.webp)

<sub>Illustration promotionnelle de Pool Cockpit ; les captures de référence ci-dessous proviennent de V4.2.0 ; V4.2.1 corrige l'affichage des vigilances.</sub>

</div>

## Pool Cockpit, c'est quoi ?

**Pool Cockpit est un tableau de bord pour suivre et gérer sa piscine depuis Home Assistant.** Home Assistant est un logiciel de domotique qui permet de réunir au même endroit les informations de vos appareils connectés.

Au lieu de consulter plusieurs applications pour voir la température de l'eau, le pH, la filtration ou la pompe à chaleur, vous retrouvez **l'essentiel de votre piscine sur un seul écran**, accessible depuis Home Assistant sur ordinateur, tablette ou téléphone.

Pool Cockpit organise ces informations en **six rubriques** :

- **Vue d'ensemble :** l'état de la piscine en un coup d'œil.
- **Conseils :** des indications fondées sur les informations disponibles.
- **Mesures :** la température de l'eau, le pH, le Redox (ORP) et les autres valeurs transmises par vos capteurs.
- **Équipements :** le suivi de la filtration, de la pompe à chaleur et de l'éclairage, selon votre installation.
- **Planning :** les programmations disponibles.
- **Historique :** l'évolution des mesures et des événements.

Les informations et commandes réellement accessibles dépendent des équipements que vous possédez et de leur configuration dans Home Assistant.

### Deux façons de l'utiliser

**🏊 Mode Réel — votre propre piscine**

Pour voir les vraies valeurs de votre piscine, **Home Assistant doit être installé et vos capteurs ou équipements doivent déjà y être configurés**, grâce aux intégrations adaptées à votre matériel. Pool Cockpit ne se connecte pas directement à toutes les sondes : il utilise les informations remontées dans Home Assistant, auxquelles vous associez ensuite les entités correspondantes.

Par exemple, pour certains appareils compatibles, vous pouvez installer dans Home Assistant les projets indépendants d'**Adrien40** : [Blue Connect Local](https://github.com/Adrien40/ha-blue-connect-local) pour des sondes Blue Connect, ou [Flipr Local](https://github.com/Adrien40/ha-flipr-local) pour des sondes Flipr. **Ces intégrations ne sont pas incluses dans Pool Cockpit** et ne sont utiles que si vous disposez du matériel concerné. D'autres intégrations Home Assistant peuvent convenir.

**🎮 Mode Démonstration — découvrir sans matériel**

Vous n'avez pas de piscine connectée ? Vous pouvez tout de même parcourir Pool Cockpit avec **des mesures fictives** et découvrir ses écrans. **Aucune sonde, aucun équipement ni aucune intégration matérielle supplémentaire n'est nécessaire**. Home Assistant et Pool Cockpit restent nécessaires pour afficher l'interface. Les données et commandes de démonstration n'agissent jamais sur vos équipements réels.

### Nouveautés de la V4.2.1

Cette version corrective améliore **l'affichage des vigilances Météo-France** sur mobile et sur les différents onglets. Le bouton « Voir les conseils » affiche désormais le détail météorologique ; la barre Réel/Démo et la mention « MODE DÉMO — DONNÉES FICTIVES » restent visibles sur mobile. L'application conserve **une seule ressource JavaScript** (`pool-cockpit.js`), la carte `custom:pool-cockpit-card`, le même backend, les réglages et les automatismes.

**Limite connue :** sur Planning et Configuration, une nouvelle vigilance peut ne s'afficher qu'après un changement d'onglet. Ce problème antérieur à la V4.2.1 est suivi dans le [ticket #12](https://github.com/vinzgithub/ha-pool-cockpit/issues/12).

[**Release Pool Cockpit V4.2.1**](https://github.com/vinzgithub/ha-pool-cockpit/releases/tag/v4.2.1) · [**Installation et mise à jour**](#installer-directement-pool-cockpit-v421)

## Aperçu de l'interface (captures de référence V4.2.0)

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

## Installer directement Pool Cockpit V4.2.1

L'installation neuve utilise **un seul JavaScript**, `pool-cockpit.js`, et la carte `custom:pool-cockpit-card`. Elle installe aussi le backend Home Assistant et les ressources graphiques nécessaires.

**Pré-requis :** Home Assistant Core / Docker avec accès au dossier réel contenant `configuration.yaml`, Python 3 et Git. Il ne s'agit pas d'une installation HACS. **Sauvegardez Home Assistant avant toute intervention.**

```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
python3 install_v421.py --config /chemin/vers/homeassistant/config --dry-run
python3 install_v421.py --config /chemin/vers/homeassistant/config --yes
```

Remplacez ce chemin par celui du dossier de configuration accessible **depuis la machine qui lance Python**. La commande `--dry-run` vérifie sans modifier ; `--yes` autorise l'installation, sauvegarde la configuration, copie les composants et déclare la ressource Lovelace. Vérifiez la configuration Home Assistant avant de redémarrer manuellement.

**Installation existante ?** L'installateur neuf refuse les installations Pool Cockpit et les configurations Lovelace déjà personnalisées pour éviter les écrasements. Pour une installation V4.2.0 existante, suivez la [procédure manuelle V4.2.1 avec retour arrière](release/v4.2.1/README.md) : n'utilisez pas l'installateur neuf. Pour une V4.1.0, consultez d'abord le [guide historique de migration vers V4.2.0](release/v4.2.0/README.md).

📖 [Fichiers de release V4.2.1](https://github.com/vinzgithub/ha-pool-cockpit/releases/tag/v4.2.1) · [Mise à jour et retour arrière](release/v4.2.1/README.md)

## Sauvegardes, limites et sécurité

- **Sauvegardes :** copies de l'installateur dans `.pool_cockpit_backups/`, à compléter par une sauvegarde Home Assistant entière. Restaurer uniquement les fichiers YAML **ne constitue pas** une désinstallation complète.
- **V3 :** aucune migration automatique depuis la V3. Les sources de la V3 restent accessibles via le [tag Git `v3.0.2`](https://github.com/vinzgithub/ha-pool-cockpit/tree/v3.0.2).
- **Autres installations :** Home Assistant OS/Supervised sans accès en écriture au dossier de configuration n'est pas couvert par l'installateur automatique.
- **Confidentialité :** ne partagez jamais vos mots de passe, jetons, identifiants privés ou mesures sensibles.
- **Sécurité :** Pool Cockpit ne remplace ni les dispositifs de protection, ni les automatismes de sécurité, ni l'entretien de la piscine. Vérifiez les commandes des équipements réels avant leur mise en service.

**Licence :** [PolyForm Noncommercial 1.0.0](LICENSE). Tout usage commercial doit respecter les dispositions de la licence.

---

<div align="center"><sub>Pool Cockpit V4.2.1 · Home Assistant · Votre piscine, votre cockpit.</sub></div>
