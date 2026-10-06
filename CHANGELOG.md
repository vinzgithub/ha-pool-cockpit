## Refactor maintenabilité — carte coordination étape 17

- Extraction isolée de `src/interface/carte-coordination.js` depuis l’étape 16 validée.
- Présentation maître/satellite uniquement ; synchronisation, persistance et exécution restent hors du module.
- Comparaison différentielle sur les vrais noms `rc30CoordinationCard` / `renderRc27Section` : 12/12 scénarios strictement identiques.
- Voir `CHANGELOG_REFACTOR_CARTE_COORDINATION_ETAPE17.md`.

## Refactor maintenabilité — carte traitement étape 15

- Extraction isolée de `src/interface/carte-traitement.js` depuis l’étape 14 validée.
- Le module rend uniquement le profil bassin, les produits configurés, les conseils déjà calculés, les actions déjà décidées et les cinq dernières entrées du journal.
- Les calculs de dosage, le mode ponctuel/fabricant, la persistance du profil, le journal backend/local et les événements utilisateur restent dans leurs modules/couches existants.
- Aucun backend Python ni appel Home Assistant n’est modifié.
- Preuve complète : `PREUVE_EQUIVALENCE_CARTE_TRAITEMENT_ETAPE15.md`.

## Refactor maintenabilité — sections repliables étape 14

- Extraction isolée de `src/interface/composants/sections-repliables.js` depuis le template.
- État desktop/mobile, normalisation, classes, attributs ARIA, chevrons et barre globale déplacés sans changement de rendu.
- `window.matchMedia`, `localStorage` et les événements DOM restent dans la façade historique ; le nouveau module est pur et n'accède pas à Home Assistant.
- Comparaison différentielle sur les vrais noms `rc271*` du bundle : 18/18 scénarios strictement identiques, événements et HTML complet inclus.
- Voir `CHANGELOG_REFACTOR_SECTIONS_REPLIABLES_ETAPE14.md`.


## Refactor maintenabilité — thèmes étape 13

- Extraction isolée de `src/interface/themes.js` depuis le template.
- Catalogue `ocean / sky / night` et résolution pure du mode `auto`, sans changement visuel.
- Le navigateur reste lu uniquement dans la façade historique `resolveTheme()` ; le nouveau module n’accède ni à `window`, ni à HA, ni au DOM.
- Comparaison différentielle `resolveTheme` + `THEMES` + HTML complet : 8/8 scénarios strictement identiques.
- Voir `CHANGELOG_REFACTOR_THEMES_ETAPE13.md`.


## Refactor maintenabilité — carte PAC étape 12

- Extraction isolée de `src/interface/carte-pac.js` depuis le template.
- Présentation uniquement : lecture HA, événements, commandes et verrou PAC restent dans leurs couches existantes.
- `src/pac/securite-pac.js` et `src/pac/commandes-pac.js` inchangés octet par octet.
- Comparaison différentielle modèle + présentation + HTML complet : 18/18 scénarios strictement identiques.
- Voir `CHANGELOG_REFACTOR_CARTE_PAC_ETAPE12.md`.
## Refactor maintenabilité — carte filtration étape 11

- Extraction isolée de `src/interface/carte-filtration.js` depuis le template.
- Aucun changement métier : RÈGLE FILT-004 reste dans `src/moteur/filtration.js`.
- Comparaison différentielle objet + HTML : 16/16 scénarios strictement identiques.
- Trois fichiers de tests ajoutés, aucun test existant modifié.
- Voir `CHANGELOG_REFACTOR_CARTE_FILTRATION_ETAPE11.md`.

## v3.0.0 — Refactor maintenabilité étape 9 (candidat)

- Finalisation isolée de `src/interface/assistant-expert/` côté frontend.
- Ajout de `adaptateur-dashboard.js` pour assembler uniquement des résultats déjà calculés.
- Ajout de `etat-popup.js` pour ouverture/fermeture/focus/scroll sans logique métier.
- `assistant-expert.js` existant inchangé octet par octet ; Gemini et backend inchangés.
- Deux anciennes vérifications d'emplacement textuel remplacées par des tests comportementaux sur le vrai bundle.
- Voir `CHANGELOG_REFACTOR_ASSISTANT_EXPERT_ETAPE9.md`.

