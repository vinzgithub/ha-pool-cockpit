# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
"""Home Assistant boundaries for wintering; decisions remain in wintering.py."""
from copy import deepcopy
from datetime import timedelta

from homeassistant.util import dt as dt_util

from .schedule_utils import adaptive_periods, adaptive_target_hours, scheduled_minutes, time_to_minutes
from .wintering import (DEFAULT_WINTERING, normalize_wintering, validate_wintering,
                        sample_health, parse_time, elapsed, frost_transition, day_program)


class WinteringRuntime:
    def _winter_config(self):
        return self.data.get('wintering') or normalize_wintering()

    def _equipment(self, key):
        return self._winter_config()['equipment'].get(key, {'status': 'en_service'})

    def _sample_stamp(self, state, timestamp_entity=''):
        if timestamp_entity:
            timestamp = self.hass.states.get(timestamp_entity)
            if not timestamp or timestamp.attributes.get('restored'):
                return None
            return timestamp.state
        attributes = state.attributes if state else {}
        return next((attributes[key] for key in ('measurement_timestamp', 'last_measurement', 'last_sample') if attributes.get(key)), None)

    def _water_sources(self, now):
        sources = self.data.get('watch', {}).get('sensor_sources')
        if not isinstance(sources, list):
            return None  # v4.2 compatibility until the new client sends mappings
        result = []
        for source in sources:
            if not isinstance(source, dict) or not source.get('key'):
                continue
            equipment = self._equipment(str(source['key']))
            status = equipment.get('status', 'en_service')
            if status != 'en_service' or source.get('enabled') is False:
                result.append({**source, 'status': 'hiverne' if status == 'hiverne' else 'unavailable', 'value': None, 'sample_at': None})
                continue
            entity = str(source.get('temperature') or '')
            state = self.hass.states.get(entity) if entity else None
            value, health, stamp = sample_health(state, now,
                stamp=self._sample_stamp(state, str(source.get('last_analysis') or '')),
                after=equipment.get('reactivated_at'))
            result.append({**source, 'status': health, 'value': value, 'sample_at': stamp})
        return result

    def _winter_water(self, now):
        sources = self._water_sources(now)
        if sources is None:
            # A legacy client must never resurrect explicitly wintered probes.
            if any(key not in ('pump', 'pac') and eq.get('status') != 'en_service'
                   for key, eq in self._winter_config()['equipment'].items()):
                return None, 'hiverne'
            return None
        fresh = {row['temperature']: row['value'] for row in sources if row['status'] == 'fresh'}
        if fresh:
            return sum(fresh.values()) / len(fresh), 'fresh'
        statuses = {row['status'] for row in sources}
        return None, ('hiverne' if statuses == {'hiverne'} else 'stale' if statuses & {'stale', 'awaiting_sample'} else 'unavailable' if sources else 'none')

    def _hydraulic_block(self, now):
        config = self._winter_config()
        if config['mode'] == 'maintenance' or not config['hydraulic_ready']:
            return 'Circuit en maintenance / hydraulique non autorisée'
        if self._equipment('pump')['status'] != 'en_service':
            return 'Pompe hors service ou hivernée'
        entity = config.get('dry_run_entity')
        if entity:
            state = self.hass.states.get(entity)
            if not self._state_is_fresh(state, now) or str(state.state).lower() != 'off':
                return 'Verrou marche à sec actif ou non vérifiable'
        override = self.data.get('overrides', {}).get('pump') or {}
        if override.get('state') == 'off' and (override.get('safety') or override.get('source') == 'external'):
            return 'Arrêt de sécurité / arrêt externe à lever explicitement'
        return None

    async def async_configure_wintering(self, payload, actor):
        if not self._is_master():
            raise ValueError('Configuration disponible sur le maître uniquement.')
        config = deepcopy(self._winter_config())
        if payload.get('confirmed') is not True:
            raise ValueError('Confirmation explicite requise.')
        if payload.get('expected_revision') != config['revision']:
            raise ValueError('Configuration modifiée ailleurs : recharger avant de confirmer.')
        changes = payload.get('changes')
        if not isinstance(changes, dict) or set(changes) - {'mode', 'base_hours', 'start', 'hydraulic_ready', 'dry_run_entity', 'flow_entity', 'equipment', 'frost'}:
            raise ValueError('Champs de configuration invalides.')
        previous = deepcopy(config)
        for key, value in changes.items():
            if key == 'frost':
                if not isinstance(value, dict) or set(value) - set(DEFAULT_WINTERING['frost']):
                    raise ValueError('Paramètres antigel invalides.')
                config[key].update(value)
            elif key == 'equipment':
                if not isinstance(value, dict):
                    raise ValueError('Statuts équipements invalides.')
                known = {'pump', 'pac'} | {str(s.get('key')) for s in self.data.get('watch', {}).get('sensor_sources', []) if isinstance(s, dict)} | set(config['equipment'])
                for equipment_key, status in value.items():
                    if equipment_key not in known:
                        raise ValueError('Équipement inconnu : synchroniser le dashboard.')
                    if not isinstance(status, str):
                        raise ValueError('Statut équipement invalide.')
                    old = config['equipment'].get(equipment_key, {'status': 'en_service'})
                    config['equipment'][equipment_key] = {**old, 'status': status}
                    if status == 'en_service' and old['status'] != status:
                        config['equipment'][equipment_key]['reactivated_at'] = dt_util.now().isoformat()
            else:
                config[key] = value
        validate_wintering(config)
        now = dt_util.now()
        if previous['mode'] != config['mode']:
            config.update(previous_mode=previous['mode'], confirmed_at=now.isoformat(), confirmed_by=str(actor))
            if config['mode'] == 'hivernage_actif':
                if 'base_hours' not in changes or 'start' not in changes:
                    raise ValueError('Confirmer la durée et l’heure hivernales, y compris toute baisse de durée.')
                if not config['hydraulic_ready'] or config['equipment']['pump']['status'] != 'en_service':
                    raise ValueError('La filtration doit être disponible pour entrer en hivernage actif.')
                # Explicit activation authorizes these winter periods; save the
                # previous scheduling choice but never restore old overrides.
                self.data.setdefault('pre_winter_schedule', {
                    'pump': {k: deepcopy(self.data['pump'][k]) for k in ('mode', 'periods', 'weekdays', 'recommended_hours', 'extension')},
                    'seasonal_profiles': deepcopy(self.data['seasonal_profiles'])})
                self.data['seasonal_profiles']['source'] = 'adaptive'
                self.data['pump']['mode'] = 'automatic'
            elif config['mode'] == 'normal':
                prior = self.data.pop('pre_winter_schedule', None)
                if prior:
                    self.data['pump'].update(deepcopy(prior['pump']))
                    self.data['seasonal_profiles'] = deepcopy(prior['seasonal_profiles'])
        config['revision'] += 1
        self.data['wintering'] = config
        if previous['frost'] != config['frost']:
            # Threshold edits restart debounce timers, not a running demand.
            self.data.setdefault('winter_runtime', {}).setdefault('frost', {}).update(entry_since=None, exit_since=None)
        for key in ('mode', 'base_hours', 'start', 'hydraulic_ready', 'equipment', 'frost', 'flow_entity', 'dry_run_entity'):
            if config[key] != previous[key]:
                self._record('hivernage', key, f'{key} : {previous[key]} → {config[key]} (confirmation : {actor})')
        self._refresh_adaptive_schedule(now)
        self._reconcile_extension(now)
        await self.async_evaluate('configuration hivernage confirmée')
        return self.public_state()

    def _winter_schedule(self, now):
        config = self._winter_config()
        if config['mode'] != 'hivernage_actif':
            return None
        water, status = self._water_temperature(now)
        watch = self.data.setdefault('watch', {})
        # Winter base is an explicit user choice, not a universal hydraulic quota.
        hours, context = adaptive_target_hours(water=water, hydraulic_hours=config['base_hours'],
            reference_hours=config['base_hours'], water_condition=str(watch.get('water_condition') or ''),
            recent_load=str(watch.get('recent_load') or ''))
        periods = adaptive_periods(hours, time_to_minutes(config['start']))
        changed = self.data['pump']['periods'] != periods or self.data['pump'].get('recommended_hours') != hours
        self.data['pump'].update(periods=periods, weekdays=['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], recommended_hours=hours)
        watch.update(adaptive_water_temperature_c=water, adaptive_water_status=status,
            adaptive_context=context or 'winter_base', adaptive_target_hours=hours,
            adaptive_base_profile='winter', adaptive_effective_profile='winter',
            adaptive_updated_at=now.isoformat(), adaptive_hydraulic_hours=None)
        self.data['seasonal_profiles']['last_adaptive_signature'] = f'winter|{hours}|{status}|{periods}'
        return changed

    def _update_winter_runtime(self, now):
        config = self._winter_config()
        runtime = self.data.setdefault('winter_runtime', {})
        frost_config = config['frost']
        entity = frost_config['temperature_entity']
        state = self.hass.states.get(entity) if entity else None
        value, health, stamp = sample_health(state, now,
            stamp=self._sample_stamp(state, frost_config['sample_time_entity']),
            max_age_hours=frost_config['max_age_minutes'] / 60, low=-50, high=60)
        old = deepcopy(runtime.get('frost') or {})
        if old.get('requested') and runtime.get('pump_state') != 'on':
            # Minimum circulation starts only after observed operation.
            old['active_since'] = now.isoformat()
        runtime['frost'] = frost_transition(frost_config, old, value, health, now)
        runtime['frost']['sample_at'] = stamp
        if old.get('status') != runtime['frost']['status']:
            self._record('antigel', runtime['frost']['status'], 'Évolution de la demande / qualité du capteur')
        pump_entity = self.data['pump'].get('entity_id')
        pump = self.hass.states.get(pump_entity) if pump_entity else None
        observed = str(pump.state).lower() if pump and self._state_is_fresh(pump, now) else 'unknown'
        observed = observed if observed in ('on', 'off') else 'unknown'
        segments = runtime.setdefault('observations', [])
        last = parse_time(runtime.get('observed_at'))
        if last and 0 <= now.timestamp() - last.timestamp() <= 90 and runtime.get('pump_state') == observed:
            if segments and segments[-1]['end'] == last.isoformat() and segments[-1]['state'] == observed:
                segments[-1]['end'] = now.isoformat()
            else:
                segments.append({'start': last.isoformat(), 'end': now.isoformat(), 'state': observed})
        runtime['observations'] = [row for row in segments[-2000:] if (parse_time(row['end']) or now).timestamp() >= now.timestamp() - 172800]
        runtime.update(pump_state=observed, observed_at=now.isoformat(), blocked=self._hydraulic_block(now))
        flow_id = config['flow_entity']
        flow = self.hass.states.get(flow_id) if flow_id else None
        runtime['flow_verified'] = bool(flow_id and self._state_is_fresh(flow, now) and str(flow.state).lower() == 'on')
        command = runtime.get('command') or {}
        if command.get('state') == observed and not command.get('confirmed_at'):
            command['confirmed_at'] = now.isoformat()
            runtime['command'] = command
            self._record('pompe', observed, 'État HA confirmé après commande (ne prouve pas le débit)')
        alerts = []
        requested = runtime['frost'].get('requested')
        if frost_config['enabled'] and health != 'fresh':
            alerts.append('Capteur antigel absent, périmé ou incohérent : protection non confirmée.')
        if requested and runtime['blocked']:
            alerts.append('CRITIQUE : demande antigel bloquée — ' + runtime['blocked'])
        override = self.data.get('overrides', {}).get('pump') or {}
        if requested and override.get('state') == 'off' and not runtime['blocked']:
            alerts.append('Conflit : antigel prioritaire sur l’arrêt ordinaire ; dérogation conservée.')
        if frost_config['enabled'] and observed == 'unknown':
            alerts.append('CRITIQUE : état pompe indisponible / alimentation ou communication à vérifier.')
        if command.get('error'):
            alerts.append('CRITIQUE : échec de la commande pompe ; vérifier Home Assistant et la liaison.')
        if requested and not runtime['blocked'] and elapsed(now, command.get('requested_at') if command.get('state') == 'on' else runtime['frost'].get('active_since')) >= frost_config['command_timeout_seconds']:
            if observed != 'on':
                alerts.append('CRITIQUE : commande antigel non suivie de marche pompe.')
            elif flow_id and not runtime['flow_verified']:
                alerts.append('CRITIQUE : pompe en marche mais débit non vérifié.')
        if config['mode'] == 'hivernage_actif' and not frost_config['enabled']:
            alerts.append('Antigel désactivé : la seule plage nocturne ne garantit pas le hors-gel.')
        runtime['alerts'] = alerts
        signature = '|'.join(alerts)
        if signature != runtime.get('alert_signature', ''):
            self._record('surveillance', 'alerte' if alerts else 'retour', signature or 'Alerte levée')
        runtime['alert_signature'] = signature

    async def _notify_winter_alerts(self):
        runtime = self.data.get('winter_runtime') or {}
        signature = runtime.get('alert_signature', '')
        if signature and signature != runtime.get('notified_signature') and self._is_master():
            try:
                await self._notify('Surveillance hivernage — protection non confirmée', signature)
            except Exception:
                self._record('notification', 'échec', 'Notification hivernage non transmise ; nouvelle tentative au prochain cycle')
                return
        runtime['notified_signature'] = signature

    def _winter_priority(self, target, now):
        if target == 'pac' and (self._equipment('pac')['status'] != 'en_service' or self._winter_config()['mode'] == 'maintenance'):
            return 'off'
        if target != 'pump':
            return None
        if self._hydraulic_block(now):
            return 'off'
        if self.data.get('winter_runtime', {}).get('frost', {}).get('requested'):
            return 'on'
        return None

    def _winter_public(self, now):
        config = self._winter_config()
        runtime = deepcopy(self.data.get('winter_runtime') or {})
        watch = self.data.get('watch') or {}
        proposal = self.data.get('schedule_proposal') or {}
        watch = proposal.get('inputs') or watch
        periods = self._target_periods('pump')
        calculated = proposal.get('hours', self.data['pump'].get('recommended_hours', 0))
        applied = scheduled_minutes(periods) / 60
        source = self.data['seasonal_profiles']['source']
        frost = runtime.get('frost') or {}
        blocked = self._hydraulic_block(now)
        override = self.data.get('overrides', {}).get('pump') or {}
        origin = 'alerte' if blocked else 'antigel' if frost.get('requested') else 'manuel' if override else config['mode']
        desired = self._desired_state('pump', now)
        reason = blocked or ('Circulation antigel demandée, indépendante des plages' if frost.get('requested') else
            'Forçage utilisateur conservé' if override else 'Plages personnalisées conservées' if source == 'custom' else
            'Plages adaptatives suspendues' if source == 'suspended' else ('Base hivernale confirmée' if watch.get('adaptive_context') == 'winter_base' else watch.get('adaptive_context', 'programme')))
        return {'schema': 1, 'backend_version': '4.3.0', 'generated_at': now.isoformat(),
            'master': self._is_master(), 'mode': config['mode'], 'configuration': deepcopy(config),
            'calculated_hours': calculated, 'applied_hours': applied, 'base_hours': config['base_hours'],
            'source': source, 'origin': origin, 'reason': reason, 'desired_pump_state': desired,
            'proposed_periods': proposal.get('periods', self.data['pump']['periods']), 'applied_periods': deepcopy(periods),
            'different': abs(calculated - applied) > 1 / 60,
            'water_status': watch.get('adaptive_water_status'), 'water_temperature_c': watch.get('adaptive_water_temperature_c'),
            'sensors': self._water_sources(now) or [], 'runtime': runtime,
            'program_day': day_program(periods, self.data['pump']['weekdays'], now),
            'timezone': str(now.tzinfo), 'warning': 'Home Assistant doit être disponible. Une protection hors-gel matérielle indépendante peut être nécessaire.'}
