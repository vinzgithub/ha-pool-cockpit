#!/bin/sh
# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
# Pool Cockpit V4.1.0: safe front door for fresh installs and V4 upgrades.
set -eu
BASE_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
has_config=0
for arg in "$@"; do
  case "$arg" in --config|--config=*) has_config=1 ;; esac
done
if [ "$has_config" -eq 0 ] && [ -d /config ]; then
  set -- --config /config "$@"
fi
# No implicit --yes: a real install needs explicit consent.
exec python3 "$BASE_DIR/install_v41.py" "$@"