## v3.0.0 — Refactor maintenabilité étape 7 (candidat)

- Extraction isolée de `src/traitement/produits-dosage.js`.
- Catalogue produits, normalisation des choix, formules de dose et mode ponctuel / protocole fabricant déplacés hors du template.
- Aucun changement de dose, de libellé utilisateur, de seuil, de journal, de filtration, de PAC ou de backend.
- `RÈGLE TRAIT-001` documentée et testée directement.
- Voir `CHANGELOG_REFACTOR_PRODUITS_DOSAGE_ETAPE7.md`.

## v3.0.0 — Refactor maintenabilité étape 4 (candidat)

- Extraction isolée de `src/moteur/saisons.js`.
- Catalogue des profils saisonniers et correspondance saison astronomique → profil déplacés hors du template.
- Aucun changement fonctionnel des profils, plages, libellés ou règles adaptatives.
- `tests/js/rc30_light_profiles.test.cjs` réécrit en tests comportementaux réels.
- Backend Python et compteurs Home Assistant inchangés.
- Voir `CHANGELOG_REFACTOR_SAISONS_ETAPE4.md`.

## v3.0.0 — Refactor maintenabilité étape 3 (candidat)

- Extraction isolée de `src/programmation/prolongation.js`.
- Aucun changement fonctionnel : prolongation one-shot et anti-double-comptage inchangés.
- Backend Python inchangé.
- Voir `CHANGELOG_REFACTOR_PROLONGATION_ETAPE3.md`.
# 3.0.0 — Production

- Promotion sans changement fonctionnel de la référence validée FIX14.5.3.
- Numéro stable de production : `3.0.0`.
- Cache-buster Lovelace : `?v=3.0.0`.
- Tous les moteurs et garde-fous restent ceux de FIX14.5.3.
- Correction de versionnement : la ligne 2.x existait déjà ; cette génération est la ligne 3.x.

# FIX14.5.3

- Mémorise l’état ouvert/fermé des deux volets du profil de traitement : « Produits et dosage de l’étiquette » et « Équilibre, filtre, stock et nouveau contrôle ».
- Conserve cet état pendant les rafraîchissements/re-rendus Home Assistant et après un rechargement du navigateur.
- Aucun changement des dosages, du journal persistant, de la filtration, de l’adaptatif, de la PAC, de Gemini ou de l’Assistant Expert.

# FIX14.5.2

- Ajoute un mode **Ponctuel / urgence** pour les produits complémentaires, actif par défaut.
- Supprime dans ce mode les rappels et boutons hebdomadaires pour l’activateur de brome, Desalgin Classic et Grease Killer.
- Conserve les doses fabricant comme simples repères visibles.
- Conserve le traitement choc au brome si l’eau est déclarée verte ou trouble.
- Le mode **Protocole fabricant** reste disponible par choix explicite pour retrouver les rappels hebdomadaires.
- Aucun changement filtration, adaptatif, PAC, Gemini, Assistant Expert ou journal persistant.

# FIX14.5.1

- Clarifie l’affichage de l’Activateur de brome sans modifier les doses ni la logique.
- Remplace « Entretien hebdomadaire indicatif » par « Protocole fabricant hebdomadaire ».
- Précise que le protocole 100 g/10 m³ est prévu par la notice en complément du brome lent et qu’il ne s’agit pas d’une alerte calculée par le dashboard.
- Conserve le traitement choc 250 g/10 m³ pour les cas prévus par la contre-étiquette.
- Aucun changement filtration, adaptatif, PAC, Gemini, journal ou sécurité.

# FIX14.5

- Confirme la contre-étiquette AXTON pH+ : 100 g/10 m³ pour +0,1 pH.
- Confirme l’Activateur de brome : 100 g/10 m³ hebdomadaire et 250 g/10 m³ en choc.
- Ajoute Bayrol Desalgin Classic (50 ml/10 m³/semaine) et Piscimar Grease Killer (0,75 L/100 m³ initial puis 0,35 L/100 m³/semaine) comme profils optionnels vérifiés.
- Ajoute les garde-fous Grease Killer : désinfectant mesuré et brome ≤ 3 mg/L / chlore ≤ 1,5 mg/L avant proposition, filtration 8 h rappelée.
- Migre le journal des traitements du seul `localStorage` vers un `Store` Home Assistant dédié, avec fusion sans doublon et miroir local de secours.
- Conserve l’export CSV et porte le journal à 500 entrées persistantes.
- Aucun changement du moteur de filtration, de l’adaptatif, de la PAC ou de Gemini.

