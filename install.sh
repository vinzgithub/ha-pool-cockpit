#!/bin/sh
# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
# Pool Cockpit V4.3.1: installer maintenance release for the V4.3.0 application.
# Supports guarded fresh installation, official V4.2.1 upgrade and rollback.
set -eu
BASE_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
has_config=0
for arg in "$@"; do
  case "$arg" in --config|--config=*) has_config=1 ;; esac
done
if [ "$has_config" -eq 0 ] && [ -d /config ]; then
  set -- --config /config "$@"
fi
exec python3 "$BASE_DIR/install_v430.py" "$@"
