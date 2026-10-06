# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

"""Petits garde-fous de résilience pour les appels Gemini.

Ce module est volontairement indépendant de Home Assistant afin d'être testé
sans réseau. Il ne contient aucune clé API et ne manipule aucune donnée métier.
"""

from __future__ import annotations

import re
from typing import Any

RETRYABLE_HTTP_STATUSES = frozenset({429, 500, 502, 503, 504})
NON_RETRYABLE_429_CODES = frozenset({"quota_exceeded"})
DEFAULT_MAX_ATTEMPTS = 3
DEFAULT_BACKOFF_BASE_SECONDS = 1.0
MAX_BACKOFF_SECONDS = 8.0
MAX_ERROR_MESSAGE_LENGTH = 320

_API_KEY_PATTERN = re.compile(r"AIza[0-9A-Za-z_-]{20,}")


def _texte_sure(value: Any, *, limit: int = MAX_ERROR_MESSAGE_LENGTH) -> str:
    """Normalise un texte de log et masque toute chaîne ressemblant à une clé."""
    text = " ".join(str(value or "").split())
    text = _API_KEY_PATTERN.sub("[CLE_MASQUEE]", text)
    return text[:limit]


def extraire_detail_erreur(data: Any) -> tuple[str, str]:
    """Extrait le code et le message d'une réponse d'erreur Interactions API."""
    error = data.get("error") if isinstance(data, dict) else None
    if not isinstance(error, dict):
        return "unknown", ""

    # Le format Interactions courant expose error.code en snake_case. On garde
    # aussi status en secours pour tolérer d'anciennes réponses Google.
    raw_code = error.get("code")
    if isinstance(raw_code, (int, float)) and error.get("status"):
        raw_code = error.get("status")
    raw_code = raw_code or error.get("status") or "unknown"
    code = _texte_sure(raw_code, limit=80).lower().replace(" ", "_") or "unknown"
    message = _texte_sure(error.get("message"))
    return code, message


def est_erreur_retryable(http_status: int, error_code: str = "") -> bool:
    """Décide si une erreur temporaire mérite une nouvelle tentative."""
    if http_status not in RETRYABLE_HTTP_STATUSES:
        return False
    code = str(error_code or "").strip().lower()
    if http_status == 429 and code in NON_RETRYABLE_429_CODES:
        # Un quota journalier épuisé ne sera pas réparé par un retry à 1 seconde.
        return False
    return True


def lire_retry_after(value: Any) -> float | None:
    """Lit un Retry-After numérique, sans accepter de délai démesuré."""
    try:
        delay = float(str(value).strip())
    except (TypeError, ValueError):
        return None
    if delay < 0:
        return None
    return min(MAX_BACKOFF_SECONDS, delay)


def calculer_delai_retry(numero_retry: int, retry_after: Any = None) -> float:
    """Calcule un backoff exponentiel déterministe : 1 s, 2 s, 4 s..."""
    header_delay = lire_retry_after(retry_after)
    if header_delay is not None:
        return header_delay
    exponent = max(0, int(numero_retry))
    return min(MAX_BACKOFF_SECONDS, DEFAULT_BACKOFF_BASE_SECONDS * (2**exponent))


def message_utilisateur_pour_erreur(http_status: int, error_code: str = "") -> str:
    """Retourne un message UI court, sans exposer le détail technique Google."""
    code = str(error_code or "").strip().lower()
    if http_status == 429 and code == "quota_exceeded":
        return "Reformulation Gemini indisponible : quota du projet atteint."
    if http_status == 429:
        return "Gemini est temporairement limité. Réessayez dans quelques instants."
    if http_status in {500, 502, 503, 504}:
        return "Gemini est temporairement indisponible. Réessayez dans quelques instants."
    return "Reformulation Gemini indisponible."