# FIX14.4.2

- Résilience Gemini ciblée : détails d'erreur sûrs, backoff borné sur erreurs temporaires et verrou anti-double-clic.
- Aucun changement du moteur déterministe, des garde-fous anti-invention, de la PAC ou de la programmation.

# FIX14.4

- Ajout du cadre Gemini optionnel dans l'Assistant Expert.
- Backend Home Assistant uniquement ; secret `GEMINI_API_KEY` jamais exposé au navigateur.
- Contrat JSON construit uniquement depuis le modèle Assistant Expert.
- Garde-fou anti-invention numérique et prescriptif.
- Aucun nouveau `hass.callService`, aucun changement des moteurs déterministes.

# FIX14.3.2 — correction architecturale ciblée

- Supprime les seuils propres de `assistantExpertConclusion()` et réutilise les conclusions existantes.
- Partage une seule recommandation adaptative entre le rendu saisonnier et l’Assistant Expert.
- Distingue saison astronomique et profil de référence.
- Affiche les écarts température / pH / ORP déjà produits par `comparisonRows()`.
- Ajoute le rollback dédié `FIX14.3.x -> FIX14.2`.
- Conserve le correctif FIX14.3.1 de maintien de la popup.
- Aucun changement des moteurs métier FIX14.2 ni du verrou PAC.

# FIX14.3 — Assistant Expert en lecture seule

- Ajoute un accès discret `🧠 Analyse expert` depuis la carte « Conseils intelligents ».
- Ouvre une popup explicative : eau, météo, analyseurs, filtration, traitement, PAC et conclusion.
- Ne modifie aucune règle du moteur FIX14.2.
- Le module `src/interface/assistant-expert/assistant-expert.js` est isolé, commenté en français et sans accès à Home Assistant.
- Aucun appel `callService` / `callWS` dans l'Assistant Expert.

## 2.0.0-rc30.0-pac-polytropic-ux1-fix14.2

- Toute édition manuelle des plages/jours de filtration rend immédiatement la programmation personnalisée prioritaire.
- Ajoute l'état `Programme adaptatif suspendu` qui fige le programme jusqu'à reprise explicite.
- Présente les saisons comme bases horaires indicatives et les durées comme recommandations, non comme règles rigides.
- Utilise un plancher hydraulique d'un renouvellement théorique du bassin.
- Renforce progressivement la recommandation au-dessus de 28 °C et conserve les cas aggravants pouvant recommander 24 h/24.
- Empêche le double comptage entre programme adaptatif et prolongation one-shot.
- Recalcule une prolongation approuvée si le programme permanent change.
- Conserve les tests runtime du verrou PAC de FIX14.1 et `write_enabled = false`.

## 2.0.0-rc30.0-pac-polytropic-ux1-fix14

- Homogénéité des commandes PAC : `Démarrer / Arrêter`, comme la filtration.
- Validation du cadran plus compacte : bouton ✓ dédié, accessible via `aria-label`/`title`, sans doublon de la valeur déjà affichée au centre.
- Aucun changement du moteur PAC, du scheduler, des mappings d’entités ou du verrouillage Modbus.

## 2.0.0-rc30.0-pac-polytropic-ux1-fix12

- Rend le cadran PAC interactif sur la plage 8–32 °C au doigt, à la souris et au clavier.
- La position du curseur et la longueur de l’arc suivent directement la consigne sélectionnée.
- Affiche une coche de validation après modification ; aucune écriture Home Assistant n’est faite avant confirmation.
- Supprime le bloc `− / consigne / +` devenu redondant.
- En simulation, la validation reste locale et n’envoie aucun ordre à la PAC.
- En mode réel, le cadran est prêt à appeler `number.set_value` une fois `write_enabled` déverrouillé après validation de la table Modbus.
- Les rafraîchissements de fond restent différés pendant le déplacement ou tant qu’une consigne est en attente de validation.

