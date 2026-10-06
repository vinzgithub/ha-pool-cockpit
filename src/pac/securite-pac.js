/*
 * SPDX-FileCopyrightText: 2026 Vincent Fournet
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

/**
 * Normalisation défensive de la configuration PAC.
 *
 * Ce module extrait le verrou le plus critique du dashboard sans déplacer les
 * commandes elles-mêmes. Il reçoit uniquement le bloc de configuration PAC déjà
 * fusionné avec les valeurs historiques, le normalise et retourne un nouvel
 * objet dont toute autorisation d'écriture persistée est d'abord neutralisée.
 *
 * RÈGLE PAC-001 : `write_enabled` est forcé à `false` à chaque normalisation.
 * La couche d'intégration du dashboard peut ensuite l'autoriser explicitement
 * uniquement lorsque l'instance est configurée en rôle `master`. Ce module ne
 * possède lui-même aucun mécanisme d'activation et ne valide aucune table Modbus.
 *
 * RÈGLE PAC-002 : les couches de commande doivent consommer uniquement le bloc
 * PAC normalisé stocké dans `_rc27Control.pac`, jamais une configuration brute.
 *
 * RÈGLE SEC-000 : ce module ne connaît ni Home Assistant, ni le DOM. Il
 * n'appelle jamais une API de service ou WebSocket Home Assistant, ni une API navigateur.
 */

/** Champs d'entités Home Assistant historiquement acceptés pour la PAC. */
export const CHAMPS_ENTITES_PAC = Object.freeze([
  "command_entity",
  "control_mode_entity",
  "setpoint_entity",
  "mode_entity",
  "status_entity",
  "inlet_temperature_entity",
  "outlet_temperature_entity",
  "ambient_temperature_entity",
  "coil_temperature_entity",
  "ipm_temperature_entity",
  "voltage_entity",
  "current_entity",
  "power_entity",
  "energy_entity",
  "daily_energy_entity",
  "monthly_energy_entity",
  "compressor_fault_code_entity",
  "water_flow_entity",
  "high_pressure_entity",
  "low_pressure_entity",
  "fault_entity",
  "communication_entity",
]);

/**
 * Clone un bloc PAC sans lire les propriétés étrangères à la normalisation.
 *
 * Le code historique reçoit ici un objet déjà cloné par la fusion de
 * configuration. La copie locale évite néanmoins toute mutation de l'argument
 * et permet au module de rester autonome. Les descripteurs sont recopiés sans
 * évaluer d'éventuels getters inconnus : un champ étranger d'exécution Home
 * Assistant ne peut donc pas être lu par accident.
 *
 * @param {unknown} configurationPac Bloc PAC issu de la configuration fusionnée.
 * @returns {object} Copie locale, ou objet vide si le bloc n'est pas un objet.
 */
function clonerConfigurationPac(configurationPac) {
  if (!configurationPac || typeof configurationPac !== "object" || Array.isArray(configurationPac)) {
    return {};
  }
  return Object.defineProperties({}, Object.getOwnPropertyDescriptors(configurationPac));
}

/**
 * Normalise et verrouille la configuration PAC.
 *
 * Le comportement reproduit ligne pour ligne la normalisation historique de
 * FIX14.5.3 / v3.0.0 : migration de l'ancien nom de capteur compresseur,
 * conversion des entity_id en chaînes, validation du mode, filtrage des jours,
 * limitation/padding à trois plages, interverrouillage pompe par défaut et,
 * surtout, verrouillage inconditionnel des écritures.
 *
 * Cette fonction ne modifie pas son argument, ne lit aucun état Home Assistant,
 * ne touche pas au DOM, ne persiste rien et n'envoie aucune commande. Elle ne
 * doit jamais être transformée en mécanisme d'activation de la PAC.
 *
 * @param {unknown} configurationPac Bloc PAC déjà fusionné avec les valeurs par défaut.
 * @param {Array<[string, string]>} joursSemaine Table historique des jours `[clé, libellé]`.
 * @returns {object} Bloc PAC normalisé, avec `write_enabled === false` avant décision de rôle.
 *
 * @example
 * normaliserConfigurationPacSecurisee(
 *   { write_enabled: true, mode: "program", weekdays: ["mon"] },
 *   [["mon", "Lun"], ["tue", "Mar"]],
 * );
 * // => { ..., mode: "program", weekdays: ["mon"], write_enabled: false }
 */
export function normaliserConfigurationPacSecurisee(configurationPac, joursSemaine) {
  const pac = clonerConfigurationPac(configurationPac);

  if (!pac.compressor_fault_code_entity && pac.compressor_entity) {
    pac.compressor_fault_code_entity = pac.compressor_entity;
  }

  for (const cle of CHAMPS_ENTITES_PAC) {
    pac[cle] = String(pac[cle] || "");
  }
  delete pac.compressor_entity;

  pac.mode = ["off", "manual", "program"].includes(pac.mode) ? pac.mode : "manual";
  pac.weekdays = (pac.weekdays || joursSemaine.map(([cle]) => cle))
    .filter((jour) => joursSemaine.some(([cle]) => cle === jour));

  pac.periods = (pac.periods || []).slice(0, 3).map((periode) => ({
    enabled: Boolean(periode.enabled),
    start: String(periode.start || "00:00").slice(0, 5),
    end: String(periode.end || "00:00").slice(0, 5),
  }));
  while (pac.periods.length < 3) {
    pac.periods.push({ enabled: false, start: "00:00", end: "00:00" });
  }

  pac.requires_pump = pac.requires_pump !== false;

  // RÈGLE PAC-001 — une valeur persistée ne peut jamais activer les écritures.
  pac.write_enabled = false;

  return pac;
}
