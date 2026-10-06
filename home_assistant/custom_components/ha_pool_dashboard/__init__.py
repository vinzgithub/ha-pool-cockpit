# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from __future__ import annotations

from typing import Any
import os

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN
from .gemini_backend import (
    DEFAULT_GEMINI_MODEL,
    DEFAULT_TIMEOUT_SECONDS,
    async_reformulate_with_gemini,
)
from .scheduler import PoolScheduler
from .treatment_journal import TreatmentJournalStore

GEMINI_DATA_KEY = f"{DOMAIN}_gemini"
TREATMENT_JOURNAL_DATA_KEY = f"{DOMAIN}_treatment_journal"
CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)


async def async_setup(hass: HomeAssistant, _config: dict[str, Any]) -> bool:
    manager = PoolScheduler(hass)
    await manager.async_load()
    hass.data[DOMAIN] = manager

    # FIX14.5 : journal des traitements durable dans Home Assistant .storage.
    # Ce stockage est indépendant du scheduler et ne pilote aucun équipement.
    treatment_journal = TreatmentJournalStore(hass)
    await treatment_journal.async_load()
    hass.data[TREATMENT_JOURNAL_DATA_KEY] = treatment_journal

    # FIX14.4 : secret strictement côté backend. Rien n'est lu depuis Lovelace.
    hass.data[GEMINI_DATA_KEY] = {
        "api_key": os.environ.get("GEMINI_API_KEY", ""),
        "model": os.environ.get("GEMINI_MODEL", DEFAULT_GEMINI_MODEL),
        "timeout_seconds": os.environ.get("GEMINI_TIMEOUT_SECONDS", str(DEFAULT_TIMEOUT_SECONDS)),
    }

    async def handle_save(call: ServiceCall) -> None:
        await manager.async_save_config(dict(call.data.get("config") or {}))

    async def handle_boost(call: ServiceCall) -> None:
        await manager.async_boost(int(call.data.get("hours", 0)))

    hass.services.async_register(DOMAIN, "save_config", handle_save, schema=vol.Schema({vol.Required("config"): dict}))
    hass.services.async_register(DOMAIN, "boost", handle_boost, schema=vol.Schema({vol.Required("hours"): vol.Coerce(int)}))
    websocket_api.async_register_command(hass, ws_get_state)
    websocket_api.async_register_command(hass, ws_save_state)
    websocket_api.async_register_command(hass, ws_control)
    websocket_api.async_register_command(hass, ws_boost)
    websocket_api.async_register_command(hass, ws_extension)
    websocket_api.async_register_command(hass, ws_clear_history)
    websocket_api.async_register_command(hass, ws_test_notification)
    websocket_api.async_register_command(hass, ws_get_treatment_history)
    websocket_api.async_register_command(hass, ws_save_treatment_history)
    websocket_api.async_register_command(hass, ws_gemini_rewrite)
    return True


@websocket_api.websocket_command({vol.Required("type"): "ha_pool_dashboard/get_state"})
@websocket_api.async_response
async def ws_get_state(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    connection.send_result(msg["id"], hass.data[DOMAIN].public_state())


@websocket_api.websocket_command({vol.Required("type"): "ha_pool_dashboard/save_state", vol.Required("config"): dict})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_save_state(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    result = await hass.data[DOMAIN].async_save_config(msg["config"])
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "ha_pool_dashboard/control", vol.Required("target"): vol.In(("pump", "light", "pac")), vol.Required("state"): vol.In(("on", "off", "auto"))})
@websocket_api.async_response
async def ws_control(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    result = await hass.data[DOMAIN].async_control(msg["target"], msg["state"])
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "ha_pool_dashboard/boost", vol.Required("hours"): vol.All(vol.Coerce(int), vol.Range(min=0, max=4))})
@websocket_api.async_response
async def ws_boost(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    result = await hass.data[DOMAIN].async_boost(msg["hours"])
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "ha_pool_dashboard/extension", vol.Required("action"): vol.In(("approve", "ignore", "reset"))})
@websocket_api.async_response
async def ws_extension(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    result = await hass.data[DOMAIN].async_extension(msg["action"])
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "ha_pool_dashboard/clear_history"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_clear_history(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    result = await hass.data[DOMAIN].async_clear_history()
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "ha_pool_dashboard/test_notification"})
@websocket_api.async_response
async def ws_test_notification(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    await hass.data[DOMAIN].async_test_notification()
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command({vol.Required("type"): "ha_pool_dashboard/get_treatment_history"})
@websocket_api.async_response
async def ws_get_treatment_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Retourne le journal des traitements persistant, sans action sur la piscine."""
    journal = hass.data[TREATMENT_JOURNAL_DATA_KEY]
    connection.send_result(msg["id"], {"history": journal.public_history()})


@websocket_api.websocket_command(
    {vol.Required("type"): "ha_pool_dashboard/save_treatment_history", vol.Required("history"): list}
)
@websocket_api.async_response
async def ws_save_treatment_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Persiste le journal déclaré par l'utilisateur dans Home Assistant `.storage`."""
    journal = hass.data[TREATMENT_JOURNAL_DATA_KEY]
    history = await journal.async_save(msg.get("history") or [])
    connection.send_result(msg["id"], {"history": history})


@websocket_api.websocket_command({vol.Required("type"): "ha_pool_dashboard/gemini_rewrite", vol.Required("payload"): dict})
@websocket_api.async_response
async def ws_gemini_rewrite(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Reformule le modèle Assistant Expert sans piloter aucun équipement."""
    result = await async_reformulate_with_gemini(
        hass,
        dict(hass.data.get(GEMINI_DATA_KEY) or {}),
        dict(msg.get("payload") or {}),
    )
    connection.send_result(msg["id"], result)