## 2.0.0-rc30.0-pac-polytropic-ux1-fix11

- Cadran circulaire PAC avec couleur dynamique selon l’état.
- Température bassin visible au centre du cadran avec la consigne.
- Séparation UX Fonctionnement : Chauffage / Automatique / Froid.
- Séparation UX Régulation : Eco / Smart / Boost.
- Préparation du mapping vers un `select` ESPHome combiné sans adresse Modbus dans le dashboard.
- Écritures toujours verrouillées tant que la table Modbus exacte n’est pas validée.

# Changelog

## 2.0.0-rc30.0-pac-polytropic-ux1-fix11

- Remplace les listes natives restantes par un sélecteur UX cohérent avec le dashboard.
- Empêche un menu ouvert ou une configuration en cours d'être fermé par un rafraîchissement de fond.
- Ajoute le mode double Home Assistant avec rôles Maître / Satellite inversables.
- Neutralise toute exécution automatique des programmations sur le satellite.
- Verrouille les éditeurs horaires du satellite tout en conservant les mappings et les commandes manuelles optionnelles.
- Le maître détecte les changements manuels externes ; pour la pompe ils deviennent un forçage persistant.
- Conserve les écritures PAC Modbus verrouillées.

## 2.0.0-rc30.0-pac-polytropic-ux1-fix11

- Sélecteurs d’entités Home Assistant avec recherche et filtrage par domaine.
- Fin des énormes menus natifs pour les mappings PAC, filtration, éclairage et caméra.
- Sélection persistée sans rendu complet ; interaction protégée des rafraîchissements.

## 2.0.0-rc30.0-light-fix1

- Correction du chargement mobile intermittent : une configuration transitoirement incomplète ne fait plus tomber toute la carte en « Erreur de configuration ».
- Conservation locale de la dernière configuration valide et affichage d’un état de chargement temporaire.

- Ajout de cinq profils de programmation mémorisés : Printemps, Été, Automne, Hivernage actif et Maintenance.
- Chaque profil conserve ses propres jours et plages de filtration.
- Changement de profil uniquement après confirmation explicite.
- Suggestion saisonnière informative uniquement : aucun basculement automatique.
- Texte justificatif court pour chaque profil.
- Détection informative de l’absence de mesures en hivernage.
- Suppression du mode « Automatique sans validation » ; migration vers « Conseillé avec validation ».
- Le moteur de recommandation, les dosages et les règles RC29.2 restent inchangés.

## 2.0.0-rc29.2

- Ajout de la brique informative Mode Location.
- Lecture d’une valeur de configuration ou d’une entité Home Assistant dédiée.
- Aucun effet sur le score et aucun pilotage.

## 2.0.0-rc29.1

- Ajout de la brique PAC informative.
- Lecture d’une entité `pac_entity` ou `heat_pump_entity`.
- Aucun pilotage, aucune écriture et contribution constante de 0 au score.

## 2.0.0-rc28.7 — Brique Redox seule

- Ajout du Redox réel (`aggregate("orp")`) comme entrée optionnelle.
- Seul un Redox bas renforce le score de filtration ; un Redox élevé reste informatif.
- Aucun appel de service, aucune écriture Home Assistant, aucun pilotage.
- Tests unitaires dédiés et maintien de la preuve DOM flag désactivé.

# Changelog

## 2.0.0-rc28.3

- Ajoute une clé stable et unique par appareil dans la configuration générée.
- Permet d’activer ou désactiver séparément plusieurs appareils d’une même famille, notamment deux Blue Connect.
- Migre l’ancien état partagé par famille sans modifier les autres appareils lors du premier changement individuel.
- Ignore un helper `enabled_entity` partagé par erreur entre plusieurs appareils afin d’éviter une commande groupée.
- Conserve sans modification les calculs et le rendu fonctionnel de la RC28.2 CLEAN FIX1.
- Ajoute le rollback direct vers la base stable RC28.2.

## 2.0.0-rc28.2

