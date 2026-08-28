#!/usr/bin/env bash
# Resolves start-local / deploy-local / populate:local from pin/package.json (when pinned) or HEAD package.json.
# Prefers local:<name>; falls back to <name> for old pins that only define start-local, etc.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY="${1:?script name}"
shift

PKG="$ROOT/package.json"
if [[ -f "$ROOT/pin/version" && -f "$ROOT/pin/package.json" ]]; then
  PKG="$ROOT/pin/package.json"
fi


# This tries to first look for `local:<cmd>` from the pinned version, if not (which means it's an older version), 
# we look for `<cmd>` itself. We need this to support older commands + the future one's 
CMD="$(
  PIN_PKG="$PKG" PIN_KEY="$KEY" node -e '
const pkg = require(process.env.PIN_PKG);
const key = process.env.PIN_KEY;
const localKey = `local:${key}`;

if (pkg.scripts[localKey]) {
  console.log(pkg.scripts[localKey]);
  process.exit(0);
}

const direct = pkg.scripts[key];
if (!direct) {
  throw new Error(`missing script: ${key} (tried ${localKey} and ${key})`);
}
if (direct.includes("run-pinned-script.sh")) {
  throw new Error(
    `script ${key} delegates to run-pinned-script.sh but ${localKey} is missing`,
  );
}
console.log(direct);
'
)"

cd "$ROOT"
if [[ "$CMD" == hardhat* ]]; then
  if (($#)); then
    exec yarn $CMD "$@"
  else
    exec yarn $CMD
  fi
fi
if (($#)); then
  exec bash -lc "$CMD $(printf '%q ' "$@")"
else
  exec bash -lc "$CMD"
fi
