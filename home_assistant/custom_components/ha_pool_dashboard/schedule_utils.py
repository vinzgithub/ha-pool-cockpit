# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta, timezone
from typing import Any

WEEKDAYS = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")


def time_to_minutes(value: str) -> int:
    try:
        hour, minute = (int(part) for part in str(value).split(":", 1))
    except (TypeError, ValueError):
        return 0
    return max(0, min(1439, hour * 60 + minute))


def minutes_to_time(value: int) -> str:
    value %= 1440
    return f"{value // 60:02d}:{value % 60:02d}"


def period_minutes(period: dict[str, Any]) -> int:
    if not period.get("enabled", True):
        return 0
    start = time_to_minutes(period.get("start", "00:00"))
    end = time_to_minutes(period.get("end", "00:00"))
    if start == end:
        return 0
    return end - start if end > start else 1440 - start + end


def scheduled_minutes(periods: list[dict[str, Any]]) -> int:
    return min(1440, sum(period_minutes(period) for period in periods[:3]))


def effective_periods(periods: list[dict[str, Any]], recommended_hours: float | int | None) -> list[dict[str, Any]]:
    result = deepcopy(periods[:3])
    try:
        target = max(0, min(1440, round(float(recommended_hours or 0) * 60)))
    except (TypeError, ValueError):
        target = 0
    current = scheduled_minutes(result)
    if target <= current:
        return result
    enabled = [period for period in result if period.get("enabled", True) and period_minutes(period)]
    if not enabled:
        return [{"enabled": True, "start": "08:00", "end": minutes_to_time(8 * 60 + target)}]
    last = enabled[-1]
    extension = min(1440 - current, target - current)
    last["end"] = minutes_to_time(time_to_minutes(last.get("end", "00:00")) + extension)
    return result



def reconcile_extension(
    periods: list[dict[str, Any]],
    recommended_hours: float | int | None,
    extension: dict[str, Any] | None,
    today: str,
    source: str,
) -> dict[str, Any]:
    """Return a coherent one-shot extension for the current base schedule.

    Adaptive periods already include the recommendation, therefore an extension
    must never stack on top of them. In custom/suspended mode, an approved
    extension is recalculated if the permanent schedule changes.
    """
    result = deepcopy(extension or {})
    try:
        target = max(0, min(1440, round(float(recommended_hours or 0) * 60)))
    except (TypeError, ValueError):
        target = 0
    base = scheduled_minutes(periods)
    missing = max(0, target - base)
    current = result.get("date") == today
    status = result.get("status", "none") if current else "none"

    if source == "adaptive" or missing <= 0:
        return {"date": today, "status": "none", "target_hours": 0, "minutes": 0}
    if status == "approved":
        return {"date": today, "status": "approved", "target_hours": target / 60, "minutes": missing}
    if status == "ignored":
        return {"date": today, "status": "ignored", "target_hours": 0, "minutes": missing}
    return {"date": today, "status": "none", "target_hours": 0, "minutes": missing}

def schedule_is_active(
    periods: list[dict[str, Any]], weekdays: list[str], now: datetime
) -> bool:
    today = WEEKDAYS[now.weekday()]
    yesterday = WEEKDAYS[(now.weekday() - 1) % 7]
    minute = now.hour * 60 + now.minute
    enabled_days = set(weekdays)
    for period in periods[:3]:
        if not period.get("enabled", True):
            continue
        start = time_to_minutes(period.get("start", "00:00"))
        end = time_to_minutes(period.get("end", "00:00"))
        if start == end:
            continue
        if end > start and today in enabled_days and start <= minute < end:
            return True
        if end < start:
            if today in enabled_days and minute >= start:
                return True
            if yesterday in enabled_days and minute < end:
                return True
    return False


def next_boundary(periods: list[dict[str, Any]], weekdays: list[str], now: datetime) -> datetime:
    enabled_days = set(weekdays)
    candidates: list[datetime] = []
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    for offset in range(8):
        day = start_of_day + timedelta(days=offset)
        code = WEEKDAYS[day.weekday()]
        if code not in enabled_days:
            continue
        for period in periods[:3]:
            if not period.get("enabled", True) or not period_minutes(period):
                continue
            start = time_to_minutes(period.get("start", "00:00"))
            end = time_to_minutes(period.get("end", "00:00"))
            candidates.append(day + timedelta(minutes=start))
            end_day = day if end > start else day + timedelta(days=1)
            candidates.append(end_day + timedelta(minutes=end))
    future = [candidate for candidate in candidates if candidate > now]
    return min(future) if future else now + timedelta(days=1)

# FIX14 — saisons astronomiques et construction du programme adaptatif.

def _jde0_season(year: int, key: str) -> float | None:
    y = (year - 2000) / 1000.0
    coefficients = {
        "spring": (2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057),
        "summer": (2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030),
        "autumn": (2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078),
        "winter": (2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032),
    }.get(key)
    if not coefficients:
        return None
    return sum(coefficient * (y ** index) for index, coefficient in enumerate(coefficients))


def _season_datetime(year: int, key: str) -> datetime:
    if 2000 <= year <= 3000:
        jde = _jde0_season(year, key)
        assert jde is not None
        unix_epoch_jd = 2440587.5
        return datetime.fromtimestamp((jde - unix_epoch_jd) * 86400, tz=timezone.utc)
    fallback = {
        "spring": (3, 20),
        "summer": (6, 21),
        "autumn": (9, 22),
        "winter": (12, 21),
    }[key]
    return datetime(year, fallback[0], fallback[1], 12, 0, tzinfo=timezone.utc)


def astronomical_profile(now: datetime) -> str:
    """Return spring/summer/autumn/winter from equinox/solstice dates."""
    year = now.year
    spring = _season_datetime(year, "spring")
    summer = _season_datetime(year, "summer")
    autumn = _season_datetime(year, "autumn")
    winter = _season_datetime(year, "winter")
    current = now if now.tzinfo is not None else now.replace(tzinfo=timezone.utc)
    current = current.astimezone(timezone.utc)
    if current >= winter:
        return "winter"
    if current >= autumn:
        return "autumn"
    if current >= summer:
        return "summer"
    if current >= spring:
        return "spring"
    return "winter"


def profile_start_minutes(periods: list[dict[str, Any]]) -> int:
    for period in periods[:3]:
        if period_minutes(period):
            return time_to_minutes(period.get("start", "00:00"))
    return 8 * 60


def adaptive_periods(hours: float | int | None, start_reference_minutes: int) -> list[dict[str, Any]]:
    try:
        total = max(0, min(1440, round(float(hours or 0) * 60)))
    except (TypeError, ValueError):
        total = 0
    if total >= 1439:
        return [
            {"enabled": True, "start": "00:00", "end": "12:00"},
            {"enabled": True, "start": "12:00", "end": "00:00"},
            {"enabled": False, "start": "00:00", "end": "00:00"},
        ]
    if total <= 0:
        return [
            {"enabled": False, "start": "00:00", "end": "00:00"},
            {"enabled": False, "start": "00:00", "end": "00:00"},
            {"enabled": False, "start": "00:00", "end": "00:00"},
        ]
    start = round(start_reference_minutes) % 1440
    end = (start + total) % 1440
    return [
        {"enabled": True, "start": minutes_to_time(start), "end": minutes_to_time(end)},
        {"enabled": False, "start": "00:00", "end": "00:00"},
        {"enabled": False, "start": "00:00", "end": "00:00"},
    ]
