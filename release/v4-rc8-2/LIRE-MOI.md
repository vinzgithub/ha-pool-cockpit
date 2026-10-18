# Pool Cockpit V4 RC8.2 — Candidat privé de recette

Frontend uniquement. Aucun backend ni installateur n'est fourni dans ce ZIP.

Correctifs : cartes Mesures sans chevauchement, bandeau compact et contrôles de 44 px,
caméra à la place du badge d'état dans l'en-tête Vue d'ensemble, onglet actif conservé
après reconstruction et rechargement. Six onglets, neuf langues, quatre thèmes.

Le ZIP est reproductible avec `npm run build` puis `python outils/emballer-rc82.py`.
Vérifier `SHA256SUMS` après extraction. Le bundle doit correspondre exactement à
`frontend/dist/pool-dashboard.js` et `release/v4-rc8-2/pool-dashboard-v4-rc8-2.js`.
Les assets viennent de `frontend/dist/assets` et restent inchangés.

Aucun déploiement n'a été réalisé. Pour une future installation explicitement autorisée,
sauvegarder le dashboard, ses ressources et les assets existants ; conserver les anciennes
ressources V4 et la V3 stable. La ressource prévue pour la recette est
`/local/ha-pool-dashboard/pool-dashboard-v4-rc8-2.js?v=4.0.0-rc.8.2` (module JavaScript).
Ne pas charger simultanément plusieurs versions du même composant V4.

La préférence d'onglet est locale au navigateur et au chemin du dashboard. Utiliser des
`pool_id` ou `view_id` distincts pour plusieurs cartes qui doivent rester indépendantes.
Un navigateur refusant le stockage continue à fonctionner sans mémoriser après reload.

Les tests navigateur simulent Home Assistant ; ils ne prouvent pas une lecture vidéo
sur l'installation réelle. Consulter `docs/releases/V4-RC8-2.md` et les preuves associées.
