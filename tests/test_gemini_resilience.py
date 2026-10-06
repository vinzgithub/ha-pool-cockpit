from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "home_assistant" / "custom_components" / "ha_pool_dashboard" / "gemini_resilience.py"

spec = importlib.util.spec_from_file_location("pool_gemini_resilience", MODULE_PATH)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)


def test_error_detail_supports_interactions_format() -> None:
    code, message = module.extraire_detail_erreur(
        {"error": {"code": "too_many_requests", "message": "Please retry later."}}
    )
    assert code == "too_many_requests"
    assert message == "Please retry later."


def test_error_detail_never_logs_api_key_shape() -> None:
    code, message = module.extraire_detail_erreur(
        {"error": {"code": "api_error", "message": "bad AIzaABCDEFGHIJKLMNOPQRSTUVWX secret"}}
    )
    assert code == "api_error"
    assert "AIza" not in message
    assert "CLE_MASQUEE" in message


def test_retryable_transient_errors() -> None:
    assert module.est_erreur_retryable(500, "api_error") is True
    assert module.est_erreur_retryable(503, "service_unavailable") is True
    assert module.est_erreur_retryable(429, "too_many_requests") is True
    assert module.est_erreur_retryable(429, "rate_limit_exceeded") is True


def test_daily_quota_is_not_retried_immediately() -> None:
    assert module.est_erreur_retryable(429, "quota_exceeded") is False


def test_exponential_backoff_is_bounded_and_retry_after_honored() -> None:
    assert module.calculer_delai_retry(0) == 1.0
    assert module.calculer_delai_retry(1) == 2.0
    assert module.calculer_delai_retry(2) == 4.0
    assert module.calculer_delai_retry(10) == module.MAX_BACKOFF_SECONDS
    assert module.calculer_delai_retry(0, "3") == 3.0
    assert module.calculer_delai_retry(0, "999") == module.MAX_BACKOFF_SECONDS


def test_user_messages_are_non_sensitive() -> None:
    assert "quota" in module.message_utilisateur_pour_erreur(429, "quota_exceeded").lower()
    assert "temporairement" in module.message_utilisateur_pour_erreur(429, "too_many_requests").lower()
    assert "temporairement" in module.message_utilisateur_pour_erreur(500, "api_error").lower()


def test_error_detail_tolerates_legacy_numeric_code_and_status() -> None:
    code, message = module.extraire_detail_erreur(
        {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "message": "Rate limited"}}
    )
    assert code == "resource_exhausted"
    assert message == "Rate limited"
