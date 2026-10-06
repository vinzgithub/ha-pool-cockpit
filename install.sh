#!/bin/sh
# SPDX-FileCopyrightText: 2026 Vincent Fournet
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

set -eu

BASE_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

has_config=0
has_theme=0
has_confirmation=0
for arg in "$@"; do
  case "$arg" in
    --config|--config=*) has_config=1 ;;
    --theme|--theme=*) has_theme=1 ;;
    --yes) has_confirmation=1 ;;
  esac
done

set -- "$@"
if [ "$has_config" -eq 0 ] && [ -d /config ]; then
  set -- --config /config "$@"
fi
if [ "$has_theme" -eq 0 ]; then
  set -- --theme ocean "$@"
fi
if [ "$has_confirmation" -eq 0 ]; then
  set -- --yes "$@"
fi

exec python3 "$BASE_DIR/install_pool_dashboard.py" "$@"