- Corrige la confiance à 100 % lorsqu’une seule source volontairement activée est récente et complète.
- Réduit la confiance seulement lorsqu’une source activée est ancienne, partielle ou invalide.
- Harmonise les libellés de confiance dans le Hero et la santé générale.
- Adapte la comparaison ORP : 0–100 mV cohérent, 101–200 mV acceptable sans pénalité, 201–300 mV à surveiller, au-delà de 300 mV sondes à vérifier.
- Ignore les comparaisons lorsque les deux relevés sont espacés de plus de 60 minutes.
- Rend la carte de comparaison compacte et informative lorsqu’une seule source est active.
- Affiche la performance réelle ou prévue de filtration directement sous la carte Pompe, en plus de la section dédiée.
- Distingue clairement durée réelle, volume théorique filtré, renouvellements et programme prévu.
- Présente l’entretien hebdomadaire de brome comme indicatif lorsqu’aucune mesure de brome n’est saisie et exige une confirmation explicite avant journalisation.
- Autorise une demande d’analyse sur un appareil désactivé pour les calculs HA Pool.
- Ajoute une temporisation de 90 secondes, la détection d’un nouvel horodatage et le déblocage automatique du bouton d’analyse.
- Ajoute le rollback direct de RC28.2 vers RC28.

## 2.0.0-rc28

- Ajoute le débit nominal StarFlo par défaut de 10 m³/h et le renouvellement théorique calculé.
- Ajoute la section Performance de filtration basée sur l’historique de la pompe.
- Introduit le barème pH progressif adapté au brome, avec zone optimale 7,20–7,50.
- Permet l’activation indépendante de Flipr et Blue Connect, avec exclusion des données anciennes.
- Calcule la moyenne des seules sources actives et valides.
- Harmonise la section Mes appareils de mesure avec les autres sections repliables.
- Ajoute l’état du filtre calculé et le seuil automatique pression propre + 0,30 bar.
- Renomme Débit nominal, Seuil de contre-lavage et Délai avant nouveau contrôle.

## 2.0.0-rc27

- Ajoute un centre « Pilotage & actions » avec les trois priorités du jour, le délai avant nouvelle mesure, le stock, l’entretien et la qualité des mesures.
- Installe une intégration Home Assistant locale qui conserve et exécute les programmes sans navigateur ouvert.
- Permet de choisir les entités de la pompe, de l’éclairage, des capteurs Shelly de puissance/énergie et de la caméra.
- Ajoute les modes Arrêt, Manuel, Programme et Automatique conseillé pour la pompe.
- Gère jusqu’à trois plages horaires par équipement, les jours de la semaine et le passage à minuit.
- Compare la durée programmée à la durée recommandée et prolonge la dernière plage en mode automatique lorsque le contexte le demande.
- Ajoute les boosts filtration de 1, 2 ou 4 heures et les dérogations manuelles valables jusqu’à la prochaine borne du programme.
- Ajoute un programme d’éclairage indépendant avec extinction automatique.
- Affiche la puissance instantanée, l’énergie cumulée, l’état courant et l’heure du prochain changement.
- Ajoute un aperçu de la caméra, les notifications Home Assistant, l’historique des commandes et l’export CSV.

## 2.0.0-rc26.2

- Corrige l’affichage vertical de « Dernière action » après validation d’un bouton bleu dans « Conseil calculé ».
- Neutralise la largeur globale de 100 % sur le bouton « Annuler » et réserve une largeur stable au texte du journal.
- Mémorise les champs texte et numériques pendant la saisie, avant qu’un rafraîchissement Home Assistant puisse les remplacer.
- Ajoute un bouton « Réinitialiser le profil » avec confirmation.
- Restaure les valeurs initiales du profil sans supprimer le journal des actions.

## 2.0.0-rc26.1

- Corrige le bas tronqué des cartes « Informations utiles » lorsque les détails de vigilance météo sont ouverts.
- Remplace la hauteur desktop fixe de 300 px par une hauteur automatique avec un minimum commun de 300 px.
- Autorise Météo, Conseils, Historique et Comparaison à s’agrandir selon leur contenu.
- Ne modifie ni le Hero, ni le fond, ni les couleurs, ni les calculs de traitement et de filtration de la RC26.

