# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "SHA256SUMS"


def excluded(path: Path) -> bool:
    relative = path.relative_to(ROOT)
    parts = relative.parts
    return (
        path == OUTPUT
        or ".git" in parts
        or "node_modules" in parts
        or "__pycache__" in parts
        or ".pytest_cache" in parts
        or path.suffix in {".pyc", ".pyo"}
    )


def main() -> None:
    files = sorted(path for path in ROOT.rglob("*") if path.is_file() and not excluded(path))
    lines = []
    for path in files:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        relative = path.relative_to(ROOT).as_posix()
        lines.append(f"{digest}  ./{relative}")
    OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
