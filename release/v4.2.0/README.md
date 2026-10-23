# Pool Cockpit V4.2.0 — Installation et mise à jour

La V4.2.0 réunit le moteur et la Démonstration dans **un seul fichier JavaScript**. Elle conserve les réglages, capteurs, équipements et le backend Home Assistant. Pour une installation neuve, utilisez l'installateur V4.2.0 ; pour une V4.1.0 existante, suivez la mise à jour manuelle ci-dessous.

## Installation neuve V4.2.0

La V4.2.0 peut être installée directement depuis le dépôt GitHub sur une configuration Home Assistant Core / Docker compatible, sans installer d'abord la V4.1.0. L'installateur copie le frontend unifié, le backend et les ressources graphiques ; une seule ressource Lovelace est déclarée.

```bash
git clone https://github.com/vinzgithub/ha-pool-cockpit.git
cd ha-pool-cockpit
python3 install_v42.py --config /chemin/vers/homeassistant/config --dry-run
python3 install_v42.py --config /chemin/vers/homeassistant/config --yes
```

L'outil exige un accès au véritable dossier `configuration.yaml`. Il refuse toute installation Pool Cockpit préexistante ou configuration Lovelace incompatible. Sauvegarder Home Assistant et vérifier la configuration avant le redémarrage manuel.

## Mise à jour depuis V4.1.0

1. Sauvegarder la configuration du dashboard et la liste des ressources Lovelace. Garder les anciens fichiers sur disque.
2. Télécharger `pool-cockpit.js` depuis [la version V4.2.0](https://github.com/vinzgithub/ha-pool-cockpit/releases/tag/v4.2.0) et le copier dans `<config>/www/ha-pool-dashboard/pool-cockpit.js`.
3. Déclarer **Module JavaScript** : `/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.0`, sans retirer immédiatement les ressources existantes.
4. Dans le dashboard V4.1, modifier **une seule ligne** : `type: custom:pool-cockpit-dual-mode-card` en `type: custom:pool-cockpit-card`. Conserver tous les paramètres.
5. Recharger le navigateur, vérifier le mode Réel et la Démonstration.
6. Seulement après validation, supprimer les deux anciennes ressources JS : `pool-dashboard-v4-rc8-2.js` et `pool-cockpit-dual-mode-card.js`. **Conserver la ressource V3** si utilisée.

La ressource finale est `/local/ha-pool-dashboard/pool-cockpit.js?v=4.2.0`, carte `custom:pool-cockpit-card`.

## Revenir à la V4.1.0

Restaurer le type de carte `custom:pool-cockpit-dual-mode-card` et réactiver les deux anciennes ressources. Aucun changement de backend n'est nécessaire.

## Compatibilité

Le bundle public ne porte plus de nom RC ou TEST. Les identifiants historiques internes `rc...`, classes CSS et clés de stockage sont conservés afin de ne pas casser les configurations. Les tests ciblés de construction et de syntaxe sont automatisés. Cette mise à jour a été essayée sur une installation réelle à Épinay (piscine réelle et Démonstration).
