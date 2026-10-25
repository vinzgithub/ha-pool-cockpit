# Pool Cockpit V4.2.1 — correction météo (PR non publiée)

Le bandeau de vigilance météo est rendu une seule fois directement dans la coquille V4, avant la navigation, sur les six onglets. Le bandeau historique V3 n'est plus injecté, et le déplacement DOM du wrapper est supprimé. Les niveaux jaune/orange/rouge, phénomènes, localisation, lien officiel et détail météo restent issus du même modèle. Le bouton « Voir les conseils » ouvre Conseils et le détail météo. CSS mobile compact.

Le grand espace observé ponctuellement sur Conseils mobile n'a pas été reproduit à l'identique ; sa cause demeure incertaine.

Pas de modification des algorithmes, réglages utilisateur, automatisations ou backend. Un seul bundle : release/v4.2.1/pool-cockpit.js. V4.2.0 et son tag inchangés. Les anciens résultats rapportés (472 npm, 65 Python, 708 Chromium) restent historiques tant qu'ils ne sont pas reproduits. Pas de tests Safari/iOS ni Home Assistant réel. Aucune release ni fusion ni déploiement sans validation.
