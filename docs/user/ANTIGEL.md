# Antigel et hivernage actif — guide Home Assistant

Ce guide est générique : il ne dépend d'aucune marque, adresse, nom d'appareil ou installation personnelle. **La surveillance antigel est désactivée par défaut.** Elle ne remplace pas un coffret hors-gel autonome, ni une protection de pompe contre le fonctionnement à sec.

## Avant d'activer

1. Vérifier que le circuit est **en eau**, que la pompe peut fonctionner même si la PAC est hivernée ou isolée, et que vannes et canalisations peuvent réellement faire circuler l'eau.
2. Vérifier que l'entité commandant la filtration pilote **la bonne pompe**, depuis l'instance Home Assistant autorisée (maître en configuration multi-instance).
3. Installer une **sonde locale extérieure** représentative des parties hydrauliques susceptibles de geler, idéalement à l'ombre, ventilée et à proximité des canalisations.
4. Contrôler la **fraîcheur réelle des mesures** et la disponibilité de Home Assistant, du réseau et de l'alimentation. La température d'une prévision météo distante ne suffit pas.
5. Si disponibles, raccorder un contact de **marche à sec** et un détecteur de **débit réel**, pas un simple disjoncteur. L'absence de ces capteurs limite fortement la vérification de sécurité.

## Choisir les entités dans Home Assistant

Dans **Outils de développement → États**, rechercher la température extérieure locale et copier son identifiant, par exemple `sensor.terrasse_temperature` (exemple fictif ; remplacer par une véritable entité).

L'antigel V4.3 attend aussi une date d'acquisition récente, soit :
- un attribut de la sonde `measurement_timestamp`, `last_measurement` ou `last_sample` contenant une date ISO 8601 ;
- soit une entité distincte `sensor.*` dont **l'état** contient la date d'acquisition réelle du même capteur, au format ISO 8601 (par exemple `2026-11-22T09:42:32+00:00`).

**Attention aux horodatages Home Assistant.** `last_changed`, `last_updated` et `last_reported` décrivent les événements reçus ou traités par Home Assistant. Ils ne garantissent pas l'instant de mesure dans le matériel. Une intégration peut republier une température ancienne ; un modèle actualisé chaque minute peut alors donner une fausse impression de fraîcheur. Il ne faut **jamais** fabriquer la date avec `now()`, un déclencheur périodique ou le dernier rechargement de l'entité : cela contourne la protection contre les données périmées.

Une entité de date créée à partir de `last_reported` ne doit être utilisée pour la protection antigel qu'après vérification explicite de la sémantique de l'intégration et tests de perte de liaison/rejeu de valeurs. Préférer l'horodatage d'acquisition natif du périphérique, ou une protection antigel indépendante si cette fiabilité n'est pas démontrée.

## Renseigner Pool Cockpit

Dans **Planning → Paramètres d'hivernage → configurer et confirmer** :

| Champ | Exemple / signification |
| --- | --- |
| Mode | **Hivernage actif** si le circuit est prêt |
| Base hivernale | Durée quotidienne **à choisir pour son bassin** (4 h/j est un exemple, pas une règle universelle) |
| Départ nocturne | Exemple : `02:00` |
| Pompe de filtration | **En service** uniquement si elle peut fonctionner en sécurité |
| PAC / sondes retirées | **Hiverné** si elles sont physiquement arrêtées ou retirées |
| Capteur local antigel | Identifiant réel `sensor.*` de température extérieure |
| Date du dernier échantillon | Identifiant réel `sensor.*` contenant l'acquisition de **cette même sonde** |
| Entrée / sortie | Valeurs initiales proposées : **3 °C / 5 °C**, adaptées à l'installation |
| Temporisation entrée / sortie | Par défaut **60 s / 600 s** |
| Maintien minimal | Par défaut **900 s** |
| Âge maximal du capteur | Par défaut **15 min** |
| Verrou marche à sec | Facultatif techniquement ; `binary_sensor.*` réellement relié au circuit, état `on` = interdiction |
| Débit confirmé | Facultatif techniquement ; `binary_sensor.*` réel, état `on` = circulation détectée |

**Ne pas copier les identifiants de cet exemple** : ils ne désignent pas vos appareils. Ne jamais réutiliser la date d'une sonde différente.

Après vérification, cocher **Activer la surveillance antigel**, puis **Vérifier et confirmer les changements**. Cette confirmation peut entraîner des commandes de la véritable pompe, même si le tableau de bord s'appelle « test ».

## Comprendre ce qui se passe

- À la baisse sous le seuil d'entrée pendant la temporisation, une **demande** de circulation antigel peut apparaître, même hors de la plage quotidienne.
- Une **marche observée** signifie que Home Assistant lit l'état de la pompe à `on` ; elle **ne prouve pas le débit** sans capteur hydraulique indépendant.
- Au-dessus du seuil de sortie et après les délais configurés, la demande est levée. Le programme de filtration habituel continue à s'appliquer.
- En cas d'échantillon périmé ou incohérent, Pool Cockpit déclare la protection **non confirmée**. Il ne faut pas considérer l'absence d'alerte comme une garantie de sécurité.

## Historique et notifications

Dans **Planning → Historique antigel**, consulter les **30 événements les plus récents** (l'historique interne retient au plus **200 événements**), notamment : demande antigel, fin de demande, marche de pompe confirmée par Home Assistant, alerte critique ou retour à la normale. Les événements sont conservés dans le stockage de Pool Cockpit, et sont distincts de la courbe de fonctionnement de la pompe.

Les événements de **début et fin de demande antigel** génèrent une notification, de même que les **anomalies de protection**. Une notification de début ne signifie pas que le débit a été établi. Les notifications suivent le service `notify` déjà configuré dans Pool Cockpit ; en l'absence de service, elles sont créées dans les notifications persistantes Home Assistant. Vérifier l'acheminement au téléphone si une alerte mobile est souhaitée. Les transitions sont dédupliquées pour éviter le spam à chaque cycle.

## Vérifier sans risquer la pompe

Tester en premier sur une **instance de recette avec pompe virtuelle et sonde virtuelle**. Vérifier seuils, temporisations, alertes, historique, notifications, absence de démarrage lorsque le circuit est bloqué, et perte de sonde. Ne pas falsifier une sonde ou une température d'une **piscine réelle** pour déclencher la filtration.

En production, vérifier après activation l'état de la sonde, la programmation appliquée, la marche observée et, idéalement, la circulation. En cas de perte d'alimentation, de Home Assistant, du réseau, de commande, de retour pompe ou de débit, la protection logicielle peut être inefficace. Prévoir une **protection hors-gel matérielle autonome** conformément aux prescriptions du fabricant.
