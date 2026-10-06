# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

"""Backend Gemini en lecture seule pour HA Pool Dashboard.

La clé API reste exclusivement côté serveur Home Assistant. Le frontend envoie
uniquement le modèle déterministe de l'Assistant Expert via le WebSocket HA.

FIX14.4.2 ajoute uniquement de la résilience réseau :
- journalisation sûre du code/message d'erreur Google ;
- backoff borné sur erreurs temporaires ;
- aucune modification du contrat métier ni des garde-fous anti-invention.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .gemini_guardrails import (
    construire_prompt,
    extraire_texte_interaction,
    serialiser_payload,
    valider_reformulation,
)
from .gemini_resilience import (
    DEFAULT_MAX_ATTEMPTS,
    calculer_delai_retry,
    est_erreur_retryable,
    extraire_detail_erreur,
    message_utilisateur_pour_erreur,
)

_LOGGER = logging.getLogger(__name__)

GEMINI_INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions"
DEFAULT_GEMINI_MODEL = "gemini-3.8-flash"
DEFAULT_TIMEOUT_SECONDS = 20


def _result_unavailable(message: str = "Reformulation Gemini indisponible.") -> dict[str, Any]:
    return {"ok": False, "status": "unavailable", "message": message}


async def async_reformulate_with_gemini(
    hass: HomeAssistant,
    config: dict[str, Any],
    payload: dict[str, Any],
) -> dict[str, Any]:
    """Appelle Gemini puis applique les garde-fous avant toute restitution."""
    api_key = str(config.get("api_key") or "").strip()
    if not api_key:
        return _result_unavailable("Backend Gemini non configuré : clé API absente.")

    try:
        serialiser_payload(payload)
    except ValueError as exc:
        return {"ok": False, "status": "rejected", "message": str(exc)}

    model = str(config.get("model") or DEFAULT_GEMINI_MODEL).strip() or DEFAULT_GEMINI_MODEL
    try:
        timeout_seconds = int(config.get("timeout_seconds") or DEFAULT_TIMEOUT_SECONDS)
    except (TypeError, ValueError):
        timeout_seconds = DEFAULT_TIMEOUT_SECONDS
    timeout_seconds = min(30, max(5, timeout_seconds))

    request_body = {
        "model": model,
        "input": construire_prompt(payload),
    }
    session = async_get_clientsession(hass)

    async def _request_once() -> tuple[int, dict[str, Any], str | None]:
        async with session.post(
            GEMINI_INTERACTIONS_URL,
            headers={
                "x-goog-api-key": api_key,
                "Content-Type": "application/json",
            },
            json=request_body,
        ) as response:
            try:
                data = await response.json(content_type=None)
            except Exception:  # pragma: no cover - protection réseau
                data = {}
            retry_after = response.headers.get("Retry-After")
            return response.status, data, retry_after

    async def _request_with_backoff() -> tuple[int, dict[str, Any]]:
        last_status = 0
        last_data: dict[str, Any] = {}

        for attempt in range(1, DEFAULT_MAX_ATTEMPTS + 1):
            status_code, response_data, retry_after = await _request_once()
            last_status, last_data = status_code, response_data
            if 200 <= status_code < 300:
                return status_code, response_data

            error_code, error_message = extraire_detail_erreur(response_data)
            _LOGGER.warning(
                "Gemini HTTP %s code=%s message=%s (tentative %s/%s)",
                status_code,
                error_code,
                error_message or "non fourni",
                attempt,
                DEFAULT_MAX_ATTEMPTS,
            )

            if attempt >= DEFAULT_MAX_ATTEMPTS or not est_erreur_retryable(status_code, error_code):
                break

            delay = calculer_delai_retry(attempt - 1, retry_after)
            _LOGGER.warning("Nouvelle tentative Gemini dans %.1f s", delay)
            await asyncio.sleep(delay)

        return last_status, last_data

    try:
        # Le timeout couvre l'ensemble des tentatives ET des pauses de backoff :
        # un incident Gemini ne doit jamais bloquer longtemps l'interface.
        status_code, response_data = await asyncio.wait_for(
            _request_with_backoff(),
            timeout=timeout_seconds,
        )
    except asyncio.TimeoutError:
        return _result_unavailable("Gemini n'a pas répondu dans le délai prévu.")
    except Exception as exc:  # pragma: no cover - dépend du réseau HA
        _LOGGER.warning("Échec de la reformulation Gemini: %s", exc)
        return _result_unavailable()

    if status_code < 200 or status_code >= 300:
        error_code, _error_message = extraire_detail_erreur(response_data)
        return _result_unavailable(message_utilisateur_pour_erreur(status_code, error_code))

    text = extraire_texte_interaction(response_data)
    validation = valider_reformulation(text, payload)
    if not validation.accepted:
        _LOGGER.warning("Reformulation Gemini rejetée: %s", validation.reason)
        return {
            "ok": False,
            "status": "rejected",
            "message": "Reformulation Gemini rejetée par le garde-fou anti-invention.",
            "reason": validation.reason,
        }

    return {
        "ok": True,
        "status": "ready",
        "text": text,
        "model": model,
    }