## 2.0.0-rc26

- Détecte les entités de vigilance météo disponibles et permet de choisir le capteur départemental dans les préférences.
- Affiche les vigilances actives dans une bannière au-dessus du Hero, dans la carte météo et via un lien vers la carte officielle Météo-France.
- Ajoute des conseils contextualisés pour les principaux phénomènes de vigilance sans imposer une filtration permanente pour une simple alerte jaune.
- Remplace le conseil automatique « eau > 28 °C = 24 h/24 » par la règle température ÷ 2, complétée par un minimum hydraulique lorsque le débit de pompe est renseigné.
- Réserve la filtration 24 h/24 aux situations aggravantes : eau trouble ou verte, pollution, désinfectant bas avec eau chaude, canicule orange/rouge avec eau chaude ou risque de gel d’un bassin actif.
- Exige deux mesures manuelles consécutives avant de proposer un changement d’un seul cran du brominateur/chlorinateur.
- Bloque les doses répétées pendant le délai de nouvelle mesure configuré, sauf analyse ou mesure plus récente.
- Ajoute les réglages TAC, TH, type et pression du filtre, stock de désinfectant, fréquentation et mode du bassin.
- Étend le journal à 60 actions et ajoute les rappels de paniers, préfiltre, ligne d’eau et filtre.
- Fournit un mode d’emploi complet pour l’installation, la météo, les dosages et l’entretien.

## 2.0.0-rc25

- Ajoute AXTON pH+ poudre à 100 g / 10 m³, avec le palier de +0,1 explicitement signalé comme restant à confirmer sur la contre-étiquette.
- Ajoute AXTON pH− liquide 14 % à 300 ml / 10 m³ par palier de -0,1.
- Calcule respectivement 160 g et 480 ml pour un bassin de 16 m³.
- Sépare strictement les unités grammes et millilitres dans les conseils et le journal.
- Indique que le pH− liquide AXTON est prêt à l'emploi, ne doit jamais être dilué et doit être injecté par pompe doseuse.
- Étend les produits personnalisés avec une unité sélectionnable sans modifier le Hero ni les sections existantes.

## 2.0.0-rc24

- Ajoute une section responsive « Traitement & dosage » après la santé générale.
- Enregistre le volume, le traitement chlore/brome, le modèle et le réglage du doseur ainsi que la mesure manuelle du désinfectant.
- Fournit des profils AstralPool Dossi-3, Hayward CL200/CL220 et Pentair Rainbow 300/320, avec échelle de réglage personnalisable.
- Intègre les dosages vérifiés Bayrol pH-Plus/pH-Minus et Sunval Activateur de brome.
- Calcule pour 16 m³ les doses Sunval de 160 g en entretien et 400 g en traitement choc.
- Bloque le traitement choc lorsque le pH n'est pas dans la plage prévue par l'étiquette et ne modifie jamais le doseur depuis l'ORP seul.
- Limite les propositions du doseur à un cran, exige une mesure chlore/brome et affiche le niveau de fiabilité du conseil.
- Ajoute la durée de filtration conseillée selon la température et un journal local annulable des actions déclarées.
- Relie le nouveau module aux cartes « Conseils intelligents » et « Préférences » sans modifier le Hero, le fond ni la palette.

## 2.0.0-rc23

- Compacte les cartes appareils desktop en supprimant la réserve verticale résiduelle entre les jauges et le statut Bluetooth.
- Stabilise les cartes « Évolutions · 24 heures » autour de 310 px sur grand écran tout en laissant le SVG occuper toute la zone de tracé.
- Aligne les quatre cartes « Informations utiles » sur une base commune de 300 px, avec expansion naturelle des conseils ouverts.
- Sécurise les valeurs techniques longues sur mobile, notamment la conductivité.
- Réduit les graphiques mobile tout en conservant une zone de courbe dédiée de 110 à 118 px.
- Ramène le détail du score et la santé générale à des hauteurs mobiles plus compactes.
- Ajoute une marge basse compatible avec les zones sûres sous les boutons d’analyse mobile.
- Ne modifie ni le Hero, ni le fond, ni les couleurs, ni la transparence établie en RC22.

## 2.0.0-rc22

