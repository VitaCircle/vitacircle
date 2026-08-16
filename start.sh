#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required to run the environment orchestrator." >&2
  exit 1
fi
exec node "$ROOT/scripts/dev-env.mjs" "${1:-start}" "${@:2}"
