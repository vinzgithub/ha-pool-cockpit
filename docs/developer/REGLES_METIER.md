# Règles métier — HA Pool Dashboard

Ce document rend explicites les règles métier déjà validées du projet.
Il est maintenu à jour au fil des évolutions sans modifier les comportements
fonctionnels garantis par la version publique v3.0.0.

## RÈGLE FILT-004 — Recommandation indicative

La durée calculée par le moteur de filtration est un **repère indicatif**. Elle ne
constitue jamais une commande obligatoire et le moteur ne pilote aucun équipement.

Implémentation actuelle :

- `src/moteur/filtration.js` : calcul des repères de base ;
- `frontend/pool-dashboard.template.js`, `rc24TreatmentModel()` : formulation de
  la recommandation et renforcements historiques ;
- `src/programmation/programme-adaptatif.js` : transforme cette durée déjà
  recommandée en plages adaptatives indicatives sans décider de leur priorité ;
- `src/interface/carte-programmation.js` : affiche la recommandation déjà calculée comme repère indicatif, sans la recalculer ni l'appliquer ;
- `frontend/pool-dashboard.template.js`, cartes de filtration : affichage.

Test direct : `tests/unitaires/filtration.test.mjs`.

## RÈGLE FILT-005 — Prolongation one-shot

Une prolongation ponctuelle ne modifie jamais la programmation permanente et
expire selon le mécanisme existant.

Implémentation actuelle :

- `home_assistant/custom_components/ha_pool_dashboard/schedule_utils.py` ;
- `home_assistant/custom_components/ha_pool_dashboard/scheduler.py` ;
- `src/programmation/prolongation.js`, `lireProlongationPonctuelle()` pour la lecture front sans effet de bord ;
- `frontend/pool-dashboard.template.js` conserve l’action utilisateur et l’appel backend.

La lecture frontend est séparée de la persistance et de l’exécution,
qui restent gérées par le backend.

## RÈGLE FILT-006 — Anti-double-comptage

Si le programme adaptatif couvre déjà la durée recommandée, aucune prolongation
supplémentaire ne doit être ajoutée.

Implémentation actuelle :

- `home_assistant/custom_components/ha_pool_dashboard/schedule_utils.py`, fonction
  `reconcile_extension()` ;
- `src/programmation/prolongation.js`, `calculerHeuresManquantesPourProlongation()` ;
- `frontend/pool-dashboard.template.js` utilise le résultat pur pour le rendu.

Le backend reste la source d’autorité ; le front reproduit strictement le même anti-double-comptage pour sa présentation.


## RÈGLE GEMINI-001 — Clé API exclusivement côté backend

La clé API Gemini n'est jamais présente dans le navigateur. Le frontend transmet
uniquement le payload déterministe via le WebSocket Home Assistant
`ha_pool_dashboard/gemini_rewrite`; l'appel HTTP vers Google et la clé restent
dans `gemini_backend.py`.

Implémentation actuelle :

- `src/interface/gemini/gemini-reformulation.js` construit le payload depuis le
  modèle Assistant Expert déjà calculé ;
- `src/interface/gemini/controleur-gemini.js` gère l'appel WebSocket, la
  concurrence et l'état d'affichage ;
- `home_assistant/custom_components/ha_pool_dashboard/gemini_backend.py` réalise
  l'appel distant côté serveur.

Tests : `tests/js/gemini_fix14_4.test.cjs` et
`tests/unitaires/gemini-controleur.test.mjs`.

## RÈGLE GEMINI-002 — Reformulation seulement, jamais décision

Gemini ne calcule ni seuil, ni durée, ni dosage, ni consigne. Il reformule
uniquement les conclusions déterministes déjà présentes dans le payload. Une
réponse devenue obsolète parce que le payload a changé n'est pas affichée.
Le backend conserve `valider_reformulation()` comme garde-fou avant retour au
navigateur.

Implémentation actuelle :

- `src/interface/gemini/gemini-reformulation.js` : contrat déterministe ;
- `src/interface/gemini/controleur-gemini.js` : refus d'afficher une réponse
  obsolète et absence de toute commande métier ;
- `home_assistant/custom_components/ha_pool_dashboard/gemini_guardrails.py` :
  validation serveur de la reformulation.

## RÈGLE SEC-000 — Séparation calcul / exécution

