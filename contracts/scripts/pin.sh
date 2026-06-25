#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$ROOT/.." && pwd)"
PIN="$ROOT/pin"

unpin() { rm -rf "$PIN"; }

resolve_ref() {
  # Any ref git resolves: tag, branch, full/short commit hash.
  if git -C "$REPO" rev-parse --verify "$1^{commit}" >/dev/null 2>&1; then
    echo "$1"
    return
  fi
  # npm package version,  it takes the commit at that release, not download the files from that package from npm
  if git -C "$REPO" rev-parse --verify "@kleros/kleros-v2-contracts@$1^{commit}" >/dev/null 2>&1; then
    echo "@kleros/kleros-v2-contracts@$1"
    return
  fi
  echo "unknown ref: $1 (expected a git tag, commit hash, branch, or npm package version)" >&2
  exit 1
}

if [[ "${1:-}" == "--unpin" ]]; then unpin; exit 0; fi
[[ -n "${1:-}" ]] || { echo "usage: pin.sh <tag|commit|version> | --unpin" >&2; exit 1; }
[[ "$PWD" == "$ROOT" ]] || { echo "run from contracts/" >&2; exit 1; }

ref="$(resolve_ref "$1")"
staging="$(mktemp -d)"
trap 'rm -rf "$staging"' EXIT

# Only what compile/deploy/local scripts need - not docs, deployments, wagmi, audit, etc.
git -C "$REPO" archive "$ref" \
  contracts/src \
  contracts/deploy \
  contracts/package.json \
  contracts/hardhat.config.ts \
  contracts/test \
  contracts/config \
  contracts/scripts \
  | tar -x -C "$staging"
rm -rf "$PIN"
rsync -a "$staging/contracts/" "$PIN/"

# hardhat compiles the type-chain types to ./contracts/typechain-types, we just point this folder to that, 
# so that the pinned scripts, which import like 'import {KlerosCore} from "../typechain-types"' still work 
ln -sfn ../typechain-types "$PIN/typechain-types"

echo "$ref" >"$PIN/version"

cd "$ROOT"
# explained in extract-pin-solidity why we need this
yarn ts-node --transpile-only scripts/extract-pin-solidity.ts
