# Pool Cockpit V4.2.1 — installation, mise à jour et retour arrière

V4.2.1 corrige la visibilité des vigilances Météo-France, l'ouverture de leurs conseils et la barre Réel/Démo sur mobile. **Seul le frontend `pool-cockpit.js` change** par rapport à V4.2.0 : aucun changement du backend, des entités, des services, de la carte Lovelace ou des données enregistrées.

## Installation neuve (Home Assistant Core / Docker)

Sur une machine ayant accès en lecture et écriture au véritable dossier de configuration Home Assistant, réaliser une sauvegarde complète, puis :

```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
python3 install_v421.py --config /chemin/vers/homeassistant/config --dry-run
python3 install_v421.py --config /chemin/vers/homeassistant/config --yes
```

L'installateur de première installation refuse un système Pool Cockpit existant, une configuration Lovelace déjà déclarée ou des liens symboliques aux emplacements sensibles. Il ne prend **pas** en charge `--upgrade`. Contrôler la configuration Home Assistant, puis redémarrer manuellement si nécessaire.

## Mise à jour manuelle V4.2.0 → V4.2.1

**Ne pas lancer l'installateur sur une installation existante.** V4.2.0 et V4.2.1 déclarent toutes deux `custom:pool-cockpit-card` : elles ne doivent pas être chargées simultanément dans un même frontend Home Assistant.

1. Faire une **sauvegarde Home Assistant complète**. Noter l'URL actuelle de la ressource JavaScript et conserver la configuration Lovelace.
2. Récupérer `pool-cockpit.js` et `pool-cockpit.js.sha256` dans les fichiers joints à la [release v4.2.1](https://github.com/vinzgithub/ha-pool-cockpit/releases/tag/v4.2.1), lorsqu'elle est publiée. Dans le répertoire contenant **les deux** fichiers, lancer :

   ```bash
   sha256sum -c pool-cockpit.js.sha256
   ```

   Empreinte SHA256 attendue du JavaScript : `5080ca2c2f399a3470b7f38e75133737b520564e33cc6c407f8e8f06e44b03ac`.
3. Conserver l'ancien fichier **hors de `www/`** (remplacer `<config>` par le bon dossier) :

   ```bash
   mkdir -p <config>/.pool_cockpit_backups
   cp <config>/www/ha-pool-dashboard/pool-cockpit.js <config>/.pool_cockpit_backups/pool-cockpit-4.2.0.js
   ```

4. Remplacer **d'abord** `<config>/www/ha-pool-dashboard/pool-cockpit.js` par le nouveau fichier vérifié. Conserver le même nom.
5. Modifier **ensuite** l'URL de **l'unique ressource JavaScript** de `/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.0` vers `/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.1`.
   - Ressource déclarée dans l'interface : Paramètres → Tableaux de bord → menu ⋮ → Ressources (mode avancé requis).
   - Ressource déclarée dans `configuration.yaml` avec `resource_mode: yaml` : modifier `url:`, vérifier la configuration Home Assistant, puis redémarrer Home Assistant pour prendre en compte la déclaration.
6. Forcer le rechargement du navigateur et vider le cache du frontend dans l'application Compagnon si nécessaire, puis relancer l'application.
7. Vérifier le mode Réel, le mode Démonstration, l'affichage du bandeau, « Voir les conseils » et les sept vues. Vérifier aussi la version V4.2.1 dans la console du navigateur.

**Important :** ne jamais changer l'URL avant de remplacer le fichier, sous peine de mettre en cache l'ancien code sous `?v=4.2.1`. Ne pas modifier `custom:pool-cockpit-card`, les intégrations, le backend ou les paramètres.

## Retour arrière vers V4.2.0

1. Remettre `<config>/.pool_cockpit_backups/pool-cockpit-4.2.0.js` dans `<config>/www/ha-pool-dashboard/pool-cockpit.js`.
2. Remplacer la seule URL de ressource par `/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.0-r1` : le suffixe neuf évite de réutiliser un contenu mis en cache.
3. Si la ressource est gérée dans `configuration.yaml`, vérifier la configuration puis redémarrer Home Assistant. Vider/recharger le cache du navigateur ou de l'application.
4. Confirmer la version V4.2.0 dans la console du navigateur et le bon affichage en modes Réel et Démo.

Aucune migration de données n'est effectuée entre ces versions : réglages, programmes, préférences et automatismes sont conservés.

## Limite connue : Planning / Configuration

Sur les onglets Planning et Configuration, une vigilance qui apparaît ou disparaît peut rester non actualisée jusqu'au changement d'onglet. Ce comportement existait déjà en V4.2.0 ; il est suivi dans le [ticket #12 — V4.2.2](https://github.com/vinzgithub/ha-pool-cockpit/issues/12).

Les essais Safari/iOS, Android et application Compagnon dans Home Assistant réel doivent être réalisés **avant tout déploiement de production**. Conserver le fichier V4.2.0 et la procédure de retour arrière à disposition.