Un moteur de calcul ou de normalisation ne doit appeler ni `hass.callService()`
ni `hass.callWS()` et ne doit pas lire Home Assistant pour effectuer son calcul.
Les accès HA restent cantonnés aux couches d'intégration déjà existantes.

Implémentation / preuve actuelle :

- `src/moteur/filtration.js` ne dépend d'aucun objet Home Assistant ;
- `tests/unitaires/filtration.test.mjs` contient un test-piège avec un getter
  `hass` qui lève une exception s'il est lu ;
- `src/pac/securite-pac.js` ne dépend ni de Home Assistant ni du DOM ;
- `src/pac/commandes-pac.js` prépare les commandes et le cadran sans accès HA/DOM ;
- `src/interface/composants/sections-repliables.js` transforme uniquement un état et un mode déjà fournis ; il ne lit ni Home Assistant, ni le DOM, ni le stockage.
- `src/interface/carte-traitement.js` rend uniquement des données déjà préparées ; il ne lit ni Home Assistant, ni le DOM, ni le stockage et ne déclenche aucune action.
- `tests/unitaires/securite-pac.test.mjs` et `tests/unitaires/commandes-pac.test.mjs`
  piègent les accès d'exécution interdits ;
- `tests/js/pac_write_lock_runtime.test.cjs` vérifie que les trois chemins PAC
  marche/arrêt, consigne et mode n'accèdent pas au service tant que le verrou
  est actif.
- `src/traitement/journal.js` manipule le miroir local et prépare la fusion
  backend/local sans appeler `callService` ni `callWS` ; l'appel WebSocket reste
  dans la couche d'intégration historique du composant.
- `src/programmation/programme-adaptatif.js` reçoit uniquement des valeurs déjà
  lues/normalisées et calcule plages, contexte thermique, signature et plancher
  hydraulique sans lire HA, le DOM, `window` ou le stockage.
- `tests/unitaires/journal-traitement.test.mjs` piège les accès HA/DOM injectés
  dans les entrées du journal.
- `src/interface/gemini/controleur-gemini.js` constitue la frontière d’intégration
  propre à Gemini : il peut appeler uniquement le WebSocket de reformulation,
  jamais `callService`, et ne pilote aucun équipement.

## RÈGLE PROG-001 — Une édition manuelle rend le personnalisé prioritaire

Toute modification manuelle d'un jour ou d'une plage de filtration fait passer
immédiatement `seasonal_profiles.source` à `custom`. La signature adaptative et
l'état de suspension sont effacés ; une révision manuelle est horodatée.

Implémentation actuelle :

- `src/programmation/priorites.js`, `rendreProgrammationPersonnalisee()` ;
- `frontend/pool-dashboard.template.js`, `rc30MarkCustomSchedule()` et les
  événements réels de `bindRc27Controls()`.

Tests directs : `tests/unitaires/priorites-programmation.test.mjs` et
`tests/js/adaptive_priority_runtime.test.cjs`.

## RÈGLE PROG-002 — Reprise adaptative uniquement explicite

Une programmation personnalisée ou suspendue ne redevient jamais adaptative à
la suite d'un simple rafraîchissement ou recalcul. La reprise passe par l'action
explicite de l'utilisateur « Reprendre le programme adaptatif ».

Implémentation actuelle :

- `src/programmation/priorites.js` formalise les sources et leur hiérarchie ;
- `src/interface/carte-programmation.js` affiche l'action explicite de reprise sans effectuer la transition ;
- `frontend/pool-dashboard.template.js`, `rc30ResumeAdaptiveSchedule()` conserve
  l'action utilisateur historique qui effectue réellement la transition.

Test comportemental existant : `tests/js/adaptive_priority_runtime.test.cjs`.

## RÈGLE PROG-003 — Suspension distincte du personnalisé

Suspendre l'adaptatif fige les plages actuellement appliquées et conserve une
source `suspended`. Cette suspension n'est pas convertie en programmation
personnalisée ; la reprise reste explicite.

Implémentation actuelle :

- `src/programmation/priorites.js`, normalisation et évaluation de la source
  `suspended` ;
- `src/interface/carte-programmation.js` affiche distinctement l'état suspendu et sa reprise explicite ;
- `frontend/pool-dashboard.template.js`, `rc30SuspendAdaptiveSchedule()`.

Test comportemental existant : `tests/js/adaptive_priority_runtime.test.cjs`.

## RÈGLE PROG-004 — Forçage manuel pompe prioritaire et persistant