- Conserve strictement le Hero, le fond desktop et les couleurs actuelles.
- Maintient les cartes appareils en hauteur automatique tout en resserrant légèrement leur rythme interne.
- Fixe les cartes « Évolutions · 24 heures » entre 300 et 320 px sur desktop.
- Étend réellement le SVG des courbes à toute la zone disponible et supprime l’espace vide sous les graphiques.
- Harmonise les quatre cartes « Informations utiles » autour d’une hauteur compacte commune, sans bloquer l’expansion des conseils.
- Applique sur mobile le verre demandé (opacité 0,76/0,70, flou 14 px, saturation 120 %).
- Uniformise l’espacement du statut Bluetooth/analyse avec les blocs batterie, Bluetooth et dernière analyse.

## 2.0.0-rc22

- Corrige le numéro de version après la RC19 déjà publiée.
- Conserve strictement le fond et le Hero desktop.
- Empêche les cartes « Informations utiles » desktop de prendre la hauteur de la carte Conseils.
- Contient définitivement les boutons d’analyse dans les cartes appareils.
- Rend le mode compact mobile réellement perceptible.
- Réduit la hauteur des cartes appareils, résumé, score et santé sur smartphone.
- Renforce la lisibilité des courbes et compacte les graphiques mobile.
- Rend les cartes mobiles plus transparentes afin de mieux voir la scène de piscine.
- Utilise un calque de fond mobile lié au viewport pour éviter l’étirement vertical de l’image.
- Traduit et normalise les états Bluetooth `waiting`, `ready` et `idle` en « En attente ».
- Remplace le libellé historique spécifique aux marques par une synthèse générique du nombre d’appareils.

## 2.0.0-rc19

- Finition visuelle desktop et mobile sans modification du fond.
- Cartes plus transparentes et effet verre renforcé.
- Hero mobile compacté et bouton d’analyse générale conservé.
- Cartes appareils densifiées ; bouton d’analyse contenu dans la carte.
- Blocs batterie, Bluetooth et statut d’analyse plus compacts.
- Courbes 24 h plus lumineuses et plus lisibles.
- Résumé, détail du score, santé générale et informations utiles compactés.
- Préférences resserrées sur mobile.
- État technique `waiting` traduit en « En attente ».
- Micro-interactions tactiles sur les boutons.

Le fond et son cadrage restent inchangés.

## 2.0.0-rc28.4 — Étape 1b

- Fusion du moteur expérimental « Eau + Météo » dans `src/intelligence/eau-meteo/`.
- Ajout du feature flag `moteurEauMeteoV1`, désactivé par défaut.
- Ajout des tests unitaires du moteur dans le dépôt principal.
- Aucun raccordement à l’interface, à Home Assistant ou au bundle distribué.
- `frontend/dist/pool-dashboard.js` est conservé strictement à l’identique de la RC28.3.

## 2.0.0-rc28.5 — Étape 3

- Connexion temps réel du moteur Eau + Météo aux données Home Assistant.
- Ajout d’un adaptateur HA et d’un contrôleur sans DOM ni appel de service.
- Affichage des données utilisées, de l’heure du calcul et de la version draft.
- Couverture absente explicitement marquée inconnue et non applicable.
- Tests des capteurs absents/unknown/unavailable, vigilances et absence de `hass.callService()`.

## 2.0.0-rc28.9
- Ajout de la brique informative « heures creuses ».
- Configuration par installation, sans valeur globale imposée.
- Aucun effet sur le score et aucun pilotage automatique.

## 2.0.0-rc29.0

- Ajout de la détection informative des saisons météorologiques françaises.
- Aucun impact sur le score, la recommandation ou la filtration.
- Affichage explicatif dans le composant expérimental.

## Refactor maintenabilité — étape 2 : priorités de programmation

- Extraction isolée de `src/programmation/priorites.js`.
- Aucun changement fonctionnel ; base de comparaison : candidat étape 1 validé.
- `manual_override_priority.test.cjs` converti en test comportemental réel comme
  demandé par le cahier des charges.
- Preuve complète : `PREUVE_EQUIVALENCE_PRIORITES_ETAPE2.md`.


## Refactor maintenabilité — étape 5 : sécurité PAC

