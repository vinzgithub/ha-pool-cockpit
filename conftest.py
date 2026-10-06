"""Repository cleanliness support for the Pytest suite.

The static cleanliness test must reject artifacts that predate the current
Python process, but it must not fail because Pytest creates rewritten bytecode
while importing this very file or collecting tests. Runtime caches are removed
at session shutdown so repeated plain test runs remain deterministic.
"""

from __future__ import annotations

import os
import shutil
import time
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent


def _process_started_ns() -> int:
    """Return the current process start time as an epoch timestamp.

    Linux exposes the boot time and process start tick through ``/proc``. The
    fallback is deliberately a little earlier than module import, which still
    prevents caches generated during normal Pytest startup from being mistaken
    for repository artifacts.
    """

    try:
        start_ticks = int(Path("/proc/self/stat").read_text(encoding="utf-8").split()[21])
        ticks_per_second = os.sysconf("SC_CLK_TCK")
        process_start_boot_ns = start_ticks * 1_000_000_000 // ticks_per_second
        now_boot_ns = time.clock_gettime_ns(time.CLOCK_BOOTTIME)
        return time.time_ns() - (now_boot_ns - process_start_boot_ns)
    except (AttributeError, OSError, ValueError):
        return time.time_ns() - 5_000_000_000


_PROCESS_STARTED_NS = _process_started_ns()


def _forbidden_artifacts() -> tuple[Path, ...]:
    return tuple(
        sorted(
            (
                path
                for path in ROOT.rglob("*")
                if (
                    path.name in {"__pycache__", ".pytest_cache"}
                    or path.suffix in {".pyc", ".pyo"}
                )
            ),
            key=lambda path: path.as_posix(),
        )
    )


def _preexisting_forbidden_artifacts() -> tuple[Path, ...]:
    return tuple(
        path
        for path in _forbidden_artifacts()
        if path.stat().st_mtime_ns < _PROCESS_STARTED_NS
    )


_PREEXISTING_FORBIDDEN = _preexisting_forbidden_artifacts()


@pytest.fixture(scope="session")
def preexisting_forbidden_artifacts() -> tuple[Path, ...]:
    """Forbidden artifacts that existed before this Python process started."""

    return _PREEXISTING_FORBIDDEN


def pytest_sessionfinish(session: pytest.Session, exitstatus: int) -> None:
    """Remove disposable Python/Pytest caches generated during the run."""

    del session, exitstatus
    for path in sorted(_forbidden_artifacts(), key=lambda item: len(item.parts), reverse=True):
        if path.is_dir():
            shutil.rmtree(path, ignore_errors=True)
        else:
            path.unlink(missing_ok=True)