Un clic manuel Démarrer/Arrêter sur la pompe crée côté backend une dérogation
persistante. Tant qu'elle existe avec l'état `on` ou `off`, elle est la priorité
d'exécution la plus haute et le programme ne reprend qu'après l'action explicite
« Reprendre le programme ».

Implémentation actuelle :

- `src/programmation/priorites.js`, `obtenirDerogationPompeActive()` et
  `evaluerPrioriteProgrammation()` ;
- `home_assistant/custom_components/ha_pool_dashboard/scheduler.py`, stockage et
  application du forçage ;
- `frontend/pool-dashboard.template.js`, rendu de l'état et bouton de reprise.

Test comportemental : `tests/js/manual_override_priority.test.cjs` — désormais
basé sur de vrais clics via le `bundle_harness`, et non sur une recherche de
texte statique.

## RÈGLE SAISON-001 — Saison astronomique et profil de référence restent indicatifs

La saison astronomique sert à proposer un **profil saisonnier de référence**
(printemps, été, automne ou hiver). Elle ne fixe jamais à elle seule la durée de
filtration : la température réelle de l'eau et le contexte restent les critères
métier déterminants dans le moteur adaptatif historique. Le profil Maintenance
reste hors suivi astronomique automatique.

Le repli historique en cas de date invalide ou de saison inconnue reste le
profil `summer`, afin de préserver le comportement historique attendu.

Implémentation actuelle :

- `src/intelligence/saisons/detecter-saison.js` : détection astronomique ;
- `src/moteur/saisons.js` : catalogue des cinq profils de référence et mapping
  saison astronomique → profil ;
- `src/programmation/programme-adaptatif.js` : calcul pur du placement horaire
  effectif et des renforcements chaud/froid à partir du profil déjà normalisé ;
- `frontend/pool-dashboard.template.js` : normalisation des profils, lectures du
  contexte courant et rendu ; la façade délègue désormais le calcul adaptatif au
  module sans dupliquer le catalogue.

Tests directs : `tests/unitaires/saisons.test.mjs` pour la détection astronomique
et `tests/unitaires/saisons-moteur.test.mjs` pour les profils de référence.
Le test comportemental `tests/js/rc30_light_profiles.test.cjs` vérifie désormais
le rendu réel et les actions réelles « Reprendre le programme adaptatif » et
« Suivre la saison astronomique » au lieu de rechercher du texte dans le bundle.

## RÈGLE PAC-001 — Verrou d'écriture PAC absolu

Toute normalisation de la configuration PAC force `write_enabled` à `false`,
quelle que soit la valeur reçue depuis le navigateur, le stockage local ou le
backend. Aucun mécanisme de cette couche ne peut activer les écritures PAC.

Implémentation actuelle :

- `src/pac/securite-pac.js`, `normaliserConfigurationPacSecurisee()` ;
- `frontend/pool-dashboard.template.js`, `rc27SanitizeControl()` consomme le
  résultat du module ;
- `home_assistant/custom_components/ha_pool_dashboard/scheduler.py` conserve son
  verrou backend existant.

Tests directs : `tests/unitaires/securite-pac.test.mjs` et
`tests/js/pac_write_lock_runtime.test.cjs`.

## RÈGLE PAC-002 — Les commandes lisent uniquement l'état PAC normalisé

Les chemins de commande marche/arrêt, consigne et mode doivent lire
`_rc27Control.pac`, c'est-à-dire le bloc déjà passé par la normalisation de
sécurité. Ils ne doivent jamais utiliser directement une configuration brute
issue du stockage local ou d'une réponse backend.

Implémentation actuelle :

- `src/pac/securite-pac.js` produit le bloc normalisé ;
- `src/pac/commandes-pac.js` prépare marche/arrêt, consigne et mode uniquement à
  partir de ce bloc normalisé ;
- `frontend/pool-dashboard.template.js` conserve les handlers d'interaction et
  leur transmet exclusivement `_rc27Control.pac`.

Les commandes sont désormais extraites dans `src/pac/commandes-pac.js`; le verrou
reste fourni par `src/pac/securite-pac.js`.

## RÈGLE TRAIT-001 — Produits complémentaires en mode ponctuel par défaut

