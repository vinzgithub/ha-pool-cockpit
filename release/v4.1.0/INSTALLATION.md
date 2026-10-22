# Pool Cockpit V4.1.0 — Installation du complément Réel / Démonstration

**Type de livraison : complément frontal pour Pool Cockpit V4 existant**, et non installateur autonome Home Assistant. Il ne contient ni le moteur de base, ni le composant backend. Pour une nouvelle installation, installer d'abord la version V4.0.0 depuis le dépôt public avec sa procédure documentée (`install_v4.py`), puis installer ce complément.

## Prérequis
- Home Assistant avec Pool Cockpit V4.0.0 opérationnel, utilisant le moteur qui enregistre `custom:pool-dashboard-v4-test-card` (bundle V4 RC8.2 fourni avec la V4.0.0 publique).
- Accès à `/config/www` (ou au dossier `www` correspondant sur l'hôte).
- Sauvegarde du tableau de bord Lovelace et de ses ressources.
- Un navigateur récent.

## Vérification de l'archive
Extraire `pool-cockpit-v4.1.0.zip`, puis lancer `sha256sum -c SHA256SUMS` depuis la racine extraite. Vérifier également `pool-cockpit-v4.1.0.zip.sha256` téléchargé à côté de l'archive.

## Installation manuelle, en complément de V4
1. Sauvegarder le dashboard Lovelace, ses ressources et le fichier de configuration utilisé. Ne pas copier `secrets.yaml` vers GitHub.
2. Conserver **sans modification** la ressource JavaScript V4 de base et son backend.
3. Copier `release/v4.1.0/pool-cockpit-dual-mode-card.js` de l'archive dans `/config/www/ha-pool-dashboard/pool-cockpit-dual-mode-card.js`.
4. Copier `release/v4.1.0/assets/demo-pool-camera.jpg` dans `/config/www/ha-pool-dashboard/assets/demo-pool-camera.jpg`.
5. Déclarer la ressource ci-dessous **après la ressource V4 existante**, une seule fois :

```yaml
url: /local/ha-pool-dashboard/pool-cockpit-dual-mode-card.js?v=4.1.0
type: module
```

6. Dans la configuration Lovelace de la carte V4 existante, conserver toutes les options réelles (appareils, entités, identifiant du bassin) et remplacer **seulement** le type de carte :

```yaml
type: custom:pool-cockpit-dual-mode-card
visual_theme: ocean
language: fr
# Conserver toutes les autres options déjà configurées.
```

Le mode **Réel** est le mode initial par défaut et conserve les interactions avec Home Assistant. La bascule vers Démonstration utilise des valeurs et commandes fictives isolées.

### Démonstration autonome
Dans une nouvelle vue Lovelace :

```yaml
type: custom:pool-cockpit-v4-demo-card
visual_theme: ocean
language: fr
```

Une caméra fictive est affichée. **Aucun flux vidéo réel ni commande réelle n'est utilisé dans la Démo.**

## Vérifications recommandées
- Contrôler les six onglets, la navigation Océan et le bandeau météo lorsqu'une entité de vigilance est configurée.
- Vérifier la séparation Réel / Démo et le retour en mode Réel.
- Le planning de démonstration utilise 07 h–14 h et 15 h–22 h, soit 14 h fictives. Les conseils du moteur restent indicatifs.
- L'enveloppe V4.1 propose des libellés français/anglais ; les autres langues du moteur V4 peuvent utiliser un repli français pour l'enveloppe.
- Tester sur une installation de recette avant d'adopter le complément sur des équipements réels.

## Retour arrière
Restaurer le type de carte précédent `custom:pool-dashboard-v4-test-card` et la configuration Lovelace sauvegardée. Retirer **uniquement** la ressource V4.1 nouvellement déclarée. Ne pas supprimer le bundle V4 de base ni son backend.

Licence : consulter `LICENSE` dans l'archive.