- Extraction isolée de `src/pac/securite-pac.js` depuis l'étape 4 validée.
- `write_enabled` reste forcé à `false` sans condition à chaque normalisation.
- Aucun déplacement des commandes PAC, aucun changement de table Modbus ou de
  comportement Home Assistant.
- Renforcement du test-piège comportemental sur marche/arrêt, consigne et mode.
- Preuve complète : `PREUVE_EQUIVALENCE_SECURITE_PAC_ETAPE5.md`.


## Refactor maintenabilité — étape 6 : commandes PAC

- Extraction isolée de `src/pac/commandes-pac.js` depuis l'étape 5 validée.
- Préparation pure marche/arrêt, consigne, mode et calculs du cadran.
- `src/pac/securite-pac.js` et le backend Home Assistant restent inchangés.
- Deux assertions d'implémentation PAC sont remplacées par des tests
  comportementaux réels couvrant cadran, consigne et sélection de mode.
- Preuve complète : `PREUVE_EQUIVALENCE_COMMANDES_PAC_ETAPE6.md`.


## Refactor maintenabilité — étape 8 : journal de traitement

- Extraction isolée de `src/traitement/journal.js` depuis l'étape 7 validée.
- Déplacement du miroir `localStorage`, de la clé de déduplication, de la fusion
  chronologique et de la préparation des drapeaux backend/local.
- Les appels WebSocket `get_treatment_history` / `save_treatment_history` restent
  dans la couche d'intégration historique ; le module extrait ne connaît pas HA.
- `home_assistant/.../treatment_journal.py` et tout le backend restent inchangés.
- Preuve complète : `PREUVE_EQUIVALENCE_JOURNAL_ETAPE8.md`.

## Refactor maintenabilité — étape 10 : interface Gemini

- Extraction isolée du contrôleur frontend Gemini dans `src/interface/gemini/controleur-gemini.js` depuis l'étape 9 validée.
- `src/interface/gemini/gemini-reformulation.js`, `gemini_backend.py` et `gemini_guardrails.py` restent inchangés octet par octet.
- Le WebSocket `ha_pool_dashboard/gemini_rewrite`, le verrou anti-concurrence et le rejet des réponses obsolètes conservent exactement leur comportement.
- Tests renforcés par un getter-piège `callService`, quatre tests unitaires directs et une comparaison différentielle étape 9 / étape 10.
- Preuve complète : `PREUVE_EQUIVALENCE_GEMINI_ETAPE10.md`.

## Refactor maintenabilité — étape 16 : carte capteurs

- Extraction isolée de `src/interface/carte-capteurs.js` depuis l'étape 15 validée.
- Présentation pure des cartes d'appareils et de la section « Mes appareils de mesure ».
- Les lectures HA, la fraîcheur, les anomalies, l'agrégation et les actions restent dans les couches historiques.
- Preuve complète : `PREUVE_EQUIVALENCE_CARTE_CAPTEURS_ETAPE16.md`.


## Refactor maintenabilité — étape 18 : programme adaptatif

- Extraction isolée de `src/programmation/programme-adaptatif.js` depuis l’étape 17 validée.
- Centralisation pure des primitives horaires et du calcul de recommandation adaptative.
- Les lectures HA restent dans la façade `rc30AdaptiveRecommendation()` ; priorités, suspension, prolongation et actions utilisateur restent inchangées.
- Preuve complète : `PREUVE_EQUIVALENCE_PROGRAMME_ADAPTATIF_ETAPE18.md`.

## Refactor maintenabilité — étape 19 : carte programmation

- Extraction isolée de `src/interface/carte-programmation.js` depuis l’étape 18 validée.
- Présentation pure des éditeurs pompe/éclairage et de la carte de profil saisonnier.
- `src/programmation/programme-adaptatif.js`, `priorites.js`, `prolongation.js`, les actions utilisateur et le backend restent inchangés.
- Le premier test historique `entity_picker_ux.test.cjs` devient comportemental pour les sélecteurs déplacés ; la vérification caméra restant dans le template est conservée.
- Preuve complète : `PREUVE_EQUIVALENCE_CARTE_PROGRAMMATION_ETAPE19.md`.
