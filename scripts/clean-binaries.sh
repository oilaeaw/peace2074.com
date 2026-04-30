#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

TARGETS=(
  "$ROOT_DIR/node_modules"
  "$ROOT_DIR/peace2074-mobile/node_modules"
  "$ROOT_DIR/peace2074-mobile/platforms"
  "$ROOT_DIR/netlify/functions/server"
)

echo "Removing generated binary-heavy directories..."

for target in "${TARGETS[@]}"; do
  if [[ -e "$target" ]]; then
    echo " - $target"
    rm -rf "$target"
  else
    echo " - $target (already absent)"
  fi
done

echo "Cleanup complete."
