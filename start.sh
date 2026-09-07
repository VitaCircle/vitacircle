#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# On Windows, Git Bash often has a thin PATH. Prefer the PowerShell launcher.
PSBIN=""
if command -v powershell.exe >/dev/null 2>&1; then
  PSBIN="$(command -v powershell.exe)"
elif [ -x "/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe" ]; then
  PSBIN="/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
fi
if [ -n "$PSBIN" ] && [ -f "$ROOT/start.ps1" ]; then
  set +e
  "$PSBIN" -NoProfile -ExecutionPolicy Bypass -File "$ROOT/start.ps1" "${1:-start}" "${@:2}"
  status=$?
  set -e
  if [ "$status" -ne 0 ]; then
    echo "ERROR: start failed (exit $status)." >&2
    if [ -n "${MSYSTEM:-}" ]; then
      read -r -p "Press Enter to close this window..." || true
    fi
    exit "$status"
  fi
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required to run the environment orchestrator." >&2
  exit 1
fi
exec node "$ROOT/scripts/dev-env.mjs" "${1:-start}" "${@:2}"
