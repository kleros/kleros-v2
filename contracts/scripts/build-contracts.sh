#!/usr/bin/env bash
set -euo pipefail

# src/ folders synced into contracts/ for the published npm package. 
# We do this, so @kleros/kleros-v2-contracts/contracts/**.sol are available at the path, since solc compiler looks for them literally at that path and ignores export subpaths
# NOTE: When you add a new prod folder under src/, add its name here too.
PUBLISH_SRC_DIRS=(
  arbitration
  gateway
  governance
  kleros-v1
  libraries
  proxy
  rng
  token
  utils
)

mkdir -p contracts

for d in "${PUBLISH_SRC_DIRS[@]}"; do
  rsync -a --delete --exclude='**/mock' --exclude='*Mock*' --exclude='*mock*' "src/$d/" "contracts/$d/"
done
