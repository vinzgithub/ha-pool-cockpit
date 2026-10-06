# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

from datetime import datetime
from pathlib import Path
import shutil

def create_backup(config_dir: Path, targets: list[Path]) -> Path:
    backup_dir = config_dir / "backups" / f"ha-pool-dashboard-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    backup_dir.mkdir(parents=True, exist_ok=True)
    for target in targets:
        if target.exists():
            destination = backup_dir / target.relative_to(config_dir)
            destination.parent.mkdir(parents=True, exist_ok=True)
            if target.is_dir():
                shutil.copytree(target, destination, dirs_exist_ok=True)
            else:
                shutil.copy2(target, destination)
    return backup_dir
