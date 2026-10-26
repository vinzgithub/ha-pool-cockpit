#!/bin/sh
# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
# Pool Cockpit V4.2.1: fresh installation only; upgrades require a manual procedure.
set -eu
BASE_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
has_config=0
for arg in "$@"; do
  case "$arg" in
    --upgrade|--upgrade=*)
      echo "STOP: automatic upgrades are not supported by Pool Cockpit V4.2.1." >&2
      echo "See release/v4.2.1/README.md for the safe manual upgrade and rollback." >&2
      exit 2
      ;;
    --config|--config=*) has_config=1 ;;
  esac
done
if [ "$has_config" -eq 0 ] && [ -d /config ]; then
  set -- --config /config "$@"
fi
# No implicit --yes: a real install needs explicit consent.
exec python3 "$BASE_DIR/install_v421.py" "$@"