L'activateur de brome, Desalgin Classic et Grease Killer ne doivent générer
aucun rappel hebdomadaire ni bouton de confirmation tant que l'utilisateur n'a
pas choisi explicitement le mode `manufacturer_schedule`. Le mode par défaut
reste `on_demand` (« Ponctuel / urgence »). Les doses de contre-étiquette peuvent
rester visibles comme repères. Le traitement choc au brome demeure une décision
du moteur existant lorsque l'état de l'eau le justifie ; il n'est pas transformé
en rappel hebdomadaire.

Implémentation actuelle :

- `src/traitement/produits-dosage.js`, `MODES_PRODUITS_COMPLEMENTAIRES`,
  `normaliserConfigurationProduitsTraitement()` et
  `protocoleFabricantHebdomadaireActif()` ;
- `frontend/pool-dashboard.template.js`, `rc24TreatmentModel()` conserve les
  décisions de contexte et consomme les doses calculées par le module ;
- `src/interface/carte-traitement.js` affiche le mode ponctuel/fabricant et les actions déjà décidées sans en créer de nouvelles ;
- `tests/unitaires/produits-dosage.test.mjs` couvre directement le défaut
  ponctuel et le choix explicite fabricant ;
- `tests/js/products_fix14_5.test.cjs` et
  `tests/js/produits_dosage_runtime.test.cjs` vérifient le comportement réel du
  bundle.

Les calculs de dose du module ne déclenchent jamais eux-mêmes une action et ne
lisent jamais l'ORP pour autoriser Grease Killer : seule la mesure dédiée
brome/chlore déjà normalisée est prise en compte.


## RÈGLE TRAIT-002 — Journal persistant HA avec miroir local de repli

Le journal de traitement est persisté côté Home Assistant dans
`.storage/ha_pool_dashboard.treatment_journal`. Le navigateur conserve en
parallèle un miroir `localStorage` sous la clé historique
`ha-pool-dashboard:treatment-history`. Au chargement, les deux sources sont
fusionnées sans doublon, triées par date décroissante et limitées à 500 entrées.
Si le backend est temporairement indisponible, le miroir local reste utilisable.

Implémentation actuelle :

- `src/traitement/journal.js` : lecture/écriture du miroir local, clé de
  déduplication, fusion et préparation des drapeaux de synchronisation ;
- `src/interface/carte-traitement.js` affiche le journal déjà chargé sans le trier, le fusionner ni le persister ;
- `frontend/pool-dashboard.template.js`, `syncTreatmentHistoryFromBackend()` et
  `persistTreatmentHistory()` : seuls endroits frontend qui effectuent les
  appels WebSocket du journal ;
- `home_assistant/custom_components/ha_pool_dashboard/treatment_journal.py` :
  stockage persistant backend ;
- `tests/unitaires/journal-traitement.test.mjs` et
  `tests/js/journal_traitement_runtime.test.cjs` : comportement direct et réel
  du bundle.

La clé de doublon reste composée de `date`, `kind`, `product`, dose, unité et
`detail`, avec priorité historique `dose_amount` puis `dose_g` puis `dose_ml`.
La première occurrence d'une clé est conservée avant tri, ce qui préserve la
priorité historique du backend lorsqu'il est passé en première source.

## RÈGLE ASSIST-001 — Assistant Expert strictement explicatif

L'Assistant Expert explique uniquement des valeurs et conclusions déjà calculées
par les moteurs déterministes. Il ne possède aucun seuil métier propre, ne
recalcule pas la recommandation adaptative, ne décide pas d'un traitement et ne
pilote aucun équipement Home Assistant.

Implémentation actuelle :

- `src/interface/assistant-expert/assistant-expert.js` : modèle explicatif et HTML ;
- `src/interface/assistant-expert/adaptateur-dashboard.js` : assemblage pur des
  valeurs déjà calculées, sans accès HA ni DOM ;
- `src/interface/assistant-expert/etat-popup.js` : ouverture, fermeture, focus et
  scroll uniquement ;
- `frontend/pool-dashboard.template.js` : façades de compatibilité et câblage
  d'événements, sans second moteur Assistant Expert.

Tests directs :

- `tests/unitaires/assistant-expert-adaptateur.test.mjs` ;
- `tests/unitaires/assistant-expert-etat-popup.test.mjs` ;
- `tests/js/assistant_expert_fix14_3.test.cjs` pour le comportement réel du bundle.

La reformulation Gemini reste une surcouche séparée et ne fait pas partie de
cette règle de calcul ; ses garde-fous sont couverts par les règles GEMINI.
